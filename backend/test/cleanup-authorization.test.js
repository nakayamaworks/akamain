import assert from "node:assert/strict";
import test from "node:test";
import { verifyCleanupAuthorization } from "../src/cleanup-authorization.js";

test("cleanup authorization accepts only the configured verified service account", async () => {
  const calls = [];
  const payload = await verifyCleanupAuthorization("signed-token", {
    audience: "https://backend.example",
    expectedEmail: "cleanup@example.iam.gserviceaccount.com",
    client: {
      async verifyIdToken(input) {
        calls.push(input);
        return {
          getPayload: () => ({
            email: "cleanup@example.iam.gserviceaccount.com",
            email_verified: true,
          }),
        };
      },
    },
  });

  assert.equal(payload.email_verified, true);
  assert.deepEqual(calls, [{ idToken: "signed-token", audience: "https://backend.example" }]);
});

test("cleanup authorization rejects a different caller", async () => {
  await assert.rejects(
    verifyCleanupAuthorization("signed-token", {
      audience: "https://backend.example",
      expectedEmail: "cleanup@example.iam.gserviceaccount.com",
      client: {
        async verifyIdToken() {
          return {
            getPayload: () => ({ email: "other@example.com", email_verified: true }),
          };
        },
      },
    }),
    (error) => error.code === "CLEANUP_AUTH_INVALID"
  );
});
