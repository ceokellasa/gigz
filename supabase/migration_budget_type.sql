-- Add budget_type column to gigs table
-- This allows gigs to be either fixed price or hourly rate

ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly'));

-- Update the comment on the budget column to reflect both types
COMMENT ON COLUMN gigs.budget IS 'Budget amount - either total fixed price or hourly rate depending on budget_type';
COMMENT ON COLUMN gigs.budget_type IS 'Type of budget: fixed (total amount) or hourly (per hour rate)';
