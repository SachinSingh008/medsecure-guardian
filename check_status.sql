-- Run this in Supabase SQL Editor to check if status column exists

-- Check if status column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'manufacturers' AND column_name = 'status';

-- Check all manufacturers and their status
SELECT id, company_name, license_number, status, created_at 
FROM manufacturers 
ORDER BY created_at DESC;

-- Count by status
SELECT status, COUNT(*) as count 
FROM manufacturers 
GROUP BY status;
