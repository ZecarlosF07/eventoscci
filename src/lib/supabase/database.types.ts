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
            foreignKeyName: "certificates_course_enrollment_id_fkey"
            columns: ["course_enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
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
      course_enrollments: {
        Row: {
          access_granted_at: string
          access_granted_by: string | null
          completed_at: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          person_id: string
          price_snapshot: number
          progress_percent: number
          registration_type: Database["public"]["Enums"]["registration_type"]
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["course_enrollment_status"]
          updated_at: string
        }
        Insert: {
          access_granted_at?: string
          access_granted_by?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          person_id: string
          price_snapshot?: number
          progress_percent?: number
          registration_type?: Database["public"]["Enums"]["registration_type"]
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["course_enrollment_status"]
          updated_at?: string
        }
        Update: {
          access_granted_at?: string
          access_granted_by?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          person_id?: string
          price_snapshot?: number
          progress_percent?: number
          registration_type?: Database["public"]["Enums"]["registration_type"]
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["course_enrollment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      course_instructors: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_primary: boolean
          role_label: string | null
          sort_order: number
          speaker_id: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_primary?: boolean
          role_label?: string | null
          sort_order?: number
          speaker_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_primary?: boolean
          role_label?: string | null
          sort_order?: number
          speaker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_instructors_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instructors_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          external_url: string | null
          file_size_bytes: number | null
          id: string
          material_type: Database["public"]["Enums"]["material_type"]
          mime_type: string | null
          sort_order: number
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          id?: string
          material_type: Database["public"]["Enums"]["material_type"]
          mime_type?: string | null
          sort_order?: number
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          id?: string
          material_type?: Database["public"]["Enums"]["material_type"]
          mime_type?: string | null
          sort_order?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          enrollment_id: string
          id: string
          person_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          enrollment_id: string
          id?: string
          person_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          enrollment_id?: string
          id?: string
          person_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_hours: number | null
          banner_path: string | null
          contents_overview: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string
          duration_text: string | null
          general_price: number
          id: string
          is_free: boolean
          member_price: number
          objectives: string | null
          published_at: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          academic_hours?: number | null
          banner_path?: string | null
          contents_overview?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          duration_text?: string | null
          general_price?: number
          id?: string
          is_free?: boolean
          member_price?: number
          objectives?: string | null
          published_at?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          academic_hours?: number | null
          banner_path?: string | null
          contents_overview?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          duration_text?: string | null
          general_price?: number
          id?: string
          is_free?: boolean
          member_price?: number
          objectives?: string | null
          published_at?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          duration_seconds_snapshot: number | null
          enrollment_id: string
          id: string
          is_completed: boolean
          last_position_seconds: number
          last_watched_at: string | null
          lesson_id: string
          progress_percent: number
          updated_at: string
          watched_seconds: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          duration_seconds_snapshot?: number | null
          enrollment_id: string
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          last_watched_at?: string | null
          lesson_id: string
          progress_percent?: number
          updated_at?: string
          watched_seconds?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          duration_seconds_snapshot?: number | null
          enrollment_id?: string
          id?: string
          is_completed?: boolean
          last_position_seconds?: number
          last_watched_at?: string | null
          lesson_id?: string
          progress_percent?: number
          updated_at?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_published: boolean
          is_required: boolean
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_asset_id: string | null
          video_provider: string | null
          video_storage_path: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          is_required?: boolean
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_asset_id?: string | null
          video_provider?: string | null
          video_storage_path?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          is_required?: boolean
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_asset_id?: string | null
          video_provider?: string | null
          video_storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
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
      quiz_attempt_answers: {
        Row: {
          attempt_id: string
          correct_option_text_snapshot: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          explanation_snapshot: string | null
          id: string
          is_correct: boolean
          question_id: string
          question_text_snapshot: string
          selected_option_id: string
          selected_option_text_snapshot: string
        }
        Insert: {
          attempt_id: string
          correct_option_text_snapshot: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          explanation_snapshot?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          question_text_snapshot: string
          selected_option_id: string
          selected_option_text_snapshot: string
        }
        Update: {
          attempt_id?: string
          correct_option_text_snapshot?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          explanation_snapshot?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          question_text_snapshot?: string
          selected_option_id?: string
          selected_option_text_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "quiz_options"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_number: number
          correct_answers: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          enrollment_id: string
          id: string
          is_passed: boolean
          quiz_id: string
          score_percent: number
          started_at: string
          submitted_at: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          attempt_number: number
          correct_answers: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          enrollment_id: string
          id?: string
          is_passed: boolean
          quiz_id: string
          score_percent: number
          started_at?: string
          submitted_at?: string
          total_questions: number
          updated_at?: string
        }
        Update: {
          attempt_number?: number
          correct_answers?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          enrollment_id?: string
          id?: string
          is_passed?: boolean
          quiz_id?: string
          score_percent?: number
          started_at?: string
          submitted_at?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_correct: boolean
          option_text: string
          question_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_correct?: boolean
          option_text: string
          question_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_correct?: boolean
          option_text?: string
          question_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          explanation: string | null
          id: string
          is_active: boolean
          prompt: string
          quiz_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          prompt: string
          quiz_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean
          prompt?: string
          quiz_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_published: boolean
          module_id: string
          passing_score: number
          title: string
          unlimited_attempts: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          module_id: string
          passing_score?: number
          title: string
          unlimited_attempts?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          module_id?: string
          passing_score?: number
          title?: string
          unlimited_attempts?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
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
      authorize_course_certificate_generation: {
        Args: { p_certificate_id: string }
        Returns: boolean
      }
      cancel_registration: {
        Args: { p_reason?: string; p_registration_id: string }
        Returns: Json
      }
      check_course_completion: {
        Args: { p_enrollment_id: string }
        Returns: boolean
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
      current_course_enrollment: {
        Args: { p_course_id: string }
        Returns: string
      }
      current_person_id: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      delete_course_rating: { Args: { p_course_id: string }; Returns: boolean }
      enroll_free_course: { Args: { p_course_id: string }; Returns: string }
      finalize_activity_certificate: {
        Args: {
          p_certificate_id: string
          p_file_path: string
          p_public_base_url: string
        }
        Returns: Json
      }
      finalize_course_certificate: {
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
      get_admin_quiz: { Args: { p_module_id: string }; Returns: Json }
      get_certificate_activity_summaries: {
        Args: never
        Returns: {
          eligible_count: number
          id: string
          issued_count: number
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }[]
      }
      get_my_certificates: { Args: never; Returns: Json }
      get_my_course_certificate: {
        Args: { p_course_id: string }
        Returns: Json
      }
      get_my_course_rating: { Args: { p_course_id: string }; Returns: Json }
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
      get_quiz_attempt_result: { Args: { p_attempt_id: string }; Returns: Json }
      get_quiz_attempts: {
        Args: { p_enrollment_id: string; p_quiz_id: string }
        Returns: Json
      }
      get_student_course_quiz_summaries: {
        Args: { p_course_id: string }
        Returns: Json
      }
      get_student_quiz: {
        Args: { p_course_id: string; p_module_id: string }
        Returns: Json
      }
      grant_course_access: {
        Args: {
          p_course_id: string
          p_person_id: string
          p_price_snapshot?: number
          p_registration_type: Database["public"]["Enums"]["registration_type"]
        }
        Returns: string
      }
      has_active_course_enrollment: {
        Args: { p_course_id: string }
        Returns: boolean
      }
      is_active_admin: { Args: never; Returns: boolean }
      is_administrator: { Args: never; Returns: boolean }
      is_internal_user: { Args: never; Returns: boolean }
      prepare_activity_certificates: {
        Args: {
          p_condition?: string
          p_registration_ids: string[]
          p_template_id: string
        }
        Returns: Json
      }
      recalculate_course_progress: {
        Args: { p_enrollment_id: string }
        Returns: number
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
      revoke_course_access: {
        Args: { p_enrollment_id: string; p_reason: string }
        Returns: undefined
      }
      save_activity: {
        Args: { p_activity: Json; p_dates: Json; p_speakers: Json }
        Returns: string
      }
      save_certificate_template: {
        Args: { p_signers: Json; p_template: Json }
        Returns: string
      }
      save_course: {
        Args: { p_course: Json; p_instructors: Json }
        Returns: string
      }
      save_course_rating: {
        Args: { p_comment?: string; p_course_id: string; p_rating: number }
        Returns: string
      }
      save_quiz: { Args: { p_questions: Json; p_quiz: Json }; Returns: string }
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
      set_course_status: {
        Args: {
          p_course_id: string
          p_status: Database["public"]["Enums"]["course_status"]
        }
        Returns: undefined
      }
      soft_delete_activity: { Args: { p_activity_id: string }; Returns: string }
      soft_delete_certificate_template: {
        Args: { p_template_id: string }
        Returns: string
      }
      submit_quiz_attempt: {
        Args: { p_answers: Json; p_enrollment_id: string; p_quiz_id: string }
        Returns: Json
      }
      update_lesson_progress: {
        Args: {
          p_enrollment_id: string
          p_last_position_seconds: number
          p_lesson_id: string
          p_watched_seconds: number
        }
        Returns: Json
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
      course_enrollment_status: "active" | "completed" | "revoked"
      course_status: "draft" | "published" | "archived"
      document_type: "dni" | "ce"
      material_type: "file" | "external_link"
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
      course_enrollment_status: ["active", "completed", "revoked"],
      course_status: ["draft", "published", "archived"],
      document_type: ["dni", "ce"],
      material_type: ["file", "external_link"],
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
