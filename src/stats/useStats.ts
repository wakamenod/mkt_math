import { useMemo } from 'react'
import type { ExerciseSetWithCategory, SessionWithSet } from '../types/domain'
import { computeStreak } from './streak'
import {
  accuracyByCategoryOverTime,
  byCategory,
  byExerciseSet,
  coverage,
  dailySeries,
  heatmap,
  improvements,
  recentDaily,
  summarize,
  weakestSets,
} from './selectors'

/** ダッシュボードが必要とする集計を一度にまとめて計算する。 */
export function useStats(sessions: SessionWithSet[], sets: ExerciseSetWithCategory[]) {
  return useMemo(
    () => ({
      summary: summarize(sessions),
      streak: computeStreak(sessions.map((s) => s.study_date)),
      daily: dailySeries(sessions),
      recent30: recentDaily(sessions, 30),
      categories: byCategory(sessions),
      categoryTrend: accuracyByCategoryOverTime(sessions),
      exerciseSets: byExerciseSet(sessions),
      weakest: weakestSets(sessions),
      improvements: improvements(sessions),
      coverage: coverage(sets, sessions),
      heatmap: heatmap(sessions),
      recentSessions: [...sessions].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 5),
    }),
    [sessions, sets],
  )
}
