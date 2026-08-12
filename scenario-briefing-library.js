(() => {
  // 画面表示用の互換ビュー。編集元は scenario-authoring-library.js のみ。
  window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS = Object.freeze(
    Object.fromEntries(
      Object.entries(window.TYPING_WORKBENCH_SCENARIO_AUTHORING || {}).map(
        ([scenarioId, profile]) => [scenarioId, profile.briefing]
      )
    )
  );
})();
