-- This table stores analysis results from the routine analyzer
CREATE TABLE routine_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES user_routines(id) ON DELETE CASCADE NOT NULL,
  analysis_result JSONB NOT NULL, -- Stores the complete analysis: { overallScore, summary, conflicts, recommendations }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_routine_analyses_user_id ON routine_analyses(user_id);
CREATE INDEX idx_routine_analyses_routine_id ON routine_analyses(routine_id);
CREATE INDEX idx_routine_analyses_created_at ON routine_analyses(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE routine_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for routine_analyses table
CREATE POLICY "Users can view own analyses" ON routine_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON routine_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON routine_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON routine_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.handle_routine_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER handle_routine_analyses_updated_at
  BEFORE UPDATE ON routine_analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_routine_analyses_updated_at();

-- Add column comments for documentation
COMMENT ON TABLE routine_analyses IS 'Stores analysis results from routine analyzer';
COMMENT ON COLUMN routine_analyses.routine_id IS 'Reference to the routine that was analyzed';
COMMENT ON COLUMN routine_analyses.analysis_result IS 'Complete analysis data: { overallScore, summary, conflicts, recommendations }';
