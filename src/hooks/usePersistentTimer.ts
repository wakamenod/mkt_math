import { useCallback, useEffect, useRef, useState } from "react";

// 計測対象が「練習問題 or 講義ビデオ」に広がったのでキーを v2 に上げる
const STORAGE_KEY = "mkt_math.timer.v2";
/** これを超えて経過していたら「止め忘れ」とみなして警告する。 */
export const ABANDONED_THRESHOLD_SECONDS = 6 * 60 * 60;

interface Segment {
  start: number;
  end: number | null;
}

/** 何を計測しているか。ビデオは範囲の区分けを持たない。 */
export type TimerTarget =
  { kind: "practice"; exerciseSetId: string } | { kind: "video" };

export interface TimerState {
  target: TimerTarget;
  startedAt: number;
  segments: Segment[];
  status: "running" | "paused";
}

function load(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerState;
    if (!Array.isArray(parsed?.segments) || parsed.segments.length === 0)
      return null;
    const kind = parsed.target?.kind;
    if (kind === "video") return parsed;
    if (kind === "practice" && parsed.target.exerciseSetId) return parsed;
    return null;
  } catch {
    return null;
  }
}

function save(state: TimerState | null) {
  try {
    if (state === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモード等で書けなくても計測自体は続行する
  }
}

/** 動いている区間を now で閉じて、止まった状態にする。 */
function halted(state: TimerState, now: number): TimerState {
  return {
    ...state,
    status: "paused",
    segments: state.segments.map((seg, i) =>
      i === state.segments.length - 1 && seg.end === null
        ? { ...seg, end: now }
        : seg,
    ),
  };
}

/** 一時停止を除いた実経過ミリ秒。壁時計から都度計算する。 */
function elapsedMs(state: TimerState, now: number): number {
  return state.segments.reduce(
    (total, seg) => total + ((seg.end ?? now) - seg.start),
    0,
  );
}

/**
 * 壁時計ベースのタイマー。
 * setInterval でカウンタを加算する方式は使わない
 * （バックグラウンドタブでスロットリングされて値が狂うため）。
 * localStorage に開始時刻を置くので、リロードや画面ロックを跨いでも正しい。
 */
export function usePersistentTimer() {
  const [state, setState] = useState<TimerState | null>(() => load());
  // 「今」を state に持ち、tick のたびに更新する。
  // レンダー中に Date.now() を読まないので、表示は常にこの値から決まる。
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const update = useCallback((next: TimerState | null) => {
    stateRef.current = next;
    setState(next);
    setNow(Date.now());
    save(next);
  }, []);

  // 表示更新のための tick。経過値は tick ごとに壁時計から取り直す。
  useEffect(() => {
    if (state?.status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [state?.status]);

  // スリープ復帰・タブ復帰の直後に即座に正しい値を出す
  useEffect(() => {
    const tick = () => setNow(Date.now());
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, []);

  const start = useCallback(
    (target: TimerTarget) => {
      const now = Date.now();
      update({
        target,
        startedAt: now,
        segments: [{ start: now, end: null }],
        status: "running",
      });
    },
    [update],
  );

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.status !== "running") return;
    update(halted(s, Date.now()));
  }, [update]);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.status !== "paused") return;
    update({
      ...s,
      status: "running",
      segments: [...s.segments, { start: Date.now(), end: null }],
    });
  }, [update]);

  /**
   * 計測を終了し、保存に必要な値を返す（記録の破棄はまだしない）。
   *
   * ここで時計も実際に止める。返り値だけ返して状態を触らずにいると、
   * 入力シートで答え合わせをしている間も背後で数字が増え続け、
   * 「ストップを押したのに止まらない」画面になる。
   * 入力をキャンセルした場合は一時停止の状態が残るので、再開して続けられる。
   */
  const stop = useCallback(() => {
    const s = stateRef.current;
    if (!s) return null;
    const now = Date.now();
    const ended = halted(s, now);
    update(ended);
    return {
      target: ended.target,
      startedAt: new Date(ended.startedAt).toISOString(),
      endedAt: new Date(now).toISOString(),
      durationSeconds: Math.round(elapsedMs(ended, now) / 1000),
    };
  }, [update]);

  const clear = useCallback(() => update(null), [update]);

  const seconds = state
    ? Math.max(0, Math.floor(elapsedMs(state, now) / 1000))
    : 0;

  return {
    state,
    seconds,
    isRunning: state?.status === "running",
    isPaused: state?.status === "paused",
    /** 止め忘れの疑い。復帰時に警告を出す。 */
    isAbandoned: state !== null && seconds > ABANDONED_THRESHOLD_SECONDS,
    start,
    pause,
    resume,
    stop,
    clear,
  };
}
