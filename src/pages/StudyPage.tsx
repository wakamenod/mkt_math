import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTitle } from "../components/layout/PageTitle";
import { ExerciseSetPicker } from "../components/timer/ExerciseSetPicker";
import {
  ResultEntryDialog,
  VideoResultDialog,
} from "../components/timer/ResultEntryDialog";
import { TimerDisplay } from "../components/timer/TimerDisplay";
import { Button, Card, ErrorNote, Spinner } from "../components/ui";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../theme/useTheme";
import { useExerciseSets, useSessions } from "../hooks/queries";
import { useCreateSession, useCreateVideoSession } from "../hooks/mutations";
import {
  usePersistentTimer,
  type TimerTarget,
} from "../hooks/usePersistentTimer";
import { useWakeLock } from "../hooks/useWakeLock";
import { savePending } from "../lib/pendingSession";
import { formatDuration } from "../lib/format";
import {
  setLabel,
  type NewSession,
  type NewVideoSession,
} from "../types/domain";

interface StoppedResult {
  target: TimerTarget;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export function StudyPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const quest = theme === "quest";
  const [searchParams, setSearchParams] = useSearchParams();
  const sets = useExerciseSets();
  const sessions = useSessions();
  const createSession = useCreateSession();
  const createVideoSession = useCreateVideoSession();
  const timer = usePersistentTimer();
  const [stopped, setStopped] = useState<StoppedResult | null>(null);

  useWakeLock(timer.isRunning);

  const attemptCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions.data ?? []) {
      map.set(s.exercise_set_id, (map.get(s.exercise_set_id) ?? 0) + 1);
    }
    return map;
  }, [sessions.data]);

  // /sets/:id から「この練習問題を始める」で飛んできたとき
  const presetId = searchParams.get("set");
  const availableSets = sets.data;
  const { start: startTimer, state: timerState } = timer;
  useEffect(() => {
    if (!presetId || timerState || !availableSets) return;
    if (!availableSets.some((s) => s.id === presetId)) return;
    startTimer({ kind: "practice", exerciseSetId: presetId });
    setSearchParams({}, { replace: true });
  }, [presetId, timerState, availableSets, startTimer, setSearchParams]);

  if (sets.isLoading) return <Spinner />;
  if (sets.error) return <ErrorNote error={sets.error} />;

  const target = stopped?.target ?? timer.state?.target ?? null;
  const activeSet =
    target?.kind === "practice"
      ? (sets.data?.find((s) => s.id === target.exerciseSetId) ?? null)
      : null;

  const handleStop = () => {
    const result = timer.stop();
    if (result) setStopped(result);
  };

  const handleSavePractice = (correctCount: number, note: string) => {
    if (!stopped || stopped.target.kind !== "practice" || !activeSet || !user)
      return;
    const payload: NewSession = {
      exercise_set_id: stopped.target.exerciseSetId,
      started_at: stopped.startedAt,
      ended_at: stopped.endedAt,
      duration_seconds: stopped.durationSeconds,
      correct_count: correctCount,
      // マスタを後から修正しても過去の正答率が動かないよう、この時点の問題数を焼き付ける
      problem_count_snapshot: activeSet.problem_count,
      created_by: user.id,
      note: note || null,
    };
    createSession.mutate(payload, {
      onSuccess: () => {
        timer.clear();
        setStopped(null);
      },
      // 計測データを失わないよう退避しておく（次回起動時に再送を促す）
      onError: () => savePending({ kind: "practice", payload }),
    });
  };

  const handleSaveVideo = (note: string) => {
    if (!stopped || !user) return;
    const payload: NewVideoSession = {
      started_at: stopped.startedAt,
      ended_at: stopped.endedAt,
      duration_seconds: stopped.durationSeconds,
      created_by: user.id,
      note: note || null,
    };
    createVideoSession.mutate(payload, {
      onSuccess: () => {
        timer.clear();
        setStopped(null);
      },
      onError: () => savePending({ kind: "video", payload }),
    });
  };

  // --- 計測中 / 一時停止中 ---
  if (timer.state && target) {
    const title =
      target.kind === "video"
        ? "講義ビデオ"
        : activeSet
          ? setLabel(activeSet)
          : "—";
    return (
      <>
        <PageTitle>{title}</PageTitle>
        <Card>
          <p className="text-center text-sm text-ink-soft">
            {target.kind === "video"
              ? "視聴時間を計測中"
              : `全${activeSet?.problem_count}問`}
          </p>
          <div className="py-8">
            <TimerDisplay seconds={timer.seconds} running={timer.isRunning} />
          </div>

          {timer.isAbandoned && (
            <div className="mb-4 rounded-control bg-warn-bg p-3 text-xs text-warn-ink ring-1 ring-warn-line">
              {formatDuration(timer.seconds)}
              経過しています。タイマーの止め忘れかもしれません。破棄して測り直せます。
            </div>
          )}

          <div className="flex gap-2">
            {timer.isRunning ? (
              <Button
                variant="secondary"
                className="flex-1 py-4"
                onClick={timer.pause}
              >
                一時停止
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1 py-4"
                onClick={timer.resume}
              >
                再開
              </Button>
            )}
            <Button className="flex-1 py-4" onClick={handleStop}>
              ストップ
            </Button>
          </div>

          <button
            onClick={() => {
              if (confirm("この計測を破棄しますか？")) timer.clear();
            }}
            className="mt-4 w-full text-xs text-ink-faint hover:text-ink-soft"
          >
            計測を破棄する
          </button>
        </Card>

        {stopped?.target.kind === "practice" && activeSet && (
          <ResultEntryDialog
            label={setLabel(activeSet)}
            problemCount={activeSet.problem_count}
            durationSeconds={stopped.durationSeconds}
            saving={createSession.isPending}
            error={createSession.error}
            onSave={handleSavePractice}
            onCancel={() => setStopped(null)}
          />
        )}
        {stopped?.target.kind === "video" && (
          <VideoResultDialog
            durationSeconds={stopped.durationSeconds}
            saving={createVideoSession.isPending}
            error={createVideoSession.error}
            onSave={handleSaveVideo}
            onCancel={() => setStopped(null)}
          />
        )}
      </>
    );
  }

  // --- 何をするか選ぶ ---
  return (
    <>
      <PageTitle>{quest ? "本日のクエスト" : "今日は何をする？"}</PageTitle>

      <button
        onClick={() => timer.start({ kind: "video" })}
        className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-line transition active:scale-[0.99] hover:ring-video"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-video/10 text-xl">
          🎥
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">
            {quest ? "けんじゃの教えを聞く" : "講義ビデオを見る"}
          </span>
          <span className="block text-xs text-ink-soft">
            {quest
              ? "講義ビデオ — 見ていた時間を記録します"
              : "視聴した時間だけを記録します"}
          </span>
        </span>
        <span className="shrink-0 text-ink-faint">›</span>
      </button>

      <Card
        title={quest ? "たたかう" : "問題を解く"}
        subtitle="番号をタップすると計測が始まります"
      >
        <ExerciseSetPicker
          sets={sets.data ?? []}
          attemptCounts={attemptCounts}
          onPick={(s) => timer.start({ kind: "practice", exerciseSetId: s.id })}
        />
      </Card>
    </>
  );
}
