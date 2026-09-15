/**
 * 環境変数の読み出しと起動時検証。
 * 未設定のまま真っ白な画面でデバッグする事態を避けるため、
 * 欠けている変数名を明示的に持ち回る。
 */

/**
 * 空文字を「未設定」として扱う。
 * GitHub Actions は未登録のシークレットを空文字として渡してくるので、
 * ?? では拾えない（?? は null/undefined のみ）。ここで undefined に正規化する。
 */
function read(value: unknown): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? undefined : trimmed;
}

export const env = {
  supabaseUrl: read(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: read(import.meta.env.VITE_SUPABASE_ANON_KEY),
};

export function missingEnvVars(): string[] {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("VITE_SUPABASE_URL");
  if (!env.supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  return missing;
}
