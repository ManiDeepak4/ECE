const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { query, getClient } = require('../config/database');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, address_id } = req.body;

    if (!amount || !address_id) {
      return res.status(400).json({
        success: false,
        message: 'Amount and address are required',
      });
    }

    // Verify address belongs to user
    const addressResult = await query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, userId]
    );

    if (addressResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1, // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment order',
      error: error.message,
    });
  }
};

/**
 * Verify Razorpay Payment
 * POST /api/payment/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, address_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !address_id) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required',
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Payment verified successfully
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message,
    });
  }
};

/**
 * Get Razorpay Key
 * GET /api/payment/key
 */
const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Get Razorpay key error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching Razorpay key',
      error: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
};
