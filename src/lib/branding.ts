/** 子供のハンドルネーム。アプリ名や冒険者名として使う。 */
export const OWNER_NAME = "MKT";

/** ヘッダーのアプリ名。テーマで見せ方を変える。 */
export const appTitle = (quest: boolean) =>
  quest ? `${OWNER_NAME}'S QUEST` : `${OWNER_NAME} の数学記録`;
