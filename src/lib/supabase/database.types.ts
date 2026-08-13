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
      attendance: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          marked_at: string | null
          marked_by: string | null
          notes: string | null
          registration_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          registration_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: []
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
      certificate_template_signers: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          signature_path: string | null
          signer_name: string
          signer_title: string | null
          sort_order: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          signature_path?: string | null
          signer_name: string
          signer_title?: string | null
          sort_order?: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          signature_path?: string | null
          signer_name?: string
          signer_title?: string | null
          sort_order?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_template_signers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          background_path: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          scope: Database["public"]["Enums"]["certificate_type"]
          template_config: Json
          updated_at: string
        }
        Insert: {
          background_path?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          scope: Database["public"]["Enums"]["certificate_type"]
          template_config?: Json
          updated_at?: string
        }
        Update: {
          background_path?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          scope?: Database["public"]["Enums"]["certificate_type"]
          template_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          academic_hours_snapshot: number | null
          access_token: string
          certificate_code: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          condition_snapshot: string | null
          course_enrollment_id: string | null
          created_at: string
          date_text_snapshot: string | null
          deleted_at: string | null
          deleted_by: string | null
          file_path: string | null
          id: string
          issued_at: string
          issued_by: string | null
          participant_name_snapshot: string
          person_id: string
          registration_id: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["certificate_status"]
          template_id: string
          title_snapshot: string
          updated_at: string
        }
        Insert: {
          academic_hours_snapshot?: number | null
          access_token?: string
          certificate_code: string
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          condition_snapshot?: string | null
          course_enrollment_id?: string | null
          created_at?: string
          date_text_snapshot?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          file_path?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          participant_name_snapshot: string
          person_id: string
          registration_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          template_id: string
          title_snapshot: string
          updated_at?: string
        }
        Update: {
          academic_hours_snapshot?: number | null
          access_token?: string
          certificate_code?: string
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          condition_snapshot?: string | null
          course_enrollment_id?: string | null
          created_at?: string
          date_text_snapshot?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          file_path?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          participant_name_snapshot?: string
          person_id?: string
          registration_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["certificate_status"]
          template_id?: string
          title_snapshot?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          attempts: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          event_type: string
          id: string
          last_error: string | null
          next_attempt_at: string | null
          payload: Json
          person_id: string | null
          recipient_email: string
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          event_type: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          person_id?: string | null
          recipient_email: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          event_type?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          person_id?: string | null
          recipient_email?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
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
      registrations: {
        Row: {
          activity_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          company_snapshot: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          person_id: string
          price_snapshot: number
          registration_code: string
          registration_type: Database["public"]["Enums"]["registration_type"]
          ruc_snapshot: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          activity_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_snapshot?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          person_id: string
          price_snapshot?: number
          registration_code: string
          registration_type?: Database["public"]["Enums"]["registration_type"]
          ruc_snapshot?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          activity_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          company_snapshot?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          person_id?: string
          price_snapshot?: number
          registration_code?: string
          registration_type?: Database["public"]["Enums"]["registration_type"]
          ruc_snapshot?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
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
      abandon_unfinalized_certificate: {
        Args: { p_certificate_id: string }
        Returns: boolean
      }
      cancel_registration: {
        Args: { p_reason?: string; p_registration_id: string }
        Returns: Json
      }
      claim_notification_batch: {
        Args: { p_limit?: number }
        Returns: {
          attempts: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          event_type: string
          id: string
          last_error: string | null
          next_attempt_at: string | null
          payload: Json
          person_id: string | null
          recipient_email: string
          related_entity_id: string | null
          related_entity_type: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notification_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_notification_delivery: {
        Args: {
          p_error?: string
          p_notification_id: string
          p_success: boolean
        }
        Returns: string
      }
      confirm_registration: {
        Args: { p_registration_id: string }
        Returns: Json
      }
      finalize_activity_certificate: {
        Args: {
          p_certificate_id: string
          p_file_path: string
          p_public_base_url: string
        }
        Returns: Json
      }
      get_activity_registration_availability: {
        Args: { p_activity_id: string }
        Returns: Json
      }
      get_public_certificate: {
        Args: { p_access_token: string }
        Returns: Json
      }
      get_public_certificate_file: {
        Args: { p_access_token: string }
        Returns: string
      }
      get_public_registration_result: {
        Args: { p_registration_code: string }
        Returns: Json
      }
      is_active_admin: { Args: never; Returns: boolean }
      prepare_activity_certificates: {
        Args: {
          p_condition?: string
          p_registration_ids: string[]
          p_template_id: string
        }
        Returns: Json
      }
      register_activity: {
        Args: { p_activity_id: string; p_registration: Json }
        Returns: Json
      }
      register_activity_internal: {
        Args: { p_activity_id: string; p_registration: Json }
        Returns: Json
      }
      retry_notification: {
        Args: { p_notification_id: string }
        Returns: string
      }
      revoke_certificate: {
        Args: { p_certificate_id: string; p_reason: string }
        Returns: Json
      }
      save_activity: {
        Args: { p_activity: Json; p_dates: Json; p_speakers: Json }
        Returns: string
      }
      save_certificate_template: {
        Args: { p_signers: Json; p_template: Json }
        Returns: string
      }
      set_activity_status: {
        Args: {
          p_activity_id: string
          p_status: Database["public"]["Enums"]["activity_status"]
        }
        Returns: string
      }
      set_attendance_status: {
        Args: {
          p_attendance_ids: string[]
          p_notes?: string
          p_status: Database["public"]["Enums"]["attendance_status"]
        }
        Returns: Json
      }
      soft_delete_activity: { Args: { p_activity_id: string }; Returns: string }
      soft_delete_certificate_template: {
        Args: { p_template_id: string }
        Returns: string
      }
      update_own_profile: { Args: { p_profile: Json }; Returns: string }
      update_participant: {
        Args: { p_person: Json; p_person_id: string }
        Returns: string
      }
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
      attendance_status: "pending" | "attended" | "absent"
      certificate_status: "issued" | "revoked"
      certificate_type: "activity" | "course"
      document_type: "dni" | "ce"
      notification_status:
        | "pending"
        | "processing"
        | "sent"
        | "failed"
        | "cancelled"
      registration_status: "pending" | "confirmed" | "cancelled"
      registration_type: "general" | "member"
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
      attendance_status: ["pending", "attended", "absent"],
      certificate_status: ["issued", "revoked"],
      certificate_type: ["activity", "course"],
      document_type: ["dni", "ce"],
      notification_status: [
        "pending",
        "processing",
        "sent",
        "failed",
        "cancelled",
      ],
      registration_status: ["pending", "confirmed", "cancelled"],
      registration_type: ["general", "member"],
      user_role: ["student", "operator", "administrator"],
    },
  },
} as const
