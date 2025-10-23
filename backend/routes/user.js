const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', userController.updateProfile);

/**
 * @route   GET /api/user/addresses
 * @desc    Get all user addresses
 * @access  Private
 */
router.get('/addresses', userController.getAddresses);

/**
 * @route   GET /api/user/addresses/:id
 * @desc    Get single address
 * @access  Private
 */
router.get('/addresses/:id', userController.getAddress);

/**
 * @route   POST /api/user/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', userController.addAddress);

/**
 * @route   PUT /api/user/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:id', userController.updateAddress);

/**
 * @route   DELETE /api/user/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:id', userController.deleteAddress);

module.exports = router;
