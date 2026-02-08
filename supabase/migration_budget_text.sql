-- Change budget column from numeric/integer to text to allow "Contact for Price" and ranges
ALTER TABLE gigs ALTER COLUMN budget TYPE text;
