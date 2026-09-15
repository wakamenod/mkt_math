import { useMemo, useState } from "react";
import { PageTitle } from "../components/layout/PageTitle";
import {
  StudyEntryList,
  toStudyEntries,
} from "../components/session/StudyEntryList";
import { Card, ErrorNote, Spinner } from "../components/ui";
import { useAuth } from "../auth/useAuth";
import { useSessions, useVideoSessions } from "../hooks/queries";
import { useDeleteSession, useDeleteVideoSession } from "../hooks/mutations";
import { formatTotalDuration } from "../lib/format";

const VIDEO_FILTER = "video";

export function HistoryPage() {
  const { canEdit } = useAuth();
  const sessions = useSessions();
  const videos = useVideoSessions();
  const deleteSession = useDeleteSession();
  const deleteVideo = useDeleteVideoSession();
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; sortOrder: number }
    >();
    for (const s of sessions.data ?? []) {
      const c = s.exercise_set.category;
      if (!map.has(c.id))
        map.set(c.id, { id: c.id, name: c.name, sortOrder: c.sort_order });
    }
    return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [sessions.data]);

  /** 問題演習とビデオを1本の時系列に混ぜる。 */
  const entries = useMemo(
    () => toStudyEntries(sessions.data ?? [], videos.data ?? []),
    [sessions.data, videos.data],
  );

  const visible = useMemo(() => {
    if (filter === "all") return entries;
    if (filter === VIDEO_FILTER)
      return entries.filter((e) => e.kind === "video");
    return entries.filter(
      (e) =>
        e.kind === "practice" && e.session.exercise_set.category.id === filter,
    );
  }, [entries, filter]);

  if (sessions.isLoading || videos.isLoading) return <Spinner />;
  const error = sessions.error ?? videos.error;
  if (error) return <ErrorNote error={error} />;

  const totalSeconds = visible.reduce(
    (a, e) => a + e.session.duration_seconds,
    0,
  );

  const tabs = [
    { id: "all", name: "すべて" },
    ...categories,
    ...((videos.data ?? []).length > 0
      ? [{ id: VIDEO_FILTER, name: "講義ビデオ" }]
      : []),
  ];

  const deleteButton = (onDelete: () => void) => (
    <button
      onClick={() => {
        if (confirm("この記録を削除しますか？")) onDelete();
      }}
      className="shrink-0 rounded-lg px-2 py-1 text-xs text-ink-faint hover:bg-danger-bg hover:text-danger-ink"
      aria-label="削除"
    >
      削除
    </button>
  );

  return (
    <>
      <PageTitle>学習の記録</PageTitle>

      {tabs.length > 2 && (
        <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                t.id === filter
                  ? "bg-accent text-accent-ink"
                  : "bg-surface-2 text-ink-soft hover:bg-surface-3"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <Card
        title="記録一覧"
        subtitle={`${visible.length}回 · 合計 ${formatTotalDuration(totalSeconds)}`}
      >
        <StudyEntryList
          entries={visible}
          renderAction={
            canEdit
              ? (e) =>
                  deleteButton(() =>
                    e.kind === "practice"
                      ? deleteSession.mutate(e.id)
                      : deleteVideo.mutate(e.id),
                  )
              : undefined
          }
        />
      </Card>
    </>
  );
}
