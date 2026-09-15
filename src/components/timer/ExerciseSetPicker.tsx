import { useMemo, useState } from "react";
import type { ExerciseSetWithCategory } from "../../types/domain";
import { EmptyState } from "../ui";

/**
 * 大分類を選んでから練習問題のマス目をタップする2段構え。
 * 番号ボタンを大きくしてスマホで押しやすくしている。
 */
export function ExerciseSetPicker({
  sets,
  onPick,
  attemptCounts,
}: {
  sets: ExerciseSetWithCategory[];
  onPick: (set: ExerciseSetWithCategory) => void;
  attemptCounts?: Map<string, number>;
}) {
  const categories = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; sortOrder: number; count: number }
    >();
    for (const s of sets) {
      const existing = map.get(s.category.id);
      if (existing) existing.count++;
      else
        map.set(s.category.id, {
          id: s.category.id,
          name: s.category.name,
          sortOrder: s.category.sort_order,
          count: 1,
        });
    }
    return [...map.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [sets]);

  const [categoryId, setCategoryId] = useState<string | null>(
    () => categories.find((c) => c.count > 0)?.id ?? null,
  );

  const visible = sets
    .filter((s) => s.category.id === categoryId)
    .sort((a, b) => a.number - b.number);

  if (sets.length === 0) {
    return (
      <EmptyState
        title="練習問題が登録されていません"
        hint="設定画面から追加してください"
      />
    );
  }

  return (
    <div>
      <div className="-mx-1 mb-4 flex gap-1 overflow-x-auto px-1 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            disabled={c.count === 0}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              c.id === categoryId
                ? "bg-slate-900 text-white"
                : c.count === 0
                  ? "bg-slate-100 text-slate-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="この大分類にはまだ練習問題がありません"
          hint="設定画面から追加できます"
        />
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {visible.map((s) => {
            const attempts = attemptCounts?.get(s.id) ?? 0;
            return (
              <button
                key={s.id}
                onClick={() => onPick(s)}
                className="flex aspect-square flex-col items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition active:scale-95 hover:ring-slate-900"
              >
                <span className="text-lg font-bold text-slate-900">
                  {s.number}
                </span>
                <span className="text-[10px] text-slate-400">
                  {s.problem_count}問
                </span>
                {attempts > 0 && (
                  <span className="mt-0.5 text-[10px] font-semibold text-accuracy">
                    {attempts}回
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
