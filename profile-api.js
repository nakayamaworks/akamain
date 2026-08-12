(function initializeTypingWorkbenchProfileApi(global) {
  const config = global.TYPING_WORKBENCH_CONFIG || {};

  function createError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  async function request(path, options = {}) {
    const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl) {
      throw createError("API_NOT_CONFIGURED", "成績保存APIがまだ接続されていません。");
    }

    const idToken = global.TYPING_WORKBENCH_AUTH?.getIdToken();
    if (!idToken) {
      throw createError("AUTH_REQUIRED", "マイページの利用にはGoogleログインが必要です。");
    }

    const controller = new AbortController();
    const timeoutId = global.setTimeout(() => controller.abort(), options.timeoutMs || 20000);
    try {
      const response = await global.fetch(`${apiBaseUrl}${path}`, {
        method: options.method || "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw createError(
          body.error?.code || `HTTP_${response.status}`,
          body.error?.message || "成績データを取得できませんでした。"
        );
      }
      return body;
    } catch (error) {
      if (error.name === "AbortError") {
        throw createError("TIMEOUT", "成績データの取得がタイムアウトしました。");
      }
      throw error;
    } finally {
      global.clearTimeout(timeoutId);
    }
  }

  function getMe() {
    return request("/api/me");
  }

  function getProgress() {
    return request("/api/progress");
  }

  function getHistory(options = {}) {
    const params = new URLSearchParams({ limit: String(options.limit || 20) });
    if (options.cursor) {
      params.set("cursor", options.cursor);
    }
    return request(`/api/history?${params.toString()}`);
  }

  function createAttempt(input) {
    return request("/api/attempts", {
      method: "POST",
      body: input,
    });
  }

  function reviewAttempt(attemptId) {
    return request(`/api/attempts/${encodeURIComponent(attemptId)}/review`, {
      method: "POST",
      timeoutMs: 45000,
    });
  }

  function getTickets(options = {}) {
    const params = new URLSearchParams({
      limit: String(options.limit || 20),
      projectId: String(options.projectId || ""),
    });
    if (options.tracker) {
      params.set("tracker", String(options.tracker));
    }
    if (options.cursor) {
      params.set("cursor", options.cursor);
    }
    return request(`/api/tickets?${params.toString()}`);
  }

  function getTicket(attemptId) {
    return request(`/api/tickets/${encodeURIComponent(attemptId)}`);
  }

  function createTicketRevision(ticketId, input) {
    return request(`/api/tickets/${encodeURIComponent(ticketId)}/revisions`, {
      method: "POST",
      body: input,
    });
  }

  function getLeaderboard(options = {}) {
    const params = new URLSearchParams({ limit: String(options.limit || 50) });
    if (options.cursor) {
      params.set("cursor", options.cursor);
    }
    return request(`/api/leaderboard?${params.toString()}`);
  }

  function updateRankingProfile(input) {
    return request("/api/me/ranking-profile", {
      method: "PUT",
      body: input,
    });
  }

  global.TYPING_WORKBENCH_PROFILE_API = Object.freeze({
    getMe,
    getProgress,
    getHistory,
    createAttempt,
    reviewAttempt,
    getTickets,
    getTicket,
    createTicketRevision,
    getLeaderboard,
    updateRankingProfile,
  });
})(window);
