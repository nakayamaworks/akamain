import assert from "node:assert/strict";
import test from "node:test";
import {
  anonymousCleanupConfiguration,
  anonymousRetentionCutoff,
  cleanupExpiredAnonymousUsers,
} from "../src/anonymous-user-cleanup.js";

test("cleanup only deletes expired anonymous users already absent from Firebase Auth", async () => {
  const deletedBatches = [];
  const summary = await cleanupExpiredAnonymousUsers({
    now: new Date("2026-08-31T00:00:00.000Z"),
    retentionDays: 31,
    batchSize: 100,
    storageRepository: {
      async listAnonymousUsersCreatedBefore(cutoff, options) {
        assert.equal(cutoff, "2026-07-31T00:00:00.000Z");
        assert.equal(options.limit, 100);
        return [
          { userId: "firebase:deleted-guest", authProvider: "anonymous" },
          { userId: "firebase:existing-guest", authProvider: "anonymous" },
          { userId: "legacy-guest", authProvider: "anonymous" },
        ];
      },
      async deleteUsersData(userIds) {
        deletedBatches.push(userIds);
        return {
          deletedUserCount: userIds.length,
          deletedAttemptCount: 2,
          deletedScoringResultCount: 3,
        };
      },
    },
    firebaseAuthDirectory: {
      async lookupExistingUserIds(localIds) {
        assert.deepEqual(localIds, ["deleted-guest", "existing-guest"]);
        return new Set(["existing-guest"]);
      },
    },
  });

  assert.deepEqual(deletedBatches, [["firebase:deleted-guest"]]);
  assert.deepEqual(summary, {
    cutoff: "2026-07-31T00:00:00.000Z",
    retentionDays: 31,
    candidateCount: 3,
    retainedAuthenticationCount: 1,
    invalidCandidateCount: 1,
    deletedUserCount: 1,
    deletedAttemptCount: 2,
    deletedScoringResultCount: 3,
  });
});

test("cleanup configuration applies safe defaults and caps each batch", () => {
  assert.deepEqual(anonymousCleanupConfiguration({}), { retentionDays: 31, batchSize: 100 });
  assert.deepEqual(
    anonymousCleanupConfiguration({
      ANONYMOUS_DATA_RETENTION_DAYS: "45",
      ANONYMOUS_CLEANUP_BATCH_SIZE: "5000",
    }),
    { retentionDays: 45, batchSize: 1000 }
  );
  assert.equal(
    anonymousRetentionCutoff(new Date("2026-08-31T00:00:00.000Z"), 31),
    "2026-07-31T00:00:00.000Z"
  );
});
