import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  dayOfWeekIso,
  diffDaysIso,
  rangeIso,
  todayJst,
  toJstDate,
} from "./date";

describe("JST 日付", () => {
  it("UTC 15:00 を境に JST の日付が翌日になる", () => {
    // 2026-09-15T14:59:59Z => JST 2026-09-15 23:59:59
    expect(toJstDate("2026-09-15T14:59:59Z")).toBe("2026-09-15");
    // 2026-09-15T15:00:00Z => JST 2026-09-16 00:00:00
    expect(toJstDate("2026-09-15T15:00:00Z")).toBe("2026-09-16");
  });

  it("todayJst は端末のタイムゾーンに依存しない", () => {
    expect(todayJst(new Date("2026-01-01T16:00:00Z"))).toBe("2026-01-02");
  });
});

describe("日付演算", () => {
  it("月末・年末をまたげる", () => {
    expect(addDaysIso("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDaysIso("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("うるう年を正しく扱う", () => {
    expect(addDaysIso("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("diffDaysIso は a - b", () => {
    expect(diffDaysIso("2026-09-15", "2026-09-13")).toBe(2);
    expect(diffDaysIso("2026-09-13", "2026-09-15")).toBe(-2);
  });

  it("dayOfWeekIso は 0=日曜", () => {
    expect(dayOfWeekIso("2026-09-13")).toBe(0);
    expect(dayOfWeekIso("2026-09-15")).toBe(2);
  });

  it("rangeIso は両端を含む", () => {
    expect(rangeIso("2026-09-13", "2026-09-15")).toEqual([
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
    ]);
  });
});
