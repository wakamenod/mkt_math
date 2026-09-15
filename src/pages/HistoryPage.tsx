import { useMemo, useState } from 'react'
import { PageTitle } from '../components/layout/PageTitle'
import { SessionList } from '../components/session/SessionList'
import { Card, ErrorNote, Spinner } from '../components/ui'
import { useAuth } from '../auth/useAuth'
import { useSessions } from '../hooks/queries'
import { useDeleteSession } from '../hooks/mutations'
import { formatTotalDuration } from '../lib/format'

export function HistoryPage() {
  const { canEdit } = useAuth()
  const sessions = useSessions()
  const deleteSession = useDeleteSession()
  const [categoryId, setCategoryId] = useState<string>('all')

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sortOrder: number }>()
    for (const s of sessions.data ?? []) {
      const c = s.exercise_set.category
      if (!map.has(c.id)) map.set(c.id, { id: c.id, name: c.name, sortOrder: c.sort_order })
    }
    return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [sessions.data])

  const visible = useMemo(() => {
    const all = [...(sessions.data ?? [])].sort((a, b) => b.started_at.localeCompare(a.started_at))
    return categoryId === 'all'
      ? all
      : all.filter((s) => s.exercise_set.category.id === categoryId)
  }, [sessions.data, categoryId])

  if (sessions.isLoading) return <Spinner />
  if (sessions.error) return <ErrorNote error={sessions.error} />

  const totalSeconds = visible.reduce((a, s) => a + s.duration_seconds, 0)

  return (
    <>
      <PageTitle>学習の記録</PageTitle>

      {categories.length > 1 && (
        <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
          {[{ id: 'all', name: 'すべて' }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                c.id === categoryId
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <Card subtitle={`${visible.length}回 · 合計 ${formatTotalDuration(totalSeconds)}`} title="記録一覧">
        <SessionList
          sessions={visible}
          renderAction={
            canEdit
              ? (s) => (
                  <button
                    onClick={() => {
                      if (confirm('この記録を削除しますか？')) deleteSession.mutate(s.id)
                    }}
                    className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="削除"
                  >
                    削除
                  </button>
                )
              : undefined
          }
        />
      </Card>
    </>
  )
}
