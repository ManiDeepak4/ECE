const { query } = require('../config/database');

/**
 * Get User Profile
 * GET /api/user/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT id, name, email, is_email_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.is_email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message,
    });
  }
};

/**
 * Update User Profile
 * PUT /api/user/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const result = await query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, is_email_verified',
      [name, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.is_email_verified,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message,
    });
  }
};

/**
 * Get All Addresses
 * GET /api/user/addresses
 */
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses',
      error: error.message,
    });
  }
};

/**
 * Get Single Address
 * GET /api/user/addresses/:id
 */
const getAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching address',
      error: error.message,
    });
  }
};

/**
 * Add New Address
 * POST /api/user/addresses
 */
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, street, city, state, pincode, is_default } = req.body;

    // Validation
    if (!full_name || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required',
      });
    }

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }

    const result = await query(
      `INSERT INTO addresses (user_id, full_name, phone, street, city, state, pincode, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, full_name, phone, street, city, state, pincode, is_default || false]
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding address',
      error: error.message,
    });
  }
};

/**
 * Update Address
 * PUT /api/user/addresses/:id
 */
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const { full_name, phone, street, city, state, pincode, is_default } = req.body;

    // Check if address exists and belongs to user
    const checkResult = await query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // If this is set as default, remove default from other addresses
    if (is_default) {
      await query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2', [userId, addressId]);
    }

    const result = await query(
      `UPDATE addresses 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone), 
           street = COALESCE($3, street), 
           city = COALESCE($4, city), 
           state = COALESCE($5, state), 
           pincode = COALESCE($6, pincode), 
           is_default = COALESCE($7, is_default) 
       WHERE id = $8 AND user_id = $9 
       RETURNING *`,
      [full_name, phone, street, city, state, pincode, is_default, addressId, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating address',
      error: error.message,
    });
  }
};

/**
 * Delete Address
 * DELETE /api/user/addresses/:id
 */
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address',
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
};
