
-- Manufacturers profile table
CREATE TABLE public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  factory_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manufacturers can read own profile" ON public.manufacturers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Manufacturers can insert own profile" ON public.manufacturers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Manufacturers can update own profile" ON public.manufacturers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read manufacturers" ON public.manufacturers
  FOR SELECT USING (true);

-- Medicines / Batches table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE CASCADE NOT NULL,
  medicine_name TEXT NOT NULL,
  composition TEXT,
  batch_number TEXT NOT NULL,
  mfg_date DATE NOT NULL,
  exp_date DATE NOT NULL,
  factory_location TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  packaging_type TEXT DEFAULT 'Strip',
  region_allocation TEXT,
  distributor_assigned TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manufacturers can read own medicines" ON public.medicines
  FOR SELECT USING (
    manufacturer_id IN (SELECT id FROM public.manufacturers WHERE user_id = auth.uid())
  );
CREATE POLICY "Manufacturers can insert own medicines" ON public.medicines
  FOR INSERT WITH CHECK (
    manufacturer_id IN (SELECT id FROM public.manufacturers WHERE user_id = auth.uid())
  );
CREATE POLICY "Manufacturers can update own medicines" ON public.medicines
  FOR UPDATE USING (
    manufacturer_id IN (SELECT id FROM public.manufacturers WHERE user_id = auth.uid())
  );
CREATE POLICY "Anyone can read medicines for verification" ON public.medicines
  FOR SELECT USING (true);

-- Auto-generated verification codes
CREATE TABLE public.medicine_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL DEFAULT 'QR',
  status TEXT NOT NULL DEFAULT 'Unused',
  scanned_at TIMESTAMPTZ,
  scan_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medicine_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manufacturers can read own codes" ON public.medicine_codes
  FOR SELECT USING (
    medicine_id IN (
      SELECT m.id FROM public.medicines m
      JOIN public.manufacturers mf ON m.manufacturer_id = mf.id
      WHERE mf.user_id = auth.uid()
    )
  );
CREATE POLICY "Manufacturers can insert own codes" ON public.medicine_codes
  FOR INSERT WITH CHECK (
    medicine_id IN (
      SELECT m.id FROM public.medicines m
      JOIN public.manufacturers mf ON m.manufacturer_id = mf.id
      WHERE mf.user_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can read codes for verification" ON public.medicine_codes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can update code status on scan" ON public.medicine_codes
  FOR UPDATE USING (true);

-- Scan logs
CREATE TABLE public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public.medicine_codes(id) ON DELETE CASCADE NOT NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scan_location TEXT,
  result TEXT NOT NULL DEFAULT 'genuine'
);

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scan logs" ON public.scan_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read scan logs" ON public.scan_logs
  FOR SELECT USING (true);

-- Function to generate unique codes
CREATE OR REPLACE FUNCTION public.generate_medicine_codes(
  p_medicine_id UUID,
  p_quantity INTEGER,
  p_code_type TEXT DEFAULT 'QR'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
  prefix TEXT;
BEGIN
  IF p_code_type = 'QR' THEN
    prefix := 'QR-';
  ELSE
    prefix := 'FOIL-';
  END IF;
  
  FOR i IN 1..p_quantity LOOP
    new_code := prefix || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));
    INSERT INTO public.medicine_codes (medicine_id, code, code_type)
    VALUES (p_medicine_id, new_code, p_code_type);
  END LOOP;
END;
$$;
