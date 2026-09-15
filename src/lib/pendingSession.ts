import type { NewSession, NewVideoSession } from "../types/domain";

const KEY = "mkt_math.pendingSession.v2";

/**
 * オフラインやトークン切れで保存に失敗した記録の退避先。
 * 次回起動時に再送を促す。計測したのに消えてしまう事故を防ぐための最後の砦。
 * 問題演習・講義ビデオのどちらも保存先が違うだけで、失う怖さは同じなので両方扱う。
 */
export type PendingEntry =
  | { kind: "practice"; payload: NewSession }
  | { kind: "video"; payload: NewVideoSession };

/**
 * キューの変化を知らせる。
 * 退避したことにその場で気づけないと「保存された」と思い込んだまま
 * 画面を離れてしまうので、バナー側が購読して即座に出せるようにする。
 */
const CHANGED_EVENT = "mkt_math:pending-changed";

export function subscribePending(listener: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, listener);
  // 別タブでの変更も拾う
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyChanged() {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function savePending(entry: PendingEntry) {
  try {
    const list = loadPending();
    list.push(entry);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // 保存できなければ諦めるしかない
  }
  notifyChanged();
}

export function loadPending(): PendingEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingEntry[];
    return Array.isArray(parsed)
      ? parsed.filter((e) => e?.kind && e?.payload)
      : [];
  } catch {
    return [];
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
  notifyChanged();
}
