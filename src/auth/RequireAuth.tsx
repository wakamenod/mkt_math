import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";

/**
 * 書き込み系ページのガード。
 * 閲覧系ページはガードしない（未ログインでもダッシュボードは見える設計）。
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-500">読み込み中…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">
          閲覧専用モードです
        </p>
        <p className="mt-2 text-sm text-slate-600">
          記録の入力・編集にはログインが必要です。
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          ログイン
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
