// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersistentTimer } from "./usePersistentTimer";

/**
 * タイマーは記録そのものなので、壁時計まわりの挙動を固定しておく。
 * Date.now() を偽の時計に差し替えて、経過時間を意図した値で進める。
 */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

type Timer = ReturnType<typeof usePersistentTimer>;
type Stopped = ReturnType<Timer["stop"]>;

/** act の中で stop() を呼び、返り値を取り出す。 */
function stop(result: { current: Timer }): Stopped {
  // act のコールバックの中で代入すると TS が never に絞ってしまうので、
  // 箱に入れて受け取る。
  const out: { value: Stopped } = { value: null };
  act(() => {
    out.value = result.current.stop();
  });
  return out.value;
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("usePersistentTimer", () => {
  it("スタートすると経過時間が増える", () => {
    const { result } = renderHook(() => usePersistentTimer());
    act(() => result.current.start({ kind: "video" }));
    advance(5000);
    expect(result.current.seconds).toBe(5);
    expect(result.current.isRunning).toBe(true);
  });

  it("一時停止している間は増えない", () => {
    const { result } = renderHook(() => usePersistentTimer());
    act(() => result.current.start({ kind: "video" }));
    advance(3000);
    act(() => result.current.pause());
    advance(10_000);
    expect(result.current.seconds).toBe(3);
    act(() => result.current.resume());
    advance(2000);
    expect(result.current.seconds).toBe(5);
  });

  it("ストップすると時計も止まる", () => {
    // 入力シートで答え合わせをしている間に数字が増え続けないこと
    const { result } = renderHook(() => usePersistentTimer());
    act(() => result.current.start({ kind: "practice", exerciseSetId: "a" }));
    advance(60_000);

    expect(stop(result)?.durationSeconds).toBe(60);

    advance(120_000);
    expect(result.current.seconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });

  it("ストップしたあとキャンセルして再開しても、止まっていた分は入らない", () => {
    const { result } = renderHook(() => usePersistentTimer());
    act(() => result.current.start({ kind: "video" }));
    advance(10_000);
    stop(result);
    advance(30_000); // 答え合わせをしていた時間
    act(() => result.current.resume());
    advance(5000);

    expect(stop(result)?.durationSeconds).toBe(15);
  });

  it("リロードを跨いでも計測が続く", () => {
    const first = renderHook(() => usePersistentTimer());
    act(() => first.result.current.start({ kind: "video" }));
    advance(7000);
    first.unmount();

    const second = renderHook(() => usePersistentTimer());
    expect(second.result.current.seconds).toBe(7);
    expect(second.result.current.isRunning).toBe(true);
  });
});
