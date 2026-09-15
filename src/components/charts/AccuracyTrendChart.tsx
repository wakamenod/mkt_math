import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "../../stats/selectors";
import {
  formatIsoDateJp,
  formatIsoDateShort,
  formatRate,
} from "../../lib/format";
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from "./chrome";
import { EmptyState } from "../ui";

/**
 * 日ごとの正答率と、その7日移動平均。
 * 2系列とも同じ 0〜100% のスケールなので1軸で収まる。
 */
export function AccuracyTrendChart({ data }: { data: DailyPoint[] }) {
  if (data.length === 0) return <EmptyState title="まだ記録がありません" />;

  return (
    <>
      <ChartFrame>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatIsoDateShort}
            {...AXIS_PROPS}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            {...AXIS_PROPS}
          />
          <Tooltip
            cursor={{ stroke: CHART.axis }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox
                  title={formatIsoDateJp(String(label))}
                  rows={[
                    {
                      label: "その日の正答率",
                      value: formatRate(payload[0]?.payload.accuracy),
                      color: CHART.accuracy,
                    },
                    {
                      label: "7日平均",
                      value: formatRate(payload[0]?.payload.accuracyMA7),
                      color: CHART.pace,
                    },
                    {
                      label: "問題数",
                      value: `${payload[0]?.payload.problemCount}問`,
                    },
                  ]}
                />
              ) : null
            }
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="その日の正答率"
            stroke={CHART.accuracy}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: CHART.accuracy }}
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="accuracyMA7"
            name="7日平均"
            stroke={CHART.pace}
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ChartFrame>

      {/* 2系列あるので凡例は必須。色だけに意味を持たせない。 */}
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <li className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ backgroundColor: CHART.accuracy }}
          />
          その日の正答率
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, ${CHART.pace} 0 4px, transparent 4px 7px)`,
            }}
          />
          7日平均
        </li>
      </ul>
    </>
  );
}
