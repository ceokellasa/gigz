CREATE TABLE IF NOT EXISTS saved_gigs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, gig_id)
);

-- RLS
ALTER TABLE saved_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved gigs"
ON saved_gigs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved gigs"
ON saved_gigs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved gigs"
ON saved_gigs FOR DELETE
USING (auth.uid() = user_id);
