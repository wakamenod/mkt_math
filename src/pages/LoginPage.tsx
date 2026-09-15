import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Button, Card, ErrorNote } from "../components/ui";

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate("/study", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-10">
      <Card title="ログイン" subtitle="記録の入力・編集に必要です">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full rounded-xl bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full rounded-xl bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
          {error != null && <ErrorNote error={error} />}
          <Button type="submit" className="w-full py-3" disabled={busy}>
            {busy ? "ログイン中…" : "ログイン"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-xs text-slate-400">
        ダッシュボードの閲覧にログインは不要です
      </p>
    </div>
  );
}
