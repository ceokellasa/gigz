-- Enforce that a user can have only one professional profile
-- We do this by adding a UNIQUE constraint on the user_id column
-- If duplicates exist, this might fail, but for a clean state it ensures logic.

ALTER TABLE professional_profiles
ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);
