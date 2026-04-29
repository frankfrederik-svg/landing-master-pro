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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          accent_color: string
          active: boolean
          banner_url: string | null
          created_at: string
          cta_text: string
          hero_subtitle: string
          hero_title: string
          id: string
          name: string
          popup_button_text: string
          popup_delay_desktop: number
          popup_delay_mobile: number
          popup_enabled: boolean
          popup_frequency_hours: number
          popup_subtitle: string
          popup_title: string
          popup_whatsapp_message: string
          primary_color: string
          slug: string
          updated_at: string
          whatsapp_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          accent_color?: string
          active?: boolean
          banner_url?: string | null
          created_at?: string
          cta_text?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          name: string
          popup_button_text?: string
          popup_delay_desktop?: number
          popup_delay_mobile?: number
          popup_enabled?: boolean
          popup_frequency_hours?: number
          popup_subtitle?: string
          popup_title?: string
          popup_whatsapp_message?: string
          primary_color?: string
          slug: string
          updated_at?: string
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          accent_color?: string
          active?: boolean
          banner_url?: string | null
          created_at?: string
          cta_text?: string
          hero_subtitle?: string
          hero_title?: string
          id?: string
          name?: string
          popup_button_text?: string
          popup_delay_desktop?: number
          popup_delay_mobile?: number
          popup_enabled?: boolean
          popup_frequency_hours?: number
          popup_subtitle?: string
          popup_title?: string
          popup_whatsapp_message?: string
          primary_color?: string
          slug?: string
          updated_at?: string
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          birth_date: string | null
          campaign_id: string | null
          clean_name: boolean | null
          created_at: string
          entry_value: number | null
          has_fgts: boolean | null
          id: string
          income_range: string
          income_type: string | null
          joins_income: boolean | null
          mcmv_faixa: number | null
          name: string
          property_id: string | null
          uses_entry_value: boolean | null
          whatsapp: string
        }
        Insert: {
          birth_date?: string | null
          campaign_id?: string | null
          clean_name?: boolean | null
          created_at?: string
          entry_value?: number | null
          has_fgts?: boolean | null
          id?: string
          income_range: string
          income_type?: string | null
          joins_income?: boolean | null
          mcmv_faixa?: number | null
          name: string
          property_id?: string | null
          uses_entry_value?: boolean | null
          whatsapp: string
        }
        Update: {
          birth_date?: string | null
          campaign_id?: string | null
          clean_name?: boolean | null
          created_at?: string
          entry_value?: number | null
          has_fgts?: boolean | null
          id?: string
          income_range?: string
          income_type?: string | null
          joins_income?: boolean | null
          mcmv_faixa?: number | null
          name?: string
          property_id?: string | null
          uses_entry_value?: boolean | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          active: boolean
          campaign_id: string
          created_at: string
          description: string | null
          display_order: number
          entry_value: number | null
          id: string
          image_url: string | null
          location: string
          name: string
          tag: string | null
        }
        Insert: {
          active?: boolean
          campaign_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          entry_value?: number | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          tag?: string | null
        }
        Update: {
          active?: boolean
          campaign_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          entry_value?: number | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          default_message: string | null
          default_whatsapp: string | null
          id: number
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          default_message?: string | null
          default_whatsapp?: string | null
          id?: number
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          default_message?: string | null
          default_whatsapp?: string | null
          id?: number
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
