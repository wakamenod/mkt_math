import { Link } from "react-router-dom";
import type { CategoryCoverage } from "../../stats/selectors";
import { formatRate } from "../../lib/format";
import { ProgressBar } from "../ui";

/** 解いた回数を単一色相の濃度で表す。未実施は枠だけのグレー。 */
function cellColor(attemptCount: number): string {
  if (attemptCount === 0) return "var(--color-surface)";
  if (attemptCount === 1) return "var(--color-heat-1)";
  if (attemptCount === 2) return "var(--color-heat-2)";
  if (attemptCount <= 4) return "var(--color-heat-3)";
  return "var(--color-heat-4)";
}

/**
 * 全練習問題の実施状況。未実施のマスも出すため、セッションではなく
 * マスタ（exercise_sets）を起点に描く。
 */
export function CoverageGrid({ coverage }: { coverage: CategoryCoverage[] }) {
  return (
    <div className="space-y-5">
      {coverage.map((c) => (
        <div key={c.categoryId}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <Link
              to={`/categories/${c.categoryId}`}
              className="text-sm font-semibold text-ink hover:underline"
            >
              {c.categoryName}
            </Link>
            <span className="tnum text-xs text-ink-soft">
              {c.attemptedSets} / {c.totalSets} 問
            </span>
          </div>
          <ProgressBar
            value={c.totalSets === 0 ? 0 : c.attemptedSets / c.totalSets}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {c.cells.map((cell) => (
              <Link
                key={cell.exerciseSetId}
                to={`/sets/${cell.exerciseSetId}`}
                title={
                  cell.attemptCount > 0
                    ? `練習問題${cell.number} — ${cell.attemptCount}回 / 正答率 ${formatRate(cell.accuracy)}`
                    : `練習問題${cell.number} — 未実施`
                }
                className="tnum flex size-8 items-center justify-center rounded-md text-[11px] font-semibold ring-1 ring-inset ring-black/10 transition hover:ring-accent"
                style={{
                  backgroundColor: cellColor(cell.attemptCount),
                  color:
                    cell.attemptCount >= 2
                      ? "var(--color-accent-ink)"
                      : "var(--color-ink-soft)",
                }}
              >
                {cell.number}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-ink-faint">
        <span>未実施</span>
        {[
          "var(--color-surface)",
          "var(--color-heat-1)",
          "var(--color-heat-2)",
          "var(--color-heat-3)",
          "var(--color-heat-4)",
        ].map((c) => (
          <span
            key={c}
            className="size-3 rounded-[3px] ring-1 ring-inset ring-black/10"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>何度も</span>
      </div>
    </div>
  );
}
