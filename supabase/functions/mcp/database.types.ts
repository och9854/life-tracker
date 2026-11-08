export type Database = {
  public: {
    Tables: {
      journal_entries: {
        Row: { id: string; user_id: string; entry_date: string; title: string; body: string; created_at: string; updated_at: string; version: number };
        Insert: { id: string; user_id?: string; entry_date: string; title?: string; body?: string; created_at?: string; updated_at?: string; version?: number };
        Update: { entry_date?: string; title?: string; body?: string; updated_at?: string; version?: number };
        Relationships: [];
      };
      action_items: {
        Row: { id: string; user_id: string; title: string; due_date: string | null; completed_at: string | null; archived_at: string | null; source_entry_id: string | null; created_at: string; updated_at: string };
        Insert: { id: string; user_id?: string; title: string; due_date?: string | null; completed_at?: string | null; archived_at?: string | null; source_entry_id?: string | null; created_at?: string; updated_at?: string };
        Update: { title?: string; due_date?: string | null; completed_at?: string | null; archived_at?: string | null; source_entry_id?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
