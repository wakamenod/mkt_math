/**
 * クエストテーマ用の派生表示。
 * 記録そのものは一切変えず、既存の集計値から見せ方だけを作る。
 * 表示に使う文字は ASCII に寄せている（ドット文字のサブセットを増やさないため）。
 */

/** LV n → n+1 に必要な問題数。序盤ほど上がりやすくして、続ける気になるようにする。 */
function costForLevel(level: number): number {
  return 10 + (level - 1) * 5;
}

export interface LevelInfo {
  level: number;
  /** 現在のレベル内で貯まっている経験値。 */
  expIntoLevel: number;
  /** 次のレベルまでに必要な経験値。 */
  expForNext: number;
  /** 0..1 の進捗。 */
  progress: number;
  /** 通算の経験値（＝解いた問題数）。 */
  totalExp: number;
}

/** 解いた問題数を経験値とみなしてレベルを求める。 */
export function levelFromExp(totalExp: number): LevelInfo {
  const exp = Math.max(0, Math.floor(totalExp));
  let level = 1;
  let remaining = exp;
  while (remaining >= costForLevel(level)) {
    remaining -= costForLevel(level);
    level++;
  }
  const expForNext = costForLevel(level);
  return {
    level,
    expIntoLevel: remaining,
    expForNext,
    progress: expForNext === 0 ? 0 : remaining / expForNext,
    totalExp: exp,
  };
}

export type Rank = "S" | "A" | "B" | "C" | "D" | "-";

/** 正答率から称号を決める。記録がなければ "-"。 */
export function rankFromAccuracy(accuracy: number | null): Rank {
  if (accuracy === null || !Number.isFinite(accuracy)) return "-";
  if (accuracy >= 0.9) return "S";
  if (accuracy >= 0.8) return "A";
  if (accuracy >= 0.7) return "B";
  if (accuracy >= 0.6) return "C";
  return "D";
}

/** 連続日数に応じた煽り文句。 */
export function streakTitle(streak: number): string {
  if (streak === 0) return "ぼうけんのはじまり";
  if (streak < 3) return "かけだしぼうけんしゃ";
  if (streak < 7) return "みならいけんじゃ";
  if (streak < 14) return "いっしょうまえのけんじゃ";
  if (streak < 30) return "だいけんじゃ";
  return "でんせつのけんじゃ";
}
