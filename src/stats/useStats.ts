import { useMemo } from "react";
import type {
  ExerciseSetWithCategory,
  SessionWithSet,
  VideoSession,
} from "../types/domain";
import { toStudyEntries } from "../components/session/StudyEntryList";
import { computeStreak } from "./streak";
import {
  accuracyByCategoryOverTime,
  byCategory,
  byExerciseSet,
  coverage,
  dailySeries,
  heatmap,
  improvements,
  recentDailyTime,
  studyDates,
  summarize,
  timeBreakdown,
  weakestSets,
} from "./selectors";

/**
 * ダッシュボードが必要とする集計を一度にまとめて計算する。
 *
 * 正答率系（summary / categories / weakest / improvements など）は
 * 問題演習のセッションだけを見る。講義ビデオは問題を解いていないので、
 * 学習時間・連続学習日数・草グラフにだけ効く。
 */
export function useStats(
  sessions: SessionWithSet[],
  videos: VideoSession[],
  sets: ExerciseSetWithCategory[],
) {
  return useMemo(
    () => ({
      summary: summarize(sessions),
      time: timeBreakdown(sessions, videos),
      streak: computeStreak(studyDates(sessions, videos)),
      daily: dailySeries(sessions),
      recentTime30: recentDailyTime(sessions, videos, 30),
      categories: byCategory(sessions),
      categoryTrend: accuracyByCategoryOverTime(sessions),
      exerciseSets: byExerciseSet(sessions),
      weakest: weakestSets(sessions),
      improvements: improvements(sessions),
      coverage: coverage(sets, sessions),
      heatmap: heatmap(sessions, videos),
      recentEntries: toStudyEntries(sessions, videos).slice(0, 5),
    }),
    [sessions, videos, sets],
  );
}
