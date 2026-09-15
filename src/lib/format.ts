/** 日本語向けの表示フォーマッタ。 */

/** 秒 → "1時間2分3秒" / "2分3秒" / "3秒" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}時間${m}分${sec}秒`
  if (m > 0) return `${m}分${sec}秒`
  return `${sec}秒`
}

/** 秒 → "12:34" / "1:02:03"（タイマー表示用） */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 秒 → 総学習時間向けの粗い表示 "12時間30分" */
export function formatTotalDuration(seconds: number): string {
  const m = Math.round(seconds / 60)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}時間${m % 60}分` : `${m}分`
}

/** 0..1 → "85.2%"。null は "—" */
export function formatRate(rate: number | null): string {
  if (rate === null || !Number.isFinite(rate)) return '—'
  return `${(rate * 100).toFixed(1)}%`
}

/** 'YYYY-MM-DD' → "9月15日(月)" */
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
export function formatIsoDateJp(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  const dow = WEEKDAYS[new Date(Date.UTC(Number(iso.slice(0, 4)), m - 1, d)).getUTCDay()]
  return `${m}月${d}日(${dow})`
}

/** 'YYYY-MM-DD' → "9/15" （グラフの軸用） */
export function formatIsoDateShort(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${m}/${d}`
}
