import assert from "node:assert/strict";
import test from "node:test";
import {
  SheetsStorageRepository,
  attemptToRow,
  rowToAttempt,
  rowToScoringResult,
  scoringResultToRow,
} from "../src/sheets-storage-repository.js";

function attemptRow(attemptId, ticketNumber, ticketId = "", revisionNumber = "", parentId = "") {
  return [
    "attempt.v2",
    attemptId,
    "user-1",
    "scenario-one",
    "customer",
    "practice",
    "{}",
    "[]",
    "2026-08-01T00:00:00.000Z",
    "2026-08-01T00:01:00.000Z",
    ticketNumber,
    ticketId,
    revisionNumber,
    parentId,
  ];
}

function repositoryWithRows(rows) {
  const repository = new SheetsStorageRepository({
    spreadsheetId: "test-sheet",
    auth: {},
  });
  const writes = [];
  repository.readValues = async () => structuredClone(rows);
  repository.writeValues = async (range, values) => {
    writes.push({ range, values: structuredClone(values) });
  };
  return { repository, writes };
}

test("Sheets migration keeps a shared ticket number across revisions", async () => {
  const ticketId = "11111111-1111-4111-8111-111111111111";
  const revisionId = "22222222-2222-4222-8222-222222222222";
  const { repository, writes } = repositoryWithRows([
    attemptRow(ticketId, 40001, ticketId, 1),
    attemptRow(revisionId, 40001, ticketId, 2, ticketId),
  ]);

  await repository.backfillAttemptMetadata();

  assert.equal(writes.length, 0);
});

test("Sheets migration backfills legacy rows and separates number collisions", async () => {
  const firstId = "11111111-1111-4111-8111-111111111111";
  const secondId = "22222222-2222-4222-8222-222222222222";
  const { repository, writes } = repositoryWithRows([
    attemptRow(firstId, 40001),
    attemptRow(secondId, 40001),
  ]);

  await repository.backfillAttemptMetadata();

  assert.equal(writes.length, 1);
  assert.equal(writes[0].range, "'Attempts'!K2");
  assert.deepEqual(writes[0].values, [
    [40001, firstId, 1, ""],
    [40002, secondId, 1, ""],
  ]);
});

test("Sheets user synchronization is shared by concurrent read requests", async () => {
  const repository = new SheetsStorageRepository({
    spreadsheetId: "test-sheet",
    auth: {},
  });
  const profile = {
    userId: "user-1",
    displayName: "テスト利用者",
    email: "user@example.com",
    emailVerified: true,
  };
  let reads = 0;
  let writes = 0;
  repository.initialize = async () => {};
  repository.readDataRows = async () => {
    reads += 1;
    return [];
  };
  repository.appendRow = async () => {
    writes += 1;
  };

  const [first, second] = await Promise.all([
    repository.upsertUser(profile),
    repository.upsertUser(profile),
  ]);
  const third = await repository.upsertUser(profile);

  assert.equal(first.userId, "user-1");
  assert.deepEqual(second, first);
  assert.deepEqual(third, first);
  assert.equal(reads, 1);
  assert.equal(writes, 1);
});

test("Sheets scoring results preserve dimension feedback and improvement items", () => {
  const scoringResult = {
    schemaVersion: "scoring-result.v3",
    scoringResultId: "33333333-3333-4333-8333-333333333333",
    attemptId: "11111111-1111-4111-8111-111111111111",
    status: "succeeded",
    totalScore: 82,
    dimensions: { factualGrounding: 80 },
    verdict: "追加確認を推奨",
    overallAssessment: "主要事象は確認できるが、補足が必要です。",
    readerQuestions: [],
    ambiguityRisks: [],
    investigationAdvice: [],
    rewriteSuggestions: [],
    strengths: [],
    rubricVersion: "scenario.v1",
    promptVersion: "practice-review.v7",
    modelId: "gemini-test",
    scoredAt: "2026-08-17T00:00:00.000Z",
    errorCode: null,
    rubricFindings: null,
    dimensionFeedback: {
      factualGrounding: { reason: "確認済み事実の補足が必要です。" },
    },
    improvementItems: [
      {
        priority: "修正推奨",
        title: "事実を補足する",
        detail: "確認した値を追記してください。",
        whyItMatters: "再現条件を判断するためです。",
        relatedDimensionIds: ["factualGrounding"],
      },
    ],
  };

  const restored = rowToScoringResult(scoringResultToRow(scoringResult));

  assert.deepEqual(restored.dimensionFeedback, scoringResult.dimensionFeedback);
  assert.deepEqual(restored.improvementItems, scoringResult.improvementItems);
});

test("Sheets attempts preserve optional attachment descriptions", () => {
  const attempt = {
    schemaVersion: "attempt.v3",
    attemptId: "11111111-1111-4111-8111-111111111111",
    userId: "user-1",
    scenarioId: "scenario-one",
    projectId: "customer",
    authoringMode: "practice",
    answer: { subject: "題名", sections: {}, ticketFields: {} },
    selectedEvidenceIds: ["api-log"],
    evidenceDescriptions: { "api-log": "14:32付近の顧客登録APIログ" },
    startedAt: "2026-08-17T00:00:00.000Z",
    completedAt: "2026-08-17T00:01:00.000Z",
    ticketNumber: 40001,
    ticketId: "11111111-1111-4111-8111-111111111111",
    revisionNumber: 1,
    parentAttemptId: null,
  };

  assert.deepEqual(
    rowToAttempt(attemptToRow(attempt)).evidenceDescriptions,
    attempt.evidenceDescriptions
  );
});

test("Sheets cleanup clears exact source rows while preserving linked users", async () => {
  const repository = new SheetsStorageRepository({ spreadsheetId: "test-sheet", auth: {} });
  repository.initialize = async () => {};
  repository.readValues = async (range) => {
    if (range.includes("Users")) {
      return [
        ["user.v1", "firebase:guest-a", "anonymous"],
        [],
        ["user.v1", "firebase:linked", "google"],
      ];
    }
    if (range.includes("Attempts")) {
      return [
        ["attempt.v3", "attempt-a", "firebase:guest-a"],
        [],
        ["attempt.v3", "attempt-linked", "firebase:linked"],
      ];
    }
    return [
      ["scoring-result.v3", "result-a", "attempt-a"],
      [],
      ["scoring-result.v3", "result-linked", "attempt-linked"],
    ];
  };
  const deletedRows = [];
  repository.deleteRows = async (rows) => deletedRows.push(...rows);

  const deleted = await repository.deleteUsersData([
    "firebase:guest-a",
    "firebase:linked",
  ]);

  assert.deepEqual(deleted, {
    deletedUserCount: 1,
    deletedAttemptCount: 1,
    deletedScoringResultCount: 1,
  });
  assert.deepEqual(deletedRows, [
    { title: "ScoringResults", rowNumber: 2 },
    { title: "Attempts", rowNumber: 2 },
    { title: "Users", rowNumber: 2 },
  ]);
});

test("Sheets cleanup deletes physical rows from bottom to top", async () => {
  const repository = new SheetsStorageRepository({ spreadsheetId: "test-sheet", auth: {} });
  repository.sheetIds = new Map([["Users", 10], ["Attempts", 20]]);
  const requests = [];
  repository.getClient = async () => ({
    async request(input) {
      requests.push(input);
      return { data: {} };
    },
  });

  await repository.deleteRows([
    { title: "Users", rowNumber: 3 },
    { title: "Attempts", rowNumber: 7 },
    { title: "Users", rowNumber: 8 },
  ]);

  assert.equal(requests[0].data.requests[1].deleteDimension.range.startIndex, 7);
  assert.equal(requests[0].data.requests[2].deleteDimension.range.startIndex, 2);
  assert.equal(requests[0].data.requests[0].deleteDimension.range.sheetId, 20);
});
