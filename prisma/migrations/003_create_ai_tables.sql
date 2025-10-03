-- ============================================
-- MIGRATION 003: AI Tables (Agents, Tools, Knowledge, Usage)
-- ============================================

-- 1. AI_PROVIDERS TABLE
CREATE TABLE public.ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google'
    api_key TEXT, -- encrypted
    model TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI_AGENTS TABLE
CREATE TABLE public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI_TOOLS TABLE (custom function calling tools like @puxarCNPJ)
CREATE TABLE public.ai_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    trigger TEXT NOT NULL, -- '@puxarCNPJ', '@buscarCEP'
    endpoint TEXT, -- external API endpoint
    parameters JSONB NOT NULL, -- function parameters schema
    response_schema JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. KNOWLEDGE_DOCUMENTS TABLE (RAG)
CREATE TABLE public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt', 'url'
    file_url TEXT,
    storage_path TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    chunk_count INTEGER DEFAULT 0,
    embedding_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. KNOWLEDGE_EMBEDDINGS TABLE (vector storage)
CREATE TABLE public.knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimensions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI_USAGE TABLE (token tracking and cost)
CREATE TABLE public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    conversation_id UUID, -- will be linked later
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    completion_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    cost DECIMAL(10,6) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FOLLOWUP_CADENCES TABLE (automated reactivation)
CREATE TABLE public.followup_cadences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_config JSONB NOT NULL, -- when to trigger
    steps JSONB NOT NULL, -- array of steps with delays
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_cadences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - TENANT ISOLATION
-- ============================================

-- AI_PROVIDERS
CREATE POLICY "Users can view own tenant providers"
ON public.ai_providers FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage providers"
ON public.ai_providers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- AI_AGENTS
CREATE POLICY "Users can view own tenant agents"
ON public.ai_agents FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage agents"
ON public.ai_agents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- AI_TOOLS
CREATE POLICY "Users can view own tenant tools"
ON public.ai_tools FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage tools"
ON public.ai_tools FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- KNOWLEDGE_DOCUMENTS
CREATE POLICY "Users can view own tenant documents"
ON public.knowledge_documents FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can upload documents"
ON public.knowledge_documents FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage documents"
ON public.knowledge_documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- KNOWLEDGE_EMBEDDINGS (linked to documents)
CREATE POLICY "Users can view embeddings"
ON public.knowledge_embeddings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents kd
    WHERE kd.id = knowledge_embeddings.document_id
    AND kd.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- AI_USAGE (read-only for users, write for system)
CREATE POLICY "Users can view own tenant usage"
ON public.ai_usage FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "System can insert usage"
ON public.ai_usage FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow system to log usage

-- FOLLOWUP_CADENCES
CREATE POLICY "Users can view own tenant cadences"
ON public.followup_cadences FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage cadences"
ON public.followup_cadences FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ============================================
-- TRIGGERS: Update updated_at
-- ============================================

CREATE TRIGGER update_ai_providers_updated_at
BEFORE UPDATE ON public.ai_providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at
BEFORE UPDATE ON public.ai_agents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at
BEFORE UPDATE ON public.ai_tools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_followup_cadences_updated_at
BEFORE UPDATE ON public.followup_cadences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_ai_agents_tenant_id ON public.ai_agents(tenant_id);
CREATE INDEX idx_ai_tools_tenant_id ON public.ai_tools(tenant_id);
CREATE INDEX idx_ai_tools_trigger ON public.ai_tools(trigger);
CREATE INDEX idx_knowledge_docs_tenant_id ON public.knowledge_documents(tenant_id);
CREATE INDEX idx_knowledge_docs_agent_id ON public.knowledge_documents(agent_id);
CREATE INDEX idx_ai_usage_tenant_id ON public.ai_usage(tenant_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at DESC);
