import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeName = "simple" | "quest";

const STORAGE_KEY = "mkt_math.theme.v1";
const FONT_ID = "quest-font";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap";

export interface ThemeValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeValue | null>(null);

function load(): ThemeName {
  try {
    return localStorage.getItem(STORAGE_KEY) === "quest" ? "quest" : "simple";
  } catch {
    return "simple";
  }
}

/**
 * クエストテーマのドット文字だけ、使うときに読み込む。
 * シンプルテーマしか使わない人に余計な通信をさせないため。
 */
function ensureQuestFont() {
  if (document.getElementById(FONT_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_ID;
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(load);

  useEffect(() => {
    // シンプルは既定値なので属性を付けない（CSS の :root 側がそのまま効く）
    if (theme === "quest") {
      document.documentElement.setAttribute("data-theme", "quest");
      ensureQuestFont();
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // 保存できなくても表示は切り替わる
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => setThemeState(next), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "quest" ? "simple" : "quest")),
    [],
  );

  const value = useMemo<ThemeValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
