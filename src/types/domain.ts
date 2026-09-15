import type { Database } from "./db";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ExerciseSet = Database["public"]["Tables"]["exercise_sets"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];

export type NewSession = Database["public"]["Tables"]["sessions"]["Insert"];

export type VideoSession =
  Database["public"]["Tables"]["video_sessions"]["Row"];
export type NewVideoSession =
  Database["public"]["Tables"]["video_sessions"]["Insert"];

/** 練習問題にカテゴリをぶら下げた形（一覧・セレクタ用）。 */
export interface ExerciseSetWithCategory extends ExerciseSet {
  category: Pick<Category, "id" | "name" | "sort_order">;
}

/** セッション + 練習問題 + カテゴリ。集計はすべてこの形を入力にする。 */
export interface SessionWithSet extends Session {
  exercise_set: {
    id: string;
    number: number;
    problem_count: number;
    category: Pick<Category, "id" | "name" | "sort_order">;
  };
}

/**
 * 学習時間・連続学習日数・草グラフの共通入力。
 * 問題演習と講義ビデオのどちらもこの形に落として集計する。
 */
export interface TimeEntry {
  study_date: string;
  duration_seconds: number;
}

/** 履歴に問題演習とビデオを混ぜて並べるための型。 */
export type StudyEntry =
  | { kind: "practice"; id: string; startedAt: string; session: SessionWithSet }
  | { kind: "video"; id: string; startedAt: string; session: VideoSession };

/** 表示用ラベル: "代数1 練習問題6" */
export function setLabel(s: {
  number: number;
  category: { name: string };
}): string {
  return `${s.category.name} 練習問題${s.number}`;
}
