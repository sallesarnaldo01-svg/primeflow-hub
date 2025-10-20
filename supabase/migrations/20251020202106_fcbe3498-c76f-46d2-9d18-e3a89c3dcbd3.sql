-- ============================================
-- FASE 1: WORKFLOWS & AI AGENT CONFIGS
-- ============================================

-- Workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  graph_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED')),
  version INTEGER NOT NULL DEFAULT 1,
  trigger_config JSONB DEFAULT '{}'::jsonb,
  rate_limit_config JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflows_tenant_status ON public.workflows(tenant_id, status);
CREATE INDEX idx_workflows_tenant ON public.workflows(tenant_id);

-- Workflow runs table
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_runs_workflow ON public.workflow_runs(workflow_id, created_at DESC);
CREATE INDEX idx_workflow_runs_tenant ON public.workflow_runs(tenant_id, created_at DESC);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(status);

-- Workflow logs table
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'ERROR', 'SKIPPED')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  tokens_used INTEGER,
  cost_brl DECIMAL(10, 6),
  duration_ms INTEGER,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_logs_run ON public.workflow_logs(run_id, executed_at ASC);
CREATE INDEX idx_workflow_logs_status ON public.workflow_logs(status);

-- AI Agent Configurations (extend existing ai_agents)
CREATE TABLE IF NOT EXISTS public.ai_agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  capabilities JSONB DEFAULT '{
    "canAssign": false,
    "canClose": false,
    "canUpdateFields": false,
    "canUpdateLifecycle": false,
    "canInterpretImages": false,
    "canRecommendProducts": false
  }'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  templates JSONB DEFAULT '[]'::jsonb,
  objectives JSONB DEFAULT '[]'::jsonb,
  tools TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, tenant_id)
);

CREATE INDEX idx_ai_agent_configs_tenant ON public.ai_agent_configs(tenant_id);
CREATE INDEX idx_ai_agent_configs_agent ON public.ai_agent_configs(agent_id);

-- Message attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  message_id TEXT,
  tenant_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_conversation ON public.message_attachments(conversation_id, created_at DESC);
CREATE INDEX idx_message_attachments_tenant ON public.message_attachments(tenant_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Workflows policies
CREATE POLICY "Users can view their tenant workflows"
  ON public.workflows FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create workflows for their tenant"
  ON public.workflows FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update their tenant workflows"
  ON public.workflows FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete their tenant workflows"
  ON public.workflows FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Workflow runs policies
CREATE POLICY "Users can view their tenant workflow runs"
  ON public.workflow_runs FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create workflow runs for their tenant"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update their tenant workflow runs"
  ON public.workflow_runs FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Workflow logs policies
CREATE POLICY "Users can view logs of their tenant runs"
  ON public.workflow_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_runs
      WHERE workflow_runs.id = workflow_logs.run_id
      AND workflow_runs.tenant_id = current_setting('app.tenant_id', true)
    )
  );

CREATE POLICY "System can insert workflow logs"
  ON public.workflow_logs FOR INSERT
  WITH CHECK (true);

-- AI Agent Configs policies
CREATE POLICY "Users can view their tenant agent configs"
  ON public.ai_agent_configs FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can manage their tenant agent configs"
  ON public.ai_agent_configs FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Message attachments policies
CREATE POLICY "Users can view their tenant attachments"
  ON public.message_attachments FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create attachments for their tenant"
  ON public.message_attachments FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agent_configs_updated_at
  BEFORE UPDATE ON public.ai_agent_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();