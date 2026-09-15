import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AttemptPoint } from "../../stats/selectors";
import { formatIsoDateJp, formatRate } from "../../lib/format";
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from "./chrome";

/**
 * 回次ごとの正答率と、1問あたりの秒数。
 * スケールが違うので2軸1図にはせず、意図的に2つのチャートに分けている。
 */
export function AttemptAccuracyChart({ data }: { data: AttemptPoint[] }) {
  return (
    <ChartFrame>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        barCategoryGap={8}
      >
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="attempt"
          tickFormatter={(v) => `${v}回目`}
          {...AXIS_PROPS}
        />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          {...AXIS_PROPS}
        />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox
                title={`${payload[0].payload.attempt}回目 — ${formatIsoDateJp(payload[0].payload.date)}`}
                rows={[
                  {
                    label: "正答率",
                    value: formatRate(payload[0].payload.accuracy),
                  },
                  {
                    label: "正解",
                    value: `${payload[0].payload.correctCount} / ${payload[0].payload.problemCount}問`,
                  },
                ]}
              />
            ) : null
          }
        />
        <Bar
          dataKey="accuracy"
          name="正答率"
          fill={CHART.accuracy}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartFrame>
  );
}

export function AttemptPaceChart({ data }: { data: AttemptPoint[] }) {
  return (
    <ChartFrame>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
      >
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="attempt"
          tickFormatter={(v) => `${v}回目`}
          {...AXIS_PROPS}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v)}秒`}
          {...AXIS_PROPS}
        />
        <Tooltip
          cursor={{ stroke: CHART.axis }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox
                title={`${payload[0].payload.attempt}回目 — ${formatIsoDateJp(payload[0].payload.date)}`}
                rows={[
                  {
                    label: "1問あたり",
                    value: `${Math.round(payload[0].payload.secondsPerProblem)}秒`,
                  },
                ]}
              />
            ) : null
          }
        />
        <Line
          type="monotone"
          dataKey="secondsPerProblem"
          name="1問あたりの秒数"
          stroke={CHART.pace}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 0, fill: CHART.pace }}
          activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartFrame>
  );
}
