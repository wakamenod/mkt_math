import { formatClock } from '../../lib/format'

export function TimerDisplay({ seconds, running }: { seconds: number; running: boolean }) {
  return (
    <div className="text-center">
      <p
        className={`tnum text-6xl font-bold tracking-tight tabular-nums sm:text-7xl ${
          running ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        {formatClock(seconds)}
      </p>
      <p className="mt-1 text-xs text-slate-400">{running ? '計測中' : '一時停止中'}</p>
    </div>
  )
}
