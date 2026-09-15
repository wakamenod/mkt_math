import type { HeatmapDay } from "../../stats/selectors";
import { formatIsoDateJp } from "../../lib/format";

const LEVEL_COLORS = ["#f0efec", "#b7d3f6", "#6da7ec", "#2a78d6", "#184f95"];
const WEEKDAY_LABELS = ["", "月", "", "水", "", "金", ""];

/**
 * 学習した日の草グラフ。Recharts では作れないので手書き。
 * 連続量（分）の単一色相ランプなので、淡→濃が素直に「多い」を意味する。
 */
export function CalendarHeatmap({ days }: { days: HeatmapDay[] }) {
  // 7日ずつ = 1列（日曜始まり）
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex gap-[3px]">
          <div className="mr-1 flex shrink-0 flex-col gap-[3px]">
            {WEEKDAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="flex h-[11px] w-3 items-center text-[9px] leading-none text-slate-400"
              >
                {label}
              </span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={
                    day.minutes > 0
                      ? `${formatIsoDateJp(day.date)} — ${day.minutes}分 / ${day.problemCount}問`
                      : `${formatIsoDateJp(day.date)} — 学習なし`
                  }
                  className="size-[11px] rounded-[2px] ring-1 ring-inset ring-black/5"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
        <span>少ない</span>
        {LEVEL_COLORS.map((c) => (
          <span
            key={c}
            className="size-[11px] rounded-[2px] ring-1 ring-inset ring-black/5"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>多い</span>
      </div>
    </div>
  );
}
