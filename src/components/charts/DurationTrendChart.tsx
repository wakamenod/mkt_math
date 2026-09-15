import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyPoint } from '../../stats/selectors'
import { formatIsoDateJp, formatIsoDateShort } from '../../lib/format'
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from './chrome'

/** 日ごとの学習時間（分）。学習していない日も 0 のまま並べる。 */
export function DurationTrendChart({ data }: { data: DailyPoint[] }) {
  return (
    <ChartFrame>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap={2}>
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
          cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox
                title={formatIsoDateJp(String(label))}
                rows={[
                  {
                    label: '学習時間',
                    value: `${payload[0]?.payload.minutes}分`,
                    color: CHART.duration,
                  },
                  { label: '問題数', value: `${payload[0]?.payload.problemCount}問` },
                  { label: '回数', value: `${payload[0]?.payload.sessionCount}回` },
                ]}
              />
            ) : null
          }
        />
        <Bar dataKey="minutes" name="学習時間" fill={CHART.duration} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartFrame>
  )
}
