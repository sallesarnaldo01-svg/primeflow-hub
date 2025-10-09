-- Fix security warnings: Replace functions with CASCADE
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped with CASCADE
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_connections_updated_at
  BEFORE UPDATE ON public.facebook_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_connections_updated_at
  BEFORE UPDATE ON public.instagram_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broadcasts_updated_at
  BEFORE UPDATE ON public.broadcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fix update_conversation_last_message function
DROP FUNCTION IF EXISTS update_conversation_last_message() CASCADE;
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();