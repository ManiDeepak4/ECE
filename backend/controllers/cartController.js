const { query } = require('../config/database');

/**
 * Get User Cart
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT c.*, p.name, p.price, p.image_url, p.availability, p.stock_quantity 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
      [userId]
    );

    // Calculate totals
    const subtotal = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = result.rows.length > 0 ? parseFloat(process.env.DELIVERY_CHARGE || 50) : 0;
    const total = subtotal + deliveryCharge;

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: {
        items: result.rows,
        subtotal: subtotal.toFixed(2),
        deliveryCharge: deliveryCharge.toFixed(2),
        total: total.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

/**
 * Add Item to Cart
 * POST /api/cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Check if product exists and is in stock
    const productResult = await query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = productResult.rows[0];

    if (product.availability === 'Out of Stock' || product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or insufficient quantity available',
      });
    }

    // Check if item already exists in cart
    const existingItem = await query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    let result;

    if (existingItem.rows.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available',
        });
      }

      result = await query(
        'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, userId, product_id]
      );
    } else {
      // Add new item
      result = await query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message,
    });
  }
};

/**
 * Update Cart Item
 * PUT /api/cart/:id
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required (minimum 1)',
      });
    }

    // Get cart item with product info
    const cartItem = await query(
      `SELECT c.*, p.stock_quantity, p.availability 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.id = $1 AND c.user_id = $2`,
      [cartItemId, userId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    const item = cartItem.rows[0];

    if (item.availability === 'Out of Stock' || item.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available',
      });
    }

    const result = await query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, cartItemId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
      error: error.message,
    });
  }
};

/**
 * Remove Item from Cart
 * DELETE /api/cart/:id
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    const result = await query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [cartItemId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
      error: error.message,
    });
  }
};

/**
 * Clear Cart
 * DELETE /api/cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await query('DELETE FROM cart WHERE user_id = $1', [userId]);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
