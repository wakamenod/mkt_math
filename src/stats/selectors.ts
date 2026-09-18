import {
  addDaysIso,
  dayOfWeekIso,
  rangeIso,
  todayJst,
  type IsoDate,
} from "../lib/date";
import type {
  ExerciseSetWithCategory,
  SessionWithSet,
  TimeEntry,
  VideoSession,
} from "../types/domain";
import { setLabel } from "../types/domain";

/* ------------------------------------------------------------------ *
 * 基本ヘルパ
 *
 * 正答率の分母は必ず problem_count_snapshot を使う。
 * マスタの exercise_set.problem_count を統計に使ってはいけない
 * （後から問題数を修正すると過去の正答率が遡って変わってしまうため）。
 * ------------------------------------------------------------------ */

export function totalProblems(sessions: SessionWithSet[]): number {
  return sessions.reduce((a, s) => a + s.problem_count_snapshot, 0);
}

export function totalCorrect(sessions: SessionWithSet[]): number {
  return sessions.reduce((a, s) => a + s.correct_count, 0);
}

export function totalSeconds(sessions: SessionWithSet[]): number {
  return sessions.reduce((a, s) => a + s.duration_seconds, 0);
}

/** 正答率。問題数が 0 なら null（ゼロ除算ガード）。 */
export function accuracy(sessions: SessionWithSet[]): number | null {
  const denom = totalProblems(sessions);
  return denom === 0 ? null : totalCorrect(sessions) / denom;
}

/** 1問あたりの秒数。問題数が 0 なら null。 */
export function secondsPerProblem(sessions: SessionWithSet[]): number | null {
  const denom = totalProblems(sessions);
  return denom === 0 ? null : totalSeconds(sessions) / denom;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

/* ------------------------------------------------------------------ *
 * サマリー
 * ------------------------------------------------------------------ */

export interface Summary {
  sessionCount: number;
  problemCount: number;
  correctCount: number;
  totalSeconds: number;
  accuracy: number | null;
  secondsPerProblem: number | null;
}

export function summarize(sessions: SessionWithSet[]): Summary {
  return {
    sessionCount: sessions.length,
    problemCount: totalProblems(sessions),
    correctCount: totalCorrect(sessions),
    totalSeconds: totalSeconds(sessions),
    accuracy: accuracy(sessions),
    secondsPerProblem: secondsPerProblem(sessions),
  };
}

/* ------------------------------------------------------------------ *
 * 日次の推移
 * ------------------------------------------------------------------ */

export interface DailyPoint {
  date: IsoDate;
  sessionCount: number;
  problemCount: number;
  correctCount: number;
  minutes: number;
  accuracy: number | null;
  secondsPerProblem: number | null;
  /** 正答率の7日移動平均（学習した日だけを対象にした直近7点の平均）。 */
  accuracyMA7: number | null;
}

/** 学習した日のみの日次系列。study_date（JST）でバケットする。 */
export function dailySeries(sessions: SessionWithSet[]): DailyPoint[] {
  const byDate = groupBy(sessions, (s) => s.study_date);
  const points = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      sessionCount: list.length,
      problemCount: totalProblems(list),
      correctCount: totalCorrect(list),
      minutes: Math.round(totalSeconds(list) / 60),
      accuracy: accuracy(list),
      secondsPerProblem: secondsPerProblem(list),
      accuracyMA7: null as number | null,
    }));

  // 7日移動平均は「直近7つの学習日」の正答率を、問題数で重み付けして平均する
  for (let i = 0; i < points.length; i++) {
    const window = points.slice(Math.max(0, i - 6), i + 1);
    const denom = window.reduce((a, p) => a + p.problemCount, 0);
    points[i].accuracyMA7 =
      denom === 0
        ? null
        : window.reduce((a, p) => a + p.correctCount, 0) / denom;
  }
  return points;
}

/** 直近 n 日ぶんを、学習していない日も 0 で埋めて返す（棒グラフ用）。 */
export function recentDaily(
  sessions: SessionWithSet[],
  days: number,
  today: IsoDate = todayJst(),
) {
  const byDate = new Map(dailySeries(sessions).map((p) => [p.date, p]));
  return rangeIso(addDaysIso(today, -(days - 1)), today).map(
    (date) =>
      byDate.get(date) ?? {
        date,
        sessionCount: 0,
        problemCount: 0,
        correctCount: 0,
        minutes: 0,
        accuracy: null,
        secondsPerProblem: null,
        accuracyMA7: null,
      },
  );
}

/* ------------------------------------------------------------------ *
 * 大分類別 / 練習問題別
 * ------------------------------------------------------------------ */

export interface CategoryStat extends Summary {
  categoryId: string;
  categoryName: string;
  sortOrder: number;
}

export function byCategory(sessions: SessionWithSet[]): CategoryStat[] {
  return [...groupBy(sessions, (s) => s.exercise_set.category.id).entries()]
    .map(([categoryId, list]) => ({
      categoryId,
      categoryName: list[0].exercise_set.category.name,
      sortOrder: list[0].exercise_set.category.sort_order,
      ...summarize(list),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** カテゴリ×日付のマトリクス。カテゴリ別の正答率推移グラフ用。 */
export function accuracyByCategoryOverTime(sessions: SessionWithSet[]) {
  const categories = byCategory(sessions).map((c) => ({
    id: c.categoryId,
    name: c.categoryName,
  }));
  const byDate = groupBy(sessions, (s) => s.study_date);
  const rows = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => {
      const row: Record<string, string | number | null> = { date };
      for (const c of categories) {
        row[c.name] = accuracy(
          list.filter((s) => s.exercise_set.category.id === c.id),
        );
      }
      return row;
    });
  return { categories, rows };
}

export interface ExerciseSetStat extends Summary {
  exerciseSetId: string;
  label: string;
  number: number;
  categoryId: string;
  categoryName: string;
  attemptCount: number;
  lastStudiedAt: string | null;
}

export function byExerciseSet(sessions: SessionWithSet[]): ExerciseSetStat[] {
  return [...groupBy(sessions, (s) => s.exercise_set_id).entries()]
    .map(([exerciseSetId, list]) => {
      const set = list[0].exercise_set;
      return {
        exerciseSetId,
        label: setLabel(set),
        number: set.number,
        categoryId: set.category.id,
        categoryName: set.category.name,
        attemptCount: list.length,
        lastStudiedAt: list.reduce<string | null>(
          (latest, s) =>
            latest === null || s.started_at > latest ? s.started_at : latest,
          null,
        ),
        ...summarize(list),
      };
    })
    .sort(
      (a, b) =>
        a.categoryName.localeCompare(b.categoryName) || a.number - b.number,
    );
}

/**
 * 苦手ランキング。
 * 1回しか解いていない・問題数が極端に少ないセットのノイズを避けるため
 * 累計問題数が minProblems 未満のものは除外する。
 */
export function weakestSets(
  sessions: SessionWithSet[],
  limit = 10,
  minProblems = 3,
) {
  return byExerciseSet(sessions)
    .filter((s) => s.problemCount >= minProblems && s.accuracy !== null)
    .sort(
      (a, b) =>
        (a.accuracy ?? 1) - (b.accuracy ?? 1) ||
        (b.secondsPerProblem ?? 0) - (a.secondsPerProblem ?? 0),
    )
    .slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * 反復による改善
 * ------------------------------------------------------------------ */

export interface AttemptPoint {
  attempt: number;
  date: IsoDate;
  accuracy: number | null;
  secondsPerProblem: number | null;
  correctCount: number;
  problemCount: number;
  durationSeconds: number;
  sessionId: string;
}

/** ある練習問題の、1回目・2回目…の推移。 */
export function attemptSeries(
  sessions: SessionWithSet[],
  exerciseSetId: string,
): AttemptPoint[] {
  return sessions
    .filter((s) => s.exercise_set_id === exerciseSetId)
    .sort((a, b) => a.started_at.localeCompare(b.started_at))
    .map((s, i) => ({
      attempt: i + 1,
      date: s.study_date,
      accuracy:
        s.problem_count_snapshot === 0
          ? null
          : s.correct_count / s.problem_count_snapshot,
      secondsPerProblem:
        s.problem_count_snapshot === 0
          ? null
          : s.duration_seconds / s.problem_count_snapshot,
      correctCount: s.correct_count,
      problemCount: s.problem_count_snapshot,
      durationSeconds: s.duration_seconds,
      sessionId: s.id,
    }));
}

/**
 * ある練習問題の、直近の記録（前回の結果）。まだ解いたことがなければ null。
 * 「今回」の結果と並べて見せるためのもので、比較の分母は
 * そのときの problem_count_snapshot（マスタの現在値ではない）。
 */
export function latestAttempt(
  sessions: SessionWithSet[],
  exerciseSetId: string,
): AttemptPoint | null {
  const series = attemptSeries(sessions, exerciseSetId);
  return series.length === 0 ? null : series[series.length - 1];
}

export interface ImprovementStat {
  exerciseSetId: string;
  label: string;
  attemptCount: number;
  firstAccuracy: number;
  latestAccuracy: number;
  /** 最新 - 初回。正なら改善。 */
  accuracyDelta: number;
  firstSecondsPerProblem: number | null;
  latestSecondsPerProblem: number | null;
  /** 最新 - 初回。負なら速くなっている。 */
  paceDelta: number | null;
}

/** 2回以上解いた練習問題について、初回から最新への変化を返す。 */
export function improvements(sessions: SessionWithSet[]): ImprovementStat[] {
  return byExerciseSet(sessions)
    .filter((s) => s.attemptCount >= 2)
    .map((s) => {
      const series = attemptSeries(sessions, s.exerciseSetId);
      const first = series[0];
      const latest = series[series.length - 1];
      const paceDelta =
        first.secondsPerProblem !== null && latest.secondsPerProblem !== null
          ? latest.secondsPerProblem - first.secondsPerProblem
          : null;
      return {
        exerciseSetId: s.exerciseSetId,
        label: s.label,
        attemptCount: s.attemptCount,
        firstAccuracy: first.accuracy ?? 0,
        latestAccuracy: latest.accuracy ?? 0,
        accuracyDelta: (latest.accuracy ?? 0) - (first.accuracy ?? 0),
        firstSecondsPerProblem: first.secondsPerProblem,
        latestSecondsPerProblem: latest.secondsPerProblem,
        paceDelta,
      };
    })
    .sort((a, b) => b.accuracyDelta - a.accuracyDelta);
}

/* ------------------------------------------------------------------ *
 * カバレッジ（進捗）
 * ------------------------------------------------------------------ */

export interface CoverageCell {
  exerciseSetId: string;
  number: number;
  problemCount: number;
  attemptCount: number;
  accuracy: number | null;
}

export interface CategoryCoverage {
  categoryId: string;
  categoryName: string;
  sortOrder: number;
  cells: CoverageCell[];
  attemptedSets: number;
  totalSets: number;
}

/**
 * 全練習問題に対する実施状況。未実施のセットも含めるため、
 * セッションだけでなくマスタ（exercise_sets）を入力に取る。
 */
export function coverage(
  sets: ExerciseSetWithCategory[],
  sessions: SessionWithSet[],
): CategoryCoverage[] {
  const bySetId = groupBy(sessions, (s) => s.exercise_set_id);
  return [...groupBy(sets, (s) => s.category.id).entries()]
    .map(([categoryId, list]) => {
      const cells = [...list]
        .sort((a, b) => a.number - b.number)
        .map((set) => {
          const attempts = bySetId.get(set.id) ?? [];
          return {
            exerciseSetId: set.id,
            number: set.number,
            problemCount: set.problem_count,
            attemptCount: attempts.length,
            accuracy: accuracy(attempts),
          };
        });
      return {
        categoryId,
        categoryName: list[0].category.name,
        sortOrder: list[0].category.sort_order,
        cells,
        attemptedSets: cells.filter((c) => c.attemptCount > 0).length,
        totalSets: cells.length,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* ------------------------------------------------------------------ *
 * 学習時間（問題演習 + 講義ビデオ）
 *
 * ビデオは「学習した時間」には数えるが、正答率には一切関わらない。
 * そのため正答率系の関数（accuracy / byCategory / weakestSets など）は
 * 一貫して SessionWithSet だけを入力に取り、ここだけが両方を見る。
 * ------------------------------------------------------------------ */

export interface TimeBreakdown {
  practiceSeconds: number;
  videoSeconds: number;
  totalSeconds: number;
}

export function timeBreakdown(
  sessions: SessionWithSet[],
  videos: VideoSession[],
): TimeBreakdown {
  const practiceSeconds = totalSeconds(sessions);
  const videoSeconds = videos.reduce((a, v) => a + v.duration_seconds, 0);
  return {
    practiceSeconds,
    videoSeconds,
    totalSeconds: practiceSeconds + videoSeconds,
  };
}

/** 学習した日（JST）。問題演習とビデオのどちらかがあればその日は学習日。 */
export function studyDates(
  sessions: TimeEntry[],
  videos: TimeEntry[],
): string[] {
  return [...sessions, ...videos].map((e) => e.study_date);
}

export interface DailyTimePoint {
  date: IsoDate;
  practiceMinutes: number;
  videoMinutes: number;
  totalMinutes: number;
  problemCount: number;
  sessionCount: number;
}

function sumSeconds(entries: TimeEntry[]): number {
  return entries.reduce((a, e) => a + e.duration_seconds, 0);
}

/** 日ごとの学習時間の内訳。学習のあった日だけを昇順で返す。 */
export function dailyTime(
  sessions: SessionWithSet[],
  videos: VideoSession[],
): DailyTimePoint[] {
  const practiceByDate = groupBy(sessions, (s) => s.study_date);
  const videoByDate = groupBy(videos, (v) => v.study_date);
  const dates = [
    ...new Set([...practiceByDate.keys(), ...videoByDate.keys()]),
  ].sort();

  return dates.map((date) => {
    const practice = practiceByDate.get(date) ?? [];
    const video = videoByDate.get(date) ?? [];
    const practiceMinutes = Math.round(sumSeconds(practice) / 60);
    const videoMinutes = Math.round(sumSeconds(video) / 60);
    return {
      date,
      practiceMinutes,
      videoMinutes,
      totalMinutes: practiceMinutes + videoMinutes,
      problemCount: totalProblems(practice),
      sessionCount: practice.length + video.length,
    };
  });
}

/** 直近 n 日ぶんの学習時間。学習していない日も 0 で埋める（棒グラフ用）。 */
export function recentDailyTime(
  sessions: SessionWithSet[],
  videos: VideoSession[],
  days: number,
  today: IsoDate = todayJst(),
): DailyTimePoint[] {
  const byDate = new Map(dailyTime(sessions, videos).map((p) => [p.date, p]));
  return rangeIso(addDaysIso(today, -(days - 1)), today).map(
    (date) =>
      byDate.get(date) ?? {
        date,
        practiceMinutes: 0,
        videoMinutes: 0,
        totalMinutes: 0,
        problemCount: 0,
        sessionCount: 0,
      },
  );
}

/* ------------------------------------------------------------------ *
 * カレンダーヒートマップ
 * ------------------------------------------------------------------ */

export interface HeatmapDay {
  date: IsoDate;
  minutes: number;
  problemCount: number;
  /** 0（未学習）〜4 の濃度レベル。 */
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * 直近 weeks 週ぶんの日別学習量。日曜始まりの週境界に揃える。
 * 濃度はビデオ視聴も含めた合計時間で決まる（ビデオの日も草が生える）。
 */
export function heatmap(
  sessions: SessionWithSet[],
  videos: VideoSession[],
  weeks = 26,
  today: IsoDate = todayJst(),
): HeatmapDay[] {
  const byDate = new Map(dailyTime(sessions, videos).map((p) => [p.date, p]));

  // 今週の土曜まで埋めて、そこから weeks 週ぶん遡る（列＝週になるように）
  const endOfWeek = addDaysIso(today, 6 - dayOfWeekIso(today));
  const start = addDaysIso(endOfWeek, -(weeks * 7 - 1));

  return rangeIso(start, endOfWeek).map((date) => {
    const p = byDate.get(date);
    const minutes = p?.totalMinutes ?? 0;
    let level: HeatmapDay["level"] = 0;
    if (minutes > 0) level = 1;
    if (minutes >= 10) level = 2;
    if (minutes >= 20) level = 3;
    if (minutes >= 40) level = 4;
    return { date, minutes, problemCount: p?.problemCount ?? 0, level };
  });
}
