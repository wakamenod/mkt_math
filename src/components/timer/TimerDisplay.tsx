import { formatClock } from "../../lib/format";

export function TimerDisplay({
  seconds,
  running,
}: {
  seconds: number;
  running: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={`display tnum text-6xl font-bold tracking-tight tabular-nums sm:text-7xl ${
          running ? "text-ink" : "text-ink-faint"
        }`}
      >
        {formatClock(seconds)}
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        {running ? "計測中" : "一時停止中"}
      </p>
    </div>
  );
}
