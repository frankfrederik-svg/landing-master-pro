-- Fix search_path em set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Revoga execução pública das SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.assign_first_admin() FROM PUBLIC, anon, authenticated;

-- Substitui política permissiva de leads
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert valid leads" ON public.leads
FOR INSERT
WITH CHECK (
  length(trim(name)) BETWEEN 2 AND 120
  AND length(trim(whatsapp)) BETWEEN 8 AND 25
  AND length(trim(income_range)) BETWEEN 1 AND 50
);