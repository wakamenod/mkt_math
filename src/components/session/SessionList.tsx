import type { SessionWithSet } from '../../types/domain'
import { EmptyState } from '../ui'
import { SessionCard } from './SessionCard'

export function SessionList({
  sessions,
  renderAction,
  emptyTitle = 'まだ記録がありません',
  emptyHint,
}: {
  sessions: SessionWithSet[]
  renderAction?: (session: SessionWithSet) => React.ReactNode
  emptyTitle?: string
  emptyHint?: string
}) {
  if (sessions.length === 0) return <EmptyState title={emptyTitle} hint={emptyHint} />
  return (
    <ul className="divide-y divide-slate-100">
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} action={renderAction?.(s)} />
      ))}
    </ul>
  )
}
