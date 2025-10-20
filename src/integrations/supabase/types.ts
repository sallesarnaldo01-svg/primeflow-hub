export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_agent_configs: {
        Row: {
          actions: Json | null
          active: boolean
          agent_id: string
          capabilities: Json | null
          created_at: string
          id: string
          objectives: Json | null
          templates: Json | null
          tenant_id: string
          tools: string[] | null
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          active?: boolean
          agent_id: string
          capabilities?: Json | null
          created_at?: string
          id?: string
          objectives?: Json | null
          templates?: Json | null
          tenant_id: string
          tools?: string[] | null
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          active?: boolean
          agent_id?: string
          capabilities?: Json | null
          created_at?: string
          id?: string
          objectives?: Json | null
          templates?: Json | null
          tenant_id?: string
          tools?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          channel: string
          created_at: string
          id: string
          message: string
          name: string
          scheduled_at: string | null
          sent_count: number | null
          status: string | null
          total_contacts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          message: string
          name: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          total_contacts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          message?: string
          name?: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          total_contacts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          broker_id: string
          created_at: string
          deal_id: string
          id: string
          notes: string | null
          paid_at: string | null
          percentage: number | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          broker_id: string
          created_at?: string
          deal_id: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          percentage?: number | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          broker_id?: string
          created_at?: string
          deal_id?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          percentage?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_events: {
        Row: {
          actor: string
          actor_id: string | null
          actor_name: string | null
          content: string | null
          conversation_id: string
          created_at: string
          feedback: string | null
          id: string
          metadata: Json | null
          rating: number | null
          type: string
          user_id: string
        }
        Insert: {
          actor: string
          actor_id?: string | null
          actor_name?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          metadata?: Json | null
          rating?: number | null
          type: string
          user_id: string
        }
        Update: {
          actor?: string
          actor_id?: string | null
          actor_name?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          metadata?: Json | null
          rating?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          ai_insights: Json | null
          ai_score: number | null
          broker_id: string | null
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          expected_close_date: string | null
          id: string
          lead_source: string | null
          notes: string | null
          position: number | null
          probability: number | null
          property_id: string | null
          stage: string
          tenant_id: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          ai_insights?: Json | null
          ai_score?: number | null
          broker_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lead_source?: string | null
          notes?: string | null
          position?: number | null
          probability?: number | null
          property_id?: string | null
          stage?: string
          tenant_id: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          ai_insights?: Json | null
          ai_score?: number | null
          broker_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lead_source?: string | null
          notes?: string | null
          position?: number | null
          probability?: number | null
          property_id?: string | null
          stage?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_connections: {
        Row: {
          created_at: string
          id: string
          integration_id: string | null
          meta: Json | null
          name: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id?: string | null
          meta?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string | null
          meta?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          created_at: string
          id: string
          integration_id: string | null
          meta: Json | null
          name: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id?: string | null
          meta?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string | null
          meta?: Json | null
          name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          connected_at: string | null
          created_at: string
          error: string | null
          id: string
          last_sync_at: string | null
          provider: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          connected_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_chats: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string | null
          participants: string[]
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          participants: string[]
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          participants?: string[]
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_messages: {
        Row: {
          attachments: Json | null
          chat_id: string
          created_at: string
          id: string
          mentions: string[] | null
          message: string
          read_by: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          chat_id: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          message: string
          read_by?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          chat_id?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          message?: string
          read_by?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "internal_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          conversation_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string | null
          metadata: Json | null
          tenant_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          tenant_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          tenant_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          name: string
          shared: boolean | null
          tenant_id: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          shared?: boolean | null
          tenant_id: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          shared?: boolean | null
          tenant_id?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          internal_note: boolean | null
          media_url: string | null
          mentions: string[] | null
          type: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          internal_note?: boolean | null
          media_url?: string | null
          mentions?: string[] | null
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          internal_note?: boolean | null
          media_url?: string | null
          mentions?: string[] | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_deal_moved: boolean | null
          email_enabled: boolean | null
          email_mention: boolean | null
          email_new_message: boolean | null
          email_task_assigned: boolean | null
          email_workflow_completed: boolean | null
          id: string
          in_app_enabled: boolean | null
          push_deal_moved: boolean | null
          push_enabled: boolean | null
          push_mention: boolean | null
          push_new_message: boolean | null
          push_task_assigned: boolean | null
          push_workflow_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_deal_moved?: boolean | null
          email_enabled?: boolean | null
          email_mention?: boolean | null
          email_new_message?: boolean | null
          email_task_assigned?: boolean | null
          email_workflow_completed?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_deal_moved?: boolean | null
          push_enabled?: boolean | null
          push_mention?: boolean | null
          push_new_message?: boolean | null
          push_task_assigned?: boolean | null
          push_workflow_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_deal_moved?: boolean | null
          email_enabled?: boolean | null
          email_mention?: boolean | null
          email_new_message?: boolean | null
          email_task_assigned?: boolean | null
          email_workflow_completed?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_deal_moved?: boolean | null
          push_enabled?: boolean | null
          push_mention?: boolean | null
          push_new_message?: boolean | null
          push_task_assigned?: boolean | null
          push_workflow_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          broker_id: string | null
          city: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          images: Json | null
          location: Json | null
          metadata: Json | null
          neighborhood: string | null
          owner_id: string | null
          parking_spaces: number | null
          price: number | null
          rent_price: number | null
          state: string
          status: string
          tenant_id: string
          title: string
          transaction_type: string
          type: string
          updated_at: string
          video_url: string | null
          virtual_tour_url: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string | null
          city: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          images?: Json | null
          location?: Json | null
          metadata?: Json | null
          neighborhood?: string | null
          owner_id?: string | null
          parking_spaces?: number | null
          price?: number | null
          rent_price?: number | null
          state: string
          status?: string
          tenant_id: string
          title: string
          transaction_type: string
          type: string
          updated_at?: string
          video_url?: string | null
          virtual_tour_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          broker_id?: string | null
          city?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          images?: Json | null
          location?: Json | null
          metadata?: Json | null
          neighborhood?: string | null
          owner_id?: string | null
          parking_spaces?: number | null
          price?: number | null
          rent_price?: number | null
          state?: string
          status?: string
          tenant_id?: string
          title?: string
          transaction_type?: string
          type?: string
          updated_at?: string
          video_url?: string | null
          virtual_tour_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      property_visits: {
        Row: {
          broker_id: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          feedback: string | null
          id: string
          property_id: string
          rating: number | null
          scheduled_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          broker_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          feedback?: string | null
          id?: string
          property_id: string
          rating?: number | null
          scheduled_at: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          broker_id?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          feedback?: string | null
          id?: string
          property_id?: string
          rating?: number | null
          scheduled_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_visits_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          device: string | null
          id: string
          integration_id: string | null
          name: string | null
          phone: string | null
          qr_code: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          device?: string | null
          id?: string
          integration_id?: string | null
          name?: string | null
          phone?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          device?: string | null
          id?: string
          integration_id?: string | null
          name?: string | null
          phone?: string | null
          qr_code?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_logs: {
        Row: {
          cost_brl: number | null
          duration_ms: number | null
          error_message: string | null
          executed_at: string
          id: string
          input_data: Json | null
          node_id: string
          node_type: string
          output_data: Json | null
          run_id: string
          status: string
          tokens_used: number | null
        }
        Insert: {
          cost_brl?: number | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          input_data?: Json | null
          node_id: string
          node_type: string
          output_data?: Json | null
          run_id: string
          status: string
          tokens_used?: number | null
        }
        Update: {
          cost_brl?: number | null
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string
          id?: string
          input_data?: Json | null
          node_id?: string
          node_type?: string
          output_data?: Json | null
          run_id?: string
          status?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          context_data: Json | null
          created_at: string
          error: string | null
          id: string
          result: Json | null
          started_at: string | null
          status: string
          tenant_id: string
          trigger_data: Json | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          tenant_id: string
          trigger_data?: Json | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          result?: Json | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          trigger_data?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          graph_json: Json
          id: string
          metadata: Json | null
          name: string
          published_at: string | null
          rate_limit_config: Json | null
          status: string
          tags: string[] | null
          tenant_id: string
          trigger_config: Json | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          graph_json?: Json
          id?: string
          metadata?: Json | null
          name: string
          published_at?: string | null
          rate_limit_config?: Json | null
          status?: string
          tags?: string[] | null
          tenant_id: string
          trigger_config?: Json | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          graph_json?: Json
          id?: string
          metadata?: Json | null
          name?: string
          published_at?: string | null
          rate_limit_config?: Json | null
          status?: string
          tags?: string[] | null
          tenant_id?: string
          trigger_config?: Json | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "agent" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "agent", "viewer"],
    },
  },
} as const
