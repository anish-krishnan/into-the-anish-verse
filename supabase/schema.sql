-- Anish-Verse Trading Card Generator
-- Run this SQL in your Supabase SQL Editor

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  stat1_name TEXT NOT NULL,
  stat1_level INTEGER NOT NULL CHECK (stat1_level BETWEEN 1 AND 6),
  stat2_name TEXT NOT NULL,
  stat2_level INTEGER NOT NULL CHECK (stat2_level BETWEEN 1 AND 6),
  raw_image_path TEXT,
  composite_image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (optional, but good practice)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow read access for all (cards are public)
CREATE POLICY "Cards are publicly readable"
  ON cards FOR SELECT
  USING (true);

-- Allow insert from service role only (server-side)
CREATE POLICY "Service role can insert cards"
  ON cards FOR INSERT
  WITH CHECK (true);

-- Storage bucket setup instructions:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket called "cards"
-- 3. Make it PUBLIC (toggle public access on)
-- 4. No additional policies needed for public read access
