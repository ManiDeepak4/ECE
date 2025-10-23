# 🚀 Quick Start Guide - Electronics Hub Backend

## Step 1: Install Dependencies

```bash
cd /workspaces/ECE/backend
npm install
```

## Step 2: Setup PostgreSQL Database

### Option A: If PostgreSQL is already running
```bash
# Create database
psql -U postgres -c "CREATE DATABASE electronics_hub;"

# Run schema
psql -U postgres -d electronics_hub -f utils/database.sql
```

### Option B: If PostgreSQL is not installed
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update && sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE electronics_hub;"

# Run schema
sudo -u postgres psql -d electronics_hub -f utils/database.sql
```

## Step 3: Configure Environment Variables

Edit the `.env` file:

```bash
nano .env
```

**Update these values:**

1. **Database Password:**
```
DB_PASSWORD=your_postgres_password
```

2. **SendGrid API Key:**
   - Sign up at https://sendgrid.com/
   - Get API key from Settings → API Keys
   - Paste here:
```
SENDGRID_API_KEY=SG.your_actual_key_here
```

3. **Razorpay Keys (TEST MODE):**
   - Sign up at https://razorpay.com/
   - Get TEST keys from Settings → API Keys
   - Paste here:
```
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

## Step 4: Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

## Step 5: Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

## 🎉 Success!

Your backend is now running on **http://localhost:5000**

### Next Steps:
1. ✅ Test all endpoints using Postman or curl
2. ✅ Add your SendGrid and Razorpay keys
3. ✅ Connect your frontend to the backend
4. ✅ Start building features!

## 📚 Documentation

Full API documentation is in `README.md`

## ❓ Need Help?

Check the troubleshooting section in README.md

---

**Happy Coding! 🚀**
