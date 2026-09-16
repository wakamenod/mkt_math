import { describe, expect, it } from "vitest";
import katex from "katex";
// マスタの出どころそのものを読む（写した定数を置くと、写し間違いを検出できない）
import seedSql from "../../supabase/seed/seed_daisu1.sql?raw";
import { PROBLEM_SETS } from "./problems";

/**
 * 画面に出す問題文と、記録に使う問題数（DB のマスタ）がずれると、
 * 「5問表示されているのに正解数は0〜6から選ぶ」ような画面ができてしまう。
 * マスタの出どころである seed を読んで、本文の小問数と突き合わせる。
 */
function seedCounts(): Map<number, number> {
  const counts = new Map<number, number>();
  for (const m of seedSql.matchAll(/\((\d+),\s*(\d+)\)/g)) {
    counts.set(Number(m[1]), Number(m[2]));
  }
  return counts;
}

const daisu1 = PROBLEM_SETS["代数1"] ?? [];

describe("代数1の問題本文", () => {
  it("練習問題1〜22がもれなく1件ずつある", () => {
    expect(daisu1.map((s) => s.number)).toEqual(
      Array.from({ length: 22 }, (_, i) => i + 1),
    );
  });

  it("小問の数が seed の problem_count と一致する", () => {
    const expected = seedCounts();
    for (const set of daisu1) {
      expect(
        set.problems.length,
        `練習問題${set.number}`,
      ).toBe(expected.get(set.number));
    }
  });

  it("合計 101 問になる", () => {
    const total = daisu1.reduce((n, s) => n + s.problems.length, 0);
    expect(total).toBe(101);
  });

  it("$ の対応が取れていて、答えが空でない", () => {
    for (const set of daisu1) {
      for (const p of set.problems) {
        for (const [field, text] of Object.entries({
          body: p.body,
          answer: p.answer,
          hint: p.hint ?? "",
        })) {
          const dollars = text.replace(/\\\$/g, "").match(/\$/g)?.length ?? 0;
          expect(
            dollars % 2,
            `練習問題${set.number} ${p.label} の ${field}`,
          ).toBe(0);
        }
        expect(p.answer.trim(), `練習問題${set.number} ${p.label}`).not.toBe("");
      }
    }
  });

  it("すべての数式が KaTeX で描画できる", () => {
    const errors: string[] = [];
    for (const set of daisu1) {
      const texts = [
        set.prompt ?? "",
        ...set.problems.flatMap((p) => [p.body, p.answer, p.hint ?? ""]),
      ];
      for (const text of texts) {
        // 偶数番目が数式（$ で割ったときの 1,3,5... 番目）
        text.split("$").forEach((chunk, i) => {
          if (i % 2 === 0) return;
          try {
            katex.renderToString(chunk, { throwOnError: true });
          } catch (e) {
            errors.push(`練習問題${set.number}: ${chunk} — ${String(e)}`);
          }
        });
      }
    }
    expect(errors).toEqual([]);
  });
});
