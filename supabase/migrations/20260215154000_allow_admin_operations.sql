-- RLS policies to allow admin operations (delete and update)
-- Run this in Supabase SQL Editor

-- Allow DELETE on manufacturers
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.manufacturers;
CREATE POLICY "Enable delete for authenticated users" ON public.manufacturers
  FOR DELETE USING (true);

-- Allow UPDATE on manufacturers
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.manufacturers;
CREATE POLICY "Enable update for authenticated users" ON public.manufacturers
  FOR UPDATE USING (true);

-- Allow DELETE on medicines
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.medicines;
CREATE POLICY "Enable delete for authenticated users" ON public.medicines
  FOR DELETE USING (true);

-- Allow UPDATE on medicines
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.medicines;
CREATE POLICY "Enable update for authenticated users" ON public.medicines
  FOR UPDATE USING (true);

-- Allow DELETE on medicine_codes
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.medicine_codes;
CREATE POLICY "Enable delete for authenticated users" ON public.medicine_codes
  FOR DELETE USING (true);

-- Allow UPDATE on medicine_codes
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.medicine_codes;
CREATE POLICY "Enable update for authenticated users" ON public.medicine_codes
  FOR UPDATE USING (true);
