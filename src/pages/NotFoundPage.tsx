import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-lg font-semibold text-ink">ページが見つかりません</p>
      <Link
        to="/"
        className="mt-4 inline-block text-sm font-semibold text-accuracy hover:underline"
      >
        ダッシュボードへ戻る
      </Link>
    </div>
  );
}
