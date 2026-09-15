import { useState } from 'react'
import { formatDuration } from '../../lib/format'
import { Button, ErrorNote } from '../ui'

/**
 * ストップ直後の正解数入力。
 * 「常に全問解く」前提なので入力は正解数のみ。
 * スマホで素早く押せるよう 0..N のボタングリッドにしている。
 */
export function ResultEntryDialog({
  label,
  problemCount,
  durationSeconds,
  saving,
  error,
  onSave,
  onCancel,
}: {
  label: string
  problemCount: number
  durationSeconds: number
  saving: boolean
  error: unknown
  onSave: (correctCount: number, note: string) => void
  onCancel: () => void
}) {
  const [correct, setCorrect] = useState<number | null>(null)
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center">
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <h2 className="text-lg font-bold text-slate-900">{label}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {formatDuration(durationSeconds)} / 全{problemCount}問
        </p>

        <p className="mt-5 text-sm font-semibold text-slate-700">正解した数は？</p>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {Array.from({ length: problemCount + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCorrect(i)}
              className={`tnum aspect-square rounded-xl text-lg font-bold transition active:scale-95 ${
                correct === i
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="メモ（任意）"
          className="mt-4 w-full rounded-xl bg-slate-100 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900"
        />

        {error != null && (
          <div className="mt-3">
            <ErrorNote error={error} />
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>
            キャンセル
          </Button>
          <Button
            className="flex-1"
            disabled={correct === null || saving}
            onClick={() => correct !== null && onSave(correct, note.trim())}
          >
            {saving ? '保存中…' : '記録する'}
          </Button>
        </div>
      </div>
    </div>
  )
}
