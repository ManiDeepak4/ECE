const { query } = require('../config/database');

/**
 * Get All Products
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_key = c.key 
       ORDER BY p.created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message,
    });
  }
};

/**
 * Get Product by ID
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_key = c.key 
       WHERE p.id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};

/**
 * Get Products by Category
 * GET /api/products/category/:categoryKey
 */
const getProductsByCategory = async (req, res) => {
  try {
    const categoryKey = req.params.categoryKey;

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_key = c.key 
       WHERE p.category_key = $1 
       ORDER BY p.name ASC`,
      [categoryKey]
    );

    res.status(200).json({
      success: true,
      category: categoryKey,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products by category',
      error: error.message,
    });
  }
};

/**
 * Search Products
 * GET /api/products/search?q=query
 */
const searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q || '';

    if (!searchQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_key = c.key 
       WHERE p.name ILIKE $1 OR p.type ILIKE $1 OR p.description ILIKE $1 
       ORDER BY p.name ASC`,
      [`%${searchQuery}%`]
    );

    // Save search history if user is logged in
    if (req.user) {
      try {
        await query(
          'INSERT INTO search_history (user_id, search_term) VALUES ($1, $2)',
          [req.user.id, searchQuery]
        );
      } catch (err) {
        // Don't fail the request if search history save fails
        console.error('Error saving search history:', err);
      }
    }

    res.status(200).json({
      success: true,
      query: searchQuery,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products',
      error: error.message,
    });
  }
};

/**
 * Get All Categories
 * GET /api/products/categories/all
 */
const getAllCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message,
    });
  }
};

/**
 * Get User Search History
 * GET /api/products/search/history
 * Requires authentication
 */
const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit || 20;

    const result = await query(
      `SELECT DISTINCT ON (search_term) search_term, created_at 
       FROM search_history 
       WHERE user_id = $1 
       ORDER BY search_term, created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(row => row.search_term),
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching search history',
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getAllCategories,
  getSearchHistory,
};
