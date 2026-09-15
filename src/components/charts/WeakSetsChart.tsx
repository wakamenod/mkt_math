import { Bar, BarChart, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import type { ExerciseSetStat } from "../../stats/selectors";
import { formatRate } from "../../lib/format";
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from "./chrome";
import { EmptyState } from "../ui";

/** 苦手な練習問題 Top N。単一系列なので凡例は不要（タイトルが系列名を兼ねる）。 */
export function WeakSetsChart({
  data,
  onSelect,
}: {
  data: ExerciseSetStat[];
  onSelect?: (exerciseSetId: string) => void;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="まだ判定できるデータがありません"
        hint="何回か解くと出てきます"
      />
    );
  }

  return (
    <ChartFrame rows={data.length}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
        barCategoryGap={4}
      >
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={142}
          {...AXIS_PROPS}
          tick={{ fill: CHART.muted, fontSize: 10 }}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox
                title={payload[0].payload.label}
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
                    label: "解いた回数",
                    value: `${payload[0].payload.attemptCount}回`,
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
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
          isAnimationActive={false}
          cursor={onSelect ? "pointer" : undefined}
          onClick={(d) => {
            const id = (
              d as unknown as { payload?: { exerciseSetId?: string } }
            ).payload?.exerciseSetId;
            if (id) onSelect?.(id);
          }}
        >
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
