# Electronics Hub - Backend API

Complete backend REST API for Electronics Hub e-commerce platform built with Node.js, Express, PostgreSQL, JWT authentication, SendGrid email service, and Razorpay payment integration.

## 🚀 Features

- ✅ **User Authentication** (JWT-based)
  - Signup with email verification
  - Login with secure password hashing
  - Password reset functionality
  - Email verification with SendGrid

- ✅ **User Management**
  - User profile management
  - Multiple delivery addresses
  - Address CRUD operations

- ✅ **Product Management**
  - Browse all products
  - Filter by category
  - Search products
  - Search history tracking

- ✅ **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Real-time stock validation

- ✅ **Order Management**
  - Place orders (COD & Online Payment)
  - Order history
  - Order details
  - Cancel orders
  - Order status tracking

- ✅ **Payment Integration**
  - Razorpay payment gateway
  - Cash on Delivery (COD)
  - Payment verification
  - Secure transactions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)
- **SendGrid Account** (for email services)
- **Razorpay Account** (for payments - TEST MODE)

## 🛠️ Installation

### Step 1: Navigate to Backend Directory

```bash
cd /workspaces/ECE/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: PostgreSQL Setup

#### Install PostgreSQL (if not installed)

**For Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**For macOS:**
```bash
brew install postgresql
brew services start postgresql
```

#### Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE electronics_hub;

# Create user (optional - or use default postgres user)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE electronics_hub TO your_username;

# Exit
\q
```

#### Run Database Schema

```bash
# Login to the database
psql -U postgres -d electronics_hub

# Run the SQL file
\i /workspaces/ECE/backend/utils/database.sql

# Or directly from terminal
psql -U postgres -d electronics_hub -f /workspaces/ECE/backend/utils/database.sql
```

### Step 4: Configure Environment Variables

The `.env` file is already created. Update it with your credentials:

```bash
nano .env
```

**Required Updates:**

1. **Database Credentials:**
```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

2. **SendGrid API Key:**
   - Go to https://sendgrid.com/
   - Sign up / Login
   - Go to Settings → API Keys
   - Create new API key
   - Copy and paste in `.env`:
```env
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
```

3. **Razorpay Keys (TEST MODE):**
   - Go to https://razorpay.com/
   - Sign up / Login
   - Go to Settings → API Keys
   - Generate Test Keys
   - Copy and paste in `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_test_secret_here
```

### Step 5: Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

---

### 🔐 Authentication Routes

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### 3. Verify Email
```http
GET /api/auth/verify-email?token=YOUR_TOKEN
```

#### 4. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 5. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

#### 6. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 👤 User Routes (All Protected)

#### 1. Get Profile
```http
GET /api/user/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 2. Update Profile
```http
PUT /api/user/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "John Updated"
}
```

#### 3. Get All Addresses
```http
GET /api/user/addresses
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 4. Add New Address
```http
POST /api/user/addresses
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone": "9876543210",
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "is_default": true
}
```

#### 5. Update Address
```http
PUT /api/user/addresses/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "full_name": "John Doe Updated",
  "phone": "9876543210"
}
```

#### 6. Delete Address
```http
DELETE /api/user/addresses/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 📦 Product Routes (Public)

#### 1. Get All Products
```http
GET /api/products
```

#### 2. Get Product by ID
```http
GET /api/products/:id
```

#### 3. Get Products by Category
```http
GET /api/products/category/sensors
```

Categories: `sensors`, `robotics`, `hardware`, `microcontrollers`, `modules`, `displays`, `power`, `projects`, `restored`

#### 4. Search Products
```http
GET /api/products/search?q=arduino
```

#### 5. Get All Categories
```http
GET /api/products/categories/all
```

#### 6. Get Search History (Protected)
```http
GET /api/products/search/history
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 🛒 Cart Routes (All Protected)

#### 1. Get Cart
```http
GET /api/cart
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 2. Add to Cart
```http
POST /api/cart
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "product_id": "product_uuid",
  "quantity": 2
}
```

#### 3. Update Cart Item
```http
PUT /api/cart/:cart_item_id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "quantity": 3
}
```

#### 4. Remove from Cart
```http
DELETE /api/cart/:cart_item_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 5. Clear Cart
```http
DELETE /api/cart
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 📋 Order Routes (All Protected)

#### 1. Create Order
```http
POST /api/orders
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "address_id": "address_uuid",
  "payment_method": "COD"
}
```

Or with Razorpay:
```json
{
  "address_id": "address_uuid",
  "payment_method": "Razorpay",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

#### 2. Get All Orders
```http
GET /api/orders
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 3. Get Order Details
```http
GET /api/orders/:order_id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### 4. Cancel Order
```http
PUT /api/orders/:order_id/cancel
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### 💳 Payment Routes

#### 1. Get Razorpay Key (Public)
```http
GET /api/payment/key
```

#### 2. Create Razorpay Order (Protected)
```http
POST /api/payment/create-order
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 500,
  "address_id": "address_uuid"
}
```

#### 3. Verify Payment (Protected)
```http
POST /api/payment/verify
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "address_id": "address_uuid"
}
```

---

## 🗄️ Database Schema

### Tables:
1. **users** - User authentication and profile
2. **addresses** - User delivery addresses
3. **categories** - Product categories
4. **products** - Product catalog
5. **cart** - Shopping cart items
6. **orders** - Order details
7. **order_items** - Order line items
8. **search_history** - User search history

See `utils/database.sql` for complete schema.

---

## 🔒 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### How to use:

1. **Signup/Login** to get tokens
2. **Store the `accessToken`** in your frontend
3. **Include token in headers** for protected routes:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Content-Type': 'application/json'
}
```

### Token Expiry:
- **Access Token:** 7 days
- **Refresh Token:** 30 days

---

## 📧 Email Service

Emails are sent via **SendGrid** for:
- ✅ Email verification
- ✅ Password reset
- ✅ Order confirmation

**Email Templates** are included in `utils/emailService.js`

---

## 💰 Payment Integration

### Razorpay Test Mode

The API is configured for **TEST MODE** by default.

#### Test Cards:
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date

#### Payment Flow:
1. Frontend calls `/api/payment/create-order`
2. Frontend shows Razorpay checkout
3. User completes payment
4. Frontend calls `/api/payment/verify`
5. Backend verifies signature
6. Frontend calls `/api/orders` to create order

---

## 🧪 Testing the API

### Using cURL:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Products
curl http://localhost:5000/api/products
```

### Using Postman:

1. Import the API endpoints
2. Create environment variable for `token`
3. Set Authorization header automatically

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js       # PostgreSQL connection
│   └── razorpay.js       # Razorpay configuration
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── paymentController.js
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   ├── auth.js
│   ├── user.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── payment.js
├── utils/
│   ├── database.sql      # Database schema
│   ├── jwtUtils.js       # JWT utilities
│   └── emailService.js   # SendGrid email service
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── server.js             # Main server file
└── README.md
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Connection refused
```
**Solution:**
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database credentials in `.env`
- Check if database exists: `psql -U postgres -l`

### SendGrid Email Not Sending
```
Error: Unauthorized
```
**Solution:**
- Verify SendGrid API key in `.env`
- Check if sender email is verified in SendGrid dashboard
- Check SendGrid account status

### Razorpay Error
```
Error: Invalid key_id or key_secret
```
**Solution:**
- Verify Razorpay keys in `.env`
- Ensure using TEST keys (starting with `rzp_test_`)
- Check Razorpay dashboard for account status

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env file
```

---

## 🚀 Deployment (Future)

When ready to deploy to production:

1. **Update Environment Variables**
   - Use production database
   - Use Razorpay LIVE keys
   - Update `FRONTEND_URL`
   - Change `NODE_ENV` to `production`

2. **Secure Your API**
   - Enable HTTPS
   - Add rate limiting
   - Add CORS whitelist
   - Enable helmet.js

3. **Deployment Platforms**
   - Heroku
   - AWS EC2/Elastic Beanstalk
   - DigitalOcean
   - Render
   - Railway

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the API documentation
- Check server logs for errors

---

## 📝 License

ISC

---

## 👨‍💻 Author

**ManiDeepak4**

---

## ✅ Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup PostgreSQL database
3. ✅ Configure `.env` file
4. ✅ Run database migrations
5. ✅ Start server: `npm run dev`
6. ✅ Test API endpoints
7. ✅ Connect frontend to backend

---

**Happy Coding! 🚀**
