-- Criar tabela de interações com leads
CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  lead_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ANOTACAO', 'LIGACAO', 'EMAIL', 'SMS', 'WHATSAPP', 'VISITA', 'TAREFA')),
  descricao TEXT NOT NULL,
  resultado TEXT,
  duracao INTEGER,
  agendado_para TIMESTAMP WITH TIME ZONE,
  concluido BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de status de leads
CREATE TABLE IF NOT EXISTS public.lead_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de leads (caso não exista)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'NEW',
  origin TEXT DEFAULT 'MANUAL',
  score INTEGER DEFAULT 0,
  owner_id UUID,
  pipeline_id UUID,
  column_id UUID,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de regras de scoring
CREATE TABLE IF NOT EXISTS public.lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value JSONB NOT NULL,
  points INTEGER NOT NULL,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- Policies para lead_interactions
CREATE POLICY "Users can view their tenant interactions"
  ON public.lead_interactions FOR SELECT
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can create interactions"
  ON public.lead_interactions FOR INSERT
  WITH CHECK ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can update their tenant interactions"
  ON public.lead_interactions FOR UPDATE
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can delete their tenant interactions"
  ON public.lead_interactions FOR DELETE
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

-- Policies para lead_status_history
CREATE POLICY "Users can view lead status history"
  ON public.lead_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.leads 
    WHERE leads.id = lead_status_history.lead_id 
    AND (leads.tenant_id)::text = current_setting('app.tenant_id'::text, true)
  ));

CREATE POLICY "System can insert status history"
  ON public.lead_status_history FOR INSERT
  WITH CHECK (true);

-- Policies para leads
CREATE POLICY "Users can view their tenant leads"
  ON public.leads FOR SELECT
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can create leads"
  ON public.leads FOR INSERT
  WITH CHECK ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can update their tenant leads"
  ON public.leads FOR UPDATE
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Users can delete their tenant leads"
  ON public.leads FOR DELETE
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

-- Policies para lead_scoring_rules
CREATE POLICY "Users can view their tenant scoring rules"
  ON public.lead_scoring_rules FOR SELECT
  USING ((tenant_id)::text = current_setting('app.tenant_id'::text, true));

CREATE POLICY "Admins can manage scoring rules"
  ON public.lead_scoring_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers para updated_at
CREATE TRIGGER update_lead_interactions_updated_at
  BEFORE UPDATE ON public.lead_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_scoring_rules_updated_at
  BEFORE UPDATE ON public.lead_scoring_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_tenant_id ON public.lead_interactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON public.lead_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON public.leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score);