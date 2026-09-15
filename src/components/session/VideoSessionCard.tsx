import type { VideoSession } from "../../types/domain";
import { formatDuration, formatIsoDateJp } from "../../lib/format";

export function VideoSessionCard({
  session,
  action,
}: {
  session: VideoSession;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-video/10 text-base">
        🎥
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">講義ビデオ</p>
        <p className="tnum mt-0.5 text-xs text-slate-500">
          {formatIsoDateJp(session.study_date)} ·{" "}
          {formatDuration(session.duration_seconds)}
        </p>
        {session.note && (
          <p className="mt-1 truncate text-xs text-slate-400">{session.note}</p>
        )}
      </div>
      {action}
    </li>
  );
}
