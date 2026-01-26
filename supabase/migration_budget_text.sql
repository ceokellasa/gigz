-- Change budget column from numeric/integer to text to support ranges and "Contact for Price"
ALTER TABLE gigs
ALTER COLUMN budget TYPE text;
