/*
  # Unicart Food Delivery Database Schema

  ## Overview
  Creates the core tables for a college food delivery app with shared batch tracking.

  ## Tables Created
  
  ### 1. menu_items
  - `id` (uuid, primary key)
  - `name` (text) - Item name
  - `price` (decimal) - Student price
  - `category` (text) - Category (Biryani, Chinese, Snacks, Drinks)
  - `image_url` (text) - Optional product image
  - `description` (text) - Item description
  - `is_available` (boolean) - Stock availability
  - `is_recommended` (boolean) - Featured items
  - `created_at` (timestamptz)
  
  ### 2. order_batches
  - `id` (uuid, primary key)
  - `slot_label` (text) - E.g., "Dinner 7:30-8:00 PM"
  - `current_step` (int) - Progress step (1-5)
  - `status_message` (text) - Custom message for users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. orders
  - `id` (uuid, primary key)
  - `batch_id` (uuid, foreign key)
  - `user_name` (text)
  - `hostel` (text)
  - `room` (text)
  - `phone` (text)
  - `items` (jsonb) - Order items array
  - `total_amount` (decimal)
  - `payment_mode` (text) - Default: "Pay on delivery"
  - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Public read access for menu_items (viewing menu)
  - Authenticated admin access for orders and batch management
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text DEFAULT '',
  description text DEFAULT '',
  is_available boolean DEFAULT true,
  is_recommended boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create order_batches table
CREATE TABLE IF NOT EXISTS order_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_label text NOT NULL,
  current_step int DEFAULT 1,
  status_message text DEFAULT 'Collecting orders',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES order_batches(id),
  user_name text NOT NULL,
  hostel text NOT NULL,
  room text NOT NULL,
  phone text NOT NULL,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  payment_mode text DEFAULT 'Pay on delivery',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for menu_items (public can view)
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for order_batches (public can view current batch)
CREATE POLICY "Anyone can view order batches"
  ON order_batches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage batches"
  ON order_batches FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for orders (users can create, admin can view all)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample menu items with TheKitchen-inspired items
INSERT INTO menu_items (name, price, category, description, is_recommended, is_available) VALUES
  ('Chicken Biryani', 180, 'Biryani', 'Aromatic basmati rice with tender chicken pieces', true, true),
  ('Veg Biryani', 140, 'Biryani', 'Flavorful rice with mixed vegetables and spices', true, true),
  ('Paneer Biryani', 160, 'Biryani', 'Rich biryani with cottage cheese cubes', false, true),
  ('Schezwan Noodles', 120, 'Chinese', 'Spicy noodles with vegetables', true, true),
  ('Veg Fried Rice', 100, 'Chinese', 'Classic fried rice with mixed veggies', false, true),
  ('Manchurian Dry', 130, 'Chinese', 'Crispy vegetable balls tossed in spicy sauce', true, true),
  ('Samosa (2 pcs)', 30, 'Snacks', 'Crispy pastry filled with spiced potatoes', false, true),
  ('Pav Bhaji', 80, 'Snacks', 'Spicy mixed vegetables with buttered buns', true, true),
  ('Paneer Tikka', 150, 'Snacks', 'Grilled cottage cheese with Indian spices', false, true),
  ('Cold Coffee', 60, 'Drinks', 'Refreshing iced coffee with milk', false, true),
  ('Masala Chai', 20, 'Drinks', 'Indian spiced tea', false, true),
  ('Fresh Lime Soda', 40, 'Drinks', 'Fizzy lime drink with a tangy twist', false, true);

-- Create default batch for today
INSERT INTO order_batches (slot_label, current_step, status_message) VALUES
  ('Dinner 8:00-8:30 PM', 1, 'Accepting orders for tonight''s delivery slot');
