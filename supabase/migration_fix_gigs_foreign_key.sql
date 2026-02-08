-- Fix gigs table foreign key to allow joining with profiles
DO $$
BEGIN
    -- Check if the constraint needs to be changed
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'gigs_client_id_fkey' 
        AND table_name = 'gigs'
    ) THEN
        ALTER TABLE gigs DROP CONSTRAINT gigs_client_id_fkey;
    END IF;

    -- Add the correct constraint referencing public.profiles
    ALTER TABLE gigs
    ADD CONSTRAINT gigs_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;
END $$;
