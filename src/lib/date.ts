/**
 * 日付は 'YYYY-MM-DD' 文字列のまま扱う。
 * new Date('2026-09-15') のようなパースは（ローカルTZ解釈でオフバイワンを生むため）使わない。
 * 演算は UTC エポック経由で行う = DST の影響を受けない純粋な日付演算。
 */
export type IsoDate = string; // 'YYYY-MM-DD'

const JST_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
});

/** JST における「今日」。端末のタイムゾーン設定に依存しない。 */
export function todayJst(now: Date = new Date()): IsoDate {
  // 'sv-SE' ロケールは YYYY-MM-DD 形式を返すので整形不要
  return JST_FORMATTER.format(now);
}

/** Date（絶対時刻）を JST の日付文字列へ。 */
export function toJstDate(value: Date | string): IsoDate {
  return JST_FORMATTER.format(
    typeof value === "string" ? new Date(value) : value,
  );
}

function toUtcMs(iso: IsoDate): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): IsoDate {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysIso(iso: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(iso) + days * 86_400_000);
}

/** a - b を日数で返す。 */
export function diffDaysIso(a: IsoDate, b: IsoDate): number {
  return Math.round((toUtcMs(a) - toUtcMs(b)) / 86_400_000);
}

/** 0=日曜 … 6=土曜。 */
export function dayOfWeekIso(iso: IsoDate): number {
  return new Date(toUtcMs(iso)).getUTCDay();
}

/** from から to まで（両端含む）の連続した日付列。 */
export function rangeIso(from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let d = from; diffDaysIso(d, to) <= 0; d = addDaysIso(d, 1)) out.push(d);
  return out;
}
