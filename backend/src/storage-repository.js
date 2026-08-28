export const ACHIEVEMENT_SCORE = 80;

export class StorageRepository {
  async initialize() {}

  async upsertUser() {
    throw new Error("upsertUser is not implemented");
  }

  async getUser() {
    throw new Error("getUser is not implemented");
  }

  async updateRankingProfile() {
    throw new Error("updateRankingProfile is not implemented");
  }

  async mergeUserData() {
    throw new Error("mergeUserData is not implemented");
  }

  async appendAttempt() {
    throw new Error("appendAttempt is not implemented");
  }

  async appendScoringResult() {
    throw new Error("appendScoringResult is not implemented");
  }

  async listAttemptsByUser() {
    throw new Error("listAttemptsByUser is not implemented");
  }

  async listTicketsByUser() {
    throw new Error("listTicketsByUser is not implemented");
  }

  async getAttemptById() {
    throw new Error("getAttemptById is not implemented");
  }

  async getTicketById() {
    throw new Error("getTicketById is not implemented");
  }

  async getScenarioProgress() {
    throw new Error("getScenarioProgress is not implemented");
  }

  async getLeaderboard() {
    throw new Error("getLeaderboard is not implemented");
  }
}

export function normalizePageOptions(options = {}) {
  const requestedLimit = Number(options.limit || 20);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 20;
  return {
    limit,
    offset: decodeCursor(options.cursor),
  };
}

export function encodeCursor(offset) {
  if (!Number.isInteger(offset) || offset < 0) {
    throw storageError("INVALID_CURSOR", "cursor offset must be a non-negative integer");
  }
  return Buffer.from(JSON.stringify({ offset }), "utf8").toString("base64url");
}

export function decodeCursor(cursor) {
  if (!cursor) {
    return 0;
  }
  try {
    const value = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    if (!Number.isInteger(value.offset) || value.offset < 0) {
      throw new Error("invalid offset");
    }
    return value.offset;
  } catch {
    throw storageError("INVALID_CURSOR", "cursor is invalid");
  }
}

export function buildScenarioProgress(attempts, scoringResults) {
  const resultsByAttempt = groupResultsByAttempt(scoringResults);
  const attemptsByScenario = new Map();

  attempts
    .filter((attempt) => attempt.authoringMode === "practice")
    .forEach((attempt) => {
      const current = attemptsByScenario.get(attempt.scenarioId) || [];
      current.push(attempt);
      attemptsByScenario.set(attempt.scenarioId, current);
    });

  return [...attemptsByScenario.entries()]
    .map(([scenarioId, scenarioAttempts]) => {
      const successfulResults = scenarioAttempts.flatMap((attempt) =>
        (resultsByAttempt.get(attempt.attemptId) || [])
          .filter((result) => result.status === "succeeded" && Number.isInteger(result.totalScore))
      );
      const bestScore = successfulResults.length
        ? Math.max(...successfulResults.map((result) => result.totalScore))
        : null;
      const latestAttempt = [...scenarioAttempts]
        .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0];
      const latestAttemptAt = latestAttempt.completedAt;
      const latestResult = (resultsByAttempt.get(latestAttempt.attemptId) || [])
        .find((result) => result.status === "succeeded" && Number.isInteger(result.totalScore));
      const latestScore = latestResult?.totalScore ?? null;

      return {
        scenarioId,
        status: bestScore === null
          ? "scoring_pending"
          : bestScore >= ACHIEVEMENT_SCORE
            ? "achieved"
            : "in_progress",
        attemptCount: scenarioAttempts.length,
        bestScore,
        latestScore,
        latestAttemptAt,
      };
    })
    .sort((left, right) => left.scenarioId.localeCompare(right.scenarioId));
}

export function buildLeaderboard(users, attempts, scoringResults, viewerUserId = "") {
  const resultsByAttempt = groupResultsByAttempt(scoringResults);
  const attemptsByUser = new Map();
  attempts
    .filter((attempt) =>
      attempt.authoringMode === "practice"
      && (attempt.revisionNumber || 1) === 1
      && attempt.answer?.ticketFields?.tracker !== "qa"
    )
    .forEach((attempt) => {
      const current = attemptsByUser.get(attempt.userId) || [];
      current.push(attempt);
      attemptsByUser.set(attempt.userId, current);
    });

  const entries = users
    .filter((user) => user.rankingOptIn && user.rankingName)
    .map((user) => {
      const bestByScenario = new Map();
      for (const attempt of attemptsByUser.get(user.userId) || []) {
        for (const result of resultsByAttempt.get(attempt.attemptId) || []) {
          if (result.status !== "succeeded" || !Number.isInteger(result.totalScore)) {
            continue;
          }
          const previous = bestByScenario.get(attempt.scenarioId);
          if (previous === undefined || result.totalScore > previous) {
            bestByScenario.set(attempt.scenarioId, result.totalScore);
          }
        }
      }
      const scores = [...bestByScenario.values()];
      return {
        rankingName: user.rankingName,
        isVerified: user.authProvider !== "anonymous",
        achievementPoints: scores.reduce((total, score) => total + score, 0),
        achievedScenarioCount: scores.filter((score) => score >= ACHIEVEMENT_SCORE).length,
        scoredScenarioCount: scores.length,
        isCurrentUser: user.userId === viewerUserId,
      };
    })
    .sort((left, right) =>
      right.achievementPoints - left.achievementPoints
      || right.achievedScenarioCount - left.achievedScenarioCount
      || left.rankingName.localeCompare(right.rankingName, "ja")
    );

  let previous = null;
  return entries.map((entry, index) => {
    const tied = previous
      && previous.achievementPoints === entry.achievementPoints
      && previous.achievedScenarioCount === entry.achievedScenarioCount;
    const ranked = { ...entry, rank: tied ? previous.rank : index + 1 };
    previous = ranked;
    return ranked;
  });
}

export function ticketIdOf(attempt) {
  return attempt?.ticketId || attempt?.attemptId || "";
}

export function revisionNumberOf(attempt) {
  return Number.isInteger(attempt?.revisionNumber) && attempt.revisionNumber > 0
    ? attempt.revisionNumber
    : 1;
}

export function latestTicketRevision(attempts) {
  return [...attempts].sort((left, right) =>
    revisionNumberOf(right) - revisionNumberOf(left)
    || String(right.completedAt || "").localeCompare(String(left.completedAt || ""))
    || String(right.attemptId || "").localeCompare(String(left.attemptId || ""))
  )[0] || null;
}

export function groupResultsByAttempt(scoringResults) {
  const grouped = new Map();
  for (const result of scoringResults) {
    const current = grouped.get(result.attemptId) || [];
    current.push(result);
    grouped.set(result.attemptId, current);
  }
  for (const results of grouped.values()) {
    results.sort((left, right) => right.scoredAt.localeCompare(left.scoredAt));
  }
  return grouped;
}

export function storageError(code, message) {
  return Object.assign(new Error(message), { code });
}
