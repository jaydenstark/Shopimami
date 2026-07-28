/* global process */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load env variables manually from .env.local
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([^=#]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not configured in .env.local");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const schemaSql = `
-- Drop tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS malls CASCADE;

-- Create Malls table
CREATE TABLE malls (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Create Stores table
CREATE TABLE stores (
  id VARCHAR(50) PRIMARY KEY,
  mall_id VARCHAR(50) REFERENCES malls(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL
);

-- Create Products table
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  store_id VARCHAR(50) REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  description TEXT
);

-- Create Orders table
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  location TEXT NOT NULL,
  mall_name VARCHAR(100) NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  momo_provider VARCHAR(50) NOT NULL,
  shopper VARCHAR(100),
  rider VARCHAR(100),
  flagged BOOLEAN DEFAULT FALSE,
  flag_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  picked BOOLEAN DEFAULT FALSE
);
`;

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute Schema creation
    await client.query(schemaSql);
    console.log("Schema created successfully.");

    // Seed Malls
    await client.query(`
      INSERT INTO malls (id, name) VALUES
      ('accra_mall', 'Accra Mall'),
      ('west_hills', 'West Hills Mall'),
      ('ac_mall', 'A&C Mall');
    `);

    // Seed Stores
    await client.query(`
      INSERT INTO stores (id, mall_id, name) VALUES
      ('shoprite_accra', 'accra_mall', 'Shoprite'),
      ('melcom_accra', 'accra_mall', 'Melcom'),
      ('game_accra', 'accra_mall', 'Game'),
      ('shoprite_west', 'west_hills', 'Shoprite'),
      ('melcom_west', 'west_hills', 'Melcom'),
      ('palace_west', 'west_hills', 'Palace Store'),
      ('shoprite_ac', 'ac_mall', 'Shoprite'),
      ('melcom_ac', 'ac_mall', 'Melcom'),
      ('game_ac', 'ac_mall', 'Game');
    `);

    // Seed Products
    await client.query(`
      INSERT INTO products (id, store_id, name, price, image, description) VALUES
      ('p1', 'shoprite_accra', 'Gazzaz Perfumed Rice 5kg', 120.00, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 'Premium long grain perfumed rice, excellent for Jollof.'),
      ('p2', 'shoprite_accra', 'Gino Tomato Paste 400g', 25.00, 'https://images.unsplash.com/photo-1607305387299-a3d9611cd46f?w=400&q=80', 'Rich double concentrated tomato paste.'),
      ('p3', 'shoprite_accra', 'Frytol Cooking Oil 1L', 45.00, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', 'Pure vegetable cooking oil for all frying and cooking needs.'),
      ('p4', 'game_accra', 'Sony Bluetooth Headphones', 650.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', 'Wireless over-ear noise-cancelling headphones.'),
      ('p5', 'game_accra', 'Oraimo 20000mAh Power Bank', 220.00, 'https://images.unsplash.com/photo-1609592426615-27432f97db4e?w=400&q=80', 'High-capacity fast-charging portable power bank.');
    `);

    // Seed Orders (matching mallData.js initial state)
    // Order 1
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1001', 'Payment Confirmed', 'Kwasi Mensah', '0244123456', 'Spintex Road, Accra', 'Accra Mall', 'Shoprite', 215.00, 25.00, 10.75, 250.75, 'MTN MoMo', '', '', false, '', '2026-07-27T18:30:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1001', 'Gazzaz Perfumed Rice 5kg', 120.00, 1, false),
      ('ORD-1001', 'Gino Tomato Paste 400g', 25.00, 2, false),
      ('ORD-1001', 'Frytol Cooking Oil 1L', 45.00, 1, false);
    `);

    // Order 2
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1002', 'Shopper Assigned & Shopping', 'Abena Osei', '0555678901', 'Tema Community 6, Tema', 'Accra Mall', 'Game', 870.00, 25.00, 43.50, 938.50, 'Telecel Cash', 'Ekow Appiah', '', false, '', '2026-07-27T19:15:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1002', 'Sony Bluetooth Headphones', 650.00, 1, true),
      ('ORD-1002', 'Oraimo 20000mAh Power Bank', 220.00, 1, false);
    `);

    // Order 3
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1003', 'Paid at Mall', 'John Boateng', '0201122334', 'Dansoman, Accra', 'West Hills Mall', 'Melcom', 1500.00, 25.00, 75.00, 1600.00, 'MTN MoMo', 'Adjoa Sarfo', '', false, '', '2026-07-27T20:00:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1003', 'Nasco 32 Inch LED TV', 1500.00, 1, true);
    `);

    // Order 4
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1004', 'Waiting for Rider', 'Fatima Bello', '0243445566', 'East Legon, Accra', 'West Hills Mall', 'Palace Store', 550.00, 25.00, 27.50, 602.50, 'AirtelTigo Money', 'Kofi Owusu', '', false, '', '2026-07-27T20:30:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1004', 'Handmade Leather Men Sandals', 250.00, 1, true),
      ('ORD-1004', 'Ghana Kente Muffler', 150.00, 2, true);
    `);

    // Order 5
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1005', 'Out for Delivery', 'Samuel Dogbe', '0549988776', 'Airport Residential, Accra', 'A&C Mall', 'Game', 440.00, 25.00, 22.00, 487.00, 'MTN MoMo', 'Ama Koomson', 'Yaw Preko', true, 'Rider delayed due to heavy rain on Spintex Road.', '2026-07-27T21:00:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1005', 'Oraimo 20000mAh Power Bank', 220.00, 2, true);
    `);

    // Order 6
    await client.query(`
      INSERT INTO orders (id, status, customer_name, phone, location, mall_name, store_name, subtotal, delivery_fee, service_fee, total, momo_provider, shopper, rider, flagged, flag_note, created_at) VALUES
      ('ORD-1006', 'Delivered', 'Dr. Grace Osei', '0244111222', 'Legon Campus, Accra', 'A&C Mall', 'Shoprite', 270.00, 25.00, 13.50, 308.50, 'MTN MoMo', 'Ama Koomson', 'Yaw Preko', false, '', '2026-07-27T21:30:00Z');
    `);
    await client.query(`
      INSERT INTO order_items (order_id, name, price, quantity, picked) VALUES
      ('ORD-1006', 'Milo Chocolate Drink 400g', 60.00, 2, true),
      ('ORD-1006', 'Nido Milk Powder 400g', 75.00, 2, true);
    `);

    await client.query('COMMIT');
    console.log("Database seeded successfully with initial Athenian MallMart data.");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Database seeding failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
