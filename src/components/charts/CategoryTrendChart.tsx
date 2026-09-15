import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { formatIsoDateJp, formatIsoDateShort, formatRate } from '../../lib/format'
import { AXIS_PROPS, CHART, ChartFrame, TooltipBox } from './chrome'
import { EmptyState } from '../ui'

/**
 * 大分類ごとの正答率の推移。
 * 系列色は CVD 検証済みの固定順で割り当てる（絞り込みで色が振り直されないよう
 * カテゴリの並び順に紐付ける）。
 */
export function CategoryTrendChart({
  categories,
  rows,
}: {
  categories: { id: string; name: string }[]
  rows: Record<string, string | number | null>[]
}) {
  if (rows.length === 0 || categories.length === 0) {
    return <EmptyState title="まだ記録がありません" />
  }

  return (
    <>
      <ChartFrame>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="date" tickFormatter={(v) => formatIsoDateShort(String(v))} {...AXIS_PROPS} />
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
                  rows={payload.map((p) => ({
                    label: String(p.name),
                    value: formatRate(p.value as number | null),
                    color: p.color,
                  }))}
                />
              ) : null
            }
          />
          {categories.map((c, i) => (
            <Line
              key={c.id}
              type="monotone"
              dataKey={c.name}
              name={c.name}
              stroke={CHART.series[i % CHART.series.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ChartFrame>

      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {categories.map((c, i) => (
          <li key={c.id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: CHART.series[i % CHART.series.length] }}
            />
            {c.name}
          </li>
        ))}
      </ul>
    </>
  )
}
