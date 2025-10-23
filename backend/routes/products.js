const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/categories/all
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories/all', productController.getAllCategories);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public (saves history if logged in)
 */
router.get('/search', optionalAuth, productController.searchProducts);

/**
 * @route   GET /api/products/search/history
 * @desc    Get user search history
 * @access  Private
 */
router.get('/search/history', authenticateToken, productController.getSearchHistory);

/**
 * @route   GET /api/products/category/:categoryKey
 * @desc    Get products by category
 * @access  Public
 */
router.get('/category/:categoryKey', productController.getProductsByCategory);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

module.exports = router;
