import assert from "node:assert/strict";
import test from "node:test";
import { MemoryStorageRepository } from "../src/memory-storage-repository.js";

function attempt(overrides = {}) {
  return {
    schemaVersion: "attempt.v1",
    attemptId: crypto.randomUUID(),
    userId: "user-1",
    scenarioId: "scenario-one",
    projectId: "customer",
    authoringMode: "practice",
    answer: { subject: "題名", sections: { detail: "詳細" } },
    selectedEvidenceIds: [],
    startedAt: "2026-08-01T00:00:00.000Z",
    completedAt: "2026-08-01T00:01:00.000Z",
    ...overrides,
  };
}

function scoringResult(attemptId, totalScore, overrides = {}) {
  return {
    schemaVersion: "scoring-result.v2",
    scoringResultId: crypto.randomUUID(),
    attemptId,
    status: "succeeded",
    totalScore,
    dimensions: {},
    verdict: "追加確認を推奨",
    overallAssessment: "総評",
    readerQuestions: [],
    ambiguityRisks: [],
    investigationAdvice: [],
    rewriteSuggestions: [],
    strengths: [],
    rubricVersion: "1.0.0",
    promptVersion: "test",
    modelId: "test-model",
    scoredAt: "2026-08-01T00:02:00.000Z",
    errorCode: null,
    ...overrides,
  };
}

test("upsert keeps ranking preferences and never uses email as the user id", async () => {
  const repository = new MemoryStorageRepository({
    now: () => "2026-08-01T00:00:00.000Z",
  });
  await repository.upsertUser({
    userId: "google-sub-1",
    email: "private@example.com",
    emailVerified: true,
    displayName: "Private Name",
  });
  await repository.updateRankingProfile("google-sub-1", {
    rankingName: "公開名",
    rankingOptIn: true,
  });
  const updated = await repository.upsertUser({
    userId: "google-sub-1",
    email: "changed@example.com",
    emailVerified: true,
    displayName: "Changed Name",
  });

  assert.equal(updated.userId, "google-sub-1");
  assert.equal(updated.rankingName, "公開名");
  assert.equal(updated.rankingOptIn, true);
  assert.equal(updated.email, "changed@example.com");
});

test("an attempt without a successful score becomes scoring_pending", async () => {
  const repository = new MemoryStorageRepository();
  const storedAttempt = attempt();
  await repository.appendAttempt(storedAttempt);
  await repository.appendScoringResult(scoringResult(storedAttempt.attemptId, null, {
    status: "unavailable",
    totalScore: null,
    verdict: null,
  }));

  assert.deepEqual(await repository.getScenarioProgress("user-1"), [{
    scenarioId: "scenario-one",
    status: "scoring_pending",
    attemptCount: 1,
    bestScore: null,
    latestScore: null,
    latestAttemptAt: "2026-08-01T00:01:00.000Z",
  }]);
});

test("progress and leaderboard use each scenario's best successful score", async () => {
  const repository = new MemoryStorageRepository();
  await repository.upsertUser({ userId: "user-1", displayName: "非公開名1" });
  await repository.updateRankingProfile("user-1", {
    rankingName: "公開A",
    rankingOptIn: true,
  });
  await repository.upsertUser({ userId: "user-2", displayName: "非公開名2" });
  await repository.updateRankingProfile("user-2", {
    rankingName: "公開B",
    rankingOptIn: false,
  });

  const first = attempt();
  const second = attempt({
    attemptId: crypto.randomUUID(),
    completedAt: "2026-08-01T00:03:00.000Z",
  });
  await repository.appendAttempt(first);
  await repository.appendAttempt(second);
  await repository.appendScoringResult(scoringResult(first.attemptId, 70));
  await repository.appendScoringResult(scoringResult(second.attemptId, 85));

  const progress = await repository.getScenarioProgress("user-1");
  assert.equal(progress[0].status, "achieved");
  assert.equal(progress[0].bestScore, 85);
  assert.equal(progress[0].latestScore, 85);
  assert.equal(progress[0].attemptCount, 2);

  const lowerThird = attempt({
    attemptId: crypto.randomUUID(),
    completedAt: "2026-08-01T00:05:00.000Z",
  });
  await repository.appendAttempt(lowerThird);
  await repository.appendScoringResult(scoringResult(lowerThird.attemptId, 62, {
    scoredAt: "2026-08-01T00:06:00.000Z",
  }));
  const updatedProgress = await repository.getScenarioProgress("user-1");
  assert.equal(updatedProgress[0].bestScore, 85);
  assert.equal(updatedProgress[0].latestScore, 62);
  assert.equal(updatedProgress[0].attemptCount, 3);

  const leaderboard = await repository.getLeaderboard({ viewerUserId: "user-1" });
  assert.deepEqual(leaderboard.items, [{
    rankingName: "公開A",
    isVerified: true,
    achievementPoints: 85,
    achievedScenarioCount: 1,
    scoredScenarioCount: 1,
    isCurrentUser: true,
    rank: 1,
  }]);
  assert.equal(JSON.stringify(leaderboard).includes("非公開名"), false);
});

test("guest attempts and ranking profile move to a linked Google identity", async () => {
  const repository = new MemoryStorageRepository({
    now: () => "2026-08-28T00:00:00.000Z",
  });
  await repository.upsertUser({
    userId: "firebase:guest-1",
    authProvider: "anonymous",
    displayName: "ゲスト",
  });
  await repository.updateRankingProfile("firebase:guest-1", {
    rankingName: "ゲスト鉱員",
    rankingOptIn: true,
  });
  await repository.appendAttempt(attempt({ userId: "firebase:guest-1" }));
  await repository.upsertUser({
    userId: "firebase:google-1",
    authProvider: "google",
    providerSubject: "google-sub-1",
    displayName: "Google利用者",
  });

  const merged = await repository.mergeUserData("firebase:guest-1", "firebase:google-1");
  const tickets = await repository.listTicketsByUser("firebase:google-1");

  assert.equal(merged.rankingName, "ゲスト鉱員");
  assert.equal(merged.rankingOptIn, true);
  assert.equal(tickets.items.length, 1);
  assert.equal(await repository.getUser("firebase:guest-1"), null);
});

test("expired anonymous user cleanup deletes the user, attempts, scores, and ranking entry", async () => {
  const repository = new MemoryStorageRepository();
  await repository.upsertUser({
    userId: "firebase:expired-guest",
    authProvider: "anonymous",
    loginAt: "2026-07-01T00:00:00.000Z",
    displayName: "ゲスト",
  });
  await repository.updateRankingProfile("firebase:expired-guest", {
    rankingName: "削除対象",
    rankingOptIn: true,
  });
  await repository.upsertUser({
    userId: "firebase:linked-user",
    authProvider: "google",
    loginAt: "2026-07-01T00:00:00.000Z",
    displayName: "連携済み",
  });
  const storedAttempt = attempt({ userId: "firebase:expired-guest" });
  await repository.appendAttempt(storedAttempt);
  await repository.appendScoringResult(scoringResult(storedAttempt.attemptId, 88));

  const candidates = await repository.listAnonymousUsersCreatedBefore(
    "2026-07-31T00:00:00.000Z"
  );
  assert.deepEqual(candidates.map((user) => user.userId), ["firebase:expired-guest"]);

  const deleted = await repository.deleteUsersData([
    "firebase:expired-guest",
    "firebase:linked-user",
  ]);
  assert.deepEqual(deleted, {
    deletedUserCount: 1,
    deletedAttemptCount: 1,
    deletedScoringResultCount: 1,
  });
  assert.equal(await repository.getUser("firebase:expired-guest"), null);
  assert.ok(await repository.getUser("firebase:linked-user"));
  assert.equal((await repository.getLeaderboard()).items.length, 0);
});

test("QA scores stay out of the bug-ticket leaderboard", async () => {
  const repository = new MemoryStorageRepository();
  await repository.upsertUser({ userId: "user-1", displayName: "非公開名" });
  await repository.updateRankingProfile("user-1", {
    rankingName: "公開A",
    rankingOptIn: true,
  });
  const bugAttempt = attempt({
    answer: { subject: "バグ", sections: {}, ticketFields: { tracker: "bug" } },
  });
  const qaAttempt = attempt({
    attemptId: crypto.randomUUID(),
    scenarioId: "qa-scenario-one",
    answer: { subject: "QA", sections: {}, ticketFields: { tracker: "qa" } },
  });
  await repository.appendAttempt(bugAttempt);
  await repository.appendAttempt(qaAttempt);
  await repository.appendScoringResult(scoringResult(bugAttempt.attemptId, 70));
  await repository.appendScoringResult(scoringResult(qaAttempt.attemptId, 95));

  const leaderboard = await repository.getLeaderboard({ viewerUserId: "user-1" });
  assert.equal(leaderboard.items[0].achievementPoints, 70);
  assert.equal(leaderboard.items[0].scoredScenarioCount, 1);
});

test("history is user-scoped and paginated with an opaque cursor", async () => {
  const repository = new MemoryStorageRepository();
  const older = attempt();
  const newer = attempt({
    attemptId: crypto.randomUUID(),
    completedAt: "2026-08-01T00:03:00.000Z",
  });
  const anotherUser = attempt({ attemptId: crypto.randomUUID(), userId: "user-2" });
  await repository.appendAttempt(older);
  await repository.appendAttempt(newer);
  await repository.appendAttempt(anotherUser);

  const firstPage = await repository.listAttemptsByUser("user-1", { limit: 1 });
  assert.equal(firstPage.items[0].attemptId, newer.attemptId);
  assert.ok(firstPage.nextCursor);
  const secondPage = await repository.listAttemptsByUser("user-1", {
    limit: 1,
    cursor: firstPage.nextCursor,
  });
  assert.equal(secondPage.items[0].attemptId, older.attemptId);
  assert.equal(secondPage.nextCursor, null);
});

test("attempt creation is idempotent and ticket lookup remains user-scoped", async () => {
  const repository = new MemoryStorageRepository();
  const stored = attempt({
    schemaVersion: "attempt.v2",
    answer: {
      subject: "保存済みチケット",
      sections: { detail: "詳細" },
      ticketFields: { priority: "high", assigneeId: "tsunagi" },
    },
  });
  const firstStored = await repository.appendAttempt(stored);
  const duplicateStored = await repository.appendAttempt(stored);

  assert.equal(repository.attempts.length, 1);
  assert.equal(firstStored.ticketNumber, 40001);
  assert.equal(duplicateStored.ticketNumber, 40001);
  assert.equal((await repository.getAttemptById("user-1", stored.attemptId)).answer.subject, "保存済みチケット");
  assert.equal(await repository.getAttemptById("user-2", stored.attemptId), null);
});

test("ticket history filters by project and practice mode before pagination", async () => {
  const repository = new MemoryStorageRepository();
  await repository.appendAttempt(attempt({ projectId: "customer" }));
  await repository.appendAttempt(attempt({
    attemptId: crypto.randomUUID(),
    projectId: "attendance",
  }));
  await repository.appendAttempt(attempt({
    attemptId: crypto.randomUUID(),
    projectId: "customer",
    authoringMode: "reference",
  }));

  const result = await repository.listAttemptsByUser("user-1", {
    projectId: "customer",
    authoringMode: "practice",
    limit: 20,
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].projectId, "customer");
  assert.equal(result.items[0].authoringMode, "practice");
});

test("ticket list can filter bug and QA trackers", async () => {
  const repository = new MemoryStorageRepository();
  await repository.appendAttempt(attempt({
    answer: { subject: "バグ", sections: {}, ticketFields: { tracker: "bug" } },
  }));
  await repository.appendAttempt(attempt({
    attemptId: crypto.randomUUID(),
    answer: { subject: "QA", sections: {}, ticketFields: { tracker: "qa" } },
  }));
  const qaTickets = await repository.listTicketsByUser("user-1", {
    authoringMode: "practice",
    tracker: "qa",
  });
  assert.equal(qaTickets.items.length, 1);
  assert.equal(qaTickets.items[0].answer.subject, "QA");
});

test("ticket numbers are numeric, sequential, and stable across idempotent writes", async () => {
  const repository = new MemoryStorageRepository();
  const first = attempt();
  const second = attempt({ attemptId: crypto.randomUUID() });

  const storedFirst = await repository.appendAttempt(first);
  const storedSecond = await repository.appendAttempt(second);
  const storedFirstAgain = await repository.appendAttempt(first);

  assert.equal(storedFirst.ticketNumber, 40001);
  assert.equal(storedSecond.ticketNumber, 40002);
  assert.equal(storedFirstAgain.ticketNumber, 40001);
  assert.match(String(storedSecond.ticketNumber), /^\d+$/);
});

test("ticket revisions keep the ticket number and expose only the latest revision in the list", async () => {
  const repository = new MemoryStorageRepository();
  const first = attempt({ completedAt: "2026-08-01T00:01:00.000Z" });
  const storedFirst = await repository.appendAttempt(first);
  const revision = attempt({
    attemptId: crypto.randomUUID(),
    ticketId: storedFirst.ticketId,
    answer: { subject: "修正版", sections: { detail: "詳細を追加" } },
    completedAt: "2026-08-01T00:05:00.000Z",
  });
  const storedRevision = await repository.appendAttempt(revision);

  assert.equal(storedRevision.ticketId, storedFirst.attemptId);
  assert.equal(storedRevision.ticketNumber, storedFirst.ticketNumber);
  assert.equal(storedRevision.revisionNumber, 2);
  assert.equal(storedRevision.parentAttemptId, storedFirst.attemptId);

  const list = await repository.listTicketsByUser("user-1", { authoringMode: "practice" });
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].attemptId, storedRevision.attemptId);
  assert.equal(list.items[0].answer.subject, "修正版");

  const detail = await repository.getTicketById("user-1", storedFirst.ticketId);
  assert.equal(detail.latestAttempt.attemptId, storedRevision.attemptId);
  assert.deepEqual(detail.revisions.map((item) => item.revisionNumber), [1, 2]);
});

test("leaderboard uses first submissions while progress can reflect revision improvement", async () => {
  const repository = new MemoryStorageRepository();
  await repository.upsertUser({ userId: "user-1", displayName: "非公開名" });
  await repository.updateRankingProfile("user-1", {
    rankingName: "公開A",
    rankingOptIn: true,
  });
  const first = await repository.appendAttempt(attempt());
  const revision = await repository.appendAttempt(attempt({
    attemptId: crypto.randomUUID(),
    ticketId: first.ticketId,
    completedAt: "2026-08-01T00:05:00.000Z",
  }));
  await repository.appendScoringResult(scoringResult(first.attemptId, 60));
  await repository.appendScoringResult(scoringResult(revision.attemptId, 95, {
    scoredAt: "2026-08-01T00:06:00.000Z",
  }));

  const progress = await repository.getScenarioProgress("user-1");
  assert.equal(progress[0].bestScore, 95);
  const leaderboard = await repository.getLeaderboard({ viewerUserId: "user-1" });
  assert.equal(leaderboard.items[0].achievementPoints, 60);
  assert.equal(leaderboard.items[0].achievedScenarioCount, 0);
});
