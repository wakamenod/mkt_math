/**
 * Supabase のスキーマ型。
 * Supabase プロジェクト作成後は
 *   npx supabase gen types typescript --project-id <id> > src/types/db.ts
 * で再生成できる（現状は supabase/migrations と手で揃えたもの）。
 */
export type Json =
  string | number | boolean | null | { [key: string]: Json } | Json[];

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ExerciseSetRow = {
  id: string;
  category_id: string;
  number: number;
  title: string | null;
  problem_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  exercise_set_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  correct_count: number;
  problem_count_snapshot: number;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  /** JST の生成列。日次集計・ストリークはすべてこれを基準にする。 */
  study_date: string;
};

type VideoSessionRow = {
  id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  /** JST の生成列。sessions と同じ基準で日次集計する。 */
  study_date: string;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Partial<Omit<CategoryRow, "id">> & { name: string };
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      exercise_sets: {
        Row: ExerciseSetRow;
        Insert: Partial<Omit<ExerciseSetRow, "id">> & {
          category_id: string;
          number: number;
          problem_count: number;
        };
        Update: Partial<ExerciseSetRow>;
        Relationships: [];
      };
      video_sessions: {
        Row: VideoSessionRow;
        Insert: Omit<
          VideoSessionRow,
          | "id"
          | "created_at"
          | "updated_at"
          | "study_date"
          | "created_by"
          | "note"
        > & {
          id?: string;
          created_by?: string;
          note?: string | null;
        };
        Update: Partial<VideoSessionRow>;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: Omit<
          SessionRow,
          | "id"
          | "created_at"
          | "updated_at"
          | "study_date"
          | "created_by"
          | "note"
        > & {
          id?: string;
          created_by?: string;
          note?: string | null;
        };
        Update: Partial<SessionRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
