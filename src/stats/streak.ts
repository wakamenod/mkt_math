import { addDaysIso, diffDaysIso, todayJst, type IsoDate } from '../lib/date'

export interface StreakInfo {
  /** 現在の連続学習日数。今日も昨日も学習していなければ 0。 */
  current: number
  /** 過去最長の連続学習日数。 */
  longest: number
  /** 今日（JST）すでに学習したか。 */
  studiedToday: boolean
  /** 最終学習日。一度も学習していなければ null。 */
  lastStudyDate: IsoDate | null
  /** 学習した日数（ユニーク）。 */
  totalDays: number
}

/**
 * 連続学習日数を求める。
 * 入力は sessions.study_date（JST の生成列）の文字列配列。
 * Date へのパースは一切行わず、文字列日付のまま演算する。
 */
export function computeStreak(studyDates: IsoDate[], today: IsoDate = todayJst()): StreakInfo {
  const days = [...new Set(studyDates)].sort()
  if (days.length === 0) {
    return { current: 0, longest: 0, studiedToday: false, lastStudyDate: null, totalDays: 0 }
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = diffDaysIso(days[i], days[i - 1]) === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  const last = days[days.length - 1]
  const studiedToday = last === today
  const yesterday = addDaysIso(today, -1)

  // 今日か昨日に学習していれば継続中。それ以外は途切れている。
  let current = 0
  if (last === today || last === yesterday) {
    current = 1
    for (let i = days.length - 1; i > 0; i--) {
      if (diffDaysIso(days[i], days[i - 1]) === 1) current++
      else break
    }
  }

  return { current, longest, studiedToday, lastStudyDate: last, totalDays: days.length }
}
