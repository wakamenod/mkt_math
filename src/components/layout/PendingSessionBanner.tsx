import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { useCreateSession, useCreateVideoSession } from "../../hooks/mutations";
import {
  clearPending,
  loadPending,
  subscribePending,
} from "../../lib/pendingSession";
import { Button } from "../ui";

/**
 * オフライン等で保存できなかった記録の再送を促す。
 * 計測したのに消えてしまった、という事故を防ぐための最後の砦。
 */
export function PendingSessionBanner() {
  const { user } = useAuth();
  const createSession = useCreateSession();
  const createVideoSession = useCreateVideoSession();
  const [pending, setPending] = useState(() => loadPending());
  const [error, setError] = useState<unknown>(null);

  // 保存に失敗した直後にその場で出す（次回起動まで気づけないのを避ける）
  useEffect(() => subscribePending(() => setPending(loadPending())), []);

  if (pending.length === 0 || !user) return null;

  const busy = createSession.isPending || createVideoSession.isPending;

  const retry = async () => {
    setError(null);
    try {
      for (const entry of pending) {
        if (entry.kind === "practice") {
          await createSession.mutateAsync({
            ...entry.payload,
            created_by: user.id,
          });
        } else {
          await createVideoSession.mutateAsync({
            ...entry.payload,
            created_by: user.id,
          });
        }
      }
      clearPending();
    } catch (e) {
      // 失敗したらキューはそのまま残す（次の機会にもう一度出す）
      setError(e);
    }
  };

  return (
    <div className="mb-4 rounded-card bg-warn-bg p-3 text-sm text-warn-ink ring-1 ring-warn-line">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex-1">
          保存できていない記録が{pending.length}件あります。
        </span>
        <Button variant="secondary" onClick={retry} disabled={busy}>
          {busy ? "送信中…" : "再送する"}
        </Button>
        <button
          onClick={() => {
            if (confirm("保存できていない記録を破棄しますか？")) clearPending();
          }}
          className="text-xs text-warn-ink hover:underline"
        >
          破棄
        </button>
      </div>
      {error != null && (
        <p className="mt-2 text-xs">
          再送に失敗しました。通信状況を確認してもう一度お試しください。
        </p>
      )}
    </div>
  );
}
