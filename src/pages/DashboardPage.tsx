import { Link, useNavigate } from "react-router-dom";
import { PageTitle } from "../components/layout/PageTitle";
import { Card, ErrorNote, Spinner, StatTile } from "../components/ui";
import { AccuracyTrendChart } from "../components/charts/AccuracyTrendChart";
import { CalendarHeatmap } from "../components/charts/CalendarHeatmap";
import { CategoryBarChart } from "../components/charts/CategoryBarChart";
import { CategoryTrendChart } from "../components/charts/CategoryTrendChart";
import { CoverageGrid } from "../components/charts/CoverageGrid";
import { DurationTrendChart } from "../components/charts/DurationTrendChart";
import { PaceTrendChart } from "../components/charts/PaceTrendChart";
import { WeakSetsChart } from "../components/charts/WeakSetsChart";
import { StudyEntryList } from "../components/session/StudyEntryList";
import { QuestStatusPanel } from "../components/quest/QuestStatusPanel";
import { useTheme } from "../theme/useTheme";
import {
  useExerciseSets,
  useSessions,
  useVideoSessions,
} from "../hooks/queries";
import { useStats } from "../stats/useStats";
import { formatRate, formatTotalDuration } from "../lib/format";
import { EmptyState } from "../components/ui";

function ImprovementList({
  items,
}: {
  items: {
    exerciseSetId: string;
    label: string;
    accuracyDelta: number;
    attemptCount: number;
  }[];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="まだ繰り返し解いた練習問題がありません"
        hint="同じ問題を2回以上解くと出てきます"
      />
    );
  }
  return (
    <ul className="divide-y divide-line text-sm">
      {items.map((i) => {
        const up = i.accuracyDelta > 0;
        const flat = i.accuracyDelta === 0;
        return (
          <li key={i.exerciseSetId} className="flex items-center gap-2 py-2">
            <Link
              to={`/sets/${i.exerciseSetId}`}
              className="min-w-0 flex-1 truncate hover:underline"
            >
              {i.label}
            </Link>
            <span className="shrink-0 text-xs text-ink-faint">
              {i.attemptCount}回
            </span>
            <span
              className="tnum shrink-0 text-sm font-semibold"
              style={{
                color: flat
                  ? "var(--color-ink-muted)"
                  : up
                    ? "var(--color-good)"
                    : "var(--color-bad)",
              }}
            >
              {flat
                ? "±0"
                : `${up ? "▲" : "▼"} ${Math.abs(i.accuracyDelta * 100).toFixed(0)}pt`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const quest = theme === "quest";
  const sessions = useSessions();
  const videos = useVideoSessions();
  const sets = useExerciseSets();
  const stats = useStats(
    sessions.data ?? [],
    videos.data ?? [],
    sets.data ?? [],
  );

  if (sessions.isLoading || sets.isLoading || videos.isLoading)
    return <Spinner />;
  const loadError = sessions.error ?? videos.error ?? sets.error;
  if (loadError) return <ErrorNote error={loadError} />;

  const hasData = (sessions.data ?? []).length > 0;
  const hasAnything = hasData || (videos.data ?? []).length > 0;
  const { summary, streak, time } = stats;

  return (
    <>
      <PageTitle>{quest ? "MKT のぼうけんのきろく" : "ダッシュボード"}</PageTitle>

      {quest && (
        <div className="mb-3">
          <QuestStatusPanel
            problemCount={summary.problemCount}
            accuracy={summary.accuracy}
            streak={streak.current}
            totalSeconds={time.totalSeconds}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="連続学習"
          value={`${streak.current}日`}
          sub={
            streak.studiedToday
              ? "今日もえらい！"
              : streak.current > 0
                ? "今日はまだ"
                : "今日から再開しよう"
          }
          tone="streak"
        />
        <StatTile
          label="最長記録"
          value={`${streak.longest}日`}
          sub={`学習した日 ${streak.totalDays}日`}
        />
        <StatTile
          label="全体の正答率"
          value={formatRate(summary.accuracy)}
          tone="accuracy"
        />
        <StatTile
          label="解いた問題"
          value={`${summary.problemCount}問`}
          sub={`正解 ${summary.correctCount}問`}
        />
        <StatTile
          label="総学習時間"
          value={formatTotalDuration(time.totalSeconds)}
          sub={
            time.videoSeconds > 0
              ? `演習 ${formatTotalDuration(time.practiceSeconds)} / ビデオ ${formatTotalDuration(time.videoSeconds)}`
              : `${summary.sessionCount}回`
          }
          tone="duration"
        />
        <StatTile
          label="1問あたり"
          value={
            summary.secondsPerProblem === null
              ? "—"
              : `${Math.round(summary.secondsPerProblem)}秒`
          }
        />
      </div>

      {!hasAnything && (
        <div className="mt-4">
          <Card>
            <EmptyState
              title="まだ記録がありません"
              hint="「学習」タブから練習問題か講義ビデオを選んでスタートしてください"
            />
          </Card>
        </div>
      )}

      <div className="mt-4 space-y-4">
        <Card
          title="学習のようす"
          subtitle={`${quest ? "明るい" : "濃い"}ほどその日たくさん勉強した日（ビデオ視聴も含む）`}
        >
          <CalendarHeatmap days={stats.heatmap} />
        </Card>

        {/* 学習時間はビデオだけの日もあるので、問題演習の有無とは独立に出す */}
        {hasAnything && (
          <Card title="学習時間の推移" subtitle="直近30日">
            <DurationTrendChart data={stats.recentTime30} />
          </Card>
        )}

        {hasData && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="正答率の推移" subtitle="日ごとの正答率と7日平均">
                <AccuracyTrendChart data={stats.daily} />
              </Card>
              <Card
                title="1問あたりの時間"
                subtitle="下がっているほど速くなっている"
              >
                <PaceTrendChart data={stats.daily} />
              </Card>
              <Card title="大分類ごとの正答率">
                <CategoryBarChart data={stats.categories} />
              </Card>
              {stats.categoryTrend.categories.length > 1 && (
                <Card
                  title="大分類ごとの正答率の推移"
                  className="lg:col-span-2"
                >
                  <CategoryTrendChart
                    categories={stats.categoryTrend.categories}
                    rows={stats.categoryTrend.rows}
                  />
                </Card>
              )}
              <Card
                title="苦手な練習問題"
                subtitle="正答率の低い順。タップで詳細へ"
              >
                <WeakSetsChart
                  data={stats.weakest}
                  onSelect={(id) => navigate(`/sets/${id}`)}
                />
              </Card>
              <Card
                title="繰り返しての伸び"
                subtitle="初回から最新への正答率の変化"
              >
                <ImprovementList items={stats.improvements} />
              </Card>
            </div>
          </>
        )}

        <Card
          title="進みぐあい"
          subtitle={`色が${quest ? "明るい" : "濃い"}ほど何度も解いた練習問題`}
        >
          <CoverageGrid coverage={stats.coverage} />
        </Card>

        <Card
          title="最近の記録"
          action={
            <Link
              to="/history"
              className="text-xs text-ink-soft hover:text-ink"
            >
              すべて見る
            </Link>
          }
        >
          <StudyEntryList entries={stats.recentEntries} />
        </Card>
      </div>
    </>
  );
}
