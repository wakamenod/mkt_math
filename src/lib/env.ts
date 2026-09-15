/**
 * 環境変数の読み出しと起動時検証。
 * 未設定のまま真っ白な画面でデバッグする事態を避けるため、
 * 欠けている変数名を明示的に持ち回る。
 */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
}

export function missingEnvVars(): string[] {
  const missing: string[] = []
  if (!env.supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!env.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  return missing
}
