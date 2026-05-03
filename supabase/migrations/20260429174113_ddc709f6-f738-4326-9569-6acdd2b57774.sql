-- Roles enum + tabela
CREATE TYPE public.feirao_app_role AS ENUM ('admin', 'user');

CREATE TABLE public.feirao_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role feirao_app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.feirao_user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.feirao_has_role(_user_id UUID, _role feirao_app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.feirao_user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Trigger: primeiro usuário cadastrado vira admin automaticamente
CREATE OR REPLACE FUNCTION public.feirao_assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.feirao_user_roles WHERE role = 'admin') THEN
    INSERT INTO public.feirao_user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER feirao_on_auth_user_created_assign_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.feirao_assign_first_admin();

CREATE POLICY "Users can view own roles" ON public.feirao_user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.feirao_user_roles FOR ALL TO authenticated USING (public.feirao_has_role(auth.uid(),'admin')) WITH CHECK (public.feirao_has_role(auth.uid(),'admin'));

-- Campanhas (hotsites)
CREATE TABLE public.feirao_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hero_title TEXT NOT NULL DEFAULT 'Realize o sonho do seu apê',
  hero_subtitle TEXT NOT NULL DEFAULT 'Condições especiais com entrada facilitada e parcelamento em até 72x',
  cta_text TEXT NOT NULL DEFAULT 'Quero aproveitar agora',
  primary_color TEXT NOT NULL DEFAULT '#16a34a',
  accent_color TEXT NOT NULL DEFAULT '#f97316',
  banner_url TEXT,
  whatsapp_number TEXT,
  whatsapp_message TEXT DEFAULT 'Olá! Tenho interesse nos empreendimentos da campanha.',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feirao_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active campaigns" ON public.feirao_campaigns FOR SELECT USING (active = true);
CREATE POLICY "Admins view all campaigns" ON public.feirao_campaigns FOR SELECT TO authenticated USING (public.feirao_has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage campaigns" ON public.feirao_campaigns FOR ALL TO authenticated USING (public.feirao_has_role(auth.uid(),'admin')) WITH CHECK (public.feirao_has_role(auth.uid(),'admin'));

-- Empreendimentos
CREATE TABLE public.feirao_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.feirao_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  entry_value NUMERIC(12,2),
  description TEXT,
  tag TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feirao_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active properties" ON public.feirao_properties FOR SELECT USING (active = true);
CREATE POLICY "Admins manage properties" ON public.feirao_properties FOR ALL TO authenticated USING (public.feirao_has_role(auth.uid(),'admin')) WITH CHECK (public.feirao_has_role(auth.uid(),'admin'));

-- Leads
CREATE TABLE public.feirao_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.feirao_campaigns(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.feirao_properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  income_range TEXT NOT NULL,
  mcmv_faixa INT,
  uses_entry_value BOOLEAN DEFAULT false,
  entry_value NUMERIC(12,2),
  joins_income BOOLEAN DEFAULT false,
  birth_date DATE,
  income_type TEXT,
  has_fgts BOOLEAN DEFAULT false,
  clean_name BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feirao_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads" ON public.feirao_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view leads" ON public.feirao_leads FOR SELECT TO authenticated USING (public.feirao_has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage leads" ON public.feirao_leads FOR ALL TO authenticated USING (public.feirao_has_role(auth.uid(),'admin')) WITH CHECK (public.feirao_has_role(auth.uid(),'admin'));

-- Settings (singleton)
CREATE TABLE public.feirao_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_whatsapp TEXT,
  default_message TEXT,
  webhook_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.feirao_settings (id) VALUES (1);

ALTER TABLE public.feirao_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read settings" ON public.feirao_settings FOR SELECT TO authenticated USING (public.feirao_has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update settings" ON public.feirao_settings FOR UPDATE TO authenticated USING (public.feirao_has_role(auth.uid(),'admin')) WITH CHECK (public.feirao_has_role(auth.uid(),'admin'));

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.feirao_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER feirao_trg_campaigns_updated BEFORE UPDATE ON public.feirao_campaigns FOR EACH ROW EXECUTE FUNCTION public.feirao_set_updated_at();
CREATE TRIGGER feirao_trg_settings_updated BEFORE UPDATE ON public.feirao_settings FOR EACH ROW EXECUTE FUNCTION public.feirao_set_updated_at();

-- Campanha demo
INSERT INTO public.feirao_campaigns (slug, name, hero_title, hero_subtitle)
VALUES ('feirao-mrv', 'Feirão MRV', 'Feirão MRV: seu apê com entrada facilitada', 'Aproveite o feirão e saia do aluguel com as menores taxas do mercado.');