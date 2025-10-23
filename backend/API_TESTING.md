# 🧪 API Testing Guide

## Testing with cURL

### 1. Authentication Flow

#### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Save the `accessToken` from response!**

#### Set Token as Variable
```bash
export TOKEN="your_access_token_here"
```

### 2. Product Operations

#### Get All Products
```bash
curl http://localhost:5000/api/products
```

#### Search Products
```bash
curl "http://localhost:5000/api/products/search?q=arduino"
```

#### Get Products by Category
```bash
curl http://localhost:5000/api/products/category/sensors
```

### 3. Cart Operations

#### Get Cart
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

#### Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_UUID_HERE",
    "quantity": 2
  }'
```

### 4. Address Management

#### Add Address
```bash
curl -X POST http://localhost:5000/api/user/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "phone": "9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "is_default": true
  }'
```

#### Get All Addresses
```bash
curl http://localhost:5000/api/user/addresses \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Order Flow

#### Create Order (COD)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address_id": "ADDRESS_UUID_HERE",
    "payment_method": "COD"
  }'
```

#### Get Orders
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with JavaScript/Fetch

### Complete Flow Example

```javascript
const BASE_URL = 'http://localhost:5000';
let token = '';
let productId = '';
let addressId = '';

// 1. Signup
async function signup() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123456'
    })
  });
  const data = await response.json();
  console.log('Signup:', data);
  token = data.data.tokens.accessToken;
}

// 2. Login
async function login() {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123456'
    })
  });
  const data = await response.json();
  console.log('Login:', data);
  token = data.data.tokens.accessToken;
}

// 3. Get Products
async function getProducts() {
  const response = await fetch(`${BASE_URL}/api/products`);
  const data = await response.json();
  console.log('Products:', data);
  if (data.data.length > 0) {
    productId = data.data[0].id;
  }
}

// 4. Add Address
async function addAddress() {
  const response = await fetch(`${BASE_URL}/api/user/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      full_name: 'Test User',
      phone: '9876543210',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      is_default: true
    })
  });
  const data = await response.json();
  console.log('Address:', data);
  addressId = data.data.id;
}

// 5. Add to Cart
async function addToCart() {
  const response = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: 2
    })
  });
  const data = await response.json();
  console.log('Cart:', data);
}

// 6. Create Order
async function createOrder() {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      address_id: addressId,
      payment_method: 'COD'
    })
  });
  const data = await response.json();
  console.log('Order:', data);
}

// Run all tests
async function runTests() {
  await login();
  await getProducts();
  await addAddress();
  await addToCart();
  await createOrder();
}

runTests();
```

---

## Expected Responses

### Successful Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Test User",
      "email": "test@example.com",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (in development mode)"
}
```

---

## Common Test Scenarios

### Scenario 1: New User Complete Flow
1. ✅ Signup
2. ✅ Login
3. ✅ Browse products
4. ✅ Add address
5. ✅ Add items to cart
6. ✅ Place order (COD)

### Scenario 2: Returning User Flow
1. ✅ Login
2. ✅ View cart
3. ✅ Update cart
4. ✅ Place order
5. ✅ View order history

### Scenario 3: Payment Flow (Razorpay)
1. ✅ Add items to cart
2. ✅ Get Razorpay key
3. ✅ Create Razorpay order
4. ✅ Complete payment (TEST MODE)
5. ✅ Verify payment
6. ✅ Create order with payment details

---

## Testing Checklist

### Authentication
- [ ] Signup with valid data
- [ ] Signup with duplicate email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Access protected route without token (should fail)
- [ ] Access protected route with valid token

### Products
- [ ] Get all products
- [ ] Get product by ID
- [ ] Get products by category
- [ ] Search products
- [ ] Get categories

### Cart
- [ ] Add item to cart
- [ ] Add duplicate item (should increase quantity)
- [ ] Update cart item quantity
- [ ] Remove item from cart
- [ ] Get cart with totals

### Orders
- [ ] Create order with COD
- [ ] Create order with Razorpay
- [ ] Get order history
- [ ] Get order details
- [ ] Cancel order

### Addresses
- [ ] Add new address
- [ ] Get all addresses
- [ ] Update address
- [ ] Delete address
- [ ] Set default address

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Electronics Hub API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/signup",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"test123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

**Happy Testing! 🧪**
