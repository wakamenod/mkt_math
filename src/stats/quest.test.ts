import { describe, expect, it } from "vitest";
import { levelFromExp, rankFromAccuracy, streakTitle } from "./quest";

describe("レベル", () => {
  it("経験値0はLV1", () => {
    expect(levelFromExp(0)).toMatchObject({
      level: 1,
      expIntoLevel: 0,
      expForNext: 10,
      progress: 0,
    });
  });

  it("最初のレベルアップは10問", () => {
    expect(levelFromExp(9).level).toBe(1);
    expect(levelFromExp(10).level).toBe(2);
  });

  it("必要量が段々増える（10, 15, 20…）", () => {
    expect(levelFromExp(24).level).toBe(2); // 10+15=25 でLV3
    expect(levelFromExp(25).level).toBe(3);
    expect(levelFromExp(44).level).toBe(3); // 25+20=45 でLV4
    expect(levelFromExp(45).level).toBe(4);
  });

  it("レベル内の進捗を返す", () => {
    const info = levelFromExp(133);
    expect(info.level).toBe(6);
    expect(info.expIntoLevel).toBe(33);
    expect(info.expForNext).toBe(35);
    expect(info.progress).toBeCloseTo(33 / 35);
    expect(info.totalExp).toBe(133);
  });

  it("負の値でも壊れない", () => {
    expect(levelFromExp(-5).level).toBe(1);
  });
});

describe("称号", () => {
  it("正答率から決まる", () => {
    expect(rankFromAccuracy(0.95)).toBe("S");
    expect(rankFromAccuracy(0.8)).toBe("A");
    expect(rankFromAccuracy(0.7)).toBe("B");
    expect(rankFromAccuracy(0.639)).toBe("C");
    expect(rankFromAccuracy(0.2)).toBe("D");
  });

  it("記録がなければハイフン", () => {
    expect(rankFromAccuracy(null)).toBe("-");
  });
});

describe("連続日数の呼び名", () => {
  it("日数で変わる", () => {
    expect(streakTitle(0)).toBe("ぼうけんのはじまり");
    expect(streakTitle(1)).toBe("かけだしぼうけんしゃ");
    expect(streakTitle(19)).toBe("だいけんじゃ");
    expect(streakTitle(40)).toBe("でんせつのけんじゃ");
  });
});
