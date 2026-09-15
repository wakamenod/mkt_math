import { supabase } from "../lib/supabase";
import type { ExerciseSet, ExerciseSetWithCategory } from "../types/domain";

const SELECT_WITH_CATEGORY = "*, category:categories(id, name, sort_order)";

export async function fetchExerciseSets(): Promise<ExerciseSetWithCategory[]> {
  const { data, error } = await supabase
    .from("exercise_sets")
    .select(SELECT_WITH_CATEGORY)
    .order("number");
  if (error) throw error;
  return (data ?? []) as unknown as ExerciseSetWithCategory[];
}

export async function createExerciseSet(input: {
  category_id: string;
  number: number;
  problem_count: number;
  title?: string | null;
}) {
  const { error } = await supabase.from("exercise_sets").insert(input);
  if (error) throw error;
}

export async function updateExerciseSet(
  id: string,
  patch: Partial<ExerciseSet>,
) {
  const { error } = await supabase
    .from("exercise_sets")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExerciseSet(id: string) {
  const { error } = await supabase.from("exercise_sets").delete().eq("id", id);
  if (error) throw error;
}
