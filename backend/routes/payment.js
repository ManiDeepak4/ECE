const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/payment/key
 * @desc    Get Razorpay API key
 * @access  Public
 */
router.get('/key', paymentController.getRazorpayKey);

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', authenticateToken, paymentController.createRazorpayOrder);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', authenticateToken, paymentController.verifyPayment);

module.exports = router;
