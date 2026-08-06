import crypto from "node:crypto";
import { SheetsStorageRepository } from "../src/sheets-storage-repository.js";

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const impersonateServiceAccount = process.env.GOOGLE_IMPERSONATE_SERVICE_ACCOUNT || "";

if (!spreadsheetId) {
  throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID is required");
}

const repository = new SheetsStorageRepository({
  spreadsheetId,
  impersonateServiceAccount,
});

const suffix = crypto.randomUUID();
const userId = `integration-user-${suffix}`;
const attemptId = `integration-attempt-${suffix}`;
const scoringResultId = `integration-score-${suffix}`;

const createdRows = [];

async function rememberRow(tab, id) {
  const rows = await repository.readValues(`'${tab}'!A2:ZZ`);
  const index = rows.findIndex((row) => row[1] === id);
  if (index < 0) {
    throw new Error(`${tab} row was not found after writing`);
  }
  createdRows.push({ tab, rowNumber: index + 2 });
}

async function clearCreatedRows() {
  const client = await repository.getClient();
  for (const { tab, rowNumber } of createdRows.reverse()) {
    const range = `'${tab}'!A${rowNumber}:ZZ${rowNumber}`;
    await client.request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:clear`,
      method: "POST",
    });
  }
}

try {
  await repository.initialize();

  await repository.upsertUser({
    userId,
    providerSubject: userId,
    email: "integration-test@example.invalid",
    emailVerified: true,
    displayName: "Integration Test",
  });
  await rememberRow("Users", userId);

  await repository.updateRankingProfile(userId, {
    rankingName: "接続テスト",
    rankingOptIn: true,
  });

  await repository.appendAttempt({
    schemaVersion: "attempt.v2",
    attemptId,
    userId,
    scenarioId: "integration-scenario",
    projectId: "integration-project",
    authoringMode: "practice",
    answer: {
      subject: "接続テスト",
      sections: { detail: "接続テスト" },
      ticketFields: {
        tracker: "bug",
        private: false,
        status: "new",
        severity: "s3",
        priority: "normal",
        assigneeId: "integration-member",
        category: "workflow",
        version: "integration-version",
        environment: "integration-environment",
        startDate: "2026-08-01",
        dueDate: null,
        progress: 0,
        watcherIds: [],
      },
    },
    selectedEvidenceIds: [],
    startedAt: "2026-08-01T00:00:00.000Z",
    completedAt: "2026-08-01T00:01:00.000Z",
  });
  await rememberRow("Attempts", attemptId);

  await repository.appendScoringResult({
    schemaVersion: "scoring-result.v2",
    scoringResultId,
    attemptId,
    status: "succeeded",
    totalScore: 80,
    dimensions: {},
    verdict: "接続テスト",
    overallAssessment: "接続テスト",
    readerQuestions: [],
    ambiguityRisks: [],
    investigationAdvice: [],
    rewriteSuggestions: [],
    strengths: [],
    rubricVersion: "integration-test",
    promptVersion: "integration-test",
    modelId: "integration-test",
    scoredAt: "2026-08-01T00:02:00.000Z",
    errorCode: null,
  });
  await rememberRow("ScoringResults", scoringResultId);

  const history = await repository.listAttemptsByUser(userId);
  const progress = await repository.getScenarioProgress(userId);
  const leaderboard = await repository.getLeaderboard();

  if (history.items.length !== 1 || history.items[0].scoringResults.length !== 1) {
    throw new Error("history integration check failed");
  }
  if (progress.length !== 1 || progress[0].bestScore !== 80) {
    throw new Error("progress integration check failed");
  }
  if (!leaderboard.items.some((item) => item.rankingName === "接続テスト")) {
    throw new Error("leaderboard integration check failed");
  }

  process.stdout.write("SHEETS_INTEGRATION_OK\n");
} finally {
  await clearCreatedRows();
}
