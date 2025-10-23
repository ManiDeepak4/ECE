-- Electronics Hub Database Schema
-- PostgreSQL Database Setup

-- Create Database (run this first if database doesn't exist)
-- CREATE DATABASE electronics_hub;

-- Connect to the database
-- \c electronics_hub;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- USERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ====================================
-- ADDRESSES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ====================================
-- CATEGORIES TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    key VARCHAR(50) UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- PRODUCTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category_key VARCHAR(50),
    image_url TEXT,
    availability VARCHAR(50) DEFAULT 'In Stock',
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category_key ON products(category_key);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ====================================
-- CART TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- ====================================
-- ORDERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) DEFAULT 50.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'COD', 'UPI', 'Razorpay'
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed'
    order_status VARCHAR(50) DEFAULT 'Placed', -- 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- ====================================
-- ORDER ITEMS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ====================================
-- SEARCH HISTORY TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_term VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

-- ====================================
-- FUNCTIONS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SEED DATA - Categories
-- ====================================
INSERT INTO categories (name, key, image_url) VALUES
('Sensors', 'sensors', 'https://m.media-amazon.com/images/I/71NvXRQrM5L.jpg'),
('Robotics', 'robotics', 'https://www.nvenia.com/wp-content/uploads/2021/05/Robot-no-conveyors_2560x2560-1500x1500.jpg'),
('Hardware', 'hardware', 'https://image.made-in-china.com/202f0j00QMEhrwYnvzup/Household-Tools-Package-Hardware-Set-Electric-Drill-Home-Electrician-Maintenance-Multi-Functional-Portable-Hardware-Tools-108PC.jpg'),
('Microcontrollers', 'microcontrollers', 'https://www.elprocus.com/wp-content/uploads/Microcontrollers-Types.jpg'),
('Modules', 'modules', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTuy-0WZ6Nv2q66rZ23hbU-_053NfRmfAzhPYymWd-bakITpIRJvSapP9oqT4Lrsoiebo26NxG0pZMutsm1t3sxmuD38p3fWYN5GQXnGoddAh-CoHzD44u6hw'),
('Displays', 'displays', 'https://my.element14.com/productimages/large/en_GB/3769973-40.jpg'),
('Power', 'power', 'https://www.enix-power-solutions.com/wp-content/uploads/2021/06/Lithium-ion-standard-Battery.jpg'),
('Projects', 'projects', 'https://cdn11.bigcommerce.com/s-am5zt8xfow/images/stencil/1280x1280/products/1706/4146/apijsjkao__93747.1554993207.jpg?c=2'),
('Restored Electronics', 'restored', 'https://tse4.mm.bing.net/th/id/OIP.wQvlDjVHaUOXQTxf7yjG5QHaLa?rs=1&pid=ImgDetMain&o=7&rm=3')
ON CONFLICT (key) DO NOTHING;

-- ====================================
-- SEED DATA - Products
-- ====================================
INSERT INTO products (name, type, description, price, category_key, image_url, availability, stock_quantity) VALUES
-- Sensors
('Ultrasonic Sensor', 'HC-SR04', 'Best Prices, Multi-Brand Ultrasonic Sensors HC-SR04-Ultrasonic Range Finder', 120.00, 'sensors', 'https://m.media-amazon.com/images/I/61V7-pm5ktL.jpg', 'In Stock', 50),
('IR Sensor', 'IR-Module', 'Best Prices, Multi-Brand IR Sensors for distance detection', 80.00, 'sensors', 'https://robu.in/wp-content/uploads/2016/01/IR-sensor-Module-2.jpg', 'In Stock', 75),
('DHT11 Temp Sensor', 'DHT11', 'Best Prices, Multi-Brand Temperature & Humidity Sensors', 150.00, 'sensors', 'https://m.media-amazon.com/images/I/41bTjJUcBuL.jpg', 'Out of Stock', 0),

-- Robotics
('BO Motor', 'DC Motor', 'High quality motors for robotics projects', 100.00, 'robotics', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS68f1-SsSdB3uxnFVm_5NBDzpcW3oBOSEgvA&s', 'In Stock', 100),
('Servo Motor', 'SG90', 'Best Servo Motor for precise robotics movements', 250.00, 'robotics', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSPXaea5VZ2_pwhI57LCnVINLohnmpM9bKu9a8jtlObkfsyA1ak7h7D2tUyRmCsqWjnLhgWR6gcwjIULpnppTZUx1jE5g4mJb7kI_cXWLCQf0LLDE58anfI', 'In Stock', 60),

-- Hardware
('Breadboard', 'MB-102', 'Multi-purpose breadboard for electronics prototyping', 90.00, 'hardware', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSUEdHCiHqvI5mSMNqYKHH2g-qY2ljbSqIj0Qn203Hk5WY4F4_SPhNdA3DD9iJIWXTWFIb33bavPHoNEP4NLhkU-j77ocXtoRqwESQhkmEi8CLS22oFPyl8Ow', 'In Stock', 120),
('Resistors Pack', 'Various', 'Assorted resistor pack for electronics projects', 50.00, 'hardware', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRqN28n1Bb-Yn9jyRpbDgZAyxceYE5Rqrb10PIuYbpo_wbCx7dr-w3spniz6hdwz-YqlFxtwLjAyHs2NNCJdjB0ezAr_WbtSfmrzdX5TUpC', 'In Stock', 200),

-- Microcontrollers
('Arduino Uno', 'ATmega328P', 'Popular microcontroller board for prototyping', 600.00, 'microcontrollers', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR4296IvdSETY2Pjk2OGXG0jAhOs8bEwOu4Q9aauXdvf_dwpNKff5i6Msdr2lAeWuUp-5SbV1lV3kLtOISeAKRj-iKQuSsRhXNfnJVuBRzKOSueFqLXG9vo6g', 'In Stock', 40),
('ESP32 Board', 'WiFi+BLE', 'Feature-rich ESP32 development board', 450.00, 'microcontrollers', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQKpLXQS6qKVYMCCNCgU5PiWP3W_lyBHPhYD8huzKvK72S2tVD3X74lYByMd2_TizXN1ssWOSwxNOZa6EVXU1TfNlsZQ4Fu33SO3n1f8-yrOWbbIWp7givu', 'In Stock', 35),

-- Modules
('Relay Module', '5V 1-Channel', 'Reliable relay module for electronics control', 150.00, 'modules', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSeR5jWB5MzCziSj5y5ZTqbgKjGGf6kgEzhZXplY89iILHB0bp_kTsPK2V8wR9xG2-TNgTHDmIp2svZWdNEvJibFDSbwblEOw', 'In Stock', 80),
('Bluetooth Module', 'HC-05', 'Bluetooth communication module for wireless control', 200.00, 'modules', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQcrYIqL-DXlPOnNNPOAYmPb7YBxFqVUXoi07mp-CkCzqpo0U6WMsOtqKtAGIuJEBxvvLyuMs3zPPWpX88MPNr8msyIncQCfH3HGhmW9RErNFIj1S1WOOF2-ds', 'In Stock', 55),

-- Displays
('LCD 16x2', 'HD44780', '16x2 Character LCD display for microcontroller projects', 300.00, 'displays', 'https://soldered.com/productdata/2022/04/28481-Edit.jpg', 'In Stock', 30),

-- Power/Batteries
('Batteries', 'Alkaline', 'Standard lithium ion batteries for electronics circuits', 80.00, 'power', 'https://cdn03.plentymarkets.com/i9a0e0hd8l6w/item/images/100732/full/22650-A-Lithium-Ionen-Akku-3-6V-3-7V-3000mAh.jpg', 'In Stock', 150)
ON CONFLICT DO NOTHING;

-- ====================================
-- QUERIES FOR REFERENCE
-- ====================================

-- Get all products with category info
-- SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_key = c.key;

-- Get user's cart with product details
-- SELECT c.*, p.name, p.price, p.image_url FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = 'user-uuid';

-- Get user's orders with order items
-- SELECT o.*, oi.product_name, oi.quantity, oi.product_price FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = 'user-uuid';
