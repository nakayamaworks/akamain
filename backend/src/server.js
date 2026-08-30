import http from "node:http";
import { OAuth2Client } from "google-auth-library";
import {
  DEFAULT_MODEL,
  attemptContentFingerprint,
  createAttemptRecord,
  createFailedScoringResult,
  createReusedScoringResult,
  isScoringResultCompatible,
  isScoringSupported,
  scoreAttemptRecordWithGemini,
} from "./scoring-service.js";
import { createStorageRepository } from "./storage-factory.js";
import { createScoringRateLimiter } from "./scoring-rate-limiter.js";
import {
  anonymousCleanupConfiguration,
  cleanupExpiredAnonymousUsers,
} from "./anonymous-user-cleanup.js";
import { verifyCleanupAuthorization } from "./cleanup-authorization.js";
import { FirebaseAuthDirectory } from "./firebase-auth-directory.js";

const port = Number(process.env.PORT || 8787);
const googleClientId = process.env.GOOGLE_WEB_CLIENT_ID || "";
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
  || process.env.GOOGLE_CLOUD_PROJECT
  || "typing-workbench-misemaru";
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
const firebaseAuthClient = new OAuth2Client();
let firebaseCertificates = null;
let firebaseCertificatesExpireAt = 0;
const scoringRateLimiter = createScoringRateLimiter();
const anonymousCleanup = anonymousCleanupConfiguration();
const cleanupServiceAccountEmail = process.env.CLEANUP_SERVICE_ACCOUNT_EMAIL || "";
const cleanupOidcAudience = process.env.CLEANUP_OIDC_AUDIENCE || "";
const cleanupOidcClient = new OAuth2Client();
const firebaseAuthDirectory = new FirebaseAuthDirectory({ projectId: firebaseProjectId });

function latestCompatibleScoringResult(attempt) {
  return (attempt?.scoringResults || []).find(
    (result) => isScoringResultCompatible(result, attempt, { modelId: geminiModel })
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
      && latestCompatibleScoringResult(revision)
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

function bearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

function unverifiedTokenPayload(idToken) {
  try {
    return JSON.parse(Buffer.from(String(idToken).split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function verifyGoogleUserToken(idToken) {
  if (!googleClientId) {
    const error = new Error("Googleログインのバックエンド設定がありません。");
    error.code = "AUTH_NOT_CONFIGURED";
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

async function verifyFirebaseUserToken(idToken) {
  let payload;
  try {
    if (!firebaseCertificates || Date.now() >= firebaseCertificatesExpireAt) {
      const response = await fetch(
        "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
      );
      if (!response.ok) {
        throw new Error("Firebase signing certificates are unavailable");
      }
      firebaseCertificates = await response.json();
      const maximumAge = Number.parseInt(
        response.headers.get("cache-control")?.match(/max-age=(\d+)/)?.[1] || "3600",
        10
      );
      firebaseCertificatesExpireAt = Date.now() + maximumAge * 1000;
    }
    const ticket = await firebaseAuthClient.verifySignedJwtWithCertsAsync(
      idToken,
      firebaseCertificates,
      firebaseProjectId,
      [`https://securetoken.google.com/${firebaseProjectId}`]
    );
    payload = ticket.getPayload();
  } catch {
    const error = new Error("利用者情報を確認できませんでした。再読み込みしてください。");
    error.code = "INVALID_ID_TOKEN";
    throw error;
  }
  if (!payload?.sub || payload.sub.length > 128) {
    const error = new Error("利用者情報を確認できませんでした。再読み込みしてください。");
    error.code = "INVALID_ID_TOKEN";
    throw error;
  }
  const signInProvider = payload.firebase?.sign_in_provider || "";
  const googleSubject = payload.firebase?.identities?.["google.com"]?.[0] || null;
  const anonymous = signInProvider === "anonymous";
  return {
    userId: `firebase:${payload.sub}`,
    authProvider: anonymous ? "anonymous" : googleSubject ? "google" : signInProvider || "firebase",
    providerSubject: googleSubject || payload.sub,
    email: payload.email_verified ? payload.email || null : null,
    emailVerified: Boolean(payload.email_verified),
    displayName: anonymous ? "ゲスト" : payload.name || "Googleユーザー",
    legacyUserId: googleSubject,
    anonymous,
  };
}

async function verifyAuthenticatedUser(request) {
  const idToken = bearerToken(request);
  if (!idToken) {
    const error = new Error("利用者情報が必要です。再読み込みしてください。");
    error.code = "AUTH_REQUIRED";
    throw error;
  }
  const issuer = unverifiedTokenPayload(idToken)?.iss || "";
  if (issuer.startsWith("https://securetoken.google.com/")) {
    return verifyFirebaseUserToken(idToken);
  }
  return verifyGoogleUserToken(idToken);
}

async function authenticateAndUpsertUser(request) {
  const verifiedUser = await verifyAuthenticatedUser(request);
  let user = await storageRepository.upsertUser(verifiedUser);
  if (verifiedUser.legacyUserId && verifiedUser.legacyUserId !== verifiedUser.userId) {
    const legacyUser = await storageRepository.getUser(verifiedUser.legacyUserId);
    if (legacyUser && legacyUser.authProvider !== "merged") {
      user = await storageRepository.mergeUserData(verifiedUser.legacyUserId, verifiedUser.userId);
    }
  }
  return user;
}

function requestIpAddress(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || request.socket?.remoteAddress || "unknown";
}

async function enforceScoringRateLimit(userId, request) {
  await scoringRateLimiter.consume({
    userId,
    ipAddress: requestIpAddress(request),
  });
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
    trainingLevel: attempt.answer?.trainingLevel || "advanced",
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
  if (new Set([
    "AUTH_REQUIRED",
    "CLEANUP_AUTH_INVALID",
    "CLEANUP_AUTH_REQUIRED",
    "INVALID_ID_TOKEN",
  ]).has(code)) {
    return 401;
  }
  if (new Set([
    "AUTH_NOT_CONFIGURED",
    "CLEANUP_AUTH_NOT_CONFIGURED",
    "INVALID_CURSOR",
    "INVALID_JSON",
    "INVALID_RANKING_PROFILE",
    "INVALID_REQUEST",
    "INVALID_SOURCE_IDENTITY",
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
  const causeMessage = error.cause?.message ? ` (${error.cause.message})` : "";
  console.error(`[${context}] ${code}: ${error.message}${causeMessage}`);
  const storageFailure = code.startsWith("STORAGE_");
  const cleanupFailure = context === "anonymous-cleanup";
  sendJson(response, statusCode, {
    error: {
      code,
      message: statusCode >= 500
        ? cleanupFailure
          ? "ゲストデータの定期削除を完了できませんでした。"
          : storageFailure
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
      scoringConfigured: Boolean(geminiApiKey),
      firebaseAuthentication: true,
      modelId: geminiModel,
      storageDriver,
      persistenceConfigured: storageDriver === "memory"
        || Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID),
      anonymousCleanupConfigured: Boolean(cleanupServiceAccountEmail && cleanupOidcAudience),
    }, origin);
    return;
  }

  const url = new URL(request.url, "http://localhost");
  const ticketDetailMatch = url.pathname.match(/^\/api\/tickets\/([0-9a-f-]+)$/i);
  const ticketRevisionMatch = url.pathname.match(/^\/api\/tickets\/([0-9a-f-]+)\/revisions$/i);
  const reviewAttemptMatch = url.pathname.match(/^\/api\/attempts\/([0-9a-f-]+)\/review$/i);

  if (request.method === "POST" && url.pathname === "/internal/cleanup/anonymous-users") {
    try {
      await verifyCleanupAuthorization(bearerToken(request), {
        client: cleanupOidcClient,
        audience: cleanupOidcAudience,
        expectedEmail: cleanupServiceAccountEmail,
      });
      const summary = await cleanupExpiredAnonymousUsers({
        storageRepository,
        firebaseAuthDirectory,
        retentionDays: anonymousCleanup.retentionDays,
        batchSize: anonymousCleanup.batchSize,
      });
      console.log(`[anonymous-cleanup] ${JSON.stringify(summary)}`);
      sendJson(response, 200, { status: "ok", ...summary }, origin);
    } catch (error) {
      sendError(response, error, origin, "anonymous-cleanup");
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/me") {
    try {
      const user = await authenticateAndUpsertUser(request);
      sendJson(response, 200, { user }, origin);
    } catch (error) {
      sendError(response, error, origin, "me");
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/identity/claim") {
    try {
      const target = await verifyAuthenticatedUser(request);
      if (target.anonymous || target.authProvider === "anonymous") {
        const error = new Error("Google連携済みの利用者情報が必要です。");
        error.code = "INVALID_SOURCE_IDENTITY";
        throw error;
      }
      let targetUser = await storageRepository.upsertUser(target);
      if (target.legacyUserId && target.legacyUserId !== target.userId) {
        const legacyUser = await storageRepository.getUser(target.legacyUserId);
        if (legacyUser && legacyUser.authProvider !== "merged") {
          targetUser = await storageRepository.mergeUserData(target.legacyUserId, target.userId);
        }
      }
      const input = await readJson(request);
      const source = await verifyFirebaseUserToken(String(input.anonymousIdToken || ""));
      if (!source.anonymous || source.userId === target.userId) {
        const error = new Error("引き継ぎ元のゲスト情報を確認できませんでした。");
        error.code = "INVALID_SOURCE_IDENTITY";
        throw error;
      }
      await storageRepository.upsertUser(source);
      targetUser = await storageRepository.mergeUserData(source.userId, target.userId);
      sendJson(response, 200, { user: targetUser }, origin);
    } catch (error) {
      sendError(response, error, origin, "identity-claim");
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
      const existingResult = latestCompatibleScoringResult(attempt);
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
          latestCompatibleScoringResult(matchedRevision)
        );
        await storageRepository.appendScoringResult(scoringResult);
        sendJson(response, 200, { scoringResult }, origin);
        return;
      }
      const previousAttempt = previousTicketRevision(ticket, attempt);
      const previousScoringResult = latestCompatibleScoringResult(previousAttempt);
      await enforceScoringRateLimit(user.userId, request);
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
      await enforceScoringRateLimit(user.userId, request);
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
