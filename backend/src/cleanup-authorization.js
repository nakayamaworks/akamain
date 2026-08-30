export async function verifyCleanupAuthorization(idToken, options = {}) {
  const audience = String(options.audience || "").trim();
  const expectedEmail = String(options.expectedEmail || "").trim().toLowerCase();
  if (!audience || !expectedEmail) {
    throw Object.assign(new Error("ゲストデータ削除の呼び出し元設定がありません。"), {
      code: "CLEANUP_AUTH_NOT_CONFIGURED",
    });
  }
  if (!idToken) {
    throw Object.assign(new Error("ゲストデータ削除の認証情報が必要です。"), {
      code: "CLEANUP_AUTH_REQUIRED",
    });
  }

  let payload;
  try {
    const ticket = await options.client.verifyIdToken({ idToken, audience });
    payload = ticket.getPayload();
  } catch {
    throw Object.assign(new Error("ゲストデータ削除の呼び出し元を確認できませんでした。"), {
      code: "CLEANUP_AUTH_INVALID",
    });
  }
  if (
    !new Set([true, "true"]).has(payload?.email_verified)
    || String(payload.email || "").toLowerCase() !== expectedEmail
  ) {
    throw Object.assign(new Error("ゲストデータ削除を実行する権限がありません。"), {
      code: "CLEANUP_AUTH_INVALID",
    });
  }
  return payload;
}
