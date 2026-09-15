import { Link, useNavigate, useParams } from "react-router-dom";
import { PageTitle } from "../components/layout/PageTitle";
import {
  AttemptAccuracyChart,
  AttemptPaceChart,
} from "../components/charts/AttemptCharts";
import {
  StudyEntryList,
  toStudyEntries,
} from "../components/session/StudyEntryList";
import {
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Spinner,
  StatTile,
} from "../components/ui";
import { useAuth } from "../auth/useAuth";
import { useExerciseSets, useSessions } from "../hooks/queries";
import { attemptSeries, summarize } from "../stats/selectors";
import { formatRate, formatTotalDuration } from "../lib/format";
import { setLabel } from "../types/domain";

export function ExerciseSetDetailPage() {
  const { setId = "" } = useParams();
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const sets = useExerciseSets();
  const sessions = useSessions();

  if (sets.isLoading || sessions.isLoading) return <Spinner />;
  const error = sets.error ?? sessions.error;
  if (error) return <ErrorNote error={error} />;

  const set = sets.data?.find((s) => s.id === setId);
  if (!set) return <EmptyState title="この練習問題は見つかりません" />;

  const mine = (sessions.data ?? []).filter((s) => s.exercise_set_id === setId);
  const summary = summarize(mine);
  const attempts = attemptSeries(sessions.data ?? [], setId);
  const first = attempts[0];
  const latest = attempts[attempts.length - 1];

  return (
    <>
      <PageTitle
        action={
          canEdit && (
            <Button onClick={() => navigate(`/study?set=${set.id}`)}>
              この問題を始める
            </Button>
          )
        }
      >
        {setLabel(set)}
      </PageTitle>

      <p className="-mt-2 mb-4 text-sm text-ink-soft">
        <Link to={`/categories/${set.category.id}`} className="hover:underline">
          {set.category.name}
        </Link>
        {" · "}全{set.problem_count}問
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="解いた回数" value={`${summary.sessionCount}回`} />
        <StatTile
          label="通算の正答率"
          value={formatRate(summary.accuracy)}
          tone="accuracy"
        />
        <StatTile
          label="合計時間"
          value={formatTotalDuration(summary.totalSeconds)}
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

      {attempts.length >= 2 && first && latest && (
        <div className="mt-3 rounded-2xl bg-surface p-3 text-sm shadow-sm ring-1 ring-line">
          初回 <strong className="tnum">{formatRate(first.accuracy)}</strong> →
          最新 <strong className="tnum">{formatRate(latest.accuracy)}</strong>
          <span
            className="tnum ml-2 font-semibold"
            style={{
              color:
                (latest.accuracy ?? 0) > (first.accuracy ?? 0)
                  ? "var(--color-good)"
                  : (latest.accuracy ?? 0) < (first.accuracy ?? 0)
                    ? "var(--color-bad)"
                    : "var(--color-ink-muted)",
            }}
          >
            {(() => {
              const d = ((latest.accuracy ?? 0) - (first.accuracy ?? 0)) * 100;
              if (d === 0) return "±0pt";
              return `${d > 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(0)}pt`;
            })()}
          </span>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {attempts.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="回ごとの正答率">
              <AttemptAccuracyChart data={attempts} />
            </Card>
            <Card
              title="回ごとの1問あたりの時間"
              subtitle="下がっているほど速くなっている"
            >
              <AttemptPaceChart data={attempts} />
            </Card>
          </div>
        ) : (
          <Card>
            <EmptyState
              title="まだ解いていません"
              hint="「この問題を始める」から計測できます"
            />
          </Card>
        )}

        <Card title="この練習問題の記録">
          <StudyEntryList entries={toStudyEntries(mine, [])} />
        </Card>
      </div>
    </>
  );
}
