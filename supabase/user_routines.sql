-- Create user_routines table to store routine history
-- This table stores all versions of user routines, preserving history
CREATE TABLE user_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine JSONB NOT NULL, -- Stores the complete routine: { morning: RoutineStep[], evening: RoutineStep[] }
  name TEXT, -- Optional name for the routine (e.g., "Summer Routine", "Winter Routine")
  is_current BOOLEAN DEFAULT FALSE, -- Indicates if this is the user's current active routine
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure routine always has both morning and evening arrays
  CONSTRAINT routine_must_have_morning_and_evening CHECK (
    routine ? 'morning' AND 
    routine ? 'evening' AND
    jsonb_typeof(routine->'morning') = 'array' AND
    jsonb_typeof(routine->'evening') = 'array'
  )
);

-- Create index on user_id for faster queries
CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX idx_user_routines_is_current ON user_routines(user_id, is_current) WHERE is_current = TRUE;

-- Enable Row Level Security
ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;

-- Create policies for user_routines table
CREATE POLICY "Users can view own routines" ON user_routines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines" ON user_routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" ON user_routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" ON user_routines
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.handle_user_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER handle_user_routines_updated_at
  BEFORE UPDATE ON user_routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_routines_updated_at();

-- Create function to ensure only one current routine per user
CREATE OR REPLACE FUNCTION public.handle_set_current_routine()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new routine is marked as current, unset all other current routines for this user
  IF NEW.is_current = TRUE THEN
    UPDATE user_routines
    SET is_current = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to ensure only one current routine
CREATE TRIGGER handle_set_current_routine_trigger
  BEFORE INSERT OR UPDATE ON user_routines
  FOR EACH ROW
  WHEN (NEW.is_current = TRUE)
  EXECUTE FUNCTION public.handle_set_current_routine();

-- Add column comments for documentation
COMMENT ON TABLE user_routines IS 'Stores all versions of user skincare routines, preserving history';
COMMENT ON COLUMN user_routines.routine IS 'Complete routine data: { morning: RoutineStep[], evening: RoutineStep[] }';
COMMENT ON COLUMN user_routines.is_current IS 'Indicates if this is the user''s current active routine (only one per user)';
COMMENT ON COLUMN user_routines.name IS 'Optional name for the routine version';
