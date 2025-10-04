-- ====================================
-- MIGRATION: Sistema de Roles Separado
-- ====================================

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'agent', 'viewer');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- 3. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função security definer para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Policies para user_roles
-- Usuários podem ver seus próprios roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Aplicar RLS em tabelas críticas usando has_role

-- AI Tools: apenas admins podem gerenciar
CREATE POLICY "Admins can manage AI tools"
ON public.ai_tools
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Knowledge Documents: admins e managers podem gerenciar
CREATE POLICY "Admins and managers can manage knowledge"
ON public.knowledge_documents
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Products: admins e managers podem gerenciar
CREATE POLICY "Admins and managers can manage products"
ON public.products
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- Custom Fields: apenas admins podem gerenciar
CREATE POLICY "Admins can manage custom fields"
ON public.custom_fields
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Follow-up Cadences: admins e managers podem gerenciar
CREATE POLICY "Admins and managers can manage followup cadences"
ON public.followup_cadences
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'manager')
);

-- AI Usage: todos podem ver seus próprios dados
CREATE POLICY "Users can view own AI usage"
ON public.ai_usage
FOR SELECT
TO authenticated
USING (tenant_id IN (
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
));

-- Conversation Events: todos podem ver eventos de suas conversas
CREATE POLICY "Users can view own conversation events"
ON public.conversation_events
FOR SELECT
TO authenticated
USING (tenant_id IN (
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
));

-- Inserir role admin para o primeiro usuário (ajustar UUID conforme necessário)
-- NOTA: Execute manualmente após criar o primeiro usuário
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR-USER-UUID-HERE', 'admin');

COMMENT ON TABLE public.user_roles IS 'Tabela de roles separada para segurança crítica - evita privilege escalation';
COMMENT ON FUNCTION public.has_role IS 'Função SECURITY DEFINER para verificar roles sem recursão RLS';
