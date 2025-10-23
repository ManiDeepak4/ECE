const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Electronics Hub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log('║     🚀 Electronics Hub Backend API 🚀      ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API Base URL: http://localhost:${PORT}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Available Routes:');
  console.log('   - POST   /api/auth/signup');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/auth/verify-email');
  console.log('   - POST   /api/auth/forgot-password');
  console.log('   - POST   /api/auth/reset-password');
  console.log('   - GET    /api/auth/me');
  console.log('');
  console.log('   - GET    /api/user/profile');
  console.log('   - PUT    /api/user/profile');
  console.log('   - GET    /api/user/addresses');
  console.log('   - POST   /api/user/addresses');
  console.log('');
  console.log('   - GET    /api/products');
  console.log('   - GET    /api/products/search');
  console.log('   - GET    /api/products/category/:key');
  console.log('   - GET    /api/products/:id');
  console.log('');
  console.log('   - GET    /api/cart');
  console.log('   - POST   /api/cart');
  console.log('   - PUT    /api/cart/:id');
  console.log('   - DELETE /api/cart/:id');
  console.log('');
  console.log('   - POST   /api/orders');
  console.log('   - GET    /api/orders');
  console.log('   - GET    /api/orders/:id');
  console.log('   - PUT    /api/orders/:id/cancel');
  console.log('');
  console.log('   - GET    /api/payment/key');
  console.log('   - POST   /api/payment/create-order');
  console.log('   - POST   /api/payment/verify');
  console.log('');
  console.log('══════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
