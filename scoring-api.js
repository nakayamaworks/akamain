(function initializeTypingWorkbenchScoringApi(global) {
  const config = global.TYPING_WORKBENCH_CONFIG || {};

  function createError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  async function scoreAttempt(attempt) {
    const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl) {
      throw createError(
        "API_NOT_CONFIGURED",
        "AIレビューAPIがまだ接続されていません。"
      );
    }

    const idToken = global.TYPING_WORKBENCH_AUTH?.getIdToken();
    if (!idToken) {
      throw createError(
        "AUTH_REQUIRED",
        "AIレビューを利用するにはGoogleアカウントでログインしてください。"
      );
    }

    const controller = new AbortController();
    const timeoutId = global.setTimeout(() => controller.abort(), 45000);
    try {
      const response = await global.fetch(`${apiBaseUrl}/api/scoring`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw createError(
          body.error?.code || `HTTP_${response.status}`,
          body.error?.message || "AIレビューに失敗しました。"
        );
      }
      return body;
    } catch (error) {
      if (error.name === "AbortError") {
        throw createError("TIMEOUT", "AIレビューがタイムアウトしました。もう一度お試しください。");
      }
      throw error;
    } finally {
      global.clearTimeout(timeoutId);
    }
  }

  global.TYPING_WORKBENCH_SCORING_API = Object.freeze({ scoreAttempt });
})(window);
