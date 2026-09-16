import { levelFromExp, rankFromAccuracy, streakTitle } from "../../stats/quest";
import { formatTotalDuration } from "../../lib/format";
import { OWNER_NAME } from "../../lib/branding";

/**
 * クエストテーマのときだけ出す、冒険者ステータス。
 * 数値はすべて既存の集計そのままで、見せ方だけを変えている。
 * ドット文字を使う箇所は ASCII に限る（日本語のサブセットを読み込ませないため）。
 */
export function QuestStatusPanel({
  problemCount,
  accuracy,
  streak,
  totalSeconds,
}: {
  problemCount: number;
  accuracy: number | null;
  streak: number;
  totalSeconds: number;
}) {
  const lv = levelFromExp(problemCount);
  const rank = rankFromAccuracy(accuracy);

  return (
    <section className="surface-card relative overflow-hidden p-4">
      {/* 上辺のネオンライン */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
        }}
      />

      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-widest text-ink-faint">
            LEVEL
          </p>
          <p
            className="display text-4xl leading-none font-bold text-accent"
            style={{ textShadow: "var(--accent-glow)" }}
          >
            {lv.level}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="display text-xs font-bold tracking-widest text-accent">
            {OWNER_NAME}
          </p>

          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-bold text-ink">
              {streakTitle(streak)}
            </p>
            <p className="display shrink-0 text-xs text-ink-faint">
              {lv.expIntoLevel} / {lv.expForNext}
            </p>
          </div>

          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${Math.round(lv.progress * 100)}%`,
                background:
                  "linear-gradient(90deg, var(--color-accent), var(--color-streak))",
                boxShadow: "var(--accent-glow)",
              }}
            />
          </div>

          <p className="mt-1 text-[10px] text-ink-faint">
            つぎのレベルまで あと {lv.expForNext - lv.expIntoLevel} もん
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-ink-faint">
            RANK
          </dt>
          <dd className="display text-2xl leading-tight font-bold text-streak">
            {rank}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-ink-faint">
            STREAK
          </dt>
          <dd className="display text-2xl leading-tight font-bold text-ink">
            {streak}
            <span className="ml-0.5 font-sans text-xs font-normal text-ink-soft">
              日
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold tracking-wider text-ink-faint">
            TIME
          </dt>
          <dd className="mt-1 text-sm leading-tight font-bold text-ink">
            {formatTotalDuration(totalSeconds)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
