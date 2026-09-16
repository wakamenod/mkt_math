import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * `$...$` を数式として描画するテキスト。
 *
 * 数式だけを描く専用コンポーネントは作らない。問題文は
 * 「日本語の中に数式が混ざったもの」がほとんどで、分けると
 * データ側が「文と式の配列」になって読みにくくなるため。
 *
 * KaTeX は色を指定しないので、文字色は親から継承される。
 * つまりテーマを切り替えても数式の色が勝手に取り残されない。
 */

/** `$` で区切って、テキストと数式に分ける。`\$` はただの `$`。 */
function split(source: string): { math: boolean; value: string }[] {
  const parts: { math: boolean; value: string }[] = [];
  let buffer = "";
  let math = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === "\\" && source[i + 1] === "$") {
      buffer += "$";
      i++;
      continue;
    }
    if (c === "$") {
      if (buffer) parts.push({ math, value: buffer });
      buffer = "";
      math = !math;
      continue;
    }
    buffer += c;
  }
  // 閉じ忘れは数式にせずそのまま出す（画面が壊れるより読めるほうがよい）
  if (buffer) parts.push({ math: false, value: buffer });
  return parts;
}

const cache = new Map<string, string>();

function renderMath(expr: string): string {
  const hit = cache.get(expr);
  if (hit !== undefined) return hit;
  const html = katex.renderToString(expr, {
    throwOnError: false,
    displayMode: false,
    // 数式が長いときにスマホで折り返せるようにする
    output: "html",
  });
  cache.set(expr, html);
  return html;
}

export function MathText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const parts = useMemo(() => split(children), [children]);
  return (
    // leading-loose: 分数は縦に大きくなるので、折り返した行と重ならないだけの行間を取る。
    // whitespace-pre-line: データ側の改行をそのまま見せる（選択肢を並べる問題で使う）。
    <span className={`whitespace-pre-line leading-loose ${className}`}>
      {parts.map((p, i) =>
        p.math ? (
          // 中身は src/content/problems.ts に書いた自前の文字列だけ。
          // 外部入力やユーザー入力をここに渡さないこと。
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: renderMath(p.value) }}
          />
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </span>
  );
}
