import { useState } from "react";
import type { Problem, ProblemSet } from "../../content/problems";
import { MathText } from "../math/MathText";
import { Button, Card } from "../ui";

/**
 * 練習問題の本文。
 *
 * 1 問ずつ出さず、紙のプリントと同じように全部まとめて見せる。
 * 手元で解いて答え合わせをする使い方なので、画面が問題の進行を
 * 管理する必要がない（記録するのは時間と正解数だけ）。
 */

/** これを超える小問は「文章題」とみなし、段組みしても 1 行に収まらない。 */
const LONG = 70;

/**
 * 短い小問ばかりなら 2 段組にする（PDF の並びに近く、全体が一目で入る）。
 * 判定は中央値で見る。練習問題6 のように 10 問が短くて 1 問だけ長いとき、
 * 最大値で決めると全部が 1 段組になってしまうため。長い小問だけ横に伸ばす。
 */
function columnsClass(problems: Problem[]): string {
  const lengths = problems.map((p) => p.body.length).sort((a, b) => a - b);
  const median = lengths[Math.floor(lengths.length / 2)] ?? 0;
  return median <= LONG ? "sm:grid-cols-2" : "";
}

function Header({ set }: { set: ProblemSet }) {
  if (!set.prompt && !set.note) return null;
  return (
    <div className="mb-3">
      {set.prompt && (
        <p className="text-sm font-medium text-ink">
          <MathText>{set.prompt}</MathText>
        </p>
      )}
      {set.note && <p className="mt-1 text-xs text-ink-faint">{set.note}</p>}
    </div>
  );
}

function Label({ children }: { children: string }) {
  if (!children) return null;
  return (
    <span className="tnum w-11 shrink-0 text-sm font-semibold text-ink-faint">
      {children}
    </span>
  );
}

/** 問題文だけを並べる（計測前・計測中に見る面）。 */
export function ProblemSheet({ set }: { set: ProblemSet }) {
  return (
    <div>
      <Header set={set} />
      <ol className={`grid gap-x-6 gap-y-3 ${columnsClass(set.problems)}`}>
        {set.problems.map((p, i) => (
          <li
            key={i}
            className={`flex gap-1 text-ink ${
              p.body.length > LONG ? "sm:col-span-full" : ""
            }`}
          >
            <Label>{p.label}</Label>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <MathText>{p.body}</MathText>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * 答え一覧（全部解き終わったあとに見る面）。
 * 問題文も小さく添える。番号だけだとどれの答えか分からなくなるため。
 */
export function AnswerSheet({ set }: { set: ProblemSet }) {
  return (
    <ol className="space-y-3">
      {set.problems.map((p, i) => (
        <li
          key={i}
          className="rounded-control bg-surface-2 px-3 py-2 text-ink"
        >
          <div className="flex gap-1">
            <Label>{p.label}</Label>
            <div className="min-w-0 flex-1 overflow-x-auto text-xs text-ink-soft">
              {/* 文章題は全文を繰り返さない。どれの答えかが分かれば足りる。 */}
              <MathText className={p.body.length > LONG ? "line-clamp-2" : ""}>
                {p.body}
              </MathText>
            </div>
          </div>
          <div className="mt-1 flex gap-1">
            <span className="w-11 shrink-0 text-sm font-semibold text-good">
              答
            </span>
            <div className="min-w-0 flex-1 overflow-x-auto text-sm font-semibold">
              <MathText>{p.answer}</MathText>
            </div>
          </div>
          {p.hint && (
            <p className="mt-1 pl-11 text-xs text-ink-faint">
              <MathText>{p.hint}</MathText>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * 復習用。問題を出しておき、答えは押したときだけ開く。
 * 計測画面と違って「解き終わったか」を知る手がかりがないので、
 * 答えを見るかどうかは本人に委ねる。
 */
export function ProblemReference({ set }: { set: ProblemSet }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      title="問題"
      subtitle={set.heading}
      action={
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? "答えを隠す" : "答えを見る"}
        </Button>
      }
    >
      {open ? <AnswerSheet set={set} /> : <ProblemSheet set={set} />}
    </Card>
  );
}
