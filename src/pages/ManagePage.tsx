import { useMemo, useState, type FormEvent } from 'react'
import { PageTitle } from '../components/layout/PageTitle'
import { Button, Card, EmptyState, ErrorNote, Spinner } from '../components/ui'
import { useCategories, useExerciseSets, useSessions } from '../hooks/queries'
import {
  useCreateCategory,
  useCreateExerciseSet,
  useDeleteExerciseSet,
  useUpdateExerciseSet,
} from '../hooks/mutations'

const inputClass =
  'w-full rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900'

function CategoryForm({ nextSortOrder }: { nextSortOrder: number }) {
  const create = useCreateCategory()
  const [name, setName] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    create.mutate(
      { name: name.trim(), sort_order: nextSortOrder },
      { onSuccess: () => setName('') },
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="大分類名（例: 代数2）"
        className={inputClass}
      />
      <Button type="submit" disabled={create.isPending || !name.trim()}>
        追加
      </Button>
    </form>
  )
}

function ExerciseSetForm({
  categoryId,
  nextNumber,
}: {
  categoryId: string
  nextNumber: number
}) {
  const create = useCreateExerciseSet()
  const [number, setNumber] = useState(String(nextNumber))
  const [problemCount, setProblemCount] = useState('5')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const n = Number(number)
    const p = Number(problemCount)
    if (!Number.isInteger(n) || n <= 0 || !Number.isInteger(p) || p <= 0) return
    create.mutate(
      { category_id: categoryId, number: n, problem_count: p },
      { onSuccess: () => setNumber(String(n + 1)) },
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        練習問題
        <input
          type="number"
          min={1}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className={`${inputClass} tnum w-20`}
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-slate-500">
        問題数
        <input
          type="number"
          min={1}
          max={200}
          value={problemCount}
          onChange={(e) => setProblemCount(e.target.value)}
          className={`${inputClass} tnum w-20`}
        />
      </label>
      <Button type="submit" variant="secondary" disabled={create.isPending}>
        追加
      </Button>
      {create.error != null && (
        <div className="w-full">
          <ErrorNote error={create.error} />
        </div>
      )}
    </form>
  )
}

/** 問題数はその場で編集できる。過去のセッションは snapshot を持つので影響を受けない。 */
function ProblemCountField({ id, value }: { id: string; value: number }) {
  const update = useUpdateExerciseSet()
  const [draft, setDraft] = useState(String(value))

  const commit = () => {
    const n = Number(draft)
    if (!Number.isInteger(n) || n <= 0 || n > 200 || n === value) {
      setDraft(String(value))
      return
    }
    update.mutate({ id, patch: { problem_count: n } })
  }

  return (
    <input
      type="number"
      min={1}
      max={200}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="tnum w-16 rounded-lg bg-slate-100 px-2 py-1 text-right text-sm outline-none focus:ring-2 focus:ring-slate-900"
      aria-label="問題数"
    />
  )
}

export function ManagePage() {
  const categories = useCategories()
  const sets = useExerciseSets()
  const sessions = useSessions()
  const deleteSet = useDeleteExerciseSet()
  const [openId, setOpenId] = useState<string | null>(null)

  /** 記録のある練習問題は消させない（sessions が参照しており DB 側も restrict）。 */
  const usedSetIds = useMemo(
    () => new Set((sessions.data ?? []).map((s) => s.exercise_set_id)),
    [sessions.data],
  )

  if (categories.isLoading || sets.isLoading) return <Spinner />
  const error = categories.error ?? sets.error
  if (error) return <ErrorNote error={error} />

  const cats = categories.data ?? []
  const nextSortOrder = cats.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1

  return (
    <>
      <PageTitle>設定</PageTitle>

      <div className="space-y-4">
        <Card title="大分類を追加" subtitle="問題集が増えたらここから">
          <CategoryForm nextSortOrder={nextSortOrder} />
        </Card>

        <Card title="練習問題" subtitle="大分類をタップすると中身を編集できます">
          {cats.length === 0 ? (
            <EmptyState title="大分類がありません" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {cats.map((c) => {
                const mine = (sets.data ?? [])
                  .filter((s) => s.category.id === c.id)
                  .sort((a, b) => a.number - b.number)
                const open = openId === c.id
                const total = mine.reduce((a, s) => a + s.problem_count, 0)
                return (
                  <li key={c.id} className="py-2">
                    <button
                      onClick={() => setOpenId(open ? null : c.id)}
                      className="flex w-full items-center gap-2 py-1 text-left"
                    >
                      <span className="flex-1 text-sm font-semibold text-slate-900">{c.name}</span>
                      <span className="tnum text-xs text-slate-400">
                        練習問題{mine.length}件 / 計{total}問
                      </span>
                      <span className="text-slate-400">{open ? '▲' : '▼'}</span>
                    </button>

                    {open && (
                      <div className="pt-2 pb-1">
                        {mine.length === 0 ? (
                          <p className="text-xs text-slate-400">まだ練習問題がありません</p>
                        ) : (
                          <ul className="divide-y divide-slate-100">
                            {mine.map((s) => (
                              <li key={s.id} className="flex items-center gap-2 py-1.5">
                                <span className="tnum flex-1 text-sm text-slate-700">
                                  練習問題{s.number}
                                </span>
                                <ProblemCountField id={s.id} value={s.problem_count} />
                                <span className="text-xs text-slate-400">問</span>
                                <button
                                  disabled={usedSetIds.has(s.id)}
                                  title={
                                    usedSetIds.has(s.id)
                                      ? '記録があるため削除できません'
                                      : undefined
                                  }
                                  onClick={() => {
                                    if (confirm(`練習問題${s.number}を削除しますか？`))
                                      deleteSet.mutate(s.id)
                                  }}
                                  className="rounded-lg px-2 py-1 text-xs text-slate-400 enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:text-slate-200"
                                >
                                  削除
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <ExerciseSetForm
                          categoryId={c.id}
                          nextNumber={mine.reduce((max, s) => Math.max(max, s.number), 0) + 1}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
