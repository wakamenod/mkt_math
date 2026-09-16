/**
 * 練習問題の本文と答え。
 *
 * PDF「中１数学 代数全解説」(2025-02-09) の練習問題をそのまま写したもの。
 * 元の PDF は `import/` に置いてある（配布物なので git には入れない）。
 * 数式は `$...$` で囲む（中身は KaTeX の記法）。描画は MathText が行う。
 *
 * ここは表示専用のデータで、記録には一切関わらない。
 * 正答率の分母はいまも DB の `problem_count_snapshot` で、この配列の長さではない。
 * ただし「表示と記録がずれていないこと」は problems.test.ts で見張っている。
 */

export interface Problem {
  /** 小問番号。"(1)" など。小問に分かれていない問題は空文字。 */
  label: string;
  /** 問題文。`$...$` の中が数式。 */
  body: string;
  /** 答え。`$...$` の中が数式。 */
  answer: string;
  /** 答えの補足（考え方・式変形）。 */
  hint?: string;
}

export interface ProblemSet {
  /** 練習問題の番号。exercise_sets.number と対応する。 */
  number: number;
  /** PDF の節見出し。 */
  heading: string;
  /** 「次の式を計算せよ。」などの共通の指示。 */
  prompt?: string;
  /** 問題全体に付く注記。 */
  note?: string;
  problems: Problem[];
}

/** 大分類ごとの本文。いまは代数1だけ PDF から起こしてある。 */
export const PROBLEM_SETS: Record<string, ProblemSet[]> = {
  代数1: [
    {
      number: 1,
      heading: "正の数・負の数",
      prompt: "数直線を用いて，次の 2 数の大小を比べよ。",
      problems: [
        { label: "(1)", body: "$-3,\\ 2$", answer: "$-3 < 2$" },
        { label: "(2)", body: "$-5,\\ -6$", answer: "$-6 < -5$" },
        { label: "(3)", body: "$-2.1,\\ -2.2$", answer: "$-2.2 < -2.1$" },
        {
          label: "(4)",
          body: "$-\\dfrac{3}{7},\\ -\\dfrac{1}{2}$",
          answer: "$-\\dfrac{1}{2} < -\\dfrac{3}{7}$",
          hint: "$\\dfrac{3}{7}=0.428\\cdots < 0.5=\\dfrac{1}{2}$ なので，絶対値の大きい $-\\dfrac{1}{2}$ のほうが小さい。",
        },
        {
          label: "(5)",
          body: "$-\\dfrac{1}{100},\\ -\\dfrac{1}{101}$",
          answer: "$-\\dfrac{1}{100} < -\\dfrac{1}{101}$",
          hint: "$\\dfrac{1}{100} > \\dfrac{1}{101}$ なので，符号を付けると大小が逆になる。",
        },
      ],
    },
    {
      number: 2,
      heading: "正・負の数の加法・減法（足し算・引き算）",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$(+2) + (+7)$", answer: "$9$" },
        { label: "(2)", body: "$(-3) + (-9)$", answer: "$-12$" },
        { label: "(3)", body: "$(+3) + (-7)$", answer: "$-4$" },
        { label: "(4)", body: "$(-2) + (+6)$", answer: "$4$" },
        { label: "(5)", body: "$(-2.1) + (+1.5)$", answer: "$-0.6$" },
      ],
    },
    {
      number: 3,
      heading: "正・負の数の加法・減法（足し算・引き算）",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$(+2) - (+5)$", answer: "$-3$" },
        { label: "(2)", body: "$(-3) - (+8)$", answer: "$-11$" },
        { label: "(3)", body: "$(+3) - (-5)$", answer: "$8$" },
        { label: "(4)", body: "$(-2) - (-3)$", answer: "$1$" },
        { label: "(5)", body: "$(-1) - (-0.11)$", answer: "$-0.89$" },
      ],
    },
    {
      number: 4,
      heading: "正・負の数の乗法・除法（かけ算・わり算）",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$(+2) \\times (+7)$", answer: "$14$" },
        { label: "(2)", body: "$(-3) \\times (-9)$", answer: "$27$" },
        { label: "(3)", body: "$(+3) \\times (-7)$", answer: "$-21$" },
        { label: "(4)", body: "$(-2) \\times (+6)$", answer: "$-12$" },
        {
          label: "(5)",
          body: "$(-2) \\times (+5) \\times (-3)$",
          answer: "$30$",
          hint: "負の数が 2 個なので積は正。",
        },
        {
          label: "(6)",
          body: "$(-3) \\times (-7) \\times (-2)$",
          answer: "$-42$",
          hint: "負の数が 3 個なので積は負。",
        },
      ],
    },
    {
      number: 5,
      heading: "正・負の数の乗法・除法（かけ算・わり算）",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$(+8) \\div (+2)$", answer: "$4$" },
        { label: "(2)", body: "$(-10) \\div (+8)$", answer: "$-\\dfrac{5}{4}$" },
        { label: "(3)", body: "$(+3) \\div (-6)$", answer: "$-\\dfrac{1}{2}$" },
        { label: "(4)", body: "$(-24) \\div (-15)$", answer: "$\\dfrac{8}{5}$" },
        {
          label: "(5)",
          body: "$(-1) \\div (-0.1) \\div (-2)$",
          answer: "$-5$",
          hint: "$(-1)\\div(-0.1)=10$，$10\\div(-2)=-5$。",
        },
      ],
    },
    {
      number: 6,
      heading: "加減乗除の混じった計算",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$(+8) - (-2) - (+3)$", answer: "$7$" },
        { label: "(2)", body: "$-10 + 2 + 5 - (-1)$", answer: "$-2$" },
        {
          label: "(3)",
          body: "$(+4) \\div (-8) + (-2.5) \\times (-3)$",
          answer: "$7$",
          hint: "$-0.5 + 7.5 = 7$。かけ算・わり算が先。",
        },
        { label: "(4)", body: "$(-24 + 13) \\times (-2)$", answer: "$22$" },
        { label: "(5)", body: "$1 - 1 \\times 2 + 1$", answer: "$0$" },
        { label: "(6)", body: "$(1 - 1) \\times 2 + 1$", answer: "$1$" },
        {
          label: "(7)",
          body: "$2 \\times 18 \\div 3 \\div 9$",
          answer: "$\\dfrac{4}{3}$",
          hint: "左から順に $36 \\div 3 = 12$，$12 \\div 9 = \\dfrac{4}{3}$。",
        },
        {
          label: "(8)",
          body: "$2 \\times 18 \\div (3 \\div 9)$",
          answer: "$108$",
          hint: "かっこの中が $\\dfrac{1}{3}$ なので $36 \\div \\dfrac{1}{3} = 108$。(7) と比べる。",
        },
        {
          label: "(9)",
          body: "$\\left(\\dfrac{2}{3} - \\dfrac{3}{4}\\right) \\times 24$",
          answer: "$-2$",
          hint: "$\\dfrac{2}{3}-\\dfrac{3}{4}=-\\dfrac{1}{12}$，$-\\dfrac{1}{12}\\times 24 = -2$。",
        },
        {
          label: "(10)",
          body: "$9 \\times (11 + 1 \\div 9)$",
          answer: "$100$",
          hint: "$9\\times 11 + 9\\times\\dfrac{1}{9} = 99 + 1$。",
        },
        {
          label: "(11)#",
          body: "$2024 \\times 2023 + 2024 \\times (-2024) - 2025 \\times 2026 - 2025 \\times (-2025)$",
          answer: "$-4049$",
          hint: "$2024(2023-2024) - 2025(2026-2025) = -2024 - 2025$。分配法則でまとめる。",
        },
      ],
    },
    {
      number: 7,
      heading: "累乗",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$2^3$", answer: "$8$" },
        { label: "(2)", body: "$(-2)^3$", answer: "$-8$" },
        {
          label: "(3)",
          body: "$-2^3$",
          answer: "$-8$",
          hint: "$-(2^3)$ の意味。(2) とは途中の意味が違う。",
        },
        {
          label: "(4)",
          body: "$(-2)^2 \\times (-5^2)$",
          answer: "$-100$",
          hint: "$4 \\times (-25) = -100$。$-5^2$ は $-(5^2)$。",
        },
        {
          label: "(5)",
          body: "$(-2 + 3 \\times 2)^2$",
          answer: "$16$",
          hint: "かっこの中が $4$ なので $4^2$。",
        },
      ],
    },
    {
      number: 8,
      heading: "累乗",
      prompt: "次の式の $\\square$ に当てはまる数を答えよ。",
      problems: [
        { label: "(1)", body: "$2^5 \\times 2^4 = 2^{\\square}$", answer: "$9$" },
        { label: "(2)", body: "$5^{10} \\div 5^8 = 5^{\\square}$", answer: "$2$" },
        { label: "(3)", body: "$2^5 \\times 3^5 = \\square^5$", answer: "$6$" },
        { label: "(4)", body: "$(2^5)^3 = 2^{\\square}$", answer: "$15$" },
        {
          label: "(5)",
          body: "$(2^3)^3 \\div 4^3 = 2^{\\square}$",
          answer: "$3$",
          hint: "$2^9 \\div 2^6 = 2^3$。$4^3 = (2^2)^3 = 2^6$ に直す。",
        },
      ],
    },
    {
      number: 9,
      heading: "文字式の表し方のルール",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$x \\times y \\times (-2)$", answer: "$-2xy$" },
        { label: "(2)", body: "$a \\times b \\times b \\div c$", answer: "$\\dfrac{ab^2}{c}$" },
        { label: "(3)", body: "$(-1) \\times x + y \\times 2$", answer: "$-x + 2y$" },
        { label: "(4)", body: "$x \\times x - x \\times (-2)$", answer: "$x^2 + 2x$" },
        { label: "(5)", body: "$\\dfrac{1}{2} \\times x \\times 3$", answer: "$\\dfrac{3}{2}x$" },
        {
          label: "(6)",
          body: "$10 \\div 3 + x \\times y \\times \\dfrac{2}{5}$",
          answer: "$\\dfrac{10}{3} + \\dfrac{2}{5}xy$",
        },
      ],
    },
    {
      number: 10,
      heading: "文字式の計算",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$2x + y - 4x + 7y$", answer: "$-2x + 8y$" },
        { label: "(2)", body: "$x + 2 - 3y - 2(x + 5)$", answer: "$-x - 3y - 8$" },
        {
          label: "(3)",
          body: "$x^2 + x + 1 - (2x^2 + 3x - 4)$",
          answer: "$-x^2 - 2x + 5$",
        },
        {
          label: "(4)",
          body: "$2(x^2 + 2xy + y^2) - 3(-x^2 - xy + y^2)$",
          answer: "$5x^2 + 7xy - y^2$",
        },
        {
          label: "(5)",
          body: "$\\dfrac{x + 2y}{3} - \\dfrac{3x + y + 1}{4}$",
          answer: "$\\dfrac{-5x + 5y - 3}{12}$",
          hint: "通分して $\\dfrac{4(x+2y) - 3(3x+y+1)}{12}$。",
        },
      ],
    },
    {
      number: 11,
      heading: "指数の計算",
      prompt: "次の式を計算せよ。",
      problems: [
        { label: "(1)", body: "$x^3 \\times x^2$", answer: "$x^5$" },
        {
          label: "(2)",
          body: "$(-y)^3 \\times y^4 \\div y^5$",
          answer: "$-y^2$",
          hint: "$(-y)^3 = -y^3$ なので $-y^{3+4-5}$。",
        },
        { label: "(3)", body: "$(-2xy)^3$", answer: "$-8x^3y^3$" },
        {
          label: "(4)",
          body: "$(3xy \\times yz)^2 \\div 2xyz$",
          answer: "$\\dfrac{9}{2}xy^3z$",
          hint: "$(3xy^2z)^2 = 9x^2y^4z^2$ を $2xyz$ でわる。",
        },
        {
          label: "(5)",
          body: "$(3xy^2z^3)^4 \\div x \\div \\left(-\\dfrac{3}{2}xyz\\right)^3$",
          answer: "$-24y^5z^9$",
          hint: "$81x^4y^8z^{12} \\div x \\div \\left(-\\dfrac{27}{8}x^3y^3z^3\\right)$。$81 \\times \\dfrac{8}{27} = 24$ で $x$ は約分し切れる。",
        },
      ],
    },
    {
      number: 12,
      heading: "文字式の利用（円周率）",
      note: "PDF では練習問題13の後に解説されている。",
      problems: [
        {
          label: "(1)",
          body: "円周率を $\\pi$ とする。半径 $r$ の円の周の長さ $l$ と面積 $S$ を $\\pi, r$ を用いて表せ。",
          answer: "$l = 2\\pi r,\\quad S = \\pi r^2$",
        },
        {
          label: "(2)",
          body: "半径 $r$，弧の長さが $l$ の扇形の面積を $l, r$ を用いて表せ。",
          answer: "$S = \\dfrac{1}{2}lr$",
          hint: "円全体 $\\pi r^2$ のうち，弧の割合 $\\dfrac{l}{2\\pi r}$ の分。",
        },
        {
          label: "(3)",
          body: "半径 $r$，母線の長さが $L$ の円錐の側面積を $\\pi, L, r$ を用いて表せ。",
          answer: "$S = \\pi r L$",
          hint: "側面は半径 $L$，弧の長さ $2\\pi r$ の扇形なので $\\dfrac{1}{2} \\cdot 2\\pi r \\cdot L$。",
        },
      ],
    },
    {
      number: 13,
      heading: "文字式の利用",
      problems: [
        {
          label: "",
          body: "日本において課税所得が 4000 万円以上の場合，課税所得の 45% から 480 万円引いた額の所得税がかかります。たとえば，10000 万円（1 億円）の課税所得がある場合には，$10000 \\times 0.45 - 480 = 4020$（万円）の所得税がかかります（払わなければ脱税になります）。将来あなたが $x$ 万円（ただし，$x \\geqq 4000$ とする）稼いだ場合，あなたにかかる所得税はいくらになりますか。$x$ を用いて答えなさい。",
          answer: "$0.45x - 480$（万円）",
        },
      ],
    },
    {
      number: 14,
      heading: "方程式",
      prompt: "次の方程式を解け。",
      problems: [
        { label: "(1)", body: "$x + 1 = 0$", answer: "$x = -1$" },
        { label: "(2)", body: "$3x = -9$", answer: "$x = -3$" },
        { label: "(3)", body: "$2x + 1 = -5$", answer: "$x = -3$" },
        {
          label: "(4)",
          body: "$-12 = 5(x + 1) - 7$",
          answer: "$x = -2$",
          hint: "$-12 = 5x - 2$ より $5x = -10$。",
        },
        {
          label: "(5)",
          body: "$2(x + 1) = -5x + 30$",
          answer: "$x = 4$",
          hint: "$2x + 2 = -5x + 30$ より $7x = 28$。",
        },
        {
          label: "(6)",
          body: "$\\dfrac{x + 1}{2} = \\dfrac{x}{5}$",
          answer: "$x = -\\dfrac{5}{3}$",
          hint: "両辺を 10 倍して $5(x+1) = 2x$。",
        },
        {
          label: "(7)",
          body: "$\\dfrac{2x - 1}{3} - \\dfrac{x + 1}{4} = 1$",
          answer: "$x = \\dfrac{19}{5}$",
          hint: "両辺を 12 倍して $4(2x-1) - 3(x+1) = 12$。",
        },
      ],
    },
    {
      number: 15,
      heading: "方程式",
      problems: [
        {
          label: "",
          body: "一次方程式 $7x = x + 3$ を次の解き方のように解いた。このとき，解き方の ① の式から ② の式へ変形してよい理由として，最も適切なものを，あとの ア〜エ からひとつ選び，記号で答えなさい。ただし，$\\boxed{a}$ には方程式の解が入るが，解を求める必要はない。\n\n【解き方】\n$7x = x + 3$\n$7x - x = 3$\n$6x = 3 \\quad \\cdots ①$\n$x = \\boxed{a} \\quad \\cdots ②$\n\nア　① の式の両辺から 3 をひいても等式は成り立つから，② の式へ変形してよい\nイ　① の式の両辺から 6 をひいても等式は成り立つから，② の式へ変形してよい\nウ　① の式の両辺を 3 でわっても等式は成り立つから，② の式へ変形してよい\nエ　① の式の両辺を 6 でわっても等式は成り立つから，② の式へ変形してよい",
          answer: "エ",
          hint: "$6x = 3$ の両辺を $x$ の係数 6 でわると $x = \\dfrac{1}{2}$ になる。",
        },
      ],
    },
    {
      number: 16,
      heading: "方程式",
      prompt: "方程式を用いて次の問題を解いてください。",
      problems: [
        {
          label: "(1)",
          body: "10% の食塩水 A がある。これに 5% の食塩水 400g を加えて，水を 100g 蒸発させたところ 8% の食塩水ができた。食塩水 A は最初何 g あったか答えよ。",
          answer: "$200$ g",
          hint: "A を $x$ g とすると，食塩は $0.1x + 20$，全体は $x + 300$。$0.1x + 20 = 0.08(x + 300)$ より $x = 200$。",
        },
        {
          label: "(2)",
          body: "チョコレートが何個かと，それを入れるための箱が何個かある。1 個の箱にチョコレートを 30 個ずつ入れたところ，すべての箱にチョコレートを入れてもチョコレートは 22 個余った。そこで，1 個の箱にチョコレートを 35 個ずつ入れていったところ，最後の箱はチョコレートが 32 個になった。このとき，箱の個数を求めなさい。（茨城県）",
          answer: "$5$ 個",
          hint: "箱を $x$ 個とすると，チョコは $30x + 22$ 個。35 個ずつだと $35(x-1) + 32$ 個なので $35(x-1) + 32 = 30x + 22$ より $x = 5$。",
        },
      ],
    },
    {
      number: 17,
      heading: "不等式",
      prompt: "次の不等式を解け。また，不等式の解を数直線を用いて表せ。",
      problems: [
        { label: "(1)", body: "$x + 4 > 2$", answer: "$x > -2$" },
        { label: "(2)", body: "$3x < -9$", answer: "$x < -3$" },
        {
          label: "(3)",
          body: "$-2x + 1 \\leqq -5$",
          answer: "$x \\geqq 3$",
          hint: "負の数でわるので不等号の向きが変わる。",
        },
        {
          label: "(4)",
          body: "$-17 \\geqq 5(x + 1) - 2$",
          answer: "$x \\leqq -4$",
          hint: "$-17 \\geqq 5x + 3$ より $5x \\leqq -20$。",
        },
        {
          label: "(5)",
          body: "$2(x - 6) > -5x + 30$",
          answer: "$x > 6$",
          hint: "$2x - 12 > -5x + 30$ より $7x > 42$。",
        },
        {
          label: "(6)",
          body: "$\\dfrac{x + 1}{2} \\leqq \\dfrac{2x - 1}{5}$",
          answer: "$x \\leqq -7$",
          hint: "両辺を 10 倍して $5(x+1) \\leqq 2(2x-1)$。",
        },
        {
          label: "(7)",
          body: "$\\dfrac{2x - 1}{3} - \\dfrac{x - 1}{4} > -1$",
          answer: "$x > -\\dfrac{11}{5}$",
          hint: "両辺を 12 倍して $4(2x-1) - 3(x-1) > -12$。",
        },
      ],
    },
    {
      number: 18,
      heading: "不等式（連立）",
      prompt: "次の不等式を解け。また，不等式の解を数直線を用いて表せ。",
      problems: [
        {
          label: "(1)",
          body: "$\\begin{cases} 5x + 4 > 2x - 2 \\\\ -x + 4 > 2 \\end{cases}$",
          answer: "$-2 < x < 2$",
          hint: "それぞれ $x > -2$ と $x < 2$。両方を満たす範囲が答え。",
        },
        {
          label: "(2)",
          body: "$\\begin{cases} 3x + 4 \\geqq 2 \\\\ -3x + 4 < x + 10 \\end{cases}$",
          answer: "$x \\geqq -\\dfrac{2}{3}$",
          hint: "それぞれ $x \\geqq -\\dfrac{2}{3}$ と $x > -\\dfrac{3}{2}$。狭いほうが答え。",
        },
      ],
    },
    {
      number: 19,
      heading: "座標平面とグラフ",
      prompt: "座標平面上に次の点の位置をかきなさい。",
      problems: [
        {
          label: "(1)",
          body: "$\\mathrm{A}(3, 2)$",
          answer: "原点から右へ 3，上へ 2 の点（第 1 象限）",
        },
        {
          label: "(2)",
          body: "$\\mathrm{B}(-2, 1)$",
          answer: "原点から左へ 2，上へ 1 の点（第 2 象限）",
        },
        {
          label: "(3)",
          body: "$\\mathrm{C}(0, 5)$",
          answer: "$y$ 軸上，原点から上へ 5 の点",
        },
        {
          label: "(4)",
          body: "$\\mathrm{D}(-5, -5)$",
          answer: "原点から左へ 5，下へ 5 の点（第 3 象限）",
        },
      ],
    },
    {
      number: 20,
      heading: "比例とそのグラフ",
      prompt: "座標平面上に次の比例のグラフをかきなさい。",
      problems: [
        { label: "(1)", body: "$y = x$", answer: "原点と $(1, 1)$ を通る右上がりの直線" },
        { label: "(2)", body: "$y = 2x$", answer: "原点と $(1, 2)$ を通る右上がりの直線" },
        { label: "(3)", body: "$y = -x$", answer: "原点と $(1, -1)$ を通る右下がりの直線" },
        { label: "(4)", body: "$y = -3x$", answer: "原点と $(1, -3)$ を通る右下がりの直線" },
        {
          label: "(5)",
          body: "$y = \\dfrac{1}{2}x$",
          answer: "原点と $(2, 1)$ を通る右上がりの直線",
        },
        {
          label: "(6)",
          body: "$y = -\\dfrac{2}{3}x$",
          answer: "原点と $(3, -2)$ を通る右下がりの直線",
        },
      ],
    },
    {
      number: 21,
      heading: "反比例とそのグラフ",
      prompt: "座標平面上に次の反比例のグラフをかきなさい。",
      problems: [
        {
          label: "(1)",
          body: "$y = \\dfrac{1}{x}$",
          answer: "$(1, 1), (2, \\tfrac{1}{2}), (-1, -1)$ などを通る双曲線（第 1・第 3 象限）",
        },
        {
          label: "(2)",
          body: "$y = \\dfrac{2}{x}$",
          answer: "$(1, 2), (2, 1), (-1, -2)$ などを通る双曲線（第 1・第 3 象限）",
        },
        {
          label: "(3)",
          body: "$y = -\\dfrac{1}{x}$",
          answer: "$(1, -1), (-1, 1)$ などを通る双曲線（第 2・第 4 象限）",
        },
      ],
    },
    {
      number: 22,
      heading: "比例・反比例",
      problems: [
        {
          label: "(1)",
          body: "$y$ は $x$ に比例し，$x = -2$ のとき $y = 10$ である。$x$ と $y$ の関係を式に表しなさい。（徳島県）",
          answer: "$y = -5x$",
          hint: "$y = ax$ に代入して $10 = -2a$ より $a = -5$。",
        },
        {
          label: "(2)",
          body: "$y$ は $x$ に反比例し，$x = 3$ のとき $y = 2$ である。$y$ を $x$ の式に表しなさい。（山口県）",
          answer: "$y = \\dfrac{6}{x}$",
          hint: "$y = \\dfrac{a}{x}$ に代入して $2 = \\dfrac{a}{3}$ より $a = 6$。",
        },
      ],
    },
  ],
};

/** 大分類名と練習問題番号から本文を引く。登録がなければ null。 */
export function findProblemSet(
  categoryName: string,
  number: number,
): ProblemSet | null {
  return (
    PROBLEM_SETS[categoryName]?.find((s) => s.number === number) ?? null
  );
}
