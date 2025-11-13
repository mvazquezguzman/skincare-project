-- Create users table with Supabase Auth integration
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Skincare profile
  skin_type TEXT,
  skin_concerns JSONB,
  skin_goals JSONB,
  allergies JSONB,
  ingredient_preferences JSONB,
  
  -- Quiz preferences
  makeup_usage TEXT,
  sunscreen_preference TEXT,
  budget_range TEXT,
  
  -- Quiz completion tracking
  quiz_completed BOOLEAN DEFAULT FALSE,
  quiz_completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add column comments for documentation
COMMENT ON TABLE users IS 'Users table with complete skin profile data from quiz';
COMMENT ON COLUMN users.skin_type IS 'User skin type from quiz';
COMMENT ON COLUMN users.skin_concerns IS 'User skin concerns from quiz (top 2 selected)';
COMMENT ON COLUMN users.skin_goals IS 'User skin goals (can be derived from concerns or separate)';
COMMENT ON COLUMN users.allergies IS 'User allergies (separate from ingredient preferences)';
COMMENT ON COLUMN users.ingredient_preferences IS 'User ingredient preferences/allergies from quiz';
COMMENT ON COLUMN users.makeup_usage IS 'User makeup usage preference from quiz';
COMMENT ON COLUMN users.sunscreen_preference IS 'User sunscreen preference from quiz';
COMMENT ON COLUMN users.budget_range IS 'User budget range preference from quiz (budget, moderate, premium, luxury, flexible)';
COMMENT ON COLUMN users.quiz_completed IS 'Whether user has completed the skin quiz';
COMMENT ON COLUMN users.quiz_completed_at IS 'Timestamp when user completed the skin quiz';
