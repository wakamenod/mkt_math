import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useCreateSession } from '../../hooks/mutations'
import { clearPending, loadPending } from '../../lib/pendingSession'
import { Button } from '../ui'

/**
 * オフライン等で保存できなかった記録の再送を促す。
 * 計測したのに消えてしまった、という事故を防ぐための最後の砦。
 */
export function PendingSessionBanner() {
  const { user } = useAuth()
  const createSession = useCreateSession()
  const [pending, setPending] = useState(() => loadPending())

  if (pending.length === 0 || !user) return null

  const retry = async () => {
    for (const session of pending) {
      await createSession.mutateAsync({ ...session, created_by: user.id })
    }
    clearPending()
    setPending([])
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
      <span className="flex-1">保存できていない記録が{pending.length}件あります。</span>
      <Button variant="secondary" onClick={retry} disabled={createSession.isPending}>
        {createSession.isPending ? '送信中…' : '再送する'}
      </Button>
      <button
        onClick={() => {
          if (confirm('保存できていない記録を破棄しますか？')) {
            clearPending()
            setPending([])
          }
        }}
        className="text-xs text-amber-700 hover:underline"
      >
        破棄
      </button>
    </div>
  )
}
