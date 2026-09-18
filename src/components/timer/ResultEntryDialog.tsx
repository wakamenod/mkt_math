import { useState } from "react";
import { formatDuration, formatIsoDateJp } from "../../lib/format";
import { Button, ErrorNote } from "../ui";
import type { AttemptPoint } from "../../stats/selectors";

function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-5 sm:rounded-3xl"
        style={{
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function NoteField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="メモ（任意）"
      className="mt-4 w-full rounded-xl bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
    />
  );
}

/** 差分の表示。0 は「同じ」とだけ出す（±0 は読み違えやすい）。 */
function Delta({
  value,
  unit,
  betterWhen,
}: {
  value: number;
  unit: string;
  betterWhen: "lower" | "higher";
}) {
  if (value === 0) return <span className="text-ink-faint">前回と同じ</span>;
  const better = betterWhen === "lower" ? value < 0 : value > 0;
  const abs = Math.abs(value);
  const text =
    unit === "秒"
      ? `${formatDuration(abs)}${value < 0 ? "速い" : "遅い"}`
      : `${abs}問${value < 0 ? "少ない" : "多い"}`;
  return (
    <span className={better ? "font-semibold text-good" : "text-ink-soft"}>
      {better ? "↑ " : ""}
      {text}
    </span>
  );
}

/**
 * 前回の記録。今回の入力と並べて「速くなったか・当たるようになったか」を見せる。
 * 正解数の差は、正解数を選ぶまでは出せないので選んでから出る。
 */
function PreviousAttempt({
  previous,
  durationSeconds,
  correct,
}: {
  previous: AttemptPoint;
  durationSeconds: number;
  correct: number | null;
}) {
  return (
    <div className="mt-4 rounded-control bg-surface-2 p-3 text-sm">
      <p className="text-xs font-semibold text-ink-soft">
        前回（{formatIsoDateJp(previous.date)} ・ {previous.attempt}回目）
      </p>
      <div className="tnum mt-1.5 flex items-baseline justify-between">
        <span className="text-ink">
          {formatDuration(previous.durationSeconds)}
        </span>
        <Delta
          value={durationSeconds - previous.durationSeconds}
          unit="秒"
          betterWhen="lower"
        />
      </div>
      <div className="tnum mt-1 flex items-baseline justify-between">
        <span className="text-ink">
          {previous.correctCount} / {previous.problemCount}問 正解
        </span>
        {correct !== null && (
          <Delta
            value={correct - previous.correctCount}
            unit="問"
            betterWhen="higher"
          />
        )}
      </div>
    </div>
  );
}

/**
 * ストップ直後の入力。
 * 問題演習は「常に全問解く」前提なので入力は正解数のみ。
 * スマホで素早く押せるよう 0..N のボタングリッドにしている。
 */
export function ResultEntryDialog({
  label,
  problemCount,
  durationSeconds,
  answers,
  previous,
  saving,
  error,
  onSave,
  onCancel,
}: {
  label: string;
  problemCount: number;
  durationSeconds: number;
  /** 答え合わせの面。正解数を入力する前にここで丸をつける。 */
  answers?: React.ReactNode;
  /** 同じ練習問題の直近の記録。初めてなら null。 */
  previous?: AttemptPoint | null;
  saving: boolean;
  error: unknown;
  onSave: (correctCount: number, note: string) => void;
  onCancel: () => void;
}) {
  const [correct, setCorrect] = useState<number | null>(null);
  const [note, setNote] = useState("");

  return (
    <Sheet>
      <h2 className="text-lg font-bold text-ink">{label}</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {formatDuration(durationSeconds)} / 全{problemCount}問
      </p>

      {previous && (
        <PreviousAttempt
          previous={previous}
          durationSeconds={durationSeconds}
          correct={correct}
        />
      )}

      {answers && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-ink">答え合わせ</p>
          {answers}
        </div>
      )}

      <p className="mt-5 text-sm font-semibold text-ink">正解した数は？</p>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {Array.from({ length: problemCount + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => setCorrect(i)}
            className={`tnum aspect-square rounded-xl text-lg font-bold transition active:scale-95 ${
              correct === i
                ? "bg-accent text-accent-ink"
                : "bg-surface-2 text-ink hover:bg-surface-3"
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      <NoteField value={note} onChange={setNote} />

      {error != null && (
        <div className="mt-3">
          <ErrorNote error={error} />
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={saving}
        >
          キャンセル
        </Button>
        <Button
          className="flex-1"
          disabled={correct === null || saving}
          onClick={() => correct !== null && onSave(correct, note.trim())}
        >
          {saving ? "保存中…" : "記録する"}
        </Button>
      </div>
    </Sheet>
  );
}

/**
 * 講義ビデオの確認ダイアログ。
 * 範囲の区分けを持たないので、確認するのは時間だけ。メモは任意。
 */
export function VideoResultDialog({
  durationSeconds,
  saving,
  error,
  onSave,
  onCancel,
}: {
  durationSeconds: number;
  saving: boolean;
  error: unknown;
  onSave: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <Sheet>
      <h2 className="text-lg font-bold text-ink">講義ビデオ</h2>
      <p className="mt-1 text-sm text-ink-soft">視聴した時間を記録します</p>

      <p className="tnum mt-6 text-center text-4xl font-bold text-ink">
        {formatDuration(durationSeconds)}
      </p>

      <NoteField value={note} onChange={setNote} />

      {error != null && (
        <div className="mt-3">
          <ErrorNote error={error} />
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={saving}
        >
          キャンセル
        </Button>
        <Button
          className="flex-1"
          disabled={saving}
          onClick={() => onSave(note.trim())}
        >
          {saving ? "保存中…" : "記録する"}
        </Button>
      </div>
    </Sheet>
  );
}
