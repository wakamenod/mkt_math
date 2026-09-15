import { supabase } from "../lib/supabase";
import type { NewVideoSession, VideoSession } from "../types/domain";

/** 講義ビデオの視聴記録。範囲の区分けはなく、時間だけを持つ。 */
export async function fetchAllVideoSessions(): Promise<VideoSession[]> {
  const { data, error } = await supabase
    .from("video_sessions")
    .select("*")
    .order("started_at");
  if (error) throw error;
  return data ?? [];
}

export async function createVideoSession(input: NewVideoSession) {
  const { error } = await supabase.from("video_sessions").insert(input);
  if (error) throw error;
}

export async function updateVideoSession(
  id: string,
  patch: Partial<VideoSession>,
) {
  const { error } = await supabase
    .from("video_sessions")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteVideoSession(id: string) {
  const { error } = await supabase.from("video_sessions").delete().eq("id", id);
  if (error) throw error;
}
