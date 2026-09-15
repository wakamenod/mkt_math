import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTimePoint } from "../../stats/selectors";
import { formatIsoDateJp, formatIsoDateShort } from "../../lib/format";
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from "./chrome";

/**
 * 日ごとの学習時間（分）を、問題演習と講義ビデオに分けた積み上げ棒で見せる。
 * 単位はどちらも「分」なので1軸で足し合わせられる。
 * 学習していない日も 0 のまま並べる。
 */
export function DurationTrendChart({ data }: { data: DailyTimePoint[] }) {
  const hasVideo = data.some((d) => d.videoMinutes > 0);

  return (
    <>
      <ChartFrame>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          barCategoryGap={2}
        >
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatIsoDateShort}
            interval="preserveStartEnd"
            minTickGap={24}
            {...AXIS_PROPS}
          />
          <YAxis tickFormatter={(v: number) => `${v}分`} {...AXIS_PROPS} />
          <Tooltip
            cursor={{ fill: "rgba(11,11,11,0.04)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox
                  title={formatIsoDateJp(String(label))}
                  rows={[
                    {
                      label: "問題演習",
                      value: `${payload[0]?.payload.practiceMinutes}分`,
                      color: CHART.duration,
                    },
                    {
                      label: "講義ビデオ",
                      value: `${payload[0]?.payload.videoMinutes}分`,
                      color: CHART.video,
                    },
                    {
                      label: "合計",
                      value: `${payload[0]?.payload.totalMinutes}分`,
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
          {/* 積み上げの境目に surface 色の隙間を入れて、隣り合う面を分離する */}
          <Bar
            dataKey="practiceMinutes"
            name="問題演習"
            stackId="time"
            fill={CHART.duration}
            stroke={CHART.surface}
            strokeWidth={2}
          />
          <Bar
            dataKey="videoMinutes"
            name="講義ビデオ"
            stackId="time"
            fill={CHART.video}
            stroke={CHART.surface}
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartFrame>

      {hasVideo && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: CHART.duration }}
            />
            問題演習
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: CHART.video }}
            />
            講義ビデオ
          </li>
        </ul>
      )}
    </>
  );
}
