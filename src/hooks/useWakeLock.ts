import { useEffect } from "react";

/**
 * 計測中は画面を消させない。非対応端末では何もしない。
 * 経過時間は壁時計から計算しているので、これが効かなくても値は正しい。
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    const request = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // ユーザー操作なしの要求や非対応は無視してよい
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && !released) void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
