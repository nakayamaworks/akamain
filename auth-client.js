(function initializeTypingWorkbenchAuth(global) {
  const config = global.TYPING_WORKBENCH_CONFIG || {};
  const credentialStorageKey = "typing-workbench:gsi-credential";
  const listeners = new Set();
  let idToken = "";
  let profile = null;
  let status = config.googleClientId ? "loading" : "not_configured";

  function decodeJwtPayload(token) {
    try {
      const encodedPayload = token.split(".")[1];
      const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      return JSON.parse(decodeURIComponent(
        global
          .atob(padded)
          .split("")
          .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      ));
    } catch {
      return null;
    }
  }

  function snapshot() {
    return Object.freeze({ status, profile });
  }

  function notify() {
    const current = snapshot();
    listeners.forEach((listener) => listener(current));
  }

  function readStoredCredential() {
    try {
      return global.sessionStorage?.getItem(credentialStorageKey) || "";
    } catch {
      return "";
    }
  }

  function writeStoredCredential(token) {
    try {
      if (token) {
        global.sessionStorage?.setItem(credentialStorageKey, token);
      } else {
        global.sessionStorage?.removeItem(credentialStorageKey);
      }
    } catch {
      // Storage may be unavailable on restricted origins; in-memory login still works.
    }
  }

  function isUsableCredential(payload) {
    return Boolean(
      payload?.sub &&
      payload?.exp &&
      payload.exp * 1000 > Date.now() + 30000 &&
      payload.aud === config.googleClientId &&
      ["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)
    );
  }

  function applyCredential(token, options = {}) {
    const payload = decodeJwtPayload(token);
    if (!isUsableCredential(payload)) {
      return false;
    }
    idToken = token;
    profile = Object.freeze({
      name: payload.name || "Googleユーザー",
      picture: payload.picture || "",
    });
    status = "signed_in";
    if (options.persist !== false) {
      writeStoredCredential(token);
    }
    notify();
    return true;
  }

  function clearCredential(nextStatus = "signed_out") {
    idToken = "";
    profile = null;
    status = nextStatus;
    writeStoredCredential("");
    notify();
  }

  function handleCredential(response) {
    if (!applyCredential(response?.credential || "")) {
      clearCredential("error");
    }
  }

  function loadGoogleIdentity() {
    return new Promise((resolve, reject) => {
      if (global.google?.accounts?.id) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Googleログインを読み込めませんでした。"));
      document.head.append(script);
    });
  }

  async function initialize(buttonElement) {
    if (!config.googleClientId || !buttonElement) {
      status = "not_configured";
      notify();
      return;
    }
    const restored = applyCredential(readStoredCredential(), { persist: false });
    if (!restored) {
      writeStoredCredential("");
    }
    try {
      await loadGoogleIdentity();
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
      if (!restored) {
        status = "signed_out";
        notify();
      }
    } catch {
      if (!restored) {
        clearCredential("error");
      }
    }
  }

  function getIdToken() {
    if (!idToken) {
      return "";
    }
    const payload = decodeJwtPayload(idToken);
    if (!isUsableCredential(payload)) {
      clearCredential("expired");
      return "";
    }
    return idToken;
  }

  function signOut() {
    global.google?.accounts?.id?.disableAutoSelect();
    clearCredential("signed_out");
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
