export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_catalog: {
        Row: {
          category: string
          created_at: string
          description: string
          documentation_url: string | null
          icon: string | null
          id: string
          metrics: Json | null
          name: string
          provider: string
          rating: number | null
          status: string
          tags: string[] | null
          tier: Database["public"]["Enums"]["agent_tier"]
          total_reviews: number | null
          updated_at: string
          version: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          documentation_url?: string | null
          icon?: string | null
          id?: string
          metrics?: Json | null
          name: string
          provider: string
          rating?: number | null
          status?: string
          tags?: string[] | null
          tier?: Database["public"]["Enums"]["agent_tier"]
          total_reviews?: number | null
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          documentation_url?: string | null
          icon?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          provider?: string
          rating?: number | null
          status?: string
          tags?: string[] | null
          tier?: Database["public"]["Enums"]["agent_tier"]
          total_reviews?: number | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      agent_requests: {
        Row: {
          agent_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          justification: string
          rejected_reason: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          requested_at: string | null
          requested_tier: Database["public"]["Enums"]["agent_tier"] | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          justification: string
          rejected_reason?: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          requested_at?: string | null
          requested_tier?: Database["public"]["Enums"]["agent_tier"] | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          justification?: string
          rejected_reason?: string | null
          request_type?: Database["public"]["Enums"]["request_type"]
          requested_at?: string | null
          requested_tier?: Database["public"]["Enums"]["agent_tier"] | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_subscriptions: {
        Row: {
          agent_id: string
          created_at: string
          expires_at: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          subscribed_at: string | null
          tier: Database["public"]["Enums"]["agent_tier"]
          updated_at: string
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscribed_at?: string | null
          tier: Database["public"]["Enums"]["agent_tier"]
          updated_at?: string
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscribed_at?: string | null
          tier?: Database["public"]["Enums"]["agent_tier"]
          updated_at?: string
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_subscriptions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_usage: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          last_used: string | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          last_used?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          last_used?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_value: string
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_value: string
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_value?: string
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      backend_connections: {
        Row: {
          connection_status: string
          created_at: string
          id: string
          is_enabled: boolean
          last_tested_at: string | null
          service_name: string
          service_type: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_status?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_tested_at?: string | null
          service_name: string
          service_type: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_status?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_tested_at?: string | null
          service_name?: string
          service_type?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rag_queries: {
        Row: {
          created_at: string
          id: string
          model_id: string
          model_provider: string
          query: string
          result: Json
          vector_store: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          model_provider: string
          query: string
          result: Json
          vector_store: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          model_provider?: string
          query?: string
          result?: Json
          vector_store?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_tier: "free" | "standard" | "premium" | "enterprise"
      request_status: "pending" | "approved" | "rejected" | "deployed"
      request_type: "subscribe" | "upgrade" | "custom"
      subscription_status: "active" | "inactive" | "pending" | "expired"
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
      agent_tier: ["free", "standard", "premium", "enterprise"],
      request_status: ["pending", "approved", "rejected", "deployed"],
      request_type: ["subscribe", "upgrade", "custom"],
      subscription_status: ["active", "inactive", "pending", "expired"],
    },
  },
} as const
