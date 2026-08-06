import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const authClientSource = fs.readFileSync(
  new URL("../../auth-client.js", import.meta.url),
  "utf8"
);

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function createToken(overrides = {}) {
  return [
    encodeJwtPart({ alg: "none", typ: "JWT" }),
    encodeJwtPart({
      sub: "google-user-1",
      name: "テスト利用者",
      aud: "test-client-id",
      iss: "https://accounts.google.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    }),
    "signature",
  ].join(".");
}

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) || null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function createAuthContext(sessionStorage) {
  let credentialCallback = null;
  const window = {
    TYPING_WORKBENCH_CONFIG: { googleClientId: "test-client-id" },
    sessionStorage,
    atob(value) {
      return Buffer.from(value, "base64").toString("binary");
    },
    google: {
      accounts: {
        id: {
          initialize(options) {
            credentialCallback = options.callback;
          },
          renderButton() {},
          disableAutoSelect() {},
        },
      },
    },
  };
  const context = vm.createContext({ window, document: {} });
  vm.runInContext(authClientSource, context, { filename: "auth-client.js" });
  return {
    auth: window.TYPING_WORKBENCH_AUTH,
    getCredentialCallback: () => credentialCallback,
  };
}

test("GSI credential survives a same-tab reload and is cleared on sign out", async () => {
  const sessionStorage = createStorage();
  const token = createToken();
  const firstPage = createAuthContext(sessionStorage);
  await firstPage.auth.initialize({});
  firstPage.getCredentialCallback()({ credential: token });
  assert.equal(firstPage.auth.getIdToken(), token);

  const reloadedPage = createAuthContext(sessionStorage);
  let latestSnapshot = null;
  reloadedPage.auth.subscribe((snapshot) => {
    latestSnapshot = snapshot;
  });
  await reloadedPage.auth.initialize({});

  assert.equal(latestSnapshot.status, "signed_in");
  assert.equal(latestSnapshot.profile.name, "テスト利用者");
  assert.equal(reloadedPage.auth.getIdToken(), token);

  reloadedPage.auth.signOut();
  assert.equal(reloadedPage.auth.getIdToken(), "");

  const signedOutReload = createAuthContext(sessionStorage);
  await signedOutReload.auth.initialize({});
  assert.equal(signedOutReload.auth.getIdToken(), "");
});

test("expired stored credentials are rejected and removed", async () => {
  const sessionStorage = createStorage();
  sessionStorage.setItem(
    "typing-workbench:gsi-credential",
    createToken({ exp: Math.floor(Date.now() / 1000) - 1 })
  );
  const page = createAuthContext(sessionStorage);
  await page.auth.initialize({});

  assert.equal(page.auth.getIdToken(), "");
  assert.equal(sessionStorage.getItem("typing-workbench:gsi-credential"), null);
});
