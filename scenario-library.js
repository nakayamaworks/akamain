(() => {
  const getSectionEntries = (scenario, sectionName) => {
    const entries = scenario.report || [];
    const start = entries.findIndex(
      (entry) => entry.kind === "section" && entry.text === sectionName
    );
    if (start < 0) {
      return [];
    }
    const lines = [];
    for (let index = start + 1; index < entries.length; index += 1) {
      if (entries[index].kind === "section") {
        break;
      }
      if (entries[index].kind === "line") {
        lines.push(entries[index]);
      }
    }
    return lines;
  };

  // 旧来の参照箇所向けの互換ビュー。編集元は scenario-authoring-library.js のみ。
  window.TYPING_WORKBENCH_SCENARIOS = Object.values(
    window.TYPING_WORKBENCH_SCENARIO_AUTHORING || {}
  ).map(({ scenario }) => {
    const detail = getSectionEntries(scenario, "■詳細");
    const expected = getSectionEntries(scenario, "■期待結果")[0];
    const actual = getSectionEntries(scenario, "■実際の動作")[0];
    const reproducibility = getSectionEntries(scenario, "■再現性")[0];
    return {
      scenarioId: scenario.scenarioId,
      projectId: scenario.projectId,
      difficulty: scenario.difficulty,
      subject: scenario.subject.text,
      subjectAnswer: scenario.subject.answers[0],
      detail: detail.map(({ text }) => text).join(" "),
      detailAnswer: detail.map(({ answers }) => answers[0]).join(" "),
      expected: expected?.text || "",
      expectedAnswer: expected?.answers?.[0] || "",
      actual: actual?.text || "",
      actualAnswer: actual?.answers?.[0] || "",
      reproducibility: reproducibility?.text || "",
    };
  });
})();
