CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_diary_entries table
CREATE TABLE IF NOT EXISTS user_diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  entry_name TEXT,
  skin_feel TEXT NOT NULL CHECK (skin_feel IN ('dry', 'oily', 'balanced', 'sensitive', 'irritated', 'combination', 'normal', 'acne')),
  skin_condition_rating INTEGER CHECK (skin_condition_rating >= 1 AND skin_condition_rating <= 5),
  notes TEXT,
  products_used JSONB DEFAULT '[]'::jsonb,
  concerns_noted JSONB DEFAULT '[]'::jsonb,
  mood TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Drop entry_type column if it exists (migration for existing databases)
ALTER TABLE user_diary_entries DROP COLUMN IF EXISTS entry_type;

-- Drop entry_type index if it exists
DROP INDEX IF EXISTS idx_user_diary_entries_entry_type;

-- Enable Row Level Security
ALTER TABLE user_diary_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own diary entries" ON user_diary_entries;
DROP POLICY IF EXISTS "Users can insert own diary entries" ON user_diary_entries;
DROP POLICY IF EXISTS "Users can update own diary entries" ON user_diary_entries;
DROP POLICY IF EXISTS "Users can delete own diary entries" ON user_diary_entries;

-- Create policies
CREATE POLICY "Users can view own diary entries" ON user_diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON user_diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON user_diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON user_diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_diary_entries_user_date ON user_diary_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_diary_entries_skin_feel ON user_diary_entries(skin_feel);

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS handle_updated_at_diary_entries ON user_diary_entries;

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_diary_entries
  BEFORE UPDATE ON user_diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add column comments for documentation
COMMENT ON TABLE user_diary_entries IS 'User diary entries for tracking daily skin condition';
COMMENT ON COLUMN user_diary_entries.entry_date IS 'Date of the diary entry';
COMMENT ON COLUMN user_diary_entries.entry_name IS 'Formatted date string (e.g., "Monday, November 15, 2025") - automatically set to the entry date';
COMMENT ON COLUMN user_diary_entries.skin_feel IS 'How the skin feels: dry, oily, balanced, sensitive, irritated, combination, normal, or acne';
COMMENT ON COLUMN user_diary_entries.skin_condition_rating IS 'Rating from 1-5 indicating overall skin condition';
COMMENT ON COLUMN user_diary_entries.notes IS 'Additional notes about the skin condition or entry';
COMMENT ON COLUMN user_diary_entries.products_used IS 'Array of product names or IDs used on this day';
COMMENT ON COLUMN user_diary_entries.concerns_noted IS 'Array of concerns noticed (e.g., breakout, dryness, redness)';
COMMENT ON COLUMN user_diary_entries.mood IS 'User mood on this day';
COMMENT ON COLUMN user_diary_entries.image_url IS 'Base64 encoded image or image URL for the diary entry';
