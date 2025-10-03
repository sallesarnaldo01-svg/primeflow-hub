-- ============================================
-- MIGRATION 002: CRM Tables (Leads, Deals, Contacts)
-- ============================================

-- 1. CONTACTS TABLE
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    source TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONTACT_TAGS (many-to-many)
CREATE TABLE public.contact_tags (
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

-- 3. CUSTOM_FIELDS (dynamic fields for leads/contacts)
CREATE TABLE public.custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'lead', 'contact', 'deal'
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL, -- 'text', 'number', 'date', 'select'
    options JSONB, -- for select type
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STAGES (pipeline stages)
CREATE TABLE public.stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DEALS (opportunities)
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'BRL',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    notes TEXT,
    custom_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. DEAL_TAGS (many-to-many)
CREATE TABLE public.deal_tags (
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (deal_id, tag_id)
);

-- 7. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    price DECIMAL(15,2),
    stock INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    ai_tags JSONB DEFAULT '[]', -- ["foto frontal", "interior", "close-up"]
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PRODUCT_IMAGES TABLE
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    ai_tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - TENANT ISOLATION
-- ============================================

-- CONTACTS
CREATE POLICY "Users can view own tenant contacts"
ON public.contacts FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create contacts"
ON public.contacts FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update contacts"
ON public.contacts FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- CUSTOM_FIELDS
CREATE POLICY "Users can view own tenant custom fields"
ON public.custom_fields FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage custom fields"
ON public.custom_fields FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- STAGES
CREATE POLICY "Users can view own tenant stages"
ON public.stages FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage stages"
ON public.stages FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- DEALS
CREATE POLICY "Users can view own tenant deals"
ON public.deals FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create deals"
ON public.deals FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update own deals"
ON public.deals FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

-- PRODUCTS
CREATE POLICY "Users can view own tenant products"
ON public.products FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- PRODUCT_IMAGES
CREATE POLICY "Users can view product images"
ON public.product_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Admins can manage product images"
ON public.product_images FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
    AND p.tenant_id = public.get_user_tenant_id(auth.uid())
  ) AND public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- TRIGGERS: Update updated_at
-- ============================================

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stages_updated_at
BEFORE UPDATE ON public.stages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_deals_tenant_id ON public.deals(tenant_id);
CREATE INDEX idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX idx_deals_owner_id ON public.deals(owner_id);
CREATE INDEX idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX idx_products_sku ON public.products(sku);
