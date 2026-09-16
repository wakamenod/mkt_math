import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTitle } from "../components/layout/PageTitle";
import { ExerciseSetPicker } from "../components/timer/ExerciseSetPicker";
import {
  ResultEntryDialog,
  VideoResultDialog,
} from "../components/timer/ResultEntryDialog";
import { TimerDisplay } from "../components/timer/TimerDisplay";
import { AnswerSheet, ProblemSheet } from "../components/problems";
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
import { findProblemSet } from "../content/problems";
import {
  setLabel,
  type ExerciseSetWithCategory,
  type NewSession,
  type NewVideoSession,
} from "../types/domain";

interface StoppedResult {
  target: TimerTarget;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

/**
 * 「何を計測するか」はクエリ文字列に置く。
 * 選んだ瞬間には計測を始めず、この画面でスタートを押してから始める
 * （選び間違えたときや、問題文を読んでいる間の時間を含めないため）。
 * URL に持たせてあるので、準備中に再読み込みしても選択が消えない。
 */
function armedTarget(params: URLSearchParams): TimerTarget | null {
  const setId = params.get("set");
  if (setId) return { kind: "practice", exerciseSetId: setId };
  if (params.get("video")) return { kind: "video" };
  return null;
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

  if (sets.isLoading) return <Spinner />;
  if (sets.error) return <ErrorNote error={sets.error} />;

  const findSet = (id: string) =>
    sets.data?.find((s) => s.id === id) ?? null;

  const handleStop = () => {
    const result = timer.stop();
    if (result) setStopped(result);
  };

  /** 計測を終えて片付ける。選択も消して、選び直せる状態に戻す。 */
  const finish = () => {
    timer.clear();
    setStopped(null);
    setSearchParams({}, { replace: true });
  };

  const handleSavePractice = (
    activeSet: ExerciseSetWithCategory,
    correctCount: number,
    note: string,
  ) => {
    if (!stopped || stopped.target.kind !== "practice" || !user) return;
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
      onSuccess: finish,
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
      onSuccess: finish,
      onError: () => savePending({ kind: "video", payload }),
    });
  };

  // --- 計測中 / 一時停止中 ---
  const runningTarget = stopped?.target ?? timer.state?.target ?? null;
  if (timer.state && runningTarget) {
    const activeSet =
      runningTarget.kind === "practice"
        ? findSet(runningTarget.exerciseSetId)
        : null;
    const title =
      runningTarget.kind === "video"
        ? "講義ビデオ"
        : activeSet
          ? setLabel(activeSet)
          : "—";
    const content = activeSet
      ? findProblemSet(activeSet.category.name, activeSet.number)
      : null;

    return (
      <>
        <PageTitle>{title}</PageTitle>
        <Card>
          <p className="text-center text-sm text-ink-soft">
            {runningTarget.kind === "video"
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
              if (confirm("この計測を破棄しますか？")) finish();
            }}
            className="mt-4 w-full text-xs text-ink-faint hover:text-ink-soft"
          >
            計測を破棄する
          </button>
        </Card>

        {content && (
          <Card className="mt-4" title="問題">
            <ProblemSheet set={content} />
          </Card>
        )}

        {stopped?.target.kind === "practice" && activeSet && (
          <ResultEntryDialog
            label={setLabel(activeSet)}
            problemCount={activeSet.problem_count}
            durationSeconds={stopped.durationSeconds}
            answers={content && <AnswerSheet set={content} />}
            saving={createSession.isPending}
            error={createSession.error}
            onSave={(correct, note) =>
              handleSavePractice(activeSet, correct, note)
            }
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

  // --- 選んだあと・スタート待ち ---
  const armed = armedTarget(searchParams);
  if (armed) {
    const armedSet =
      armed.kind === "practice" ? findSet(armed.exerciseSetId) : null;
    // 存在しない ID が URL に残っているときは、選び直しに戻す
    if (armed.kind === "practice" && !armedSet) {
      return (
        <>
          <PageTitle>見つかりません</PageTitle>
          <Card>
            <p className="text-sm text-ink-soft">
              この練習問題は見つかりませんでした。
            </p>
            <Button
              className="mt-4"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              選び直す
            </Button>
          </Card>
        </>
      );
    }
    const content = armedSet
      ? findProblemSet(armedSet.category.name, armedSet.number)
      : null;

    return (
      <>
        <PageTitle>{armedSet ? setLabel(armedSet) : "講義ビデオ"}</PageTitle>
        <Card>
          <p className="text-center text-sm text-ink-soft">
            {armedSet
              ? `全${armedSet.problem_count}問`
              : "見ていた時間を記録します"}
          </p>
          <p className="mt-1 text-center text-xs text-ink-faint">
            スタートを押すと計測が始まります
          </p>
          <div className="mt-5 flex gap-2">
            <Button
              variant="secondary"
              className="py-4"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              選び直す
            </Button>
            <Button
              className="flex-1 py-4 text-base"
              onClick={() => timer.start(armed)}
            >
              {quest ? "▶ たたかう" : "▶ スタート"}
            </Button>
          </div>
        </Card>

        {content && (
          <Card className="mt-4" title="問題" subtitle="答えは解き終わってから出ます">
            <ProblemSheet set={content} />
          </Card>
        )}
      </>
    );
  }

  // --- 何をするか選ぶ ---
  return (
    <>
      <PageTitle>{quest ? "本日のクエスト" : "今日は何をする？"}</PageTitle>

      <button
        onClick={() => setSearchParams({ video: "1" })}
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
        subtitle="番号をタップすると問題が開きます"
      >
        <ExerciseSetPicker
          sets={sets.data ?? []}
          attemptCounts={attemptCounts}
          onPick={(s) => setSearchParams({ set: s.id })}
        />
      </Card>
    </>
  );
}
