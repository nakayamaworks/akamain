import assert from "node:assert/strict";
import test from "node:test";
import { SheetsStorageRepository } from "../src/sheets-storage-repository.js";

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
