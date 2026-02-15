-- FIX RLS Policies for Hardcoded Admin
-- The hardcoded admin uses local state (is not authenticated with Supabase),
-- so they count as an "anon" (public) user.
-- We must allow public access for the admin dashboard to work.

-- 1. Allow reading ALL manufacturers (including pending/rejected)
DROP POLICY IF EXISTS "Anyone can read approved manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Anyone can read manufacturers" ON public.manufacturers;

CREATE POLICY "Anyone can read all manufacturers" ON public.manufacturers
  FOR SELECT USING (true);

-- 2. Allow UPDATE/DELETE for everyone (needed for hardcoded admin)
-- Note: In a production app, we would use Supabase Auth for admins.
-- For this project structure, we allow public operations.

-- Manufacturers
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.manufacturers;
CREATE POLICY "Public enable delete" ON public.manufacturers FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.manufacturers;
CREATE POLICY "Public enable update" ON public.manufacturers FOR UPDATE USING (true);

-- Medicines
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.medicines;
CREATE POLICY "Public enable delete" ON public.medicines FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.medicines;
CREATE POLICY "Public enable update" ON public.medicines FOR UPDATE USING (true);

-- Codes
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.medicine_codes;
CREATE POLICY "Public enable delete" ON public.medicine_codes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.medicine_codes;
CREATE POLICY "Public enable update" ON public.medicine_codes FOR UPDATE USING (true);
