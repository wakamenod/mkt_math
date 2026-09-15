/**
 * 環境変数が欠けている状態では何も動かないので、アプリの代わりにこれを出す。
 * 原因の分からない白画面を避けるのが目的。
 */
export function EnvSetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-lg font-bold text-slate-900">
          セットアップが未完了です
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Supabase の接続情報が読み込めていないため、アプリを起動できません。
          次の環境変数がビルド時に設定されていませんでした。
        </p>
        <ul className="mt-3 space-y-1">
          {missing.map((name) => (
            <li
              key={name}
              className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-800"
            >
              {name}
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <p>
            <strong className="text-slate-900">ローカル:</strong>{" "}
            プロジェクト直下の{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            に記入して開発サーバーを再起動してください。
          </p>
          <p>
            <strong className="text-slate-900">GitHub Pages:</strong>{" "}
            リポジトリの Settings → Secrets and variables → Actions →{" "}
            <strong>Repository secrets</strong> に{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              SUPABASE_URL
            </code>{" "}
            と{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
              SUPABASE_ANON_KEY
            </code>{" "}
            を登録し（<code className="text-xs">VITE_</code>{" "}
            は付けない）、もう一度デプロイしてください。
          </p>
        </div>
      </div>
    </div>
  );
}
