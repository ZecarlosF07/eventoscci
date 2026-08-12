// Instantánea temporal del esquema. Regenerar con `yarn types:db` tras ejecutar las migraciones.
export type Json =
  | boolean
  | number
  | string
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      people: {
        Row: {
          address: string | null;
          company: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          document_number: string;
          document_type: Database["public"]["Enums"]["document_type"];
          email: string;
          first_names: string;
          id: string;
          job_title: string;
          last_names: string;
          phone: string;
          ruc: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          company?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document_number: string;
          document_type?: Database["public"]["Enums"]["document_type"];
          email: string;
          first_names: string;
          id?: string;
          job_title: string;
          last_names: string;
          phone: string;
          ruc?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          company?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          document_number?: string;
          document_type?: Database["public"]["Enums"]["document_type"];
          email?: string;
          first_names?: string;
          id?: string;
          job_title?: string;
          last_names?: string;
          phone?: string;
          ruc?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      speakers: {
        Row: {
          bio: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          first_names: string;
          id: string;
          last_names: string;
          organization: string | null;
          photo_path: string | null;
          professional_title: string | null;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_names: string;
          id?: string;
          last_names: string;
          organization?: string | null;
          photo_path?: string | null;
          professional_title?: string | null;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          first_names?: string;
          id?: string;
          last_names?: string;
          organization?: string | null;
          photo_path?: string | null;
          professional_title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_accounts: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
          is_active: boolean;
          person_id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          is_active?: boolean;
          person_id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
          is_active?: boolean;
          person_id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_accounts_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      document_type: "ce" | "dni";
      user_role: "administrator" | "operator" | "student";
    };
    CompositeTypes: Record<string, never>;
  };
};
