-- ============================================
-- MIGRATION 004: Conversation Tables (Messages, Events, Timeline)
-- ============================================

-- 1. CONVERSATIONS TABLE
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    queue_id UUID REFERENCES public.queues(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open', -- 'open', 'waiting', 'closed'
    channel TEXT NOT NULL, -- 'whatsapp', 'facebook', 'instagram', 'webchat'
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_enabled BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MESSAGES TABLE
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'contact', 'user', 'ai', 'system'
    sender_id UUID, -- user_id or contact_id
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'audio', 'video', 'document'
    media_url TEXT,
    metadata JSONB DEFAULT '{}',
    external_id TEXT, -- ID from WhatsApp/Facebook/Instagram
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONVERSATION_EVENTS TABLE (unified timeline)
CREATE TABLE public.conversation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'message', 'ai_action', 'user_action', 'system_event', 'stage_change', 'tag_added'
    actor TEXT NOT NULL, -- 'ai', 'user', 'system'
    actor_id UUID, -- user_id or agent_id
    actor_name TEXT,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    rating INTEGER, -- 1-5 for AI responses
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. BROADCASTS TABLE (bulk messaging)
CREATE TABLE public.broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    message_template TEXT NOT NULL,
    target_filters JSONB, -- filters to select contacts
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'failed'
    total_contacts INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MESSAGE_LOGS TABLE (tracking broadcast messages)
CREATE TABLE public.message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CAMPAIGN_PHRASES TABLE (pre-defined messages)
CREATE TABLE public.campaign_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_phrases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - TENANT ISOLATION
-- ============================================

-- CONVERSATIONS
CREATE POLICY "Users can view own tenant conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid()) AND
  (assigned_to = auth.uid() OR assigned_to IS NULL OR public.has_role(auth.uid(), 'admin'))
);

-- MESSAGES (linked to conversations)
CREATE POLICY "Users can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND c.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- CONVERSATION_EVENTS
CREATE POLICY "Users can view own tenant events"
ON public.conversation_events FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create events"
ON public.conversation_events FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can rate AI responses"
ON public.conversation_events FOR UPDATE
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- BROADCASTS
CREATE POLICY "Users can view own tenant broadcasts"
ON public.broadcasts FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create broadcasts"
ON public.broadcasts FOR INSERT
TO authenticated
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage broadcasts"
ON public.broadcasts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- MESSAGE_LOGS (read-only for users)
CREATE POLICY "Users can view message logs"
ON public.message_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.broadcasts b
    WHERE b.id = message_logs.broadcast_id
    AND b.tenant_id = public.get_user_tenant_id(auth.uid())
  )
);

-- CAMPAIGN_PHRASES
CREATE POLICY "Users can view own tenant phrases"
ON public.campaign_phrases FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage phrases"
ON public.campaign_phrases FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ============================================
-- TRIGGERS: Update updated_at & last_message_at
-- ============================================

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcasts_updated_at
BEFORE UPDATE ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_phrases_updated_at
BEFORE UPDATE ON public.campaign_phrases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update last_message_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_last_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_assigned_to ON public.conversations(assigned_to);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_conversation_events_tenant_id ON public.conversation_events(tenant_id);
CREATE INDEX idx_conversation_events_conversation_id ON public.conversation_events(conversation_id);
CREATE INDEX idx_conversation_events_created_at ON public.conversation_events(created_at DESC);
CREATE INDEX idx_broadcasts_tenant_id ON public.broadcasts(tenant_id);
CREATE INDEX idx_message_logs_broadcast_id ON public.message_logs(broadcast_id);

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_events;
