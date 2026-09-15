import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("学習履歴がなければ全て 0", () => {
    expect(computeStreak([], "2026-09-15")).toEqual({
      current: 0,
      longest: 0,
      studiedToday: false,
      lastStudyDate: null,
      totalDays: 0,
    });
  });

  it("今日を含む連続日数を数える", () => {
    const r = computeStreak(
      ["2026-09-13", "2026-09-14", "2026-09-15"],
      "2026-09-15",
    );
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
    expect(r.studiedToday).toBe(true);
  });

  it("今日まだでも昨日やっていれば継続中", () => {
    const r = computeStreak(["2026-09-13", "2026-09-14"], "2026-09-15");
    expect(r.current).toBe(2);
    expect(r.studiedToday).toBe(false);
  });

  it("2日以上空いたら途切れている", () => {
    const r = computeStreak(
      ["2026-09-10", "2026-09-11", "2026-09-12"],
      "2026-09-15",
    );
    expect(r.current).toBe(0);
    expect(r.longest).toBe(3);
  });

  it("同じ日に複数セッションあっても1日として数える", () => {
    const r = computeStreak(
      ["2026-09-14", "2026-09-14", "2026-09-15"],
      "2026-09-15",
    );
    expect(r.current).toBe(2);
    expect(r.totalDays).toBe(2);
  });

  it("最長記録は過去の連続にも反応する", () => {
    const dates = [
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-14",
      "2026-09-15",
    ];
    const r = computeStreak(dates, "2026-09-15");
    expect(r.longest).toBe(4);
    expect(r.current).toBe(2);
  });

  it("月をまたいでも連続として数える", () => {
    const r = computeStreak(
      ["2026-08-30", "2026-08-31", "2026-09-01"],
      "2026-09-01",
    );
    expect(r.current).toBe(3);
  });

  it("1日だけの学習", () => {
    const r = computeStreak(["2026-09-15"], "2026-09-15");
    expect(r).toMatchObject({
      current: 1,
      longest: 1,
      studiedToday: true,
      totalDays: 1,
    });
  });
});
