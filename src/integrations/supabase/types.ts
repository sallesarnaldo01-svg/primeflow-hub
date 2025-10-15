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
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          id: string
          media_url: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          media_url?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          media_url?: string | null
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
