const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
require('dotenv').config();

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@electronicshub.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Electronics Hub';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate a random token for email verification or password reset
 * @returns {String} Random token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send email verification email
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} token - Verification token
 */
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'Verify Your Email - Electronics Hub',
    text: `Hi ${name},\n\nThank you for signing up with Electronics Hub! Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nElectronics Hub Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(90deg, #ff6a00, #ffcc00); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f4f7fb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1565c0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Electronics Hub! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for signing up with Electronics Hub! We're excited to have you on board.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1565c0;">${verificationUrl}</p>
            <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Electronics Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {String} token - Reset token
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'Password Reset Request - Electronics Hub',
    text: `Hi ${name},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nElectronics Hub Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(90deg, #ff6a00, #ffcc00); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f4f7fb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your Electronics Hub account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1565c0;">${resetUrl}</p>
            <div class="warning">
              <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2025 Electronics Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send order confirmation email
 * @param {String} email - Recipient email
 * @param {String} name - Recipient name
 * @param {Object} order - Order details
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
  const msg = {
    to: email,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `Order Confirmation #${order.id.substring(0, 8)} - Electronics Hub`,
    text: `Hi ${name},\n\nThank you for your order!\n\nOrder ID: ${order.id}\nTotal Amount: ₹${order.total_amount}\nPayment Method: ${order.payment_method}\n\nWe'll send you another email when your order ships.\n\nBest regards,\nElectronics Hub Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(90deg, #ff6a00, #ffcc00); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f4f7fb; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✅</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for your order! We're processing it now.</p>
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id.substring(0, 8)}</p>
              <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>
              <p><strong>Payment Method:</strong> ${order.payment_method}</p>
              <p><strong>Status:</strong> ${order.order_status}</p>
            </div>
            <p>We'll send you another email when your order ships.</p>
          </div>
          <div class="footer">
            <p>© 2025 Electronics Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Order confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    // Don't throw error for order confirmation emails
    return false;
  }
};

module.exports = {
  generateToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
