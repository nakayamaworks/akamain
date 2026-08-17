import http from "node:http";
import { OAuth2Client } from "google-auth-library";
import {
  DEFAULT_MODEL,
  attemptContentFingerprint,
  createAttemptRecord,
  createFailedScoringResult,
  createReusedScoringResult,
  isScoringSupported,
  scoreAttemptRecordWithGemini,
} from "./scoring-service.js";
import { createStorageRepository } from "./storage-factory.js";

const port = Number(process.env.PORT || 8787);
const googleClientId = process.env.GOOGLE_WEB_CLIENT_ID || "";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const geminiModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
const storageDriver = String(process.env.STORAGE_DRIVER || "memory").toLowerCase();
const storageRepository = createStorageRepository();
const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || "http://localhost:5500")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const googleAuthClient = new OAuth2Client();
const scoringWindows = new Map();
const scoringWindowMs = 60000;
const scoringLimitPerWindow = 5;

function latestSuccessfulScoringResult(attempt) {
  return (attempt?.scoringResults || []).find(
    (result) => result.status === "succeeded" && Number.isInteger(result.totalScore)
  ) || null;
}

function previousTicketRevision(ticket, attempt) {
  return [...(ticket?.revisions || [])]
    .filter((revision) =>
      revision.attemptId !== attempt.attemptId
      && (revision.revisionNumber || 1) < (attempt.revisionNumber || 1)
    )
    .sort((left, right) => (right.revisionNumber || 1) - (left.revisionNumber || 1))[0] || null;
}

function matchingScoredRevision(ticket, attempt) {
  const fingerprint = attemptContentFingerprint(attempt);
  return [...(ticket?.revisions || [])]
    .filter((revision) =>
      revision.attemptId !== attempt.attemptId
      && (revision.revisionNumber || 1) < (attempt.revisionNumber || 1)
      && attemptContentFingerprint(revision) === fingerprint
      && latestSuccessfulScoringResult(revision)
    )
    .sort((left, right) => (right.revisionNumber || 1) - (left.revisionNumber || 1))[0] || null;
}

function sendJson(response, statusCode, body, origin = "") {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...(origin && allowedOrigins.has(origin)
      ? {
          "Access-Control-Allow-Origin": origin,
          Vary: "Origin",
        }
      : {}),
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        reject(Object.assign(new Error("request body is too large"), { code: "PAYLOAD_TOO_LARGE" }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(Object.assign(new Error("request body must be valid JSON"), { code: "INVALID_JSON" }));
      }
    });
    request.on("error", reject);
  });
}

async function verifyGoogleUser(request) {
  if (!googleClientId) {
    const error = new Error("Googleログインのバックエンド設定がありません。");
    error.code = "AUTH_NOT_CONFIGURED";
    throw error;
  }
  const authorization = request.headers.authorization || "";
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!idToken) {
    const error = new Error("Googleログインが必要です。");
    error.code = "AUTH_REQUIRED";
    throw error;
  }
  let ticket;
  try {
    ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
  } catch {
    const error = new Error("Googleアカウントを確認できませんでした。");
    error.code = "INVALID_ID_TOKEN";
    throw error;
  }
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    const error = new Error("Googleアカウントを確認できませんでした。");
    error.code = "INVALID_ID_TOKEN";
    throw error;
  }
  return {
    userId: payload.sub,
    authProvider: "google",
    providerSubject: payload.sub,
    email: payload.email_verified ? payload.email || null : null,
    emailVerified: Boolean(payload.email_verified),
    displayName: payload.name || "Googleユーザー",
  };
}

async function authenticateAndUpsertUser(request) {
  const verifiedUser = await verifyGoogleUser(request);
  return storageRepository.upsertUser(verifiedUser);
}

function enforceScoringRateLimit(userId) {
  const now = Date.now();
  const currentWindow = scoringWindows.get(userId);
  if (!currentWindow || now - currentWindow.startedAt >= scoringWindowMs) {
    scoringWindows.set(userId, { startedAt: now, count: 1 });
    return;
  }
  if (currentWindow.count >= scoringLimitPerWindow) {
    const error = new Error("AI採点の連続実行が多すぎます。1分後にもう一度お試しください。");
    error.code = "RATE_LIMITED";
    throw error;
  }
  currentWindow.count += 1;
}

function displayTicketId(attempt) {
  if (Number.isSafeInteger(attempt?.ticketNumber) && attempt.ticketNumber > 0) {
    return String(attempt.ticketNumber);
  }
  const compactId = String(attempt?.attemptId || "").replaceAll("-", "");
  const numericFallback = Number.parseInt(compactId.slice(0, 8), 16);
  return String(40001 + (Number.isFinite(numericFallback) ? numericFallback : 0));
}

function latestScoringResult(attempt) {
  return Array.isArray(attempt?.scoringResults) ? attempt.scoringResults[0] || null : null;
}

function toPublicAttempt(attempt) {
  if (!attempt) {
    return null;
  }
  const { userId: _userId, ...publicAttempt } = attempt;
  return {
    ...publicAttempt,
    displayId: displayTicketId(attempt),
    scoringSupported: isScoringSupported(attempt.scenarioId),
  };
}

function toTicketSummary(attempt) {
  const result = latestScoringResult(attempt);
  const ticketFields = attempt.answer?.ticketFields || {};
  return {
    ticketId: attempt.ticketId || attempt.attemptId,
    attemptId: attempt.attemptId,
    revisionNumber: attempt.revisionNumber || 1,
    displayId: displayTicketId(attempt),
    projectId: attempt.projectId,
    scenarioId: attempt.scenarioId,
    subject: attempt.answer?.subject || "",
    tracker: ticketFields.tracker || "bug",
    priority: ticketFields.priority || null,
    assigneeId: ticketFields.assigneeId || null,
    reviewStatus: result?.status || (isScoringSupported(attempt.scenarioId) ? "pending" : "not_supported"),
    totalScore: result?.status === "succeeded" && Number.isInteger(result.totalScore)
      ? result.totalScore
      : null,
    completedAt: attempt.completedAt,
  };
}

function errorStatus(code) {
  if (code === "AUTH_REQUIRED" || code === "INVALID_ID_TOKEN") {
    return 401;
  }
  if (new Set([
    "AUTH_NOT_CONFIGURED",
    "INVALID_CURSOR",
    "INVALID_JSON",
    "INVALID_RANKING_PROFILE",
    "INVALID_REQUEST",
    "PAYLOAD_TOO_LARGE",
    "SCENARIO_NOT_SUPPORTED",
  ]).has(code)) {
    return 400;
  }
  if (code === "RATE_LIMITED") {
    return 429;
  }
  if (code === "USER_NOT_FOUND" || code === "ATTEMPT_NOT_FOUND" || code === "TICKET_NOT_FOUND") {
    return 404;
  }
  return 503;
}

function sendError(response, error, origin, context = "api") {
  const code = error.code || "INTERNAL_ERROR";
  const statusCode = errorStatus(code);
  console.error(`[${context}] ${code}: ${error.message}`);
  const storageFailure = code.startsWith("STORAGE_");
  sendJson(response, statusCode, {
    error: {
      code,
      message: statusCode >= 500
        ? storageFailure
          ? "成績データへ接続できませんでした。少し待ってからもう一度お試しください。"
          : "AI採点を完了できませんでした。入力内容は保持されています。"
        : error.message,
    },
  }, origin);
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || "";
  if (origin && !allowedOrigins.has(origin)) {
    sendJson(response, 403, {
      error: { code: "ORIGIN_NOT_ALLOWED", message: "このサイトからは利用できません。" },
    });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, PUT, GET, OPTIONS",
      Vary: "Origin",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      status: "ok",
      scoringConfigured: Boolean(googleClientId && geminiApiKey),
      modelId: geminiModel,
      storageDriver,
      persistenceConfigured: storageDriver === "memory"
        || Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
    }, origin);
    return;
  }

  const url = new URL(request.url, "http://localhost");
  const ticketDetailMatch = url.pathname.match(/^\/api\/tickets\/([0-9a-f-]+)$/i);
  const ticketRevisionMatch = url.pathname.match(/^\/api\/tickets\/([0-9a-f-]+)\/revisions$/i);
  const reviewAttemptMatch = url.pathname.match(/^\/api\/attempts\/([0-9a-f-]+)\/review$/i);

  if (request.method === "GET" && url.pathname === "/api/me") {
    try {
      const user = await authenticateAndUpsertUser(request);
      sendJson(response, 200, { user }, origin);
    } catch (error) {
      sendError(response, error, origin, "me");
    }
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/me/ranking-profile") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const input = await readJson(request);
      const updatedUser = await storageRepository.updateRankingProfile(user.userId, input);
      sendJson(response, 200, { user: updatedUser }, origin);
    } catch (error) {
      sendError(response, error, origin, "ranking-profile");
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/attempts") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const attemptInput = await readJson(request);
      const attempt = createAttemptRecord(attemptInput, {
        userId: user.userId,
        attemptId: attemptInput.attemptId,
      });
      const storedAttempt = await storageRepository.appendAttempt(attempt);
      sendJson(response, 201, { attempt: toPublicAttempt(storedAttempt) }, origin);
    } catch (error) {
      sendError(response, error, origin, "attempt-create");
    }
    return;
  }

  if (request.method === "POST" && reviewAttemptMatch) {
    try {
      const user = await authenticateAndUpsertUser(request);
      const attempt = await storageRepository.getAttemptById(user.userId, reviewAttemptMatch[1]);
      if (!attempt) {
        const error = new Error("保存された起票が見つかりません。");
        error.code = "ATTEMPT_NOT_FOUND";
        throw error;
      }
      if (!isScoringSupported(attempt.scenarioId)) {
        const error = new Error("このシナリオはAI採点の対象外です。");
        error.code = "SCENARIO_NOT_SUPPORTED";
        throw error;
      }
      const existingResult = latestSuccessfulScoringResult(attempt);
      if (existingResult) {
        sendJson(response, 200, { scoringResult: existingResult }, origin);
        return;
      }
      const ticket = attempt.ticketId
        ? await storageRepository.getTicketById(user.userId, attempt.ticketId)
        : null;
      const matchedRevision = matchingScoredRevision(ticket, attempt);
      if (matchedRevision) {
        const scoringResult = createReusedScoringResult(
          attempt,
          latestSuccessfulScoringResult(matchedRevision)
        );
        await storageRepository.appendScoringResult(scoringResult);
        sendJson(response, 200, { scoringResult }, origin);
        return;
      }
      const previousAttempt = previousTicketRevision(ticket, attempt);
      const previousScoringResult = latestSuccessfulScoringResult(previousAttempt);
      enforceScoringRateLimit(user.userId);
      let scoringResult;
      try {
        scoringResult = await scoreAttemptRecordWithGemini(attempt, {
          apiKey: geminiApiKey,
          modelId: geminiModel,
          previousAttempt,
          previousScoringResult,
        });
      } catch (error) {
        const failedResult = createFailedScoringResult(attempt, error, { modelId: geminiModel });
        await storageRepository.appendScoringResult(failedResult);
        throw error;
      }
      await storageRepository.appendScoringResult(scoringResult);
      sendJson(response, 200, { scoringResult }, origin);
    } catch (error) {
      sendError(response, error, origin, "attempt-review");
    }
    return;
  }

  if (request.method === "POST" && ticketRevisionMatch) {
    try {
      const user = await authenticateAndUpsertUser(request);
      const ticket = await storageRepository.getTicketById(user.userId, ticketRevisionMatch[1]);
      if (!ticket || ticket.latestAttempt.authoringMode !== "practice") {
        const error = new Error("保存された起票が見つかりません。");
        error.code = "TICKET_NOT_FOUND";
        throw error;
      }
      const revisionInput = await readJson(request);
      const attempt = createAttemptRecord({
        ...revisionInput,
        scenarioId: ticket.latestAttempt.scenarioId,
        projectId: ticket.latestAttempt.projectId,
        authoringMode: "practice",
      }, {
        userId: user.userId,
        attemptId: revisionInput.attemptId,
        ticketId: ticketRevisionMatch[1],
      });
      const storedAttempt = await storageRepository.appendAttempt(attempt);
      sendJson(response, 201, { attempt: toPublicAttempt(storedAttempt) }, origin);
    } catch (error) {
      sendError(response, error, origin, "ticket-revision-create");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/tickets") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const tickets = await storageRepository.listTicketsByUser(user.userId, {
        limit: url.searchParams.get("limit"),
        cursor: url.searchParams.get("cursor"),
        projectId: url.searchParams.get("projectId") || "",
        tracker: new Set(["bug", "qa"]).has(url.searchParams.get("tracker"))
          ? url.searchParams.get("tracker")
          : "",
        authoringMode: "practice",
      });
      sendJson(response, 200, {
        items: tickets.items.map(toTicketSummary),
        nextCursor: tickets.nextCursor,
      }, origin);
    } catch (error) {
      sendError(response, error, origin, "tickets");
    }
    return;
  }

  if (request.method === "GET" && ticketDetailMatch) {
    try {
      const user = await authenticateAndUpsertUser(request);
      const ticket = await storageRepository.getTicketById(user.userId, ticketDetailMatch[1]);
      if (!ticket || ticket.latestAttempt.authoringMode !== "practice") {
        const error = new Error("保存された起票が見つかりません。");
        error.code = "TICKET_NOT_FOUND";
        throw error;
      }
      sendJson(response, 200, {
        ticket: toPublicAttempt(ticket.latestAttempt),
        revisions: ticket.revisions.map(toPublicAttempt),
      }, origin);
    } catch (error) {
      sendError(response, error, origin, "ticket-detail");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/history") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const history = await storageRepository.listAttemptsByUser(user.userId, {
        limit: url.searchParams.get("limit"),
        cursor: url.searchParams.get("cursor"),
      });
      sendJson(response, 200, {
        items: history.items.map(toPublicAttempt),
        nextCursor: history.nextCursor,
      }, origin);
    } catch (error) {
      sendError(response, error, origin, "history");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/progress") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const scenarios = await storageRepository.getScenarioProgress(user.userId);
      sendJson(response, 200, { scenarios }, origin);
    } catch (error) {
      sendError(response, error, origin, "progress");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/leaderboard") {
    try {
      const user = await authenticateAndUpsertUser(request);
      const leaderboard = await storageRepository.getLeaderboard({
        limit: url.searchParams.get("limit"),
        cursor: url.searchParams.get("cursor"),
        viewerUserId: user.userId,
      });
      sendJson(response, 200, leaderboard, origin);
    } catch (error) {
      sendError(response, error, origin, "leaderboard");
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/scoring") {
    try {
      const user = await authenticateAndUpsertUser(request);
      enforceScoringRateLimit(user.userId);
      const attemptInput = await readJson(request);
      if (!isScoringSupported(attemptInput.scenarioId)) {
        const error = new Error("このシナリオはAI採点の対象外です。");
        error.code = "SCENARIO_NOT_SUPPORTED";
        throw error;
      }
      const attempt = createAttemptRecord(attemptInput, {
        userId: user.userId,
        attemptId: attemptInput.attemptId,
      });
      await storageRepository.appendAttempt(attempt);

      let scoringResult;
      try {
        scoringResult = await scoreAttemptRecordWithGemini(attempt, {
          apiKey: geminiApiKey,
          modelId: geminiModel,
        });
      } catch (error) {
        const failedResult = createFailedScoringResult(attempt, error, {
          modelId: geminiModel,
        });
        try {
          await storageRepository.appendScoringResult(failedResult);
        } catch (storageError) {
          console.error(`[scoring-result] ${storageError.code || "STORAGE_FAILED"}: ${storageError.message}`);
        }
        throw error;
      }
      await storageRepository.appendScoringResult(scoringResult);
      const result = {
        attempt,
        scoringResult,
      };
      sendJson(response, 200, result, origin);
    } catch (error) {
      sendError(response, error, origin, "scoring");
    }
    return;
  }

  sendJson(response, 404, {
    error: { code: "NOT_FOUND", message: "Endpoint not found" },
  }, origin);
});

try {
  await storageRepository.initialize();
  server.listen(port, () => {
    console.log(`Typing Workbench backend listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(
    `[startup] ${error.code || "STORAGE_INITIALIZATION_FAILED"}: ${error.message}`
  );
  process.exitCode = 1;
}
