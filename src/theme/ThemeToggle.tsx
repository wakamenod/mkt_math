import { useTheme } from "./useTheme";

/** ヘッダーに常設する見た目の切り替え。選んだテーマはその端末に残る。 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isQuest = theme === "quest";

  return (
    <button
      onClick={toggle}
      aria-pressed={isQuest}
      title={isQuest ? "シンプルな見た目に戻す" : "クエストの見た目にする"}
      className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
    >
      <span className="text-sm leading-none">{isQuest ? "🗡️" : "📘"}</span>
      <span className="hidden sm:inline">
        {isQuest ? "クエスト" : "シンプル"}
      </span>
    </button>
  );
}
