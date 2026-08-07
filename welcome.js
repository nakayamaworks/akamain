(function initializeWelcomePage(global) {
  const auth = global.TYPING_WORKBENCH_AUTH;
  const elements = {
    signedOutView: document.getElementById("signedOutView"),
    signedInView: document.getElementById("signedInView"),
    googleSignInButton: document.getElementById("googleSignInButton"),
    authLoading: document.getElementById("authLoading"),
    authMessage: document.getElementById("authMessage"),
    userName: document.getElementById("userName"),
    userAvatar: document.getElementById("userAvatar"),
    userAvatarFallback: document.getElementById("userAvatarFallback"),
  };

  function setAvatar(profile) {
    const name = profile?.name || "Googleユーザー";
    const picture = profile?.picture || "";
    elements.userName.textContent = name;
    elements.userAvatarFallback.textContent = name.trim().charAt(0).toUpperCase() || "A";

    if (picture) {
      elements.userAvatar.src = picture;
      elements.userAvatar.alt = `${name}さんのプロフィール画像`;
      elements.userAvatar.hidden = false;
      elements.userAvatarFallback.hidden = true;
      return;
    }

    elements.userAvatar.removeAttribute("src");
    elements.userAvatar.alt = "";
    elements.userAvatar.hidden = true;
    elements.userAvatarFallback.hidden = false;
  }

  function renderAuthState(authState) {
    const signedIn = authState.status === "signed_in";
    const loading = authState.status === "loading";

    elements.signedOutView.hidden = signedIn;
    elements.signedInView.hidden = !signedIn;
    elements.googleSignInButton.hidden = signedIn || loading || authState.status === "not_configured";
    elements.authLoading.hidden = !loading;
    elements.authLoading.setAttribute("aria-busy", String(loading));
    elements.authMessage.textContent = "";

    if (signedIn) {
      setAvatar(authState.profile);
      return;
    }

    if (authState.status === "not_configured") {
      elements.authLoading.hidden = true;
      elements.authMessage.textContent = "Googleログインの設定が見つかりません。管理者にお問い合わせください。";
    } else if (authState.status === "error") {
      elements.authLoading.hidden = true;
      elements.authMessage.textContent = "Googleログインを読み込めませんでした。通信環境を確認して再読み込みしてください。";
    } else if (authState.status === "expired") {
      elements.authMessage.textContent = "ログインの有効期限が切れました。もう一度ログインしてください。";
    }
  }

  elements.userAvatar.addEventListener("error", () => {
    elements.userAvatar.hidden = true;
    elements.userAvatarFallback.hidden = false;
  });

  if (!auth) {
    renderAuthState({ status: "not_configured", profile: null });
    return;
  }

  auth.subscribe(renderAuthState);
  auth.initialize(elements.googleSignInButton);
})(window);
