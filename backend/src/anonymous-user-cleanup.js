const FIREBASE_USER_ID_PREFIX = "firebase:";

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function anonymousCleanupConfiguration(environment = process.env) {
  return {
    retentionDays: positiveInteger(environment.ANONYMOUS_DATA_RETENTION_DAYS, 31),
    batchSize: Math.min(positiveInteger(environment.ANONYMOUS_CLEANUP_BATCH_SIZE, 100), 1000),
  };
}

export function anonymousRetentionCutoff(now, retentionDays) {
  return new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
}

export async function cleanupExpiredAnonymousUsers(options) {
  const now = options.now || new Date();
  const retentionDays = positiveInteger(options.retentionDays, 31);
  const batchSize = Math.min(positiveInteger(options.batchSize, 100), 1000);
  const cutoff = anonymousRetentionCutoff(now, retentionDays);
  const candidates = await options.storageRepository.listAnonymousUsersCreatedBefore(cutoff, {
    limit: batchSize,
  });

  const eligible = candidates
    .map((user) => ({
      user,
      localId: String(user.userId || "").startsWith(FIREBASE_USER_ID_PREFIX)
        ? String(user.userId).slice(FIREBASE_USER_ID_PREFIX.length)
        : "",
    }))
    .filter((entry) => entry.localId);
  const invalidCandidateCount = candidates.length - eligible.length;
  const existingLocalIds = await options.firebaseAuthDirectory.lookupExistingUserIds(
    eligible.map((entry) => entry.localId)
  );
  const deletableUserIds = eligible
    .filter((entry) => !existingLocalIds.has(entry.localId))
    .map((entry) => entry.user.userId);
  const deleted = await options.storageRepository.deleteUsersData(deletableUserIds);

  return {
    cutoff,
    retentionDays,
    candidateCount: candidates.length,
    retainedAuthenticationCount: eligible.length - deletableUserIds.length,
    invalidCandidateCount,
    ...deleted,
  };
}
