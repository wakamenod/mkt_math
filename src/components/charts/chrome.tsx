import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'

/** 全チャート共通の寸法・配色。個々のチャートで色を直書きしない。 */
export const CHART = {
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  accuracy: '#2a78d6',
  duration: '#eb6834',
  pace: '#4a3aa7',
  good: '#0ca30c',
  bad: '#d03b3b',
  /** CVD 検証済みの並び。順序を入れ替えないこと。 */
  series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7'],
} as const

export const AXIS_PROPS = {
  stroke: CHART.axis,
  tick: { fill: CHART.muted, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: CHART.axis },
} as const

/**
 * モバイル 200px / md以上 280px の高さを一箇所で決める。
 * 横向き棒グラフは行数で高さが決まるので `rows` を渡す（行が少ないときに
 * 間延びするのを防ぐ）。
 */
export function ChartFrame({
  children,
  tall = false,
  rows,
}: {
  children: ReactNode
  tall?: boolean
  rows?: number
}) {
  if (rows !== undefined) {
    return (
      <div style={{ height: Math.max(96, rows * 34 + 24) }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    )
  }
  return (
    <div className={tall ? 'h-64 w-full sm:h-80' : 'h-50 w-full sm:h-70'}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

/** Recharts のツールチップ中身。全チャートで同じ見た目にする。 */
export function TooltipBox({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string; color?: string }[]
}) {
  return (
    <div className="rounded-xl bg-white/95 px-3 py-2 text-xs shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <p className="font-semibold text-slate-900">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2">
            {r.color && (
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: r.color }}
              />
            )}
            <span className="text-slate-500">{r.label}</span>
            <span className="tnum ml-auto font-semibold text-slate-900">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
