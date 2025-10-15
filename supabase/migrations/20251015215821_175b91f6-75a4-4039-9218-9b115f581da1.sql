-- Tabela de Imóveis
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('house', 'apartment', 'commercial', 'land', 'farm')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent', 'both')),
  price DECIMAL(12,2),
  rent_price DECIMAL(12,2),
  address TEXT NOT NULL,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10,2),
  parking_spaces INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  location JSONB,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'rented', 'unavailable')),
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  virtual_tour_url TEXT,
  owner_id UUID,
  broker_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant properties"
  ON public.properties FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can update their tenant properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can delete their tenant properties"
  ON public.properties FOR DELETE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

-- Tabela de Deals (Negócios Imobiliários)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  title TEXT NOT NULL,
  contact_id UUID,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (stage IN ('new_lead', 'qualification', 'visit_scheduled', 'visit_done', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost')),
  value DECIMAL(12,2),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  broker_id UUID,
  lead_source TEXT CHECK (lead_source IN ('website', 'whatsapp', 'facebook', 'instagram', 'olx', 'zap', 'vivareal', 'referral', 'other')),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_insights JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant deals"
  ON public.deals FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can create deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can update their tenant deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can delete their tenant deals"
  ON public.deals FOR DELETE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

-- Tabela de Visitas
CREATE TABLE IF NOT EXISTS public.property_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  contact_id UUID,
  broker_id UUID,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.property_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant visits"
  ON public.property_visits FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can create visits"
  ON public.property_visits FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can update their tenant visits"
  ON public.property_visits FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

-- Tabela de Comissões
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant commissions"
  ON public.commissions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can create commissions"
  ON public.commissions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

CREATE POLICY "Users can update their tenant commissions"
  ON public.commissions FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'tenantId' = tenant_id::text));

-- Índices para performance
CREATE INDEX idx_properties_tenant ON public.properties(tenant_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_deals_tenant ON public.deals(tenant_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_property ON public.deals(property_id);
CREATE INDEX idx_visits_tenant ON public.property_visits(tenant_id);
CREATE INDEX idx_visits_property ON public.property_visits(property_id);
CREATE INDEX idx_commissions_tenant ON public.commissions(tenant_id);
CREATE INDEX idx_commissions_broker ON public.commissions(broker_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON public.property_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();