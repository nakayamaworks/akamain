import assert from "node:assert/strict";
import test from "node:test";
import { FirebaseAuthDirectory } from "../src/firebase-auth-directory.js";

test("Firebase directory looks up unique user ids in bounded batches", async () => {
  const requests = [];
  const directory = new FirebaseAuthDirectory({
    projectId: "test-project",
    auth: {
      async getClient() {
        return {
          async request(input) {
            requests.push(input);
            return {
              data: {
                users: input.data.localId
                  .filter((localId) => localId.endsWith("0"))
                  .map((localId) => ({ localId })),
              },
            };
          },
        };
      },
    },
  });
  const requested = Array.from({ length: 101 }, (_, index) => `guest-${index}`);
  const existing = await directory.lookupExistingUserIds([...requested, "guest-0", ""]);

  assert.equal(requests.length, 2);
  assert.equal(requests[0].data.localId.length, 100);
  assert.equal(requests[1].data.localId.length, 1);
  assert.ok(requests[0].url.includes("/test-project/accounts:lookup"));
  assert.deepEqual([...existing], ["guest-0", "guest-10", "guest-20", "guest-30", "guest-40", "guest-50", "guest-60", "guest-70", "guest-80", "guest-90", "guest-100"]);
});

test("Firebase directory fails closed when account lookup is unavailable", async () => {
  const directory = new FirebaseAuthDirectory({
    projectId: "test-project",
    auth: {
      async getClient() {
        return { async request() { throw new Error("permission denied"); } };
      },
    },
  });

  await assert.rejects(
    directory.lookupExistingUserIds(["guest-1"]),
    (error) => error.code === "FIREBASE_DIRECTORY_UNAVAILABLE"
  );
});
