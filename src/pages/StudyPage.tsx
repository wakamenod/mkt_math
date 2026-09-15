import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageTitle } from '../components/layout/PageTitle'
import { ExerciseSetPicker } from '../components/timer/ExerciseSetPicker'
import { ResultEntryDialog } from '../components/timer/ResultEntryDialog'
import { TimerDisplay } from '../components/timer/TimerDisplay'
import { Button, Card, ErrorNote, Spinner } from '../components/ui'
import { useAuth } from '../auth/useAuth'
import { useExerciseSets, useSessions } from '../hooks/queries'
import { useCreateSession } from '../hooks/mutations'
import { usePersistentTimer } from '../hooks/usePersistentTimer'
import { useWakeLock } from '../hooks/useWakeLock'
import { savePending } from '../lib/pendingSession'
import { formatDuration } from '../lib/format'
import { setLabel, type NewSession } from '../types/domain'

interface StoppedResult {
  exerciseSetId: string
  startedAt: string
  endedAt: string
  durationSeconds: number
}

export function StudyPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const sets = useExerciseSets()
  const sessions = useSessions()
  const createSession = useCreateSession()
  const timer = usePersistentTimer()
  const [stopped, setStopped] = useState<StoppedResult | null>(null)

  useWakeLock(timer.isRunning)

  const attemptCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of sessions.data ?? []) {
      map.set(s.exercise_set_id, (map.get(s.exercise_set_id) ?? 0) + 1)
    }
    return map
  }, [sessions.data])

  const activeSetId = stopped?.exerciseSetId ?? timer.state?.exerciseSetId ?? null
  const activeSet = sets.data?.find((s) => s.id === activeSetId) ?? null

  // /sets/:id から「この練習問題を始める」で飛んできたとき
  const presetId = searchParams.get('set')
  const availableSets = sets.data
  const { start: startTimer, state: timerState } = timer
  useEffect(() => {
    if (!presetId || timerState || !availableSets) return
    if (!availableSets.some((s) => s.id === presetId)) return
    startTimer(presetId)
    setSearchParams({}, { replace: true })
  }, [presetId, timerState, availableSets, startTimer, setSearchParams])

  if (sets.isLoading) return <Spinner />
  if (sets.error) return <ErrorNote error={sets.error} />

  const handleStop = () => {
    const result = timer.stop()
    if (result) setStopped(result)
  }

  const handleSave = (correctCount: number, note: string) => {
    if (!stopped || !activeSet || !user) return
    const payload: NewSession = {
      exercise_set_id: stopped.exerciseSetId,
      started_at: stopped.startedAt,
      ended_at: stopped.endedAt,
      duration_seconds: stopped.durationSeconds,
      correct_count: correctCount,
      // マスタを後から修正しても過去の正答率が動かないよう、この時点の問題数を焼き付ける
      problem_count_snapshot: activeSet.problem_count,
      created_by: user.id,
      note: note || null,
    }
    createSession.mutate(payload, {
      onSuccess: () => {
        timer.clear()
        setStopped(null)
      },
      onError: () => {
        // 計測データを失わないよう退避しておく（次回起動時に再送を促す）
        savePending(payload)
      },
    })
  }

  // --- 計測中 / 一時停止中 ---
  if (timer.state && activeSet) {
    return (
      <>
        <PageTitle>{setLabel(activeSet)}</PageTitle>
        <Card>
          <p className="text-center text-sm text-slate-500">全{activeSet.problem_count}問</p>
          <div className="py-8">
            <TimerDisplay seconds={timer.seconds} running={timer.isRunning} />
          </div>

          {timer.isAbandoned && (
            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
              {formatDuration(timer.seconds)}
              経過しています。タイマーの止め忘れかもしれません。破棄して測り直せます。
            </div>
          )}

          <div className="flex gap-2">
            {timer.isRunning ? (
              <Button variant="secondary" className="flex-1 py-4" onClick={timer.pause}>
                一時停止
              </Button>
            ) : (
              <Button variant="secondary" className="flex-1 py-4" onClick={timer.resume}>
                再開
              </Button>
            )}
            <Button className="flex-1 py-4" onClick={handleStop}>
              ストップ
            </Button>
          </div>

          <button
            onClick={() => {
              if (confirm('この計測を破棄しますか？')) timer.clear()
            }}
            className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600"
          >
            計測を破棄する
          </button>
        </Card>

        {stopped && (
          <ResultEntryDialog
            label={setLabel(activeSet)}
            problemCount={activeSet.problem_count}
            durationSeconds={stopped.durationSeconds}
            saving={createSession.isPending}
            error={createSession.error}
            onSave={handleSave}
            onCancel={() => setStopped(null)}
          />
        )}
      </>
    )
  }

  // --- 練習問題の選択 ---
  return (
    <>
      <PageTitle>今日はどれを解く？</PageTitle>
      <Card>
        <ExerciseSetPicker
          sets={sets.data ?? []}
          attemptCounts={attemptCounts}
          onPick={(s) => timer.start(s.id)}
        />
      </Card>
      <p className="mt-3 text-center text-xs text-slate-400">
        番号をタップすると計測が始まります
      </p>
    </>
  )
}
