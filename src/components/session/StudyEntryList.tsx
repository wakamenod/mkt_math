import type {
  SessionWithSet,
  StudyEntry,
  VideoSession,
} from "../../types/domain";
import { EmptyState } from "../ui";
import { SessionCard } from "./SessionCard";
import { VideoSessionCard } from "./VideoSessionCard";

/** 問題演習とビデオを1本の時系列にまとめる。 */
export function toStudyEntries(
  sessions: SessionWithSet[],
  videos: VideoSession[],
): StudyEntry[] {
  const practice: StudyEntry[] = sessions.map((s) => ({
    kind: "practice",
    id: s.id,
    startedAt: s.started_at,
    session: s,
  }));
  const video: StudyEntry[] = videos.map((v) => ({
    kind: "video",
    id: v.id,
    startedAt: v.started_at,
    session: v,
  }));
  return [...practice, ...video].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

export function StudyEntryList({
  entries,
  renderAction,
  emptyTitle = "まだ記録がありません",
  emptyHint,
}: {
  entries: StudyEntry[];
  renderAction?: (entry: StudyEntry) => React.ReactNode;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (entries.length === 0)
    return <EmptyState title={emptyTitle} hint={emptyHint} />;

  return (
    <ul className="divide-y divide-line">
      {entries.map((e) =>
        e.kind === "practice" ? (
          <SessionCard
            key={e.id}
            session={e.session}
            action={renderAction?.(e)}
          />
        ) : (
          <VideoSessionCard
            key={e.id}
            session={e.session}
            action={renderAction?.(e)}
          />
        ),
      )}
    </ul>
  );
}
