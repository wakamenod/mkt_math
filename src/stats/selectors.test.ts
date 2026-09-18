import { describe, expect, it } from "vitest";
import type { SessionWithSet, ExerciseSetWithCategory } from "../types/domain";
import {
  accuracy,
  attemptSeries,
  latestAttempt,
  byCategory,
  byExerciseSet,
  coverage,
  dailySeries,
  heatmap,
  improvements,
  recentDaily,
  summarize,
  weakestSets,
} from "./selectors";

const CAT = { id: "c1", name: "代数1", sort_order: 1 };
const CAT2 = { id: "c2", name: "幾何1", sort_order: 4 };

let seq = 0;
function session(p: {
  setId: string;
  number: number;
  problems: number;
  correct: number;
  seconds: number;
  date: string;
  category?: typeof CAT;
}): SessionWithSet {
  const cat = p.category ?? CAT;
  return {
    id: `s${seq++}`,
    exercise_set_id: p.setId,
    started_at: `${p.date}T01:00:00Z`,
    ended_at: `${p.date}T01:10:00Z`,
    duration_seconds: p.seconds,
    correct_count: p.correct,
    problem_count_snapshot: p.problems,
    note: null,
    created_by: "u1",
    created_at: `${p.date}T01:10:00Z`,
    updated_at: `${p.date}T01:10:00Z`,
    study_date: p.date,
    exercise_set: {
      id: p.setId,
      number: p.number,
      problem_count: p.problems,
      category: cat,
    },
  };
}

describe("集計の基本", () => {
  it("空配列でゼロ除算しない", () => {
    expect(accuracy([])).toBeNull();
    expect(summarize([])).toMatchObject({
      sessionCount: 0,
      accuracy: null,
      secondsPerProblem: null,
    });
  });

  it("正答率の分母は problem_count_snapshot", () => {
    const s = [
      session({
        setId: "e1",
        number: 1,
        problems: 5,
        correct: 4,
        seconds: 300,
        date: "2026-09-14",
      }),
      session({
        setId: "e2",
        number: 2,
        problems: 5,
        correct: 3,
        seconds: 200,
        date: "2026-09-15",
      }),
    ];
    expect(accuracy(s)).toBeCloseTo(7 / 10);
    expect(summarize(s).secondsPerProblem).toBeCloseTo(500 / 10);
  });

  it("マスタの problem_count を変えても過去の正答率は動かない", () => {
    const s = session({
      setId: "e1",
      number: 1,
      problems: 5,
      correct: 4,
      seconds: 300,
      date: "2026-09-14",
    });
    // マスタだけ 10 問に修正された状況を再現
    s.exercise_set.problem_count = 10;
    expect(accuracy([s])).toBeCloseTo(0.8);
  });
});

describe("日次系列", () => {
  const sessions = [
    session({
      setId: "e1",
      number: 1,
      problems: 5,
      correct: 5,
      seconds: 300,
      date: "2026-09-13",
    }),
    session({
      setId: "e2",
      number: 2,
      problems: 5,
      correct: 3,
      seconds: 600,
      date: "2026-09-15",
    }),
    session({
      setId: "e3",
      number: 3,
      problems: 5,
      correct: 2,
      seconds: 300,
      date: "2026-09-15",
    }),
  ];

  it("study_date でバケットし昇順に並ぶ", () => {
    const d = dailySeries(sessions);
    expect(d.map((p) => p.date)).toEqual(["2026-09-13", "2026-09-15"]);
    expect(d[1].sessionCount).toBe(2);
    expect(d[1].accuracy).toBeCloseTo(5 / 10);
    expect(d[1].minutes).toBe(15);
  });

  it("移動平均は累積の重み付き平均", () => {
    const d = dailySeries(sessions);
    expect(d[0].accuracyMA7).toBeCloseTo(1);
    expect(d[1].accuracyMA7).toBeCloseTo(10 / 15);
  });

  it("recentDaily は学習していない日を 0 で埋める", () => {
    const r = recentDaily(sessions, 5, "2026-09-15");
    expect(r).toHaveLength(5);
    expect(r.map((p) => p.date)).toEqual([
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
    ]);
    expect(r[3]).toMatchObject({ minutes: 0, sessionCount: 0, accuracy: null });
  });
});

describe("大分類別・練習問題別", () => {
  const sessions = [
    session({
      setId: "e1",
      number: 1,
      problems: 5,
      correct: 5,
      seconds: 100,
      date: "2026-09-13",
    }),
    session({
      setId: "g1",
      number: 1,
      problems: 4,
      correct: 1,
      seconds: 400,
      date: "2026-09-14",
      category: CAT2,
    }),
  ];

  it("カテゴリは sort_order 順", () => {
    const c = byCategory(sessions);
    expect(c.map((x) => x.categoryName)).toEqual(["代数1", "幾何1"]);
    expect(c[1].accuracy).toBeCloseTo(0.25);
  });

  it("練習問題別にラベルと回数が出る", () => {
    const s = byExerciseSet(sessions);
    expect(s.find((x) => x.exerciseSetId === "e1")).toMatchObject({
      label: "代数1 練習問題1",
      attemptCount: 1,
    });
  });

  it("苦手ランキングは正答率の低い順", () => {
    const w = weakestSets(sessions);
    expect(w[0].exerciseSetId).toBe("g1");
  });

  it("累計問題数が少ないセットは苦手ランキングから除外される", () => {
    const tiny = [
      session({
        setId: "e9",
        number: 9,
        problems: 1,
        correct: 0,
        seconds: 60,
        date: "2026-09-15",
      }),
    ];
    expect(weakestSets(tiny, 10, 3)).toHaveLength(0);
  });
});

describe("反復による改善", () => {
  const sessions = [
    session({
      setId: "e6",
      number: 6,
      problems: 10,
      correct: 4,
      seconds: 600,
      date: "2026-09-10",
    }),
    session({
      setId: "e6",
      number: 6,
      problems: 10,
      correct: 9,
      seconds: 300,
      date: "2026-09-15",
    }),
  ];

  it("回次順に並び、attempt が 1 から振られる", () => {
    const a = attemptSeries(sessions, "e6");
    expect(a.map((p) => p.attempt)).toEqual([1, 2]);
    expect(a[0].accuracy).toBeCloseTo(0.4);
    expect(a[1].secondsPerProblem).toBeCloseTo(30);
  });

  it("初回→最新の差分を出す", () => {
    const [imp] = improvements(sessions);
    expect(imp.accuracyDelta).toBeCloseTo(0.5);
    expect(imp.paceDelta).toBeCloseTo(-30); // 速くなった
  });

  it("前回の記録は最新の1件（まだ解いていなければ null）", () => {
    const prev = latestAttempt(sessions, "e6");
    expect(prev?.attempt).toBe(2);
    expect(prev?.correctCount).toBe(9);
    expect(prev?.durationSeconds).toBe(300);
    expect(latestAttempt(sessions, "e1")).toBeNull();
  });

  it("1回しか解いていないセットは対象外", () => {
    const once = [
      session({
        setId: "e1",
        number: 1,
        problems: 5,
        correct: 5,
        seconds: 100,
        date: "2026-09-13",
      }),
    ];
    expect(improvements(once)).toHaveLength(0);
  });
});

describe("カバレッジ", () => {
  const sets: ExerciseSetWithCategory[] = [1, 2, 3].map((n) => ({
    id: `e${n}`,
    category_id: CAT.id,
    number: n,
    title: null,
    problem_count: 5,
    is_active: true,
    created_at: "",
    updated_at: "",
    category: CAT,
  }));

  it("未実施のセットも含めて返す", () => {
    const c = coverage(sets, [
      session({
        setId: "e1",
        number: 1,
        problems: 5,
        correct: 5,
        seconds: 100,
        date: "2026-09-13",
      }),
    ]);
    expect(c[0].totalSets).toBe(3);
    expect(c[0].attemptedSets).toBe(1);
    expect(c[0].cells.map((x) => x.attemptCount)).toEqual([1, 0, 0]);
    expect(c[0].cells[1].accuracy).toBeNull();
  });
});

describe("ヒートマップ", () => {
  it("週境界に揃った連続日付を返す", () => {
    const h = heatmap([], [], 4, "2026-09-15");
    expect(h).toHaveLength(28);
    expect(h[0].date).toBe("2026-08-23"); // 日曜始まり
    expect(h[h.length - 1].date).toBe("2026-09-19"); // 土曜終わり
    expect(h.every((d) => d.level === 0)).toBe(true);
  });

  it("学習時間に応じて濃度が上がる", () => {
    const h = heatmap(
      [
        session({
          setId: "e1",
          number: 1,
          problems: 5,
          correct: 5,
          seconds: 60,
          date: "2026-09-14",
        }),
        session({
          setId: "e2",
          number: 2,
          problems: 5,
          correct: 5,
          seconds: 3000,
          date: "2026-09-15",
        }),
      ],
      [],
      4,
      "2026-09-15",
    );
    expect(h.find((d) => d.date === "2026-09-14")!.level).toBe(1);
    expect(h.find((d) => d.date === "2026-09-15")!.level).toBe(4);
  });
});
