import type { NewSession } from '../types/domain'

const KEY = 'mkt_math.pendingSession.v1'

/**
 * オフラインやトークン切れで保存に失敗したセッションの退避先。
 * 次回起動時に再送を促す。計測データを取りこぼさないための最後の砦。
 */
export function savePending(session: NewSession) {
  try {
    const list = loadPending()
    list.push(session)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // 保存できなければ諦めるしかない
  }
}

export function loadPending(): NewSession[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as NewSession[]) : []
  } catch {
    return []
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // noop
  }
}
