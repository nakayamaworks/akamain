import {
  StorageRepository,
  buildLeaderboard,
  buildScenarioProgress,
  encodeCursor,
  groupResultsByAttempt,
  latestTicketRevision,
  normalizePageOptions,
  revisionNumberOf,
  storageError,
  ticketIdOf,
} from "./storage-repository.js";

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export class MemoryStorageRepository extends StorageRepository {
  constructor(options = {}) {
    super();
    this.now = options.now || (() => new Date().toISOString());
    this.users = new Map();
    this.attempts = [];
    this.scoringResults = [];
  }

  async upsertUser(profile) {
    if (!profile?.userId) {
      throw storageError("INVALID_USER", "userId is required");
    }
    const timestamp = profile.loginAt || this.now();
    const existing = this.users.get(profile.userId);
    const user = {
      schemaVersion: "user.v1",
      userId: profile.userId,
      authProvider: profile.authProvider || "google",
      providerSubject: profile.providerSubject || profile.userId,
      email: profile.email || null,
      emailVerified: Boolean(profile.emailVerified),
      displayName: profile.displayName || "Googleユーザー",
      rankingName: existing?.rankingName || null,
      rankingOptIn: existing?.rankingOptIn || false,
      createdAt: existing?.createdAt || timestamp,
      lastLoginAt: timestamp,
      updatedAt: timestamp,
    };
    this.users.set(user.userId, user);
    return clone(user);
  }

  async getUser(userId) {
    return clone(this.users.get(userId) || null);
  }

  async updateRankingProfile(userId, input) {
    const existing = this.users.get(userId);
    if (!existing) {
      throw storageError("USER_NOT_FOUND", "user was not found");
    }
    const rankingName = typeof input?.rankingName === "string"
      ? input.rankingName.trim()
      : "";
    if (rankingName.length > 24) {
      throw storageError("INVALID_RANKING_PROFILE", "ランキング名は24文字以内で入力してください。");
    }
    const rankingOptIn = Boolean(input?.rankingOptIn);
    if (rankingOptIn && !rankingName) {
      throw storageError("INVALID_RANKING_PROFILE", "ランキング参加には公開名が必要です。");
    }
    const updated = {
      ...existing,
      rankingName: rankingName || null,
      rankingOptIn,
      updatedAt: this.now(),
    };
    this.users.set(userId, updated);
    return clone(updated);
  }

  async mergeUserData(sourceUserId, targetUserId) {
    if (!sourceUserId || !targetUserId || sourceUserId === targetUserId) {
      return this.getUser(targetUserId);
    }
    const source = this.users.get(sourceUserId);
    const target = this.users.get(targetUserId);
    if (!target) {
      throw storageError("USER_NOT_FOUND", "target user was not found");
    }
    if (!source) {
      return clone(target);
    }
    this.attempts = this.attempts.map((attempt) =>
      attempt.userId === sourceUserId ? { ...attempt, userId: targetUserId } : attempt
    );
    const merged = {
      ...target,
      rankingName: target.rankingName || source.rankingName || null,
      rankingOptIn: target.rankingOptIn || source.rankingOptIn || false,
      createdAt: [target.createdAt, source.createdAt].filter(Boolean).sort()[0] || target.createdAt,
      updatedAt: this.now(),
    };
    this.users.set(targetUserId, merged);
    this.users.delete(sourceUserId);
    return clone(merged);
  }

  async appendAttempt(attempt) {
    const existing = this.attempts.find((stored) => stored.attemptId === attempt?.attemptId);
    if (existing?.userId === attempt?.userId) {
      return clone(existing);
    }
    if (existing) {
      throw storageError("DUPLICATE_ATTEMPT", "attemptId already exists");
    }
    const requestedTicketId = ticketIdOf(attempt);
    const ticketAttempts = this.attempts.filter(
      (stored) => ticketIdOf(stored) === requestedTicketId
    );
    if (ticketAttempts.some((stored) => stored.userId !== attempt.userId)) {
      throw storageError("TICKET_NOT_FOUND", "ticket was not found");
    }
    if (requestedTicketId !== attempt.attemptId && ticketAttempts.length === 0) {
      throw storageError("TICKET_NOT_FOUND", "ticket was not found");
    }
    const latestRevision = latestTicketRevision(ticketAttempts);
    const existingTicketNumbers = new Set(
      this.attempts.map((stored) => stored.ticketNumber).filter(Number.isSafeInteger)
    );
    let nextTicketNumber = 40001;
    while (existingTicketNumbers.has(nextTicketNumber)) {
      nextTicketNumber += 1;
    }
    const numberedAttempt = {
      ...attempt,
      schemaVersion: "attempt.v3",
      ticketId: requestedTicketId,
      revisionNumber: latestRevision ? revisionNumberOf(latestRevision) + 1 : 1,
      parentAttemptId: latestRevision?.attemptId || null,
      ticketNumber: latestRevision?.ticketNumber || nextTicketNumber,
    };
    this.attempts.push(clone(numberedAttempt));
    return clone(numberedAttempt);
  }

  async appendScoringResult(result) {
    if (!this.attempts.some((attempt) => attempt.attemptId === result?.attemptId)) {
      throw storageError("ATTEMPT_NOT_FOUND", "attempt was not found");
    }
    if (this.scoringResults.some((stored) => stored.scoringResultId === result?.scoringResultId)) {
      throw storageError("DUPLICATE_SCORING_RESULT", "scoringResultId already exists");
    }
    this.scoringResults.push(clone(result));
    return clone(result);
  }

  async listAttemptsByUser(userId, options = {}) {
    const { limit, offset } = normalizePageOptions(options);
    const resultsByAttempt = groupResultsByAttempt(this.scoringResults);
    const all = this.attempts
      .filter((attempt) => attempt.userId === userId)
      .filter((attempt) => !options.authoringMode || attempt.authoringMode === options.authoringMode)
      .filter((attempt) => !options.projectId || attempt.projectId === options.projectId)
      .filter((attempt) => !options.tracker || attempt.answer?.ticketFields?.tracker === options.tracker)
      .sort((left, right) =>
        right.completedAt.localeCompare(left.completedAt)
        || right.attemptId.localeCompare(left.attemptId)
      )
      .map((attempt) => ({
        ...clone(attempt),
        scoringResults: clone(resultsByAttempt.get(attempt.attemptId) || []),
      }));
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items,
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }

  async listTicketsByUser(userId, options = {}) {
    const { limit, offset } = normalizePageOptions(options);
    const resultsByAttempt = groupResultsByAttempt(this.scoringResults);
    const grouped = new Map();
    this.attempts
      .filter((attempt) => attempt.userId === userId)
      .filter((attempt) => !options.authoringMode || attempt.authoringMode === options.authoringMode)
      .filter((attempt) => !options.projectId || attempt.projectId === options.projectId)
      .filter((attempt) => !options.tracker || attempt.answer?.ticketFields?.tracker === options.tracker)
      .forEach((attempt) => {
        const ticketId = ticketIdOf(attempt);
        const current = grouped.get(ticketId) || [];
        current.push(attempt);
        grouped.set(ticketId, current);
      });
    const all = [...grouped.values()]
      .map(latestTicketRevision)
      .sort((left, right) =>
        right.completedAt.localeCompare(left.completedAt)
        || right.attemptId.localeCompare(left.attemptId)
      )
      .map((attempt) => ({
        ...clone(attempt),
        scoringResults: clone(resultsByAttempt.get(attempt.attemptId) || []),
      }));
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items,
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }

  async getAttemptById(userId, attemptId) {
    const attempt = this.attempts.find(
      (item) => item.userId === userId && item.attemptId === attemptId
    );
    if (!attempt) {
      return null;
    }
    const results = this.scoringResults
      .filter((result) => result.attemptId === attemptId)
      .sort((left, right) => right.scoredAt.localeCompare(left.scoredAt));
    return clone({ ...attempt, scoringResults: results });
  }

  async getTicketById(userId, ticketId) {
    const resultsByAttempt = groupResultsByAttempt(this.scoringResults);
    const revisions = this.attempts
      .filter((attempt) => attempt.userId === userId && ticketIdOf(attempt) === ticketId)
      .sort((left, right) =>
        revisionNumberOf(left) - revisionNumberOf(right)
        || left.completedAt.localeCompare(right.completedAt)
      )
      .map((attempt) => ({
        ...clone(attempt),
        scoringResults: clone(resultsByAttempt.get(attempt.attemptId) || []),
      }));
    if (!revisions.length) {
      return null;
    }
    return clone({
      latestAttempt: latestTicketRevision(revisions),
      revisions,
    });
  }

  async getScenarioProgress(userId) {
    const userAttempts = this.attempts.filter((attempt) => attempt.userId === userId);
    const attemptIds = new Set(userAttempts.map((attempt) => attempt.attemptId));
    const results = this.scoringResults.filter((result) => attemptIds.has(result.attemptId));
    return clone(buildScenarioProgress(userAttempts, results));
  }

  async getLeaderboard(options = {}) {
    const { limit, offset } = normalizePageOptions(options);
    const all = buildLeaderboard(
      [...this.users.values()],
      this.attempts,
      this.scoringResults,
      options.viewerUserId
    );
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items: clone(items),
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }
}
