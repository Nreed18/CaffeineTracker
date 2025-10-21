-- Fix corrupted dates in periods table
-- This script will help identify and fix date issues

-- First, let's see what we're working with
SELECT
  id,
  name,
  start_date,
  end_date,
  EXTRACT(YEAR FROM start_date) as start_year,
  EXTRACT(YEAR FROM end_date) as end_year
FROM periods
ORDER BY start_date;

-- If you see dates from 1969 or other incorrect years,
-- you'll need to manually update them below.

-- Example updates (replace with your actual period IDs and correct dates):
-- UPDATE periods SET start_date = '2025-01-20', end_date = '2025-01-24' WHERE name = 'Period 1';
-- UPDATE periods SET start_date = '2025-01-27', end_date = '2025-01-31' WHERE name = 'Period 2';

-- After fixing dates, verify:
SELECT
  id,
  name,
  start_date,
  end_date
FROM periods
ORDER BY start_date;
