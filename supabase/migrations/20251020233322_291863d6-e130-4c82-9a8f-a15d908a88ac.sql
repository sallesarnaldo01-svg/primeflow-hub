-- =============================================
-- FASE 7: NOTIFICAÇÕES E COMUNICAÇÃO
-- =============================================

-- 1. PREFERÊNCIAS DE NOTIFICAÇÃO
-- =============================================

CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_new_message BOOLEAN DEFAULT true,
  email_deal_moved BOOLEAN DEFAULT true,
  email_task_assigned BOOLEAN DEFAULT true,
  email_workflow_completed BOOLEAN DEFAULT true,
  email_mention BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  push_new_message BOOLEAN DEFAULT true,
  push_deal_moved BOOLEAN DEFAULT false,
  push_task_assigned BOOLEAN DEFAULT true,
  push_workflow_completed BOOLEAN DEFAULT false,
  push_mention BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. TEMPLATES DE MENSAGENS
-- =============================================

CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'vendas', 'suporte', 'financeiro', etc.
  variables TEXT[], -- ['nome', 'empresa', 'produto', 'valor']
  shared BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Índices
CREATE INDEX idx_message_templates_tenant_id ON public.message_templates(tenant_id);
CREATE INDEX idx_message_templates_created_by ON public.message_templates(created_by);
CREATE INDEX idx_message_templates_category ON public.message_templates(category);
CREATE INDEX idx_message_templates_shared ON public.message_templates(shared);

-- RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates in their tenant"
  ON public.message_templates FOR SELECT
  USING (shared = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own templates"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- 3. ADICIONAR NOTAS INTERNAS ÀS CONVERSAS
-- =============================================

-- Adicionar campo internal_note à tabela de mensagens existente
-- Assumindo que existe uma tabela messages ou conversation_messages

-- Se a tabela for 'messages':
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    ALTER TABLE public.messages 
    ADD COLUMN IF NOT EXISTS internal_note BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS mentions UUID[];
    
    CREATE INDEX IF NOT EXISTS idx_messages_internal_note ON public.messages(internal_note);
  END IF;
END $$;

-- 4. CHAT INTERNO ENTRE AGENTES
-- =============================================

CREATE TABLE public.internal_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'direct', -- 'direct' ou 'group'
  participants UUID[] NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_internal_chats_tenant_id ON public.internal_chats(tenant_id);
CREATE INDEX idx_internal_chats_participants ON public.internal_chats USING GIN(participants);
CREATE INDEX idx_internal_chats_created_by ON public.internal_chats(created_by);

-- RLS
ALTER TABLE public.internal_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chats they participate in"
  ON public.internal_chats FOR SELECT
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create chats"
  ON public.internal_chats FOR INSERT
  WITH CHECK (auth.uid() = created_by AND auth.uid() = ANY(participants));

CREATE POLICY "Participants can update chat"
  ON public.internal_chats FOR UPDATE
  USING (auth.uid() = ANY(participants));

-- Mensagens do chat interno
CREATE TABLE public.internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.internal_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments JSONB, -- [{name: 'file.pdf', url: '...', type: 'pdf'}]
  mentions UUID[],
  read_by UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_internal_messages_chat_id ON public.internal_messages(chat_id);
CREATE INDEX idx_internal_messages_user_id ON public.internal_messages(user_id);
CREATE INDEX idx_internal_messages_created_at ON public.internal_messages(created_at DESC);

-- RLS
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
  ON public.internal_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.internal_chats
      WHERE internal_chats.id = internal_messages.chat_id
        AND auth.uid() = ANY(internal_chats.participants)
    )
  );

CREATE POLICY "Users can create messages in their chats"
  ON public.internal_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.internal_chats
      WHERE internal_chats.id = chat_id
        AND auth.uid() = ANY(internal_chats.participants)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.internal_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_chats_updated_at
  BEFORE UPDATE ON public.internal_chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_messages_updated_at
  BEFORE UPDATE ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. FUNÇÃO PARA CRIAR NOTIFICAÇÕES DE MENÇÕES
-- =============================================

CREATE OR REPLACE FUNCTION public.notify_internal_message_mentions()
RETURNS TRIGGER AS $$
DECLARE
  v_mentioned_user UUID;
  v_sender_name TEXT;
BEGIN
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    -- Buscar nome do remetente
    SELECT name INTO v_sender_name
    FROM auth.users
    WHERE id = NEW.user_id;
    
    -- Criar notificação para cada usuário mencionado
    FOREACH v_mentioned_user IN ARRAY NEW.mentions
    LOOP
      PERFORM public.create_notification(
        v_mentioned_user,
        'internal_chat_mention',
        'Menção no chat interno',
        v_sender_name || ' mencionou você em uma conversa',
        '/chat-interno',
        jsonb_build_object('chat_id', NEW.chat_id, 'message_id', NEW.id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER internal_message_mention_notification
  AFTER INSERT ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_internal_message_mentions();

-- 7. HABILITAR REALTIME NAS NOVAS TABELAS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_messages;