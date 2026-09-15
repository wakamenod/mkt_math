import { Link, useParams } from 'react-router-dom'
import { PageTitle } from '../components/layout/PageTitle'
import { AccuracyTrendChart } from '../components/charts/AccuracyTrendChart'
import { Card, EmptyState, ErrorNote, ProgressBar, Spinner, StatTile } from '../components/ui'
import { useCategories, useExerciseSets, useSessions } from '../hooks/queries'
import { byExerciseSet, coverage, dailySeries, summarize } from '../stats/selectors'
import { formatIsoDateJp, formatRate, formatTotalDuration } from '../lib/format'
import { toJstDate } from '../lib/date'

export function CategoryDetailPage() {
  const { categoryId = '' } = useParams()
  const categories = useCategories()
  const sets = useExerciseSets()
  const sessions = useSessions()

  if (categories.isLoading || sets.isLoading || sessions.isLoading) return <Spinner />
  const error = categories.error ?? sets.error ?? sessions.error
  if (error) return <ErrorNote error={error} />

  const category = categories.data?.find((c) => c.id === categoryId)
  if (!category) return <EmptyState title="この大分類は見つかりません" />

  const categorySets = (sets.data ?? []).filter((s) => s.category.id === categoryId)
  const categorySessions = (sessions.data ?? []).filter(
    (s) => s.exercise_set.category.id === categoryId,
  )
  const summary = summarize(categorySessions)
  const setStats = new Map(byExerciseSet(categorySessions).map((s) => [s.exerciseSetId, s]))
  const cov = coverage(categorySets, categorySessions)[0]

  return (
    <>
      <PageTitle>{category.name}</PageTitle>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="正答率" value={formatRate(summary.accuracy)} tone="accuracy" />
        <StatTile
          label="解いた問題"
          value={`${summary.problemCount}問`}
          sub={`正解 ${summary.correctCount}問`}
        />
        <StatTile label="学習時間" value={formatTotalDuration(summary.totalSeconds)} tone="duration" />
        <StatTile
          label="進みぐあい"
          value={cov ? `${cov.attemptedSets}/${cov.totalSets}` : '—'}
          sub="手をつけた練習問題"
        />
      </div>

      {cov && (
        <div className="mt-3">
          <ProgressBar value={cov.totalSets === 0 ? 0 : cov.attemptedSets / cov.totalSets} />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {categorySessions.length > 0 && (
          <Card title="正答率の推移" subtitle={`${category.name}のみ`}>
            <AccuracyTrendChart data={dailySeries(categorySessions)} />
          </Card>
        )}

        <Card title="練習問題の一覧">
          {categorySets.length === 0 ? (
            <EmptyState title="練習問題が登録されていません" hint="設定画面から追加してください" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...categorySets]
                .sort((a, b) => a.number - b.number)
                .map((s) => {
                  const stat = setStats.get(s.id)
                  return (
                    <li key={s.id}>
                      <Link
                        to={`/sets/${s.id}`}
                        className="flex items-center gap-3 py-3 transition hover:bg-slate-50"
                      >
                        <span className="tnum flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                          {s.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            練習問題{s.number}
                            <span className="ml-2 text-xs font-normal text-slate-400">
                              {s.problem_count}問
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {stat
                              ? `${stat.attemptCount}回 · 最終 ${formatIsoDateJp(toJstDate(stat.lastStudiedAt!))}`
                              : '未実施'}
                          </p>
                        </div>
                        <span className="tnum shrink-0 text-sm font-bold text-accuracy">
                          {stat ? formatRate(stat.accuracy) : '—'}
                        </span>
                      </Link>
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
