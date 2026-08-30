import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const authClientSource = fs.readFileSync(
  new URL("../../auth-client.js", import.meta.url),
  "utf8"
);

function createUser(options = {}) {
  const user = {
    uid: options.uid || "anonymous-1",
    isAnonymous: options.isAnonymous ?? true,
    displayName: options.displayName || null,
    photoURL: options.photoURL || null,
    providerData: options.providerData || [],
    async getIdToken() {
      return user.isAnonymous ? `anonymous-token-${user.uid}` : `google-token-${user.uid}`;
    },
  };
  return user;
}

function createAuthContext(options = {}) {
  const listeners = new Set();
  let credentialCallback = null;
  let currentUser = options.initialUser || null;
  let anonymousSignInCount = 0;
  const authInstance = {
    get currentUser() {
      return currentUser;
    },
    async setPersistence() {},
    onAuthStateChanged(listener) {
      listeners.add(listener);
      queueMicrotask(() => listener(currentUser));
      return () => listeners.delete(listener);
    },
    async signInAnonymously() {
      anonymousSignInCount += 1;
      currentUser = createUser({ uid: options.nextAnonymousUid || "anonymous-1" });
      currentUser.linkWithCredential = async () => {
        currentUser.isAnonymous = false;
        currentUser.displayName = "テスト利用者";
        currentUser.providerData = [{
          providerId: "google.com",
          displayName: "テスト利用者",
          photoURL: "https://example.test/avatar.png",
        }];
        listeners.forEach((listener) => listener(currentUser));
        return { user: currentUser };
      };
      listeners.forEach((listener) => listener(currentUser));
      return { user: currentUser };
    },
    async signInWithCredential() {
      currentUser = createUser({
        uid: "google-1",
        isAnonymous: false,
        displayName: "テスト利用者",
        providerData: [{ providerId: "google.com", displayName: "テスト利用者" }],
      });
      listeners.forEach((listener) => listener(currentUser));
      return { user: currentUser };
    },
    async signOut() {
      currentUser = null;
      listeners.forEach((listener) => listener(currentUser));
    },
  };
  const authFunction = () => authInstance;
  authFunction.Auth = { Persistence: { LOCAL: "local" } };
  authFunction.GoogleAuthProvider = { credential: (token) => ({ token }) };
  const firebase = {
    apps: [],
    auth: authFunction,
    initializeApp() {
      const app = { auth: authFunction };
      firebase.apps.push(app);
      return app;
    },
    app() {
      return firebase.apps[0];
    },
  };
  const window = {
    TYPING_WORKBENCH_CONFIG: {
      apiBaseUrl: "https://api.example.test",
      googleClientId: "test-client-id",
      firebaseApiKey: "test-api-key",
      firebaseAuthDomain: "test.firebaseapp.com",
      firebaseProjectId: "test-project",
    },
    firebase,
    fetch: options.fetch || (async () => ({ ok: true, json: async () => ({}) })),
    google: {
      accounts: {
        id: {
          initialize(configuration) {
            credentialCallback = configuration.callback;
          },
          renderButton() {},
          disableAutoSelect() {},
        },
      },
    },
  };
  const context = vm.createContext({
    window,
    document: {},
    console,
    queueMicrotask,
  });
  vm.runInContext(authClientSource, context, { filename: "auth-client.js" });
  return {
    auth: window.TYPING_WORKBENCH_AUTH,
    getCredentialCallback: () => credentialCallback,
    getAnonymousSignInCount: () => anonymousSignInCount,
  };
}

test("initialization keeps a new visitor local until an ID token is requested", async () => {
  const page = createAuthContext();
  let latestSnapshot = null;
  page.auth.subscribe((snapshot) => {
    latestSnapshot = snapshot;
  });
  await page.auth.initialize({});

  assert.equal(latestSnapshot.status, "guest");
  assert.equal(latestSnapshot.accountType, "guest");
  assert.equal(page.getAnonymousSignInCount(), 0);

  assert.equal(await page.auth.getIdToken(), "anonymous-token-anonymous-1");
  assert.equal(latestSnapshot.status, "anonymous");
  assert.equal(latestSnapshot.accountType, "anonymous");
  assert.equal(page.getAnonymousSignInCount(), 1);
});

test("concurrent server requests create only one anonymous identity", async () => {
  const page = createAuthContext();
  await page.auth.initialize({});

  const tokens = await Promise.all([
    page.auth.getIdToken(),
    page.auth.getIdToken(),
    page.auth.getIdToken(),
  ]);

  assert.deepEqual(tokens, [
    "anonymous-token-anonymous-1",
    "anonymous-token-anonymous-1",
    "anonymous-token-anonymous-1",
  ]);
  assert.equal(page.getAnonymousSignInCount(), 1);
});

test("Google credential upgrades an anonymous identity without changing its uid", async () => {
  const page = createAuthContext();
  let latestSnapshot = null;
  page.auth.subscribe((snapshot) => {
    latestSnapshot = snapshot;
  });
  await page.auth.initialize({});
  await page.auth.getIdToken();
  await page.getCredentialCallback()({ credential: "google-id-token" });

  assert.equal(latestSnapshot.status, "signed_in");
  assert.equal(latestSnapshot.profile.name, "テスト利用者");
  assert.equal(await page.auth.getIdToken(), "google-token-anonymous-1");
});

test("Google credential signs in directly when no guest data exists", async () => {
  const page = createAuthContext();
  let latestSnapshot = null;
  page.auth.subscribe((snapshot) => {
    latestSnapshot = snapshot;
  });
  await page.auth.initialize({});
  await page.getCredentialCallback()({ credential: "google-id-token" });

  assert.equal(latestSnapshot.status, "signed_in");
  assert.equal(await page.auth.getIdToken(), "google-token-google-1");
  assert.equal(page.getAnonymousSignInCount(), 0);
});

test("signing out returns the browser to a local guest without creating an account", async () => {
  const page = createAuthContext({ nextAnonymousUid: "guest-after-signout" });
  let latestSnapshot = null;
  page.auth.subscribe((snapshot) => {
    latestSnapshot = snapshot;
  });
  await page.auth.initialize({});
  await page.getCredentialCallback()({ credential: "google-id-token" });
  await page.auth.signOut();

  assert.equal(latestSnapshot.status, "guest");
  assert.equal(page.getAnonymousSignInCount(), 0);
  assert.equal(await page.auth.getIdToken(), "anonymous-token-guest-after-signout");
  assert.equal(page.getAnonymousSignInCount(), 1);
});
