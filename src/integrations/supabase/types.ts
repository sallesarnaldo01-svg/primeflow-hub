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
      correspondentes: {
        Row: {
          bairro: string | null
          banco_credenciado: string | null
          celular: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          comissao_padrao: number | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          metadata: Json | null
          nome_fantasia: string | null
          observacoes: string | null
          razao_social: string
          responsavel_email: string | null
          responsavel_nome: string | null
          responsavel_telefone: string | null
          status: string | null
          telefone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          banco_credenciado?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          comissao_padrao?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          metadata?: Json | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string | null
          telefone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          banco_credenciado?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          comissao_padrao?: number | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          metadata?: Json | null
          nome_fantasia?: string | null
          observacoes?: string | null
          razao_social?: string
          responsavel_email?: string | null
          responsavel_nome?: string | null
          responsavel_telefone?: string | null
          status?: string | null
          telefone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      correspondentes_usuarios: {
        Row: {
          cargo: string | null
          celular: string | null
          correspondente_id: string
          created_at: string
          email: string
          id: string
          metadata: Json | null
          nome: string
          status: string | null
          telefone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          celular?: string | null
          correspondente_id: string
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          nome: string
          status?: string | null
          telefone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          celular?: string | null
          correspondente_id?: string
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          nome?: string
          status?: string | null
          telefone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correspondentes_usuarios_correspondente_id_fkey"
            columns: ["correspondente_id"]
            isOneToOne: false
            referencedRelation: "correspondentes"
            referencedColumns: ["id"]
          },
        ]
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
      documentos_pre_cadastro: {
        Row: {
          aprovado_por: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          created_at: string
          data_aprovacao: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          motivo_rejeicao: string | null
          nome: string
          obrigatorio: boolean | null
          pessoa: Database["public"]["Enums"]["documento_pessoa"]
          pre_cadastro_id: string
          status: Database["public"]["Enums"]["documento_status"] | null
          storage_path: string
          tenant_id: string
          tipo: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          aprovado_por?: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          created_at?: string
          data_aprovacao?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          motivo_rejeicao?: string | null
          nome: string
          obrigatorio?: boolean | null
          pessoa: Database["public"]["Enums"]["documento_pessoa"]
          pre_cadastro_id: string
          status?: Database["public"]["Enums"]["documento_status"] | null
          storage_path: string
          tenant_id: string
          tipo: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          aprovado_por?: string | null
          categoria?: Database["public"]["Enums"]["documento_categoria"]
          created_at?: string
          data_aprovacao?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          motivo_rejeicao?: string | null
          nome?: string
          obrigatorio?: boolean | null
          pessoa?: Database["public"]["Enums"]["documento_pessoa"]
          pre_cadastro_id?: string
          status?: Database["public"]["Enums"]["documento_status"] | null
          storage_path?: string
          tenant_id?: string
          tipo?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_pre_cadastro_pre_cadastro_id_fkey"
            columns: ["pre_cadastro_id"]
            isOneToOne: false
            referencedRelation: "pre_cadastros"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          construtora: string | null
          created_at: string
          data_entrega_prevista: string | null
          data_lancamento: string | null
          descricao: string | null
          documentos: Json | null
          endereco: string | null
          estado: string | null
          id: string
          imagens: Json | null
          incorporadora: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          nome: string
          status: string | null
          tenant_id: string
          tipo: string | null
          total_unidades: number | null
          unidades_disponiveis: number | null
          updated_at: string
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          construtora?: string | null
          created_at?: string
          data_entrega_prevista?: string | null
          data_lancamento?: string | null
          descricao?: string | null
          documentos?: Json | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagens?: Json | null
          incorporadora?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          nome: string
          status?: string | null
          tenant_id: string
          tipo?: string | null
          total_unidades?: number | null
          unidades_disponiveis?: number | null
          updated_at?: string
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          construtora?: string | null
          created_at?: string
          data_entrega_prevista?: string | null
          data_lancamento?: string | null
          descricao?: string | null
          documentos?: Json | null
          endereco?: string | null
          estado?: string | null
          id?: string
          imagens?: Json | null
          incorporadora?: string | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          nome?: string
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          total_unidades?: number | null
          unidades_disponiveis?: number | null
          updated_at?: string
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: []
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
      pre_cadastros: {
        Row: {
          bloco: string | null
          contact_id: string | null
          correspondente_id: string | null
          correspondente_usuario_id: string | null
          corretor_nome: string | null
          created_at: string
          data_aprovacao: string | null
          data_cadastro: string
          data_vencimento_aprovacao: string | null
          deal_id: string | null
          empreendimento_id: string | null
          id: string
          imobiliaria_nome: string | null
          lead_id: string | null
          metadata: Json | null
          numero: string
          observacoes: string | null
          owner_id: string | null
          prazo_meses: number | null
          renda_familiar_bruta: number | null
          renda_mensal_bruta: number | null
          sistema_amortizacao:
            | Database["public"]["Enums"]["sistema_amortizacao"]
            | null
          status: Database["public"]["Enums"]["pre_cadastro_status"] | null
          taxa_juros: number | null
          tenant_id: string
          unidade: string | null
          updated_at: string
          valor_aprovado: number | null
          valor_avaliacao: number
          valor_entrada: number | null
          valor_fgts: number | null
          valor_prestacao: number | null
          valor_subsidio: number | null
          valor_total: number | null
        }
        Insert: {
          bloco?: string | null
          contact_id?: string | null
          correspondente_id?: string | null
          correspondente_usuario_id?: string | null
          corretor_nome?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_cadastro?: string
          data_vencimento_aprovacao?: string | null
          deal_id?: string | null
          empreendimento_id?: string | null
          id?: string
          imobiliaria_nome?: string | null
          lead_id?: string | null
          metadata?: Json | null
          numero: string
          observacoes?: string | null
          owner_id?: string | null
          prazo_meses?: number | null
          renda_familiar_bruta?: number | null
          renda_mensal_bruta?: number | null
          sistema_amortizacao?:
            | Database["public"]["Enums"]["sistema_amortizacao"]
            | null
          status?: Database["public"]["Enums"]["pre_cadastro_status"] | null
          taxa_juros?: number | null
          tenant_id: string
          unidade?: string | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_avaliacao: number
          valor_entrada?: number | null
          valor_fgts?: number | null
          valor_prestacao?: number | null
          valor_subsidio?: number | null
          valor_total?: number | null
        }
        Update: {
          bloco?: string | null
          contact_id?: string | null
          correspondente_id?: string | null
          correspondente_usuario_id?: string | null
          corretor_nome?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_cadastro?: string
          data_vencimento_aprovacao?: string | null
          deal_id?: string | null
          empreendimento_id?: string | null
          id?: string
          imobiliaria_nome?: string | null
          lead_id?: string | null
          metadata?: Json | null
          numero?: string
          observacoes?: string | null
          owner_id?: string | null
          prazo_meses?: number | null
          renda_familiar_bruta?: number | null
          renda_mensal_bruta?: number | null
          sistema_amortizacao?:
            | Database["public"]["Enums"]["sistema_amortizacao"]
            | null
          status?: Database["public"]["Enums"]["pre_cadastro_status"] | null
          taxa_juros?: number | null
          tenant_id?: string
          unidade?: string | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_avaliacao?: number
          valor_entrada?: number | null
          valor_fgts?: number | null
          valor_prestacao?: number | null
          valor_subsidio?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_cadastros_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_cadastros_correspondente_id_fkey"
            columns: ["correspondente_id"]
            isOneToOne: false
            referencedRelation: "correspondentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_cadastros_correspondente_usuario_id_fkey"
            columns: ["correspondente_usuario_id"]
            isOneToOne: false
            referencedRelation: "correspondentes_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_cadastros_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_cadastros_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_cadastros_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      calcular_percentual_documentos: {
        Args: { p_pre_cadastro_id: string }
        Returns: number
      }
      generate_pre_cadastro_numero: {
        Args: { p_tenant_id: string }
        Returns: string
      }
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
      documento_categoria:
        | "IDENTIFICACAO"
        | "COMPROVANTE_RENDA"
        | "COMPROVANTE_RESIDENCIA"
        | "CERTIDOES"
        | "DOCUMENTOS_IMOVEL"
        | "OUTROS"
      documento_pessoa: "TITULAR" | "CONJUGE" | "AVALISTA" | "OUTROS"
      documento_status:
        | "PENDENTE"
        | "ENVIADO"
        | "AGUARDANDO_APROVACAO"
        | "APROVADO"
        | "REJEITADO"
      pre_cadastro_status:
        | "NOVA_AVALIACAO"
        | "EM_ANALISE"
        | "APROVADO"
        | "APROVADO_COM_RESTRICAO"
        | "REPROVADO"
        | "PENDENTE_DOCUMENTACAO"
        | "CANCELADO"
      sistema_amortizacao: "SAC" | "PRICE" | "SACRE"
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
      documento_categoria: [
        "IDENTIFICACAO",
        "COMPROVANTE_RENDA",
        "COMPROVANTE_RESIDENCIA",
        "CERTIDOES",
        "DOCUMENTOS_IMOVEL",
        "OUTROS",
      ],
      documento_pessoa: ["TITULAR", "CONJUGE", "AVALISTA", "OUTROS"],
      documento_status: [
        "PENDENTE",
        "ENVIADO",
        "AGUARDANDO_APROVACAO",
        "APROVADO",
        "REJEITADO",
      ],
      pre_cadastro_status: [
        "NOVA_AVALIACAO",
        "EM_ANALISE",
        "APROVADO",
        "APROVADO_COM_RESTRICAO",
        "REPROVADO",
        "PENDENTE_DOCUMENTACAO",
        "CANCELADO",
      ],
      sistema_amortizacao: ["SAC", "PRICE", "SACRE"],
    },
  },
} as const
