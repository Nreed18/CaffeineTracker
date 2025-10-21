# Database Migration & Fix Guide

## Problem
Dates are showing as 1969 or incorrect values due to timezone conversion issues in the old code.

## Steps to Fix

### Step 1: Backup Your Database (IMPORTANT!)

```bash
# On your server, create a backup first
sudo -u postgres pg_dump caffeine_tracker > ~/caffeine_backup_$(date +%Y%m%d).sql
```

### Step 2: Check Current Data

```bash
# Connect to the database
sudo -u postgres psql caffeine_tracker

# Run this query to see current data:
SELECT id, name, start_date, end_date FROM periods ORDER BY start_date;
```

You'll likely see dates like `1969-12-31` or other incorrect dates.

### Step 3: Update the Database Schema

```bash
# Exit psql first (type \q)
# Then run the migration
cd /opt/caffeine-tracker  # or your app directory
npm run db:push
```

This applies the cascade delete constraint.

### Step 4: Fix Corrupted Dates

You have two options:

#### Option A: If you remember your period dates

```bash
sudo -u postgres psql caffeine_tracker
```

Then run UPDATE commands for each period:

```sql
-- Example: Update each period with correct dates
-- Replace the WHERE clause and dates with your actual values

-- Find period IDs and names
SELECT id, name, start_date, end_date FROM periods;

-- Update each period (one at a time)
UPDATE periods
SET start_date = '2025-01-20', end_date = '2025-01-24'
WHERE id = 'your-period-id-here';

-- Repeat for each period

-- Verify the fix
SELECT id, name, start_date, end_date FROM periods ORDER BY start_date;
```

Exit psql with `\q`

#### Option B: If you don't remember exact dates but want to keep the drink data

```bash
sudo -u postgres psql caffeine_tracker
```

```sql
-- Check what dates your drinks were logged
SELECT
  p.id,
  p.name,
  MIN(DATE(de.timestamp)) as first_drink,
  MAX(DATE(de.timestamp)) as last_drink,
  COUNT(*) as drink_count
FROM periods p
LEFT JOIN drink_entries de ON p.id = de.period_id
GROUP BY p.id, p.name
ORDER BY first_drink;

-- Update periods based on actual drink dates
-- For each period, run:
UPDATE periods
SET
  start_date = (SELECT DATE(MIN(timestamp)) FROM drink_entries WHERE period_id = 'period-id-here'),
  end_date = (SELECT DATE(MAX(timestamp)) FROM drink_entries WHERE period_id = 'period-id-here')
WHERE id = 'period-id-here';

-- Verify
SELECT id, name, start_date, end_date FROM periods ORDER BY start_date;
```

Exit with `\q`

### Step 5: Restart the Application

```bash
sudo systemctl restart caffeine-tracker

# Check it's running
sudo systemctl status caffeine-tracker

# Check logs for errors
sudo journalctl -u caffeine-tracker -n 50
```

### Step 6: Verify in Browser

1. Open your app in the browser
2. Go to "Manage Periods" tab
3. Check that dates are showing correctly (not 1969)
4. Check that the week view shows correct dates

## Troubleshooting

### If dates are still wrong after migration:

```bash
# Check the database directly
sudo -u postgres psql caffeine_tracker -c "SELECT id, name, start_date, end_date FROM periods;"
```

### If app won't start:

```bash
# Check logs
sudo journalctl -u caffeine-tracker -f

# Common issues:
# 1. Database connection error - check .env file
# 2. Port already in use - restart the service
# 3. Permission errors - check file ownership
```

### To restore from backup (if something goes wrong):

```bash
# Stop the app
sudo systemctl stop caffeine-tracker

# Restore database
sudo -u postgres psql caffeine_tracker < ~/caffeine_backup_YYYYMMDD.sql

# Start the app
sudo systemctl start caffeine-tracker
```

## What Changed

1. **Schema**: Added CASCADE DELETE on foreign key (periods → drink_entries)
2. **Backend**: Dates now stored as strings ('YYYY-MM-DD') instead of Date objects
3. **Frontend**: Dates parsed as local dates to avoid timezone issues

## Need Help?

If you get stuck, check:
1. Database has correct dates: `sudo -u postgres psql caffeine_tracker -c "SELECT * FROM periods;"`
2. App is running: `sudo systemctl status caffeine-tracker`
3. No errors in logs: `sudo journalctl -u caffeine-tracker -n 50`
