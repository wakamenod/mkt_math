import { describe, expect, it } from "vitest";
import type { SessionWithSet, VideoSession } from "../types/domain";
import {
  accuracy,
  dailyTime,
  heatmap,
  recentDailyTime,
  studyDates,
  summarize,
  timeBreakdown,
} from "./selectors";
import { computeStreak } from "./streak";

const CAT = { id: "c1", name: "代数1", sort_order: 1 };

function practice(
  date: string,
  seconds: number,
  correct = 3,
  problems = 5,
): SessionWithSet {
  return {
    id: `p-${date}-${seconds}`,
    exercise_set_id: "e1",
    started_at: `${date}T01:00:00Z`,
    ended_at: `${date}T01:10:00Z`,
    duration_seconds: seconds,
    correct_count: correct,
    problem_count_snapshot: problems,
    note: null,
    created_by: "u1",
    created_at: "",
    updated_at: "",
    study_date: date,
    exercise_set: {
      id: "e1",
      number: 1,
      problem_count: problems,
      category: CAT,
    },
  };
}

function video(date: string, seconds: number): VideoSession {
  return {
    id: `v-${date}-${seconds}`,
    started_at: `${date}T02:00:00Z`,
    ended_at: `${date}T02:30:00Z`,
    duration_seconds: seconds,
    note: null,
    created_by: "u1",
    created_at: "",
    updated_at: "",
    study_date: date,
  };
}

describe("講義ビデオは正答率に影響しない", () => {
  it("正答率系の関数はビデオを受け取らない（問題演習だけで決まる）", () => {
    const sessions = [practice("2026-09-15", 300, 3, 5)];
    expect(accuracy(sessions)).toBeCloseTo(0.6);
    // ビデオをいくら足しても summarize は SessionWithSet しか見ないので変わらない
    expect(summarize(sessions).accuracy).toBeCloseTo(0.6);
    expect(summarize(sessions).problemCount).toBe(5);
  });
});

describe("学習時間はビデオを含む", () => {
  it("内訳と合計を返す", () => {
    const t = timeBreakdown(
      [practice("2026-09-15", 300)],
      [video("2026-09-15", 1200)],
    );
    expect(t).toEqual({
      practiceSeconds: 300,
      videoSeconds: 1200,
      totalSeconds: 1500,
    });
  });

  it("ビデオだけでも合計に出る", () => {
    const t = timeBreakdown([], [video("2026-09-15", 600)]);
    expect(t.totalSeconds).toBe(600);
    expect(t.practiceSeconds).toBe(0);
  });

  it("日ごとに演習とビデオを分けて積む", () => {
    const d = dailyTime(
      [practice("2026-09-14", 600), practice("2026-09-15", 300)],
      [video("2026-09-15", 1200), video("2026-09-16", 900)],
    );
    expect(d.map((p) => p.date)).toEqual([
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
    ]);
    expect(d[1]).toMatchObject({
      practiceMinutes: 5,
      videoMinutes: 20,
      totalMinutes: 25,
    });
    // ビデオしかない日も出る
    expect(d[2]).toMatchObject({
      practiceMinutes: 0,
      videoMinutes: 15,
      totalMinutes: 15,
    });
  });

  it("recentDailyTime は学習のない日を 0 で埋める", () => {
    const r = recentDailyTime([], [video("2026-09-15", 600)], 3, "2026-09-15");
    expect(r.map((p) => p.date)).toEqual([
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
    ]);
    expect(r[0].totalMinutes).toBe(0);
    expect(r[2].videoMinutes).toBe(10);
  });
});

describe("連続学習日数はビデオも学習として数える", () => {
  it("ビデオだけの日でも継続する", () => {
    const sessions = [practice("2026-09-13", 300), practice("2026-09-15", 300)];
    const videos = [video("2026-09-14", 1200)];
    // 問題演習だけだと 9/14 が抜けて途切れる
    expect(
      computeStreak(
        sessions.map((s) => s.study_date),
        "2026-09-15",
      ).current,
    ).toBe(1);
    // ビデオを含めれば3日連続
    expect(
      computeStreak(studyDates(sessions, videos), "2026-09-15").current,
    ).toBe(3);
  });

  it("同じ日に演習とビデオがあっても1日として数える", () => {
    const dates = studyDates(
      [practice("2026-09-15", 300)],
      [video("2026-09-15", 600)],
    );
    expect(computeStreak(dates, "2026-09-15").totalDays).toBe(1);
  });
});

describe("草グラフはビデオでも色がつく", () => {
  it("ビデオだけの日も濃度がつく", () => {
    const h = heatmap([], [video("2026-09-15", 3000)], 2, "2026-09-15");
    expect(h.find((d) => d.date === "2026-09-15")!.level).toBe(4);
  });

  it("演習とビデオの時間は合算して濃度を決める", () => {
    // 6分 + 6分 = 12分 → level 2（10分以上）
    const h = heatmap(
      [practice("2026-09-15", 360)],
      [video("2026-09-15", 360)],
      2,
      "2026-09-15",
    );
    expect(h.find((d) => d.date === "2026-09-15")!.level).toBe(2);
  });
});
