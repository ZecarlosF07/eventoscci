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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          academic_hours: number | null
          additional_info: string | null
          address: string | null
          banner_path: string | null
          capacity: number | null
          category_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string
          duration_text: string | null
          general_price: number
          id: string
          is_free: boolean
          location_name: string | null
          member_price: number
          members_only: boolean
          modality: Database["public"]["Enums"]["activity_modality"]
          objective: string | null
          program: string | null
          published_at: string | null
          registration_close_at: string | null
          registration_open_at: string | null
          registrations_closed_manually: boolean
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["activity_status"]
          syllabus: string | null
          target_audience: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
          updated_by: string | null
          virtual_url: string | null
        }
        Insert: {
          academic_hours?: number | null
          additional_info?: string | null
          address?: string | null
          banner_path?: string | null
          capacity?: number | null
          category_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          duration_text?: string | null
          general_price?: number
          id?: string
          is_free?: boolean
          location_name?: string | null
          member_price?: number
          members_only?: boolean
          modality: Database["public"]["Enums"]["activity_modality"]
          objective?: string | null
          program?: string | null
          published_at?: string | null
          registration_close_at?: string | null
          registration_open_at?: string | null
          registrations_closed_manually?: boolean
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["activity_status"]
          syllabus?: string | null
          target_audience?: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          updated_by?: string | null
          virtual_url?: string | null
        }
        Update: {
          academic_hours?: number | null
          additional_info?: string | null
          address?: string | null
          banner_path?: string | null
          capacity?: number | null
          category_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          duration_text?: string | null
          general_price?: number
          id?: string
          is_free?: boolean
          location_name?: string | null
          member_price?: number
          members_only?: boolean
          modality?: Database["public"]["Enums"]["activity_modality"]
          objective?: string | null
          program?: string | null
          published_at?: string | null
          registration_close_at?: string | null
          registration_open_at?: string | null
          registrations_closed_manually?: boolean
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["activity_status"]
          syllabus?: string | null
          target_audience?: string | null
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
          updated_by?: string | null
          virtual_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_dates: {
        Row: {
          activity_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          ends_at: string | null
          id: string
          label: string | null
          sort_order: number
          starts_at: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          ends_at?: string | null
          id?: string
          label?: string | null
          sort_order?: number
          starts_at: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          ends_at?: string | null
          id?: string
          label?: string | null
          sort_order?: number
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_dates_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_speakers: {
        Row: {
          activity_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          role_label: string | null
          sort_order: number
          speaker_id: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          role_label?: string | null
          sort_order?: number
          speaker_id: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          role_label?: string | null
          sort_order?: number
          speaker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_speakers_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_speakers_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          document_number: string
          document_type: Database["public"]["Enums"]["document_type"]
          email: string
          first_names: string
          id: string
          job_title: string
          last_names: string
          phone: string
          ruc: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          document_number: string
          document_type?: Database["public"]["Enums"]["document_type"]
          email: string
          first_names: string
          id?: string
          job_title: string
          last_names: string
          phone: string
          ruc?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          document_number?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          email?: string
          first_names?: string
          id?: string
          job_title?: string
          last_names?: string
          phone?: string
          ruc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      speakers: {
        Row: {
          bio: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          first_names: string
          id: string
          last_names: string
          organization: string | null
          photo_path: string | null
          professional_title: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          first_names: string
          id?: string
          last_names: string
          organization?: string | null
          photo_path?: string | null
          professional_title?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          first_names?: string
          id?: string
          last_names?: string
          organization?: string | null
          photo_path?: string | null
          professional_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          is_active: boolean
          person_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          is_active?: boolean
          person_id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          is_active?: boolean
          person_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_accounts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_active_admin: { Args: never; Returns: boolean }
      save_activity: {
        Args: { p_activity: Json; p_dates: Json; p_speakers: Json }
        Returns: string
      }
      set_activity_status: {
        Args: {
          p_activity_id: string
          p_status: Database["public"]["Enums"]["activity_status"]
        }
        Returns: string
      }
      soft_delete_activity: { Args: { p_activity_id: string }; Returns: string }
    }
    Enums: {
      activity_modality: "in_person" | "virtual" | "hybrid"
      activity_status:
        | "draft"
        | "published"
        | "finished"
        | "archived"
        | "cancelled"
      activity_type: "event" | "training"
      document_type: "dni" | "ce"
      user_role: "student" | "operator" | "administrator"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_modality: ["in_person", "virtual", "hybrid"],
      activity_status: [
        "draft",
        "published",
        "finished",
        "archived",
        "cancelled",
      ],
      activity_type: ["event", "training"],
      document_type: ["dni", "ce"],
      user_role: ["student", "operator", "administrator"],
    },
  },
} as const
