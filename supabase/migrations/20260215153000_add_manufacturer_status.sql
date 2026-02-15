-- Add status column to manufacturers table for approval workflow
ALTER TABLE public.manufacturers 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- Add constraint to only allow specific values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'manufacturers_status_check'
  ) THEN
    ALTER TABLE public.manufacturers 
    ADD CONSTRAINT manufacturers_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Set all existing manufacturers to approved (migration step)
UPDATE public.manufacturers SET status = 'approved' WHERE status IS NULL OR status = '';

-- Update RLS policies to only show approved manufacturers publicly
DROP POLICY IF EXISTS "Anyone can read manufacturers" ON public.manufacturers;

-- Public can only see approved manufacturers
CREATE POLICY "Anyone can read approved manufacturers" ON public.manufacturers
  FOR SELECT USING (status = 'approved');

-- Note: Admin access is controlled by application logic, not RLS
-- Manufacturers can still read their own profile regardless of status
