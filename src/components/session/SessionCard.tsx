import { Link } from 'react-router-dom'
import type { SessionWithSet } from '../../types/domain'
import { setLabel } from '../../types/domain'
import { formatDuration, formatIsoDateJp, formatRate } from '../../lib/format'

export function SessionCard({
  session,
  action,
}: {
  session: SessionWithSet
  action?: React.ReactNode
}) {
  const rate =
    session.problem_count_snapshot === 0
      ? null
      : session.correct_count / session.problem_count_snapshot

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Link
          to={`/sets/${session.exercise_set_id}`}
          className="block truncate text-sm font-semibold text-slate-900 hover:underline"
        >
          {setLabel(session.exercise_set)}
        </Link>
        <p className="tnum mt-0.5 text-xs text-slate-500">
          {formatIsoDateJp(session.study_date)} · {formatDuration(session.duration_seconds)}
        </p>
        {session.note && <p className="mt-1 truncate text-xs text-slate-400">{session.note}</p>}
      </div>

      <div className="shrink-0 text-right">
        <p className="tnum text-sm font-bold text-slate-900">
          {session.correct_count}
          <span className="text-xs font-normal text-slate-400">
            {' '}
            / {session.problem_count_snapshot}
          </span>
        </p>
        <p className="tnum text-xs text-accuracy">{formatRate(rate)}</p>
      </div>

      {action}
    </li>
  )
}
