const { query, getClient } = require('../config/database');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

/**
 * Create Order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  const client = await getClient();
  
  try {
    const userId = req.user.id;
    const { 
      address_id, 
      payment_method, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Validation
    if (!address_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Address and payment method are required',
      });
    }

    // Valid payment methods
    const validPaymentMethods = ['COD', 'UPI', 'Razorpay'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    await client.query('BEGIN');

    // Get user info
    const userResult = await client.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Verify address
    const addressResult = await client.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, userId]
    );

    if (addressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Get cart items
    const cartResult = await client.query(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const cartItems = cartResult.rows;

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = parseFloat(process.env.DELIVERY_CHARGE || 50);
    const totalAmount = subtotal + deliveryCharge;

    // Determine payment status
    let paymentStatus = 'Pending';
    if (payment_method === 'COD') {
      paymentStatus = 'Pending'; // Will be paid on delivery
    } else if (payment_method === 'Razorpay' && razorpay_payment_id) {
      paymentStatus = 'Completed'; // Already paid through Razorpay
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, address_id, subtotal, delivery_charge, total_amount, 
        payment_method, payment_status, razorpay_order_id, 
        razorpay_payment_id, razorpay_signature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        userId, address_id, subtotal, deliveryCharge, totalAmount,
        payment_method, paymentStatus, razorpay_order_id || null,
        razorpay_payment_id || null, razorpay_signature || null
      ]
    );

    const order = orderResult.rows[0];

    // Create order items and update stock
    for (const item of cartItems) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_price, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.price, item.quantity, item.price * item.quantity]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(user.email, user.name, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.id,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Get All Orders
 * GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT o.*, a.full_name, a.street, a.city, a.state, a.pincode, a.phone,
       COUNT(oi.id) as item_count
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 
       GROUP BY o.id, a.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: error.message,
    });
  }
};

/**
 * Get Order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Get order details
    const orderResult = await query(
      `SELECT o.*, a.full_name, a.street, a.city, a.state, a.pincode, a.phone 
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, p.image_url 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: error.message,
    });
  }
};

/**
 * Cancel Order
 * PUT /api/orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  const client = await getClient();
  
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    await client.query('BEGIN');

    // Get order
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    // Check if order can be cancelled
    if (order.order_status === 'Delivered' || order.order_status === 'Cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.order_status}`,
      });
    }

    // Update order status
    await client.query(
      'UPDATE orders SET order_status = $1 WHERE id = $2',
      ['Cancelled', orderId]
    );

    // Restore stock for cancelled items
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};
