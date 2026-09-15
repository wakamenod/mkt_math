import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { DailyPoint } from '../../stats/selectors'
import { formatIsoDateJp, formatIsoDateShort } from '../../lib/format'
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from './chrome'
import { EmptyState } from '../ui'

/**
 * 1問あたりの秒数の推移。
 * 正答率とはスケールが違うので、同じ図に重ねず別チャートにしている。
 */
export function PaceTrendChart({ data }: { data: DailyPoint[] }) {
  const points = data.filter((p) => p.secondsPerProblem !== null)
  if (points.length === 0) return <EmptyState title="まだ記録がありません" />

  return (
    <ChartFrame>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatIsoDateShort} {...AXIS_PROPS} />
        <YAxis tickFormatter={(v: number) => `${Math.round(v)}秒`} {...AXIS_PROPS} />
        <Tooltip
          cursor={{ stroke: CHART.axis }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox
                title={formatIsoDateJp(String(label))}
                rows={[
                  {
                    label: '1問あたり',
                    value: `${Math.round(payload[0]?.payload.secondsPerProblem)}秒`,
                    color: CHART.pace,
                  },
                  { label: '問題数', value: `${payload[0]?.payload.problemCount}問` },
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
          dot={{ r: 3, strokeWidth: 0, fill: CHART.pace }}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ChartFrame>
  )
}
