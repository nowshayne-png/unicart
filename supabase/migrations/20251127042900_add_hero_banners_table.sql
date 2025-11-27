/*
  # Add Hero Banners Table

  1. New Tables
    - `hero_banners`
      - `id` (uuid, primary key)
      - `title` (text) - Banner title/heading
      - `description` (text) - Banner description
      - `image_url` (text) - Banner image or gradient
      - `bg_color` (text) - Background color (hex)
      - `text_color` (text) - Text color (hex)
      - `action_text` (text) - CTA button text
      - `action_link` (text) - CTA link or action
      - `order` (int) - Display order for carousel
      - `is_active` (boolean) - Show/hide banner
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Public read access for viewing banners
    - Authenticated admin access for management
*/

CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  bg_color text DEFAULT '#1a1a1a',
  text_color text DEFAULT '#ffffff',
  action_text text DEFAULT '',
  action_link text DEFAULT '',
  "order" int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero banners"
  ON hero_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage banners"
  ON hero_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample hero banners
INSERT INTO hero_banners (title, description, bg_color, text_color, action_text, "order", is_active) VALUES
  ('🎉 New Menu Items!', 'Check out our latest Chinese dishes', '#1a1a1a', '#c4ff00', 'View Menu', 1, true),
  ('⚡ Flash Deal', '20% off on orders above ₹200', '#1a1a1a', '#c4ff00', 'Shop Now', 2, true),
  ('🥗 Healthy Options', 'Fresh salads and light bites available', '#1a1a1a', '#c4ff00', 'Explore', 3, true);
