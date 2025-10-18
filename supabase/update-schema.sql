-- Update users table to include all skin-quiz fields
-- This script adds missing fields for complete quiz data storage

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS makeup_usage TEXT,
ADD COLUMN IF NOT EXISTS sunscreen_preference TEXT,
ADD COLUMN IF NOT EXISTS ingredient_preferences JSONB,
ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMP WITH TIME ZONE;

-- Update the comment to reflect the complete schema
COMMENT ON TABLE users IS 'Users table with complete skin profile data from quiz';

-- Add comments for the new columns
COMMENT ON COLUMN users.makeup_usage IS 'User makeup usage preference from quiz';
COMMENT ON COLUMN users.sunscreen_preference IS 'User sunscreen preference from quiz';
COMMENT ON COLUMN users.ingredient_preferences IS 'User ingredient preferences/allergies from quiz';
COMMENT ON COLUMN users.quiz_completed IS 'Whether user has completed the skin quiz';
COMMENT ON COLUMN users.quiz_completed_at IS 'Timestamp when user completed the skin quiz';
COMMENT ON COLUMN users.skin_concerns IS 'User skin concerns from quiz (top 2 selected)';
COMMENT ON COLUMN users.skin_goals IS 'User skin goals (can be derived from concerns or separate)';
COMMENT ON COLUMN users.allergies IS 'User allergies (separate from ingredient preferences)';

-- The updated users table now includes:
-- - Basic user info: id, email, first_name, last_name, avatar, created_at, updated_at
-- - Quiz completion: quiz_completed, quiz_completed_at
-- - Skin profile: skin_type, skin_concerns, skin_goals, allergies
-- - Quiz preferences: makeup_usage, sunscreen_preference, ingredient_preferences
