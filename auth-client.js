(function initializeTypingWorkbenchAuth(global) {
  const config = global.TYPING_WORKBENCH_CONFIG || {};
  const listeners = new Set();
  let auth = null;
  let status = "loading";
  let profile = null;
  let accountType = null;
  let initialized = false;
  let transitionInProgress = false;

  function snapshot() {
    return Object.freeze({ status, profile, accountType });
  }

  function notify() {
    const current = snapshot();
    listeners.forEach((listener) => listener(current));
  }

  function setState(nextStatus, nextProfile = null, nextAccountType = null) {
    status = nextStatus;
    profile = nextProfile;
    accountType = nextAccountType;
    notify();
  }

  function firebaseConfiguration() {
    return {
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
    };
  }

  function hasFirebaseConfiguration() {
    return Boolean(
      config.firebaseApiKey &&
      config.firebaseAuthDomain &&
      config.firebaseProjectId
    );
  }

  function profileFromUser(user) {
    const providerProfile = (user?.providerData || []).find(
      (provider) => provider?.providerId === "google.com"
    );
    return Object.freeze({
      name: providerProfile?.displayName || user?.displayName || "Googleユーザー",
      picture: providerProfile?.photoURL || user?.photoURL || "",
    });
  }

  function applyFirebaseUser(user) {
    if (transitionInProgress) {
      return;
    }
    if (!user) {
      setState("loading");
      return;
    }
    if (user.isAnonymous) {
      setState("anonymous", Object.freeze({ name: "ゲスト", picture: "" }), "anonymous");
      return;
    }
    setState("signed_in", profileFromUser(user), "google");
  }

  function loadGoogleIdentity() {
    return new Promise((resolve, reject) => {
      if (!config.googleClientId) {
        resolve(false);
        return;
      }
      if (global.google?.accounts?.id) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Googleログインを読み込めませんでした。"));
      document.head.append(script);
    });
  }

  async function claimAnonymousData(anonymousIdToken, targetIdToken) {
    const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/+$/, "");
    if (!apiBaseUrl || !anonymousIdToken || !targetIdToken) {
      return;
    }
    const response = await global.fetch(`${apiBaseUrl}/api/identity/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${targetIdToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonymousIdToken }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        body.error?.message || "ゲスト履歴をGoogleアカウントへ引き継げませんでした。"
      );
      error.code = body.error?.code || `HTTP_${response.status}`;
      throw error;
    }
  }

  function isCredentialCollision(error) {
    return new Set([
      "auth/credential-already-in-use",
      "auth/email-already-in-use",
      "auth/provider-already-linked",
    ]).has(error?.code);
  }

  async function handleCredential(response) {
    if (!auth || !response?.credential) {
      setState("error");
      return;
    }
    transitionInProgress = true;
    setState("linking");
    let anonymousIdToken = "";
    try {
      const googleCredential = global.firebase.auth.GoogleAuthProvider.credential(
        response.credential
      );
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        anonymousIdToken = await currentUser.getIdToken();
        try {
          await currentUser.linkWithCredential(googleCredential);
        } catch (error) {
          if (!isCredentialCollision(error)) {
            throw error;
          }
          const result = await auth.signInWithCredential(googleCredential);
          await claimAnonymousData(anonymousIdToken, await result.user.getIdToken());
        }
      } else {
        await auth.signInWithCredential(googleCredential);
      }
      transitionInProgress = false;
      applyFirebaseUser(auth.currentUser);
    } catch (error) {
      transitionInProgress = false;
      console.error(`[auth] ${error?.code || "GOOGLE_LINK_FAILED"}: ${error?.message || error}`);
      applyFirebaseUser(auth.currentUser);
      if (!auth.currentUser) {
        setState("error");
      }
    }
  }

  async function initializeFirebaseAuth() {
    if (!hasFirebaseConfiguration() || !global.firebase?.auth) {
      setState("not_configured");
      return false;
    }
    const app = global.firebase.apps?.length
      ? global.firebase.app()
      : global.firebase.initializeApp(firebaseConfiguration());
    auth = app.auth();
    await auth.setPersistence(global.firebase.auth.Auth.Persistence.LOCAL);

    const initialUser = await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject
      );
    });
    auth.onAuthStateChanged(applyFirebaseUser);
    if (initialUser) {
      applyFirebaseUser(initialUser);
      return true;
    }
    const credential = await auth.signInAnonymously();
    applyFirebaseUser(credential.user);
    return true;
  }

  async function initialize(buttonElement) {
    if (initialized) {
      return;
    }
    initialized = true;
    try {
      const firebaseReady = await initializeFirebaseAuth();
      if (!firebaseReady || !buttonElement || !config.googleClientId) {
        return;
      }
      const googleReady = await loadGoogleIdentity();
      if (!googleReady) {
        return;
      }
      global.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      global.google.accounts.id.renderButton(buttonElement, {
        type: "standard",
        theme: "outline",
        size: "small",
        text: "signin_with",
        shape: "rectangular",
        width: 180,
      });
    } catch (error) {
      console.error(`[auth] ${error?.code || "INITIALIZE_FAILED"}: ${error?.message || error}`);
      if (!auth?.currentUser) {
        setState("error");
      }
    }
  }

  async function getIdToken() {
    if (!auth?.currentUser) {
      return "";
    }
    return auth.currentUser.getIdToken();
  }

  async function signOut() {
    if (!auth) {
      return;
    }
    transitionInProgress = true;
    setState("loading");
    global.google?.accounts?.id?.disableAutoSelect();
    try {
      await auth.signOut();
      const credential = await auth.signInAnonymously();
      transitionInProgress = false;
      applyFirebaseUser(credential.user);
    } catch (error) {
      transitionInProgress = false;
      console.error(`[auth] ${error?.code || "SIGN_OUT_FAILED"}: ${error?.message || error}`);
      setState("error");
    }
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  global.TYPING_WORKBENCH_AUTH = Object.freeze({
    initialize,
    getIdToken,
    signOut,
    subscribe,
  });
})(window);
