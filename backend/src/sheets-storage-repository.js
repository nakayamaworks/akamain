import { GoogleAuth, Impersonated } from "google-auth-library";
import {
  StorageRepository,
  buildLeaderboard,
  buildScenarioProgress,
  encodeCursor,
  groupResultsByAttempt,
  isAnonymousUserCreatedBefore,
  latestTicketRevision,
  normalizePageOptions,
  revisionNumberOf,
  storageError,
  ticketIdOf,
} from "./storage-repository.js";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const TAB_COLUMNS = {
  Users: [
    "schema_version",
    "user_id",
    "auth_provider",
    "provider_subject",
    "email",
    "email_verified",
    "display_name",
    "ranking_name",
    "ranking_opt_in",
    "created_at",
    "last_login_at",
    "updated_at",
  ],
  Attempts: [
    "schema_version",
    "attempt_id",
    "user_id",
    "scenario_id",
    "project_id",
    "authoring_mode",
    "answer_json",
    "selected_evidence_ids_json",
    "started_at",
    "completed_at",
    "ticket_number",
    "ticket_id",
    "revision_number",
    "parent_attempt_id",
    "evidence_descriptions_json",
  ],
  ScoringResults: [
    "schema_version",
    "scoring_result_id",
    "attempt_id",
    "status",
    "total_score",
    "dimensions_json",
    "verdict",
    "overall_assessment",
    "reader_questions_json",
    "ambiguity_risks_json",
    "investigation_advice_json",
    "rewrite_suggestions_json",
    "strengths_json",
    "rubric_version",
    "prompt_version",
    "model_id",
    "scored_at",
    "error_code",
    "rubric_findings_json",
    "dimension_feedback_json",
    "improvement_items_json",
  ],
};

function json(value) {
  return JSON.stringify(value ?? null);
}

function parseJson(value, fallback) {
  if (value === "" || value === undefined || value === null) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    throw storageError("STORAGE_DATA_INVALID", "Sheetsに不正なJSONデータがあります。");
  }
}

function bool(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function nullable(value) {
  return value === "" || value === undefined || value === null ? null : value;
}

function nullableNumber(value) {
  const normalized = nullable(value);
  return normalized === null ? null : Number(normalized);
}

function quoteTab(title) {
  return `'${title.replaceAll("'", "''")}'`;
}

function userToRow(user) {
  return [
    user.schemaVersion,
    user.userId,
    user.authProvider,
    user.providerSubject,
    user.email || "",
    user.emailVerified,
    user.displayName,
    user.rankingName || "",
    user.rankingOptIn,
    user.createdAt,
    user.lastLoginAt,
    user.updatedAt,
  ];
}

function rowToUser(row) {
  return {
    schemaVersion: row[0],
    userId: row[1],
    authProvider: row[2],
    providerSubject: row[3],
    email: nullable(row[4]),
    emailVerified: bool(row[5]),
    displayName: row[6],
    rankingName: nullable(row[7]),
    rankingOptIn: bool(row[8]),
    createdAt: row[9],
    lastLoginAt: row[10],
    updatedAt: row[11],
  };
}

export function attemptToRow(attempt) {
  return [
    attempt.schemaVersion,
    attempt.attemptId,
    attempt.userId,
    attempt.scenarioId,
    attempt.projectId,
    attempt.authoringMode,
    json(attempt.answer),
    json(attempt.selectedEvidenceIds),
    attempt.startedAt,
    attempt.completedAt,
    attempt.ticketNumber,
    attempt.ticketId,
    attempt.revisionNumber,
    attempt.parentAttemptId || "",
    json(attempt.evidenceDescriptions || {}),
  ];
}

export function rowToAttempt(row) {
  return {
    schemaVersion: row[0],
    attemptId: row[1],
    userId: row[2],
    scenarioId: row[3],
    projectId: row[4],
    authoringMode: row[5],
    answer: parseJson(row[6], { subject: "", sections: {} }),
    selectedEvidenceIds: parseJson(row[7], []),
    startedAt: row[8],
    completedAt: row[9],
    ticketNumber: nullableNumber(row[10]),
    ticketId: nullable(row[11]) || row[1],
    revisionNumber: nullableNumber(row[12]) || 1,
    parentAttemptId: nullable(row[13]),
    evidenceDescriptions: parseJson(row[14], {}),
  };
}

export function scoringResultToRow(result) {
  return [
    result.schemaVersion,
    result.scoringResultId,
    result.attemptId,
    result.status,
    result.totalScore ?? "",
    json(result.dimensions),
    result.verdict || "",
    result.overallAssessment || "",
    json(result.readerQuestions),
    json(result.ambiguityRisks),
    json(result.investigationAdvice),
    json(result.rewriteSuggestions),
    json(result.strengths),
    result.rubricVersion,
    result.promptVersion,
    result.modelId,
    result.scoredAt,
    result.errorCode || "",
    json(result.rubricFindings),
    json(result.dimensionFeedback),
    json(result.improvementItems),
  ];
}

export function rowToScoringResult(row) {
  return {
    schemaVersion: row[0],
    scoringResultId: row[1],
    attemptId: row[2],
    status: row[3],
    totalScore: nullableNumber(row[4]),
    dimensions: parseJson(row[5], {}),
    verdict: nullable(row[6]),
    overallAssessment: nullable(row[7]),
    readerQuestions: parseJson(row[8], []),
    ambiguityRisks: parseJson(row[9], []),
    investigationAdvice: parseJson(row[10], []),
    rewriteSuggestions: parseJson(row[11], []),
    strengths: parseJson(row[12], []),
    rubricVersion: row[13],
    promptVersion: row[14],
    modelId: row[15],
    scoredAt: row[16],
    errorCode: nullable(row[17]),
    rubricFindings: parseJson(row[18], null),
    dimensionFeedback: parseJson(row[19], {}),
    improvementItems: parseJson(row[20], []),
  };
}

export class SheetsStorageRepository extends StorageRepository {
  constructor(options = {}) {
    super();
    if (!options.spreadsheetId) {
      throw storageError("STORAGE_NOT_CONFIGURED", "GOOGLE_SHEETS_SPREADSHEET_ID is required");
    }
    this.spreadsheetId = options.spreadsheetId;
    this.impersonateServiceAccount = options.impersonateServiceAccount || "";
    this.now = options.now || (() => new Date().toISOString());
    this.auth = options.auth || new GoogleAuth({
      scopes: [this.impersonateServiceAccount
        ? "https://www.googleapis.com/auth/cloud-platform"
        : "https://www.googleapis.com/auth/spreadsheets"],
    });
    this.clientPromise = null;
    this.initializationPromise = null;
    this.writeQueue = Promise.resolve();
    this.userCache = new Map();
    this.userUpsertPromises = new Map();
    this.userCacheTtlMs = 5 * 60 * 1000;
    this.sheetIds = new Map();
  }

  async initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSpreadsheet()
        .catch((error) => {
          this.initializationPromise = null;
          throw this.wrapGoogleError(error);
        });
    }
    return this.initializationPromise;
  }

  async upsertUser(profile) {
    const cached = this.userCache.get(profile.userId);
    const profileMatches = cached
      && cached.user.displayName === (profile.displayName || "Googleユーザー")
      && cached.user.email === (profile.email || null)
      && cached.user.emailVerified === Boolean(profile.emailVerified);
    if (profileMatches && Date.now() - cached.cachedAt < this.userCacheTtlMs) {
      return cached.user;
    }
    const pending = this.userUpsertPromises.get(profile.userId);
    if (pending) {
      return pending;
    }
    const operation = this.withWriteLock(async () => {
      await this.initialize();
      const rows = await this.readDataRows("Users");
      const index = rows.findIndex((row) => row[1] === profile.userId);
      const existing = index >= 0 ? rowToUser(rows[index]) : null;
      const timestamp = profile.loginAt || this.now();
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
      if (index >= 0) {
        await this.updateRow("Users", index + 2, userToRow(user));
      } else {
        await this.appendRow("Users", userToRow(user));
      }
      return user;
    });
    this.userUpsertPromises.set(profile.userId, operation);
    try {
      const user = await operation;
      this.userCache.set(profile.userId, { user, cachedAt: Date.now() });
      return user;
    } finally {
      this.userUpsertPromises.delete(profile.userId);
    }
  }

  async getUser(userId) {
    await this.initialize();
    const row = (await this.readDataRows("Users")).find((item) => item[1] === userId);
    return row ? rowToUser(row) : null;
  }

  async listAnonymousUsersCreatedBefore(cutoff, options = {}) {
    await this.initialize();
    const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 1000);
    return (await this.readDataRows("Users"))
      .map(rowToUser)
      .filter((user) => isAnonymousUserCreatedBefore(user, cutoff))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, limit);
  }

  async deleteUsersData(userIds) {
    const requested = new Set((userIds || []).filter(Boolean));
    if (!requested.size) {
      return { deletedUserCount: 0, deletedAttemptCount: 0, deletedScoringResultCount: 0 };
    }
    return this.withWriteLock(async () => {
      await this.initialize();
      const [rawUserRows, rawAttemptRows, rawResultRows] = await Promise.all([
        this.readValues(`${quoteTab("Users")}!A2:L`),
        this.readValues(`${quoteTab("Attempts")}!A2:O`),
        this.readValues(`${quoteTab("ScoringResults")}!A2:U`),
      ]);
      const userRows = rawUserRows
        .map((row, index) => ({ row, rowNumber: index + 2 }))
        .filter(({ row }) => requested.has(row[1]) && row[2] === "anonymous");
      const deletable = new Set(userRows.map(({ row }) => row[1]));
      const attemptRows = rawAttemptRows
        .map((row, index) => ({ row, rowNumber: index + 2 }))
        .filter(({ row }) => deletable.has(row[2]));
      const attemptIds = new Set(attemptRows.map(({ row }) => row[1]));
      const resultRows = rawResultRows
        .map((row, index) => ({ row, rowNumber: index + 2 }))
        .filter(({ row }) => attemptIds.has(row[2]));
      const rowsToDelete = [
        ...resultRows.map(({ rowNumber }) => ({ title: "ScoringResults", rowNumber })),
        ...attemptRows.map(({ rowNumber }) => ({ title: "Attempts", rowNumber })),
        ...userRows.map(({ rowNumber }) => ({ title: "Users", rowNumber })),
      ];
      await this.deleteRows(rowsToDelete);
      deletable.forEach((userId) => this.userCache.delete(userId));
      return {
        deletedUserCount: userRows.length,
        deletedAttemptCount: attemptRows.length,
        deletedScoringResultCount: resultRows.length,
      };
    });
  }

  async updateRankingProfile(userId, input) {
    return this.withWriteLock(async () => {
      await this.initialize();
      const rows = await this.readDataRows("Users");
      const index = rows.findIndex((row) => row[1] === userId);
      if (index < 0) {
        throw storageError("USER_NOT_FOUND", "user was not found");
      }
      const rankingName = typeof input?.rankingName === "string" ? input.rankingName.trim() : "";
      if (rankingName.length > 24) {
        throw storageError("INVALID_RANKING_PROFILE", "ランキング名は24文字以内で入力してください。");
      }
      const rankingOptIn = Boolean(input?.rankingOptIn);
      if (rankingOptIn && !rankingName) {
        throw storageError("INVALID_RANKING_PROFILE", "ランキング参加には公開名が必要です。");
      }
      const user = {
        ...rowToUser(rows[index]),
        rankingName: rankingName || null,
        rankingOptIn,
        updatedAt: this.now(),
      };
      await this.updateRow("Users", index + 2, userToRow(user));
      this.userCache.set(userId, { user, cachedAt: Date.now() });
      return user;
    });
  }

  async mergeUserData(sourceUserId, targetUserId) {
    if (!sourceUserId || !targetUserId || sourceUserId === targetUserId) {
      return this.getUser(targetUserId);
    }
    return this.withWriteLock(async () => {
      await this.initialize();
      const userRows = await this.readDataRows("Users");
      const sourceIndex = userRows.findIndex((row) => row[1] === sourceUserId);
      const targetIndex = userRows.findIndex((row) => row[1] === targetUserId);
      if (targetIndex < 0) {
        throw storageError("USER_NOT_FOUND", "target user was not found");
      }
      const target = rowToUser(userRows[targetIndex]);
      if (sourceIndex < 0) {
        return target;
      }
      const source = rowToUser(userRows[sourceIndex]);
      const timestamp = this.now();
      const merged = {
        ...target,
        rankingName: target.rankingName || source.rankingName || null,
        rankingOptIn: target.rankingOptIn || source.rankingOptIn || false,
        createdAt: [target.createdAt, source.createdAt].filter(Boolean).sort()[0] || target.createdAt,
        updatedAt: timestamp,
      };
      await this.updateRow("Users", targetIndex + 2, userToRow(merged));
      await this.updateRow("Users", sourceIndex + 2, userToRow({
        ...source,
        authProvider: "merged",
        providerSubject: targetUserId,
        displayName: "統合済み",
        rankingName: null,
        rankingOptIn: false,
        updatedAt: timestamp,
      }));

      const attemptRows = await this.readDataRows("Attempts");
      for (let index = 0; index < attemptRows.length; index += 1) {
        if (attemptRows[index][2] !== sourceUserId) {
          continue;
        }
        const updatedRow = [...attemptRows[index]];
        updatedRow[2] = targetUserId;
        await this.updateRow("Attempts", index + 2, updatedRow);
      }
      this.userCache.delete(sourceUserId);
      this.userCache.set(targetUserId, { user: merged, cachedAt: Date.now() });
      return merged;
    });
  }

  async appendAttempt(attempt) {
    return this.withWriteLock(async () => {
      await this.initialize();
      const rows = await this.readDataRows("Attempts");
      const existingRow = rows.find((row) => row[1] === attempt.attemptId);
      if (existingRow && existingRow[2] === attempt.userId) {
        return rowToAttempt(existingRow);
      }
      if (existingRow) {
        throw storageError("DUPLICATE_ATTEMPT", "attemptId already exists");
      }
      const storedAttempts = rows.map(rowToAttempt);
      const requestedTicketId = ticketIdOf(attempt);
      const ticketAttempts = storedAttempts.filter(
        (stored) => ticketIdOf(stored) === requestedTicketId
      );
      if (ticketAttempts.some((stored) => stored.userId !== attempt.userId)) {
        throw storageError("TICKET_NOT_FOUND", "ticket was not found");
      }
      if (requestedTicketId !== attempt.attemptId && ticketAttempts.length === 0) {
        throw storageError("TICKET_NOT_FOUND", "ticket was not found");
      }
      const latestRevision = latestTicketRevision(ticketAttempts);
      const highestTicketNumber = storedAttempts.reduce((highest, stored) => {
        const value = Number(stored.ticketNumber);
        return Number.isSafeInteger(value) && value > highest ? value : highest;
      }, 40000);
      const numberedAttempt = {
        ...attempt,
        schemaVersion: "attempt.v3",
        ticketId: requestedTicketId,
        revisionNumber: latestRevision ? revisionNumberOf(latestRevision) + 1 : 1,
        parentAttemptId: latestRevision?.attemptId || null,
        ticketNumber: latestRevision?.ticketNumber || highestTicketNumber + 1,
      };
      await this.appendRow("Attempts", attemptToRow(numberedAttempt));
      return numberedAttempt;
    });
  }

  async appendScoringResult(result) {
    return this.withWriteLock(async () => {
      await this.initialize();
      const [attemptRows, resultRows] = await Promise.all([
        this.readDataRows("Attempts"),
        this.readDataRows("ScoringResults"),
      ]);
      if (!attemptRows.some((row) => row[1] === result.attemptId)) {
        throw storageError("ATTEMPT_NOT_FOUND", "attempt was not found");
      }
      if (resultRows.some((row) => row[1] === result.scoringResultId)) {
        throw storageError("DUPLICATE_SCORING_RESULT", "scoringResultId already exists");
      }
      await this.appendRow("ScoringResults", scoringResultToRow(result));
      return result;
    });
  }

  async listAttemptsByUser(userId, options = {}) {
    await this.initialize();
    const { limit, offset } = normalizePageOptions(options);
    const [attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const resultsByAttempt = groupResultsByAttempt(resultRows.map(rowToScoringResult));
    const all = attemptRows
      .map(rowToAttempt)
      .filter((attempt) => attempt.userId === userId)
      .filter((attempt) => !options.authoringMode || attempt.authoringMode === options.authoringMode)
      .filter((attempt) => !options.projectId || attempt.projectId === options.projectId)
      .filter((attempt) => !options.tracker || attempt.answer?.ticketFields?.tracker === options.tracker)
      .sort((left, right) =>
        right.completedAt.localeCompare(left.completedAt)
        || right.attemptId.localeCompare(left.attemptId)
      )
      .map((attempt) => ({
        ...attempt,
        scoringResults: resultsByAttempt.get(attempt.attemptId) || [],
      }));
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items,
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }

  async listTicketsByUser(userId, options = {}) {
    await this.initialize();
    const { limit, offset } = normalizePageOptions(options);
    const [attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const resultsByAttempt = groupResultsByAttempt(resultRows.map(rowToScoringResult));
    const grouped = new Map();
    attemptRows
      .map(rowToAttempt)
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
        ...attempt,
        scoringResults: resultsByAttempt.get(attempt.attemptId) || [],
      }));
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items,
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }

  async getAttemptById(userId, attemptId) {
    await this.initialize();
    const [attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const row = attemptRows.find((item) => item[1] === attemptId && item[2] === userId);
    if (!row) {
      return null;
    }
    const attempt = rowToAttempt(row);
    const scoringResults = resultRows
      .map(rowToScoringResult)
      .filter((result) => result.attemptId === attemptId)
      .sort((left, right) => right.scoredAt.localeCompare(left.scoredAt));
    return { ...attempt, scoringResults };
  }

  async getTicketById(userId, ticketId) {
    await this.initialize();
    const [attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const resultsByAttempt = groupResultsByAttempt(resultRows.map(rowToScoringResult));
    const revisions = attemptRows
      .map(rowToAttempt)
      .filter((attempt) => attempt.userId === userId && ticketIdOf(attempt) === ticketId)
      .sort((left, right) =>
        revisionNumberOf(left) - revisionNumberOf(right)
        || left.completedAt.localeCompare(right.completedAt)
      )
      .map((attempt) => ({
        ...attempt,
        scoringResults: resultsByAttempt.get(attempt.attemptId) || [],
      }));
    if (!revisions.length) {
      return null;
    }
    return {
      latestAttempt: latestTicketRevision(revisions),
      revisions,
    };
  }

  async getScenarioProgress(userId) {
    await this.initialize();
    const [attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const attempts = attemptRows.map(rowToAttempt).filter((attempt) => attempt.userId === userId);
    const attemptIds = new Set(attempts.map((attempt) => attempt.attemptId));
    const results = resultRows
      .map(rowToScoringResult)
      .filter((result) => attemptIds.has(result.attemptId));
    return buildScenarioProgress(attempts, results);
  }

  async getLeaderboard(options = {}) {
    await this.initialize();
    const { limit, offset } = normalizePageOptions(options);
    const [userRows, attemptRows, resultRows] = await Promise.all([
      this.readDataRows("Users"),
      this.readDataRows("Attempts"),
      this.readDataRows("ScoringResults"),
    ]);
    const all = buildLeaderboard(
      userRows.map(rowToUser),
      attemptRows.map(rowToAttempt),
      resultRows.map(rowToScoringResult),
      options.viewerUserId
    );
    const items = all.slice(offset, offset + limit);
    const nextOffset = offset + items.length;
    return {
      items,
      nextCursor: nextOffset < all.length ? encodeCursor(nextOffset) : null,
    };
  }

  async initializeSpreadsheet() {
    const client = await this.getClient();
    let metadata = await client.request({
      url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}?fields=sheets.properties(sheetId,title)`,
    });
    const existingTitles = new Set(
      (metadata.data.sheets || []).map((sheet) => sheet.properties.title)
    );
    const missingTitles = Object.keys(TAB_COLUMNS).filter((title) => !existingTitles.has(title));
    if (missingTitles.length) {
      await client.request({
        url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}:batchUpdate`,
        method: "POST",
        data: {
          requests: missingTitles.map((title) => ({ addSheet: { properties: { title } } })),
        },
      });
      metadata = await client.request({
        url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}?fields=sheets.properties(sheetId,title)`,
      });
    }
    this.sheetIds = new Map(
      (metadata.data.sheets || []).map((sheet) => [
        sheet.properties.title,
        sheet.properties.sheetId,
      ])
    );
    for (const [title, columns] of Object.entries(TAB_COLUMNS)) {
      const values = await this.readValues(`${quoteTab(title)}!1:1`);
      const header = values[0] || [];
      if (!header.length) {
        await this.writeValues(`${quoteTab(title)}!A1`, [columns]);
      } else if (
        header.length > columns.length
        || header.some((column, index) => columns[index] !== column)
      ) {
        throw storageError(
          "STORAGE_SCHEMA_MISMATCH",
          `${title}タブのヘッダーが保存契約と一致しません。`
        );
      } else if (header.length < columns.length) {
        await this.writeValues(`${quoteTab(title)}!A1`, [columns]);
      }
    }
    await this.backfillAttemptMetadata();
  }

  async backfillAttemptMetadata() {
    const rows = await this.readValues(`${quoteTab("Attempts")}!A2:N`);
    const highestExistingNumber = rows.reduce((highest, row) => {
      const value = Number(row[10]);
      return Number.isSafeInteger(value) && value > highest ? value : highest;
    }, 40000);
    const numberOwners = new Map();
    const ticketNumbers = new Map();
    let nextNumber = highestExistingNumber;
    let changed = false;
    const metadataColumns = rows.map((row) => {
      if (!row[1]) {
        return [row[10] || "", row[11] || "", row[12] || "", row[13] || ""];
      }
      const existing = Number(row[10]);
      const ticketId = row[11] || row[1];
      const existingOwner = numberOwners.get(existing);
      if (
        Number.isSafeInteger(existing)
        && existing > 0
        && (!existingOwner || existingOwner === ticketId)
      ) {
        numberOwners.set(existing, ticketId);
        ticketNumbers.set(ticketId, existing);
        const revisionNumber = Number(row[12]) || 1;
        if (!row[11] || !row[12]) {
          changed = true;
        }
        return [existing, ticketId, revisionNumber, row[13] || ""];
      }
      if (ticketNumbers.has(ticketId)) {
        changed = true;
        return [ticketNumbers.get(ticketId), ticketId, Number(row[12]) || 1, row[13] || ""];
      }
      do {
        nextNumber += 1;
      } while (numberOwners.has(nextNumber));
      numberOwners.set(nextNumber, ticketId);
      ticketNumbers.set(ticketId, nextNumber);
      changed = true;
      return [nextNumber, ticketId, Number(row[12]) || 1, row[13] || ""];
    });
    if (changed && metadataColumns.length > 0) {
      await this.writeValues(`${quoteTab("Attempts")}!K2`, metadataColumns);
    }
  }

  async readDataRows(title) {
    const rows = await this.readValues(`${quoteTab(title)}!A2:ZZ`);
    return rows.filter((row) => row.some((value) => value !== ""));
  }

  async appendRow(title, row) {
    const client = await this.getClient();
    await client.request({
      url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}/values/${encodeURIComponent(`${quoteTab(title)}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      method: "POST",
      data: { values: [row] },
    });
  }

  async updateRow(title, rowNumber, row) {
    await this.writeValues(`${quoteTab(title)}!A${rowNumber}`, [row]);
  }

  async readValues(range) {
    const client = await this.getClient();
    const response = await client.request({
      url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}/values/${encodeURIComponent(range)}`,
    });
    return response.data.values || [];
  }

  async writeValues(range, values) {
    const client = await this.getClient();
    await client.request({
      url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      method: "PUT",
      data: { values },
    });
  }

  async deleteRows(rows) {
    if (!rows.length) {
      return;
    }
    const ordered = [...rows].sort((left, right) =>
      left.title.localeCompare(right.title) || right.rowNumber - left.rowNumber
    );
    const requests = ordered.map(({ title, rowNumber }) => {
      const sheetId = this.sheetIds.get(title);
      if (!Number.isInteger(sheetId)) {
        throw storageError("STORAGE_SCHEMA_MISMATCH", `${title}タブのsheetIdが見つかりません。`);
      }
      return {
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      };
    });
    const client = await this.getClient();
    await client.request({
      url: `${SHEETS_API}/${encodeURIComponent(this.spreadsheetId)}:batchUpdate`,
      method: "POST",
      data: { requests },
    });
  }

  async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = this.createClient();
    }
    return this.clientPromise;
  }

  async createClient() {
    const sourceClient = await this.auth.getClient();
    if (!this.impersonateServiceAccount) {
      return sourceClient;
    }
    return new Impersonated({
      sourceClient,
      targetPrincipal: this.impersonateServiceAccount,
      targetScopes: ["https://www.googleapis.com/auth/spreadsheets"],
      lifetime: 3600,
    });
  }

  withWriteLock(operation) {
    const result = this.writeQueue.then(operation, operation);
    this.writeQueue = result.catch(() => {});
    return result.catch((error) => {
      throw this.wrapGoogleError(error);
    });
  }

  wrapGoogleError(error) {
    if (error?.code && typeof error.code === "string") {
      return error;
    }
    const wrapped = new Error("Google Sheetsへ接続できませんでした。", { cause: error });
    wrapped.code = "STORAGE_UNAVAILABLE";
    return wrapped;
  }
}

export { TAB_COLUMNS };
