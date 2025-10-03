-- ============================================
-- MIGRATION 005: Workflow Tables (Flows, Nodes, Edges)
-- ============================================

-- 1. FLOWS TABLE (visual workflows)
CREATE TABLE public.flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL, -- 'manual', 'message_received', 'tag_added', 'stage_changed', 'scheduled'
    trigger_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FLOW_NODES TABLE (blocks in workflow)
CREATE TABLE public.flow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
    node_type TEXT NOT NULL, -- 'trigger', 'action', 'condition', 'delay'
    label TEXT NOT NULL,
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    config JSONB NOT NULL, -- node-specific configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FLOW_EDGES TABLE (connections between nodes)
CREATE TABLE public.flow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
    label TEXT,
    condition JSONB, -- for conditional edges
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FLOW_EXECUTIONS TABLE (execution history)
CREATE TABLE public.flow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    current_node_id UUID REFERENCES public.flow_nodes(id) ON DELETE SET NULL,
    variables JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. SCHEDULED_JOBS TABLE (BullMQ job tracking)
CREATE TABLE public.scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'flow_execution', 'followup_cadence', 'bulk_ai', 'broadcast'
    job_data JSONB NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FOLLOW_UPS TABLE (individual follow-up tasks)
CREATE TABLE public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    cadence_id UUID REFERENCES public.followup_cadences(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - TENANT ISOLATION
-- ============================================

-- FLOWS
CREATE POLICY "Users can view own tenant flows"
ON public.flows FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create flows"
ON public.flows FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update own flows"
ON public.flows FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Admins can delete flows"
ON public.flows FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- FLOW_NODES (linked to flows)
CREATE POLICY "Users can view flow nodes"
ON public.flow_nodes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_nodes.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can manage flow nodes"
ON public.flow_nodes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_nodes.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_nodes.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- FLOW_EDGES (linked to flows)
CREATE POLICY "Users can view flow edges"
ON public.flow_edges FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_edges.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can manage flow edges"
ON public.flow_edges FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_edges.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_edges.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- FLOW_EXECUTIONS (read-only for users)
CREATE POLICY "Users can view flow executions"
ON public.flow_executions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.flows f
    WHERE f.id = flow_executions.flow_id
    AND f.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- SCHEDULED_JOBS
CREATE POLICY "Users can view own tenant jobs"
ON public.scheduled_jobs FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "System can manage jobs"
ON public.scheduled_jobs FOR ALL
TO authenticated
WITH CHECK (true); -- Allow system to create/update jobs

-- FOLLOW_UPS
CREATE POLICY "Users can view own tenant follow-ups"
ON public.follow_ups FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create follow-ups"
ON public.follow_ups FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update assigned follow-ups"
ON public.follow_ups FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

-- ============================================
-- TRIGGERS: Update updated_at
-- ============================================

CREATE TRIGGER update_flows_updated_at
BEFORE UPDATE ON public.flows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flow_nodes_updated_at
BEFORE UPDATE ON public.flow_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at
BEFORE UPDATE ON public.scheduled_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
BEFORE UPDATE ON public.follow_ups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_flows_tenant_id ON public.flows(tenant_id);
CREATE INDEX idx_flows_is_active ON public.flows(is_active);
CREATE INDEX idx_flow_nodes_flow_id ON public.flow_nodes(flow_id);
CREATE INDEX idx_flow_edges_flow_id ON public.flow_edges(flow_id);
CREATE INDEX idx_flow_edges_source_node ON public.flow_edges(source_node_id);
CREATE INDEX idx_flow_edges_target_node ON public.flow_edges(target_node_id);
CREATE INDEX idx_flow_executions_flow_id ON public.flow_executions(flow_id);
CREATE INDEX idx_flow_executions_status ON public.flow_executions(status);
CREATE INDEX idx_scheduled_jobs_tenant_id ON public.scheduled_jobs(tenant_id);
CREATE INDEX idx_scheduled_jobs_scheduled_at ON public.scheduled_jobs(scheduled_at);
CREATE INDEX idx_follow_ups_tenant_id ON public.follow_ups(tenant_id);
CREATE INDEX idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at);
