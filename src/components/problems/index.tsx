import { Suspense, lazy } from "react";
import type { ProblemSet } from "../../content/problems";

/**
 * 問題本文の入口。
 *
 * 中身（KaTeX と全問題のテキスト）は 300KB 近くあり、ダッシュボードを
 * 開くだけの人には要らない。チャートと同じ理由でここで遅延読み込みにし、
 * 学習タブの初回表示を軽く保つ。
 *
 * ルートの Suspense に任せると読み込み中にページ全体が消えてしまうので、
 * それぞれの差し込み口で受け止める。
 */

const Sheet = lazy(() =>
  import("./ProblemSheet").then((m) => ({ default: m.ProblemSheet })),
);
const Answers = lazy(() =>
  import("./ProblemSheet").then((m) => ({ default: m.AnswerSheet })),
);
const Reference = lazy(() =>
  import("./ProblemSheet").then((m) => ({ default: m.ProblemReference })),
);

function Loading() {
  return <p className="py-6 text-center text-sm text-ink-faint">問題を準備中…</p>;
}

export function ProblemSheet({ set }: { set: ProblemSet }) {
  return (
    <Suspense fallback={<Loading />}>
      <Sheet set={set} />
    </Suspense>
  );
}

export function AnswerSheet({ set }: { set: ProblemSet }) {
  return (
    <Suspense fallback={<Loading />}>
      <Answers set={set} />
    </Suspense>
  );
}

export function ProblemReference({ set }: { set: ProblemSet }) {
  return (
    <Suspense fallback={<Loading />}>
      <Reference set={set} />
    </Suspense>
  );
}
