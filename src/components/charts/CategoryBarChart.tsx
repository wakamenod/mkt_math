import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryStat } from "../../stats/selectors";
import { formatRate, formatTotalDuration } from "../../lib/format";
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from "./chrome";
import { EmptyState } from "../ui";

/**
 * 大分類ごとの正答率。
 * 対 surface コントラストが 3:1 未満の系列色があるので、値を直接ラベルで添える
 * （色だけに情報を持たせない）。
 */
export function CategoryBarChart({ data }: { data: CategoryStat[] }) {
  if (data.length === 0) return <EmptyState title="まだ記録がありません" />;

  return (
    <ChartFrame rows={data.length}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
        barCategoryGap={6}
      >
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis
          type="category"
          dataKey="categoryName"
          width={64}
          {...AXIS_PROPS}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox
                title={payload[0].payload.categoryName}
                rows={[
                  {
                    label: "正答率",
                    value: formatRate(payload[0].payload.accuracy),
                  },
                  {
                    label: "正解",
                    value: `${payload[0].payload.correctCount} / ${payload[0].payload.problemCount}問`,
                  },
                  {
                    label: "学習時間",
                    value: formatTotalDuration(payload[0].payload.totalSeconds),
                  },
                  {
                    label: "回数",
                    value: `${payload[0].payload.sessionCount}回`,
                  },
                ]}
              />
            ) : null
          }
        />
        <Bar
          dataKey="accuracy"
          name="正答率"
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell
              key={d.categoryId}
              fill={CHART.series[i % CHART.series.length]}
            />
          ))}
          <LabelList
            dataKey="accuracy"
            position="right"
            formatter={(v) => formatRate(typeof v === "number" ? v : null)}
            fill="#52514e"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
