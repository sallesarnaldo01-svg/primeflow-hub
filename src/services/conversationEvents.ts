import { supabase } from '@/integrations/supabase/client';

export interface ConversationEvent {
  id: string;
  conversationId: string;
  type: string;
  actor: string;
  actorId?: string;
  actorName?: string;
  content?: string;
  metadata?: any;
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export const conversationEventsService = {
  async list(conversationId: string, limit?: number): Promise<ConversationEvent[]> {
    let query = supabase
      .from('conversation_events')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(event => ({
      id: event.id,
      conversationId: event.conversation_id,
      type: event.type,
      actor: event.actor,
      actorId: event.actor_id || undefined,
      actorName: event.actor_name || undefined,
      content: event.content || undefined,
      metadata: event.metadata,
      rating: event.rating || undefined,
      feedback: event.feedback || undefined,
      createdAt: event.created_at
    }));
  },

  async timeline(conversationId: string): Promise<any> {
    return this.list(conversationId);
  },

  async create(conversationId: string, event: {
    type: string;
    actor: string;
    actorId?: string;
    actorName?: string;
    content?: string;
    metadata?: any;
  }): Promise<ConversationEvent> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('conversation_events')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        ...event
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      conversationId: data.conversation_id,
      type: data.type,
      actor: data.actor,
      actorId: data.actor_id || undefined,
      actorName: data.actor_name || undefined,
      content: data.content || undefined,
      metadata: data.metadata,
      createdAt: data.created_at
    };
  },

  async rate(conversationId: string, eventId: string, rating: number, feedback?: string): Promise<ConversationEvent> {
    const { data, error } = await supabase
      .from('conversation_events')
      .update({ rating, feedback })
      .eq('id', eventId)
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      conversationId: data.conversation_id,
      type: data.type,
      actor: data.actor,
      actorId: data.actor_id || undefined,
      actorName: data.actor_name || undefined,
      content: data.content || undefined,
      metadata: data.metadata,
      rating: data.rating || undefined,
      feedback: data.feedback || undefined,
      createdAt: data.created_at
    };
  }
};
