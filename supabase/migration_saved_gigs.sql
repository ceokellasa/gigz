-- Create saved_gigs table for bookmarking/favoriting gigs
CREATE TABLE IF NOT EXISTS saved_gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gig_id)
);

-- Enable RLS
ALTER TABLE saved_gigs ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved gigs
CREATE POLICY "Users can view own saved gigs" ON saved_gigs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can save gigs
CREATE POLICY "Users can save gigs" ON saved_gigs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave gigs
CREATE POLICY "Users can unsave gigs" ON saved_gigs
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_gigs_user_id ON saved_gigs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_gigs_gig_id ON saved_gigs(gig_id);
