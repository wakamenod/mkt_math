import { supabase } from '../lib/supabase'
import type { NewSession, Session, SessionWithSet } from '../types/domain'

const SELECT_WITH_SET =
  '*, exercise_set:exercise_sets(id, number, problem_count, category:categories(id, name, sort_order))'

/**
 * 全セッションを1リクエストで取得する。
 * 統計はすべてクライアント側の純関数で計算するため、全件をキャッシュ1本に載せる。
 */
export async function fetchAllSessions(): Promise<SessionWithSet[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(SELECT_WITH_SET)
    .order('started_at')
  if (error) throw error
  return (data ?? []) as unknown as SessionWithSet[]
}

export async function createSession(input: NewSession) {
  const { error } = await supabase.from('sessions').insert(input)
  if (error) throw error
}

export async function updateSession(id: string, patch: Partial<Session>) {
  const { error } = await supabase.from('sessions').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}
