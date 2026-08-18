import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MODEL,
  PROMPT_VERSION,
  SUPPORTED_SCENARIO_IDS,
  attemptContentFingerprint,
  buildRubricFindings,
  buildModelOutputSchema,
  buildScoringPrompt,
  buildScoringSystemInstruction,
  calculateWeightedTotal,
  createAttemptRecord,
  createFailedScoringResult,
  createReusedScoringResult,
  isScoringSupported,
  isScoringResultCompatible,
  getScenarioRubric,
  normalizeModelOutput,
  scoreAttemptRecordWithGemini,
  stabilizeRevisionScoringResult,
  validateAttemptInput,
} from "../src/scoring-service.js";

const pilotScenarioId = "customer-save-multiple-clicks-duplicate";
const pilotFactIds = Object.values(getScenarioRubric(pilotScenarioId).requiredFacts)
  .flat()
  .map((fact) => fact.id);

const completeModelOutput = {
  dimensions: {
    factualGrounding: 80,
    informationCoverage: 70,
    reproducibility: 60,
    expectedActualSeparation: 90,
    interpretiveClarity: 80,
    investigationReadiness: 70,
  },
  dimensionFeedback: {
    factualGrounding: { reason: "観測事実はありますが、一部の表現が曖昧です。" },
    informationCoverage: { reason: "主要情報の一部が不足しています。" },
    reproducibility: { reason: "操作回数を一意に読み取れません。" },
    expectedActualSeparation: { reason: "期待と実際は概ね区別されています。" },
    interpretiveClarity: { reason: "原因の推測は抑えられています。" },
    investigationReadiness: { reason: "調査は始められますが条件が不足しています。" },
  },
  improvementItems: [{
    priority: "修正推奨",
    title: "発生条件を具体化する",
    detail: "クリック回数と確認対象を具体化してください。",
    whyItMatters: "第三者が同じ条件で再現できるようにするためです。",
    relatedDimensionIds: [
      "factualGrounding",
      "informationCoverage",
      "reproducibility",
      "expectedActualSeparation",
      "interpretiveClarity",
      "investigationReadiness",
    ],
  }],
  verdict: "追加確認を推奨",
  overallAssessment: "現象は伝わりますが、クリック回数の記載が不足しています。",
  readerQuestions: [
    {
      reader: "担当開発者",
      question: "保存ボタンを何回クリックしましたか？",
      whyItMatters: "発生条件を確定するためです。",
      classification: "不足情報",
      factId: "steps-reproducible",
    },
    {
      reader: "QA担当者",
      question: "APIリクエストは何回送信されていますか？",
      whyItMatters: "画面側とサーバー側を切り分けるためです。",
      classification: "調査提案",
      factId: "not-applicable",
    },
  ],
  ambiguityRisks: [
    {
      quote: "何度かクリックした",
      risk: "操作回数を一意に解釈できません。",
      advice: "クリック回数を記載してください。",
    },
  ],
  investigationAdvice: [
    {
      action: "HARで保存APIの送信回数を確認する。",
      purpose: "多重送信かサーバー処理かを切り分けるため。",
    },
  ],
  rewriteSuggestions: [],
  strengths: [{
    evidenceQuote: "保存ボタンを3回クリックする",
    evaluation: "応答待ち中の連続操作という発生条件を特定できています",
    whyItHelps: "開発担当者が多重送信の再現条件をそろえられます。",
  }],
  factAssessments: pilotFactIds.map((factId) => ({
    factId,
    status: "present",
    evidenceQuote: "回答内に記載あり",
  })),
  forbiddenClaimIds: [],
};

function completeOutputForScenario(scenarioId) {
  const rubric = getScenarioRubric(scenarioId);
  const factIds = Object.values(rubric.requiredFacts)
    .flat()
    .map((fact) => fact.id);
  const dimensions = Object.fromEntries(
    rubric.dimensions.map(({ id }) => [id, 80])
  );
  const dimensionFeedback = Object.fromEntries(
    rubric.dimensions.map(({ id }) => [id, {
      reason: "主要な内容は伝わります。",
    }])
  );
  const improvementItems = [{
    priority: "任意改善",
    title: "判断条件を具体化する",
    detail: "判断条件をもう一段具体化してください。",
    whyItMatters: "読み手の確認負荷をさらに下げるためです。",
    relatedDimensionIds: rubric.dimensions.map(({ id }) => id),
  }];
  return {
    ...completeModelOutput,
    dimensions,
    dimensionFeedback,
    improvementItems,
    verdict: rubric.ticketType === "qa" ? "回答依頼可能" : completeModelOutput.verdict,
    investigationAdvice: rubric.ticketType === "qa" ? [] : completeModelOutput.investigationAdvice,
    readerQuestions: completeModelOutput.readerQuestions.map((question) => ({
      ...question,
      classification: "調査提案",
      factId: "not-applicable",
    })),
    factAssessments: factIds.map((factId) => ({
      factId,
      status: "present",
      evidenceQuote: "回答内に記載あり",
    })),
    forbiddenClaimIds: [],
  };
}

test("weighted total follows the pilot rubric weights", () => {
  assert.equal(calculateWeightedTotal(completeModelOutput.dimensions), 74);
});

test("attempt fingerprints ignore revision metadata and order-only changes", () => {
  const first = {
    scenarioId: pilotScenarioId,
    projectId: "customer",
    attemptId: crypto.randomUUID(),
    revisionNumber: 1,
    startedAt: "2026-08-17T01:00:00.000Z",
    completedAt: "2026-08-17T01:05:00.000Z",
    answer: {
      subject: "保存操作で顧客が重複登録される",
      sections: { detail: "保存ボタンを3回クリックする" },
      ticketFields: { priority: "high", watcherIds: ["kikuta", "tsunagi"] },
    },
    selectedEvidenceIds: ["log-b", "log-a"],
    evidenceDescriptions: { "log-a": "APIログ", "log-b": "画面ログ" },
  };
  const sameContent = {
    ...structuredClone(first),
    attemptId: crypto.randomUUID(),
    revisionNumber: 2,
    startedAt: "2026-08-17T02:00:00.000Z",
    completedAt: "2026-08-17T02:05:00.000Z",
    answer: {
      ...structuredClone(first.answer),
      ticketFields: { watcherIds: ["tsunagi", "kikuta"], priority: "high" },
    },
    selectedEvidenceIds: ["log-a", "log-b"],
  };
  assert.equal(attemptContentFingerprint(first), attemptContentFingerprint(sameContent));
  sameContent.answer.sections.detail += "。確認結果は2件";
  assert.notEqual(attemptContentFingerprint(first), attemptContentFingerprint(sameContent));
});

test("an identical revision reuses the exact previous score and feedback", () => {
  const attempt = { attemptId: crypto.randomUUID() };
  const previousResult = {
    schemaVersion: "scoring-result.v3",
    scoringResultId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    status: "succeeded",
    totalScore: 82,
    dimensions: { factualGrounding: 82 },
    dimensionFeedback: { factualGrounding: { reason: "前回の理由" } },
    improvementItems: [],
    verdict: "開発着手可能（軽微な改善あり）",
    overallAssessment: "前回の総評",
    scoredAt: "2026-08-17T01:00:00.000Z",
  };
  const reused = createReusedScoringResult(attempt, previousResult, {
    scoringResultId: "9aa36eba-00ee-4ae0-a918-54eb5e11686f",
    scoredAt: "2026-08-17T02:00:00.000Z",
  });
  assert.equal(reused.attemptId, attempt.attemptId);
  assert.equal(reused.scoringResultId, "9aa36eba-00ee-4ae0-a918-54eb5e11686f");
  assert.equal(reused.totalScore, 82);
  assert.deepEqual(reused.dimensions, previousResult.dimensions);
  assert.deepEqual(reused.dimensionFeedback, previousResult.dimensionFeedback);
  assert.equal(reused.overallAssessment, "前回の総評");
});

function revisionScoringResult(attemptId, score, factStatus, factQuote) {
  const rubric = getScenarioRubric(pilotScenarioId);
  const dimensions = Object.fromEntries(rubric.dimensions.map(({ id }) => [id, score]));
  return {
    schemaVersion: "scoring-result.v3",
    scoringResultId: crypto.randomUUID(),
    attemptId,
    status: "succeeded",
    totalScore: score,
    dimensions,
    dimensionFeedback: Object.fromEntries(
      rubric.dimensions.map(({ id }) => [id, { reason: `${score}点の理由` }])
    ),
    improvementItems: [{
      priority: "修正推奨",
      title: "記述を確認する",
      detail: "記述内容を確認してください。",
      whyItMatters: "調査判断に必要なためです。",
      relatedDimensionIds: rubric.dimensions.map(({ id }) => id),
    }],
    verdict: score >= 80 ? "開発着手可能（軽微な改善あり）" : "追加確認を推奨",
    overallAssessment: `${score}点の総評`,
    rubricFindings: {
      factAssessments: [{
        factId: "steps-reproducible",
        status: factStatus,
        evidenceQuote: factQuote,
      }],
      forbiddenClaimIds: [],
      ticketFieldChecks: [],
      evidenceCheck: { matched: true },
      rawWeightedScore: score,
      scoreCaps: [],
      appliedScoreCap: null,
    },
    rubricVersion: "test",
    promptVersion: "test",
    modelId: "test-model",
    scoredAt: "2026-08-17T01:00:00.000Z",
    errorCode: null,
  };
}

test("a revision cannot lose points from AI variance without an objective regression", () => {
  const previousAttempt = {
    scenarioId: pilotScenarioId,
    projectId: "customer",
    attemptId: crypto.randomUUID(),
    answer: {
      subject: "保存操作で顧客が重複登録される",
      sections: { detail: "保存ボタンを3回クリックする" },
      ticketFields: {},
    },
    selectedEvidenceIds: [],
    evidenceDescriptions: {},
  };
  const currentAttempt = {
    ...structuredClone(previousAttempt),
    attemptId: crypto.randomUUID(),
    answer: {
      ...structuredClone(previousAttempt.answer),
      subject: "保存操作で顧客が2件重複登録される",
    },
  };
  const previousResult = revisionScoringResult(
    previousAttempt.attemptId,
    82,
    "present",
    "保存ボタンを3回クリックする"
  );
  const noisyLowerResult = revisionScoringResult(
    currentAttempt.attemptId,
    74,
    "missing",
    ""
  );
  const stabilized = stabilizeRevisionScoringResult(
    currentAttempt,
    noisyLowerResult,
    previousAttempt,
    previousResult
  );
  assert.equal(stabilized.totalScore, 82);
  assert.match(stabilized.overallAssessment, /AIの採点揺れ/);
  assert.equal(calculateWeightedTotal(stabilized.dimensions, pilotScenarioId), 82);
});

test("a revision may lose points when a previously present fact was actually removed", () => {
  const previousAttempt = {
    scenarioId: pilotScenarioId,
    projectId: "customer",
    attemptId: crypto.randomUUID(),
    answer: {
      subject: "保存操作で顧客が重複登録される",
      sections: { detail: "保存ボタンを3回クリックする" },
      ticketFields: {},
    },
    selectedEvidenceIds: [],
    evidenceDescriptions: {},
  };
  const currentAttempt = {
    ...structuredClone(previousAttempt),
    attemptId: crypto.randomUUID(),
    answer: {
      ...structuredClone(previousAttempt.answer),
      sections: { detail: "保存後に顧客が重複した" },
    },
  };
  const previousResult = revisionScoringResult(
    previousAttempt.attemptId,
    82,
    "present",
    "保存ボタンを3回クリックする"
  );
  const lowerResult = revisionScoringResult(
    currentAttempt.attemptId,
    74,
    "missing",
    ""
  );
  const stabilized = stabilizeRevisionScoringResult(
    currentAttempt,
    lowerResult,
    previousAttempt,
    previousResult
  );
  assert.equal(stabilized.totalScore, 74);
  assert.doesNotMatch(stabilized.overallAssessment, /AIの採点揺れ/);
});

test("inconsistent question classifications are normalized conservatively", () => {
  const normalizedComplete = normalizeModelOutput(completeModelOutput);
  assert.deepEqual(normalizedComplete.strengths, [
    "「保存ボタンを3回クリックする」という記述から、応答待ち中の連続操作という発生条件を特定できています。開発担当者が多重送信の再現条件をそろえられます。",
  ]);
  assert.deepEqual(
    { ...normalizedComplete, strengths: completeModelOutput.strengths },
    completeModelOutput
  );
  const missingWithoutFact = normalizeModelOutput({
      ...completeModelOutput,
      readerQuestions: [{
        ...completeModelOutput.readerQuestions[0],
        factId: "not-applicable",
      }],
    });
  assert.equal(missingWithoutFact.readerQuestions[0].classification, "調査提案");
  const suggestionWithFact = normalizeModelOutput({
      ...completeModelOutput,
      readerQuestions: [{
        ...completeModelOutput.readerQuestions[1],
        factId: "steps-reproducible",
      }],
  });
  assert.equal(suggestionWithFact.readerQuestions[0].factId, "not-applicable");
  const confirmationWithFact = normalizeModelOutput({
    ...completeModelOutput,
    readerQuestions: [{
      ...completeModelOutput.readerQuestions[0],
      classification: "記述確認",
      factId: "steps-reproducible",
    }],
  });
  assert.equal(confirmationWithFact.readerQuestions[0].classification, "記述確認");
  assert.equal(confirmationWithFact.readerQuestions[0].factId, "not-applicable");
});

test("a complete ticket can return no reader questions", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    readerQuestions: [],
  });
  assert.deepEqual(normalized.readerQuestions, []);
});

test("scores without a prioritized improvement are restored to 100", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    improvementItems: [],
  });
  assert.equal(Object.values(normalized.dimensions).every((score) => score === 100), true);
});

test("a ticket with no evidence-based strengths can return an empty strengths list", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    strengths: [],
  });
  assert.deepEqual(normalized.strengths, []);
});

test("feedback cannot quote review-source text as if the learner wrote it", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    strengths: [
      ...completeModelOutput.strengths,
      {
        evidenceQuote: "同一端末で3回検証しました",
        evaluation: "比較確認ができています",
        whyItHelps: "発生範囲を絞れます。",
      },
    ],
  }, pilotScenarioId, {
    answer: {
      subject: "保存ボタンを3回クリックする",
      sections: { detail: "応答待ち中に保存ボタンを3回クリックする" },
    },
    selectedEvidenceIds: [],
  });
  assert.deepEqual(normalized.strengths, [
    "「保存ボタンを3回クリックする」という記述から、応答待ち中の連続操作という発生条件を特定できています。開発担当者が多重送信の再現条件をそろえられます。",
  ]);
});

test("generic praise for filling the form is removed even when its quote exists", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    strengths: [{
      evidenceQuote: "期待結果: あい, 実際の動作: あい",
      evaluation: "期待する動作と実際の動作を分ける形式面の枠組みがあります",
      whyItHelps: "項目ごとの分離の意識は基本に沿っています。",
    }],
  }, pilotScenarioId, {
    answer: {
      subject: "ウェイ",
      sections: { expected: "あい", actual: "あい", raw: "期待結果: あい, 実際の動作: あい" },
    },
    selectedEvidenceIds: [],
  });
  assert.deepEqual(normalized.strengths, []);
});

test("a rewrite for a missing section gets a readable original placeholder", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    rewriteSuggestions: [{
      section: "詳細",
      original: "",
      suggested: "確認した現象を具体的に記載する。",
      reason: "元の記載がないため。",
    }],
  });
  assert.equal(normalized.rewriteSuggestions[0].original, "（未記載）");
});

test("the internal remarks section uses the public surrounding-checks label", () => {
  const normalized = normalizeModelOutput({
    ...completeModelOutput,
    rewriteSuggestions: [{
      section: "備考",
      original: "（未記載）",
      suggested: "Android端末では未確認です。",
      reason: "周辺環境の確認状況を明確にするため。",
    }],
  });
  assert.equal(normalized.rewriteSuggestions[0].section, "周辺確認・補足");
});

test("all registered scenarios can be stored and reviewed", async () => {
  const normalized = validateAttemptInput({
    scenarioId: "customer-context-menu-not-shown",
    projectId: "customer",
    answer: { subject: "題名", sections: { detail: "詳細" } },
  });
  assert.equal(normalized.scenarioId, "customer-context-menu-not-shown");
  assert.equal(normalized.answer.ticketFields.tracker, "bug");
  assert.equal(isScoringSupported(normalized.scenarioId), true);
  assert.equal(SUPPORTED_SCENARIO_IDS.length, 72);
  assert.equal(new Set(SUPPORTED_SCENARIO_IDS).size, 72);
  assert.equal(SUPPORTED_SCENARIO_IDS.every(isScoringSupported), true);
  assert.equal(isScoringSupported("unknown-scenario"), false);
  await assert.rejects(
    () => scoreAttemptRecordWithGemini(
      { ...normalized, scenarioId: "unknown-scenario", attemptId: crypto.randomUUID() },
      { apiKey: "server-only-key" }
    ),
    /AI採点の対象外/
  );
});

test("attachment descriptions are normalized and included in the existing AI review prompt", () => {
  const rubric = getScenarioRubric(pilotScenarioId);
  const selectedEvidenceIds = rubric.evidenceFiles
    .filter(({ required }) => required)
    .map(({ id }) => id);
  const firstEvidenceId = selectedEvidenceIds[0];
  const normalized = validateAttemptInput({
    scenarioId: pilotScenarioId,
    projectId: rubric.projectId,
    answer: {
      subject: "保存操作で顧客が重複登録される",
      sections: { detail: "保存時の挙動を確認した。" },
    },
    selectedEvidenceIds: [...selectedEvidenceIds, selectedEvidenceIds[0]],
    evidenceDescriptions: {
      [firstEvidenceId]: "  14:32付近の顧客登録APIログ  ",
      ignoredEvidence: "選択していないため保存対象外",
    },
  });
  assert.deepEqual(normalized.selectedEvidenceIds, selectedEvidenceIds);
  assert.equal(normalized.evidenceDescriptions[firstEvidenceId], "14:32付近の顧客登録APIログ");
  assert.equal("ignoredEvidence" in normalized.evidenceDescriptions, false);
  const prompt = buildScoringPrompt(normalized);
  assert.match(prompt, /evidenceDescriptionsは起票内容の一部/);
  assert.match(prompt, /investigationReadinessだけで評価/);
  assert.match(prompt, /14:32付近の顧客登録APIログ/);
});

test("revision prompts anchor the review to the previous score and improvements", () => {
  const rubric = getScenarioRubric(pilotScenarioId);
  const previousAttempt = {
    scenarioId: pilotScenarioId,
    projectId: rubric.projectId,
    answer: rubric.writingExample,
    selectedEvidenceIds: [],
    evidenceDescriptions: {},
  };
  const previousScoringResult = {
    status: "succeeded",
    totalScore: 78,
    dimensions: completeModelOutput.dimensions,
    improvementItems: completeModelOutput.improvementItems,
    rubricFindings: { factAssessments: [], forbiddenClaimIds: [] },
  };
  const prompt = buildScoringPrompt(previousAttempt, {
    previousAttempt,
    previousScoringResult,
  });
  assert.match(prompt, /前回版との比較/);
  assert.match(prompt, /前回の改善点が解消した評価軸だけを加点/);
  assert.match(prompt, /"previousScore":78/);
  assert.equal(prompt.includes("userId"), false);
});

test("all registered rubrics produce scenario-specific structured-output schemas", () => {
  SUPPORTED_SCENARIO_IDS.forEach((scenarioId) => {
    const rubric = getScenarioRubric(scenarioId);
    const schema = buildModelOutputSchema(rubric);
    const expectedFactIds = Object.values(rubric.requiredFacts)
      .flat()
      .map((fact) => fact.id)
      .sort();
    const schemaFactIds = [...schema.properties.factAssessments.items.properties.factId.enum]
      .sort();
    assert.deepEqual(schemaFactIds, expectedFactIds);
    assert.deepEqual(
      schema.properties.dimensions.required,
      rubric.dimensions.map((dimension) => dimension.id)
    );
    assert.deepEqual(
      schema.properties.dimensionFeedback.required,
      rubric.dimensions.map((dimension) => dimension.id)
    );
    assert.equal(schema.properties.improvementItems.maxItems, 4);
    assert.equal(schema.properties.readerQuestions.minItems, 0);
    assert.equal(schema.properties.readerQuestions.maxItems, 4);
    assert.deepEqual(
      schema.properties.readerQuestions.items.properties.classification.enum,
      ["不足情報", "記述確認", "調査提案"]
    );
    assert.equal(schema.properties.investigationAdvice.minItems, 0);
    assert.equal(schema.properties.investigationAdvice.maxItems, 4);
    assert.equal(schema.properties.strengths.minItems, 0);
    assert.equal(schema.properties.strengths.maxItems, 2);
    assert.deepEqual(
      schema.properties.strengths.items.required,
      ["evidenceQuote", "evaluation", "whyItHelps"]
    );
  });
});

test("QA scenarios use a question-focused rubric and never ask the model to decide the specification", () => {
  const scenarioId = "customer-qa-search-state-after-back";
  const rubric = getScenarioRubric(scenarioId);
  assert.equal(rubric.ticketType, "qa");
  assert.equal(rubric.qaType, "behavior");
  assert.equal("severity" in rubric.expectedTicketFields, false);
  assert.deepEqual(
    rubric.dimensions.map(({ id }) => id),
    [
      "questionFocus",
      "answerability",
      "sourceGrounding",
      "factInterpretationSeparation",
      "impactClarity",
      "responseEfficiency",
    ]
  );
  const prompt = buildScoringPrompt({
    scenarioId,
    answer: rubric.writingExample,
    selectedEvidenceIds: [],
  });
  const systemInstruction = buildScoringSystemInstruction({ scenarioId });
  assert.match(systemInstruction, /AI自身が仕様回答を決めてはいけません/);
  assert.match(prompt, /不要な聞き返し/);
  assert.match(prompt, /不具合として扱ってよいか/);
  assert.match(prompt, /仕様決定の丸投げとは評価しない/);
  assert.match(prompt, /実務上十分なら100点/);
  assert.match(prompt, /90〜100点はそのまま回答依頼可能/);
  assert.match(prompt, /回答依頼可能/);
  assert.doesNotMatch(prompt, /不具合票を受け取って調査を始める/);
  assert.doesNotMatch(prompt, /AI自身が仕様回答を決めてはいけません/);
  assert.match(
    rubric.reviewSource.observations.map(({ text }) => text).join("\n"),
    /画面内の『一覧へ戻る』リンク/
  );
  assert.match(
    rubric.reviewSource.observations.map(({ text }) => text).join("\n"),
    /検索条件の再設定が必要/
  );
});

test("QA attempts accept the QA tracker and QA verdicts", () => {
  const scenarioId = "ec-qa-free-shipping-after-coupon";
  const rubric = getScenarioRubric(scenarioId);
  const normalizedAttempt = validateAttemptInput({
    scenarioId,
    projectId: rubric.projectId,
    answer: {
      ...rubric.writingExample,
      ticketFields: { tracker: "qa", progress: 0 },
    },
  });
  assert.equal(normalizedAttempt.answer.ticketFields.tracker, "qa");
  const normalizedOutput = normalizeModelOutput(
    completeOutputForScenario(scenarioId),
    scenarioId
  );
  assert.equal(normalizedOutput.verdict, "回答依頼可能");
  const findings = buildRubricFindings({
    scenarioId,
    completedAt: "2026-08-12T01:00:00.000Z",
    answer: { ticketFields: { ...rubric.expectedTicketFields, severity: null } },
    selectedEvidenceIds: [],
  }, normalizedOutput, 88);
  assert.equal(findings.ticketFieldChecks.some(({ field }) => field === "severity"), false);
});

test("QA reader questions keep only genuine answerer-to-author follow-ups", () => {
  const scenarioId = "customer-qa-search-state-after-back";
  const output = completeOutputForScenario(scenarioId);
  output.readerQuestions = [
    {
      reader: "仕様担当者",
      question: "検索条件を保持する修正を不具合として扱っても問題ありませんか？",
      whyItMatters: "不具合として修正してよいか判断するため。",
      classification: "不足情報",
      factId: "question-single-decision",
    },
    {
      reader: "仕様担当者",
      question: "一覧へ戻る際に使用したのは画面内リンクですか？",
      whyItMatters: "遷移経路を特定するため。",
      classification: "不足情報",
      factId: "situation-confirmed-facts",
    },
  ];
  const normalized = normalizeModelOutput(output, scenarioId);
  assert.deepEqual(
    normalized.readerQuestions.map(({ question }) => question),
    ["一覧へ戻る際に使用したのは画面内リンクですか？"]
  );
});

test("QA verdicts follow the learner-facing score bands", async () => {
  const scenarioId = "customer-qa-search-state-after-back";
  const rubric = getScenarioRubric(scenarioId);
  const attempt = createAttemptRecord({
    scenarioId,
    projectId: rubric.projectId,
    answer: {
      ...rubric.writingExample,
      ticketFields: { tracker: "qa", progress: 0 },
    },
  }, { userId: "verified-google-sub" });
  const modelOutput = completeOutputForScenario(scenarioId);
  modelOutput.dimensions = Object.fromEntries(
    rubric.dimensions.map(({ id }) => [id, 85])
  );
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: "server-only-key",
    fetchImplementation: async () => ({
      ok: true,
      async json() {
        return {
          candidates: [{ content: { parts: [{ text: JSON.stringify(modelOutput) }] } }],
        };
      },
    }),
  });
  assert.equal(result.totalScore, 85);
  assert.equal(result.verdict, "回答依頼可能（軽微な改善あり）");
});

test("ready-to-send reviews do not label polish as a required correction", async () => {
  const scenarioId = "customer-qa-search-state-after-back";
  const rubric = getScenarioRubric(scenarioId);
  const attempt = createAttemptRecord({
    scenarioId,
    projectId: rubric.projectId,
    answer: {
      ...rubric.writingExample,
      ticketFields: { tracker: "qa", progress: 0 },
    },
  }, { userId: "verified-google-sub" });
  const modelOutput = completeOutputForScenario(scenarioId);
  modelOutput.dimensions = Object.fromEntries(
    rubric.dimensions.map(({ id }) => [id, 95])
  );
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: "server-only-key",
    fetchImplementation: async () => ({
      ok: true,
      async json() {
        return {
          candidates: [{ content: { parts: [{ text: JSON.stringify(modelOutput) }] } }],
        };
      },
    }),
  });
  assert.equal(result.totalScore, 95);
  assert.equal(result.verdict, "回答依頼可能");
  assert.deepEqual(
    result.improvementItems.map(({ priority }) => priority),
    ["任意改善"]
  );
});

test("a reproducibility mismatch is consolidated without overwhelming an otherwise usable ticket", async () => {
  const scenarioId = "ec-payment-notification-double-order";
  const rubric = getScenarioRubric(scenarioId);
  const attempt = createAttemptRecord({
    scenarioId,
    projectId: rubric.projectId,
    answer: {
      ...rubric.writingExample,
      sections: {
        ...rubric.writingExample.sections,
        expected: "処理済みの通知IDを再受信した場合、初回の注文結果を返すこと",
        reproducibility: "2/15",
      },
      ticketFields: { tracker: "bug", progress: 0 },
    },
    selectedEvidenceIds: rubric.evidenceFiles.filter(({ required }) => required).map(({ id }) => id),
  }, { userId: "verified-google-sub" });
  const modelOutput = completeOutputForScenario(scenarioId);
  modelOutput.dimensions = Object.fromEntries(rubric.dimensions.map(({ id }) => [id, 60]));
  modelOutput.improvementItems = [
    {
      priority: "修正推奨",
      title: "再現回数を訂正する",
      detail: "2/15を1/15へ訂正してください。",
      whyItMatters: "発生頻度を正確に伝えるためです。",
      relatedDimensionIds: ["factualGrounding"],
    },
    {
      priority: "修正推奨",
      title: "再現性欄の発生回数の修正",
      detail: "再現性を15回中1回発生へ修正してください。",
      whyItMatters: "調査担当者の誤認を防ぐためです。",
      relatedDimensionIds: ["reproducibility"],
    },
    {
      priority: "任意改善",
      title: "切り分け状況の補足",
      detail: "注文API側と周辺処理側のどちらに原因があるか未分明であると追記してください。",
      whyItMatters: "原因の切り分け状況を伝えるためです。",
      relatedDimensionIds: ["informationCoverage", "investigationReadiness"],
    },
  ];
  modelOutput.rewriteSuggestions = [
    {
      section: "詳細",
      original: rubric.writingExample.sections.detail,
      suggested: "同じ通知を再送したところ、異なる注文番号の注文が2件作成されました。",
      reason: "観測記録に合わせるためです。",
    },
    {
      section: "再現性",
      original: "2/15",
      suggested: "15回中1回発生",
      reason: "発生回数を訂正するためです。",
    },
  ];
  modelOutput.strengths = [];
  modelOutput.factAssessments = modelOutput.factAssessments.map((assessment) =>
    assessment.factId === "reproducibility-observed"
      ? { ...assessment, status: "contradicted", evidenceQuote: "2/15" }
      : assessment
  );
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: "server-only-key",
    fetchImplementation: async () => ({
      ok: true,
      async json() {
        return { candidates: [{ content: { parts: [{ text: JSON.stringify(modelOutput) }] } }] };
      },
    }),
  });
  assert.equal(result.totalScore, 93);
  assert.equal(result.verdict, "開発着手可能");
  assert.equal(result.improvementItems[0].priority, "修正推奨");
  assert.equal(result.improvementItems.filter(({ priority }) => priority === "修正推奨").length, 1);
  assert.equal(result.improvementItems.filter(({ title }) => /再現/u.test(title)).length, 1);
  assert.equal(result.improvementItems[1].title, "確認済みの影響範囲を補足する");
  assert.deepEqual(result.rewriteSuggestions, []);
  assert.match(result.strengths[0], /初回の注文結果を返すこと/);
  assert.match(result.overallAssessment, /15回中1回発生/);
});

test("the customer search-state QA accepts both UI and workflow categories while recommending UI", () => {
  const scenarioId = "customer-qa-search-state-after-back";
  const rubric = getScenarioRubric(scenarioId);
  const normalizedOutput = normalizeModelOutput(
    completeOutputForScenario(scenarioId),
    scenarioId
  );
  const findings = buildRubricFindings({
    scenarioId,
    completedAt: "2026-08-12T01:00:00.000Z",
    answer: {
      ticketFields: {
        priority: "normal",
        category: "workflow",
        version: "App version: 2.3.1",
        environment: "Google Chrome 126.0.6478.127 / Windows 11 23H2",
        assigneeId: "tsunagi",
        watcherIds: ["tsunagi", "kikuta"],
        dueDate: null,
      },
    },
    selectedEvidenceIds: [],
  }, normalizedOutput, 100);
  const categoryCheck = findings.ticketFieldChecks.find(({ field }) => field === "category");
  assert.equal(categoryCheck.matched, true);
  assert.equal(categoryCheck.recommendedMatch, false);
  assert.equal(categoryCheck.recommended, "ui");
  assert.deepEqual([...categoryCheck.accepted], ["ui", "workflow"]);
});

test("the mobile data-loss prompt rewards scenario-specific analysis without scoring future research", () => {
  const scenarioId = "mobile-background-sync-data-lost";
  const rubric = getScenarioRubric(scenarioId);
  const prompt = buildScoringPrompt({
    scenarioId,
    answer: {
      subject: rubric.writingExample.subject,
      sections: rubric.writingExample.sections,
    },
    selectedEvidenceIds: rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id),
  });
  assert.match(prompt, /同じ発生条件では1\/25、メモリ解放なしでは0\/25/);
  assert.match(prompt, /低頻度のため、iOS固有または3\.4\.0でのデグレとはまだ断定していません/);
  assert.match(prompt, /nonScoringInvestigationIdeasは不足情報や減点理由ではなく/);
  assert.match(prompt, /期待結果と実際の動作が分かれている/);
  assert.match(prompt, /唯一の正解文はありません/);
  assert.match(prompt, /記載例より有効な比較確認や切り分け/);
  assert.match(prompt, /strengthsは0〜2件/);
  assert.doesNotMatch(prompt, /"writingExample"/);
});

test("bug and QA reviews use ticket-specific system instructions", () => {
  const bugInstruction = buildScoringSystemInstruction({
    scenarioId: "customer-save-multiple-clicks-duplicate",
  });
  const qaInstruction = buildScoringSystemInstruction({
    scenarioId: "customer-qa-search-state-after-back",
  });
  assert.match(bugInstruction, /シニア開発者兼QAリード/);
  assert.match(bugInstruction, /改善点がなければ無理に指摘を生成しない/);
  assert.doesNotMatch(bugInstruction, /仕様回答を決めてはいけません/);
  assert.match(qaInstruction, /仕様作成者としてQA起票を受け取り/);
  assert.match(qaInstruction, /AI自身が仕様回答を決めてはいけません/);
  assert.doesNotMatch(qaInstruction, /不具合票を受け取って調査を始める/);
});

test("semantic rubric policy does not require trace identifiers in ticket prose", () => {
  const rubric = getScenarioRubric("ec-payment-notification-double-order");
  assert.equal(rubric.factAssessmentPolicy.semanticEquivalence, true);
  assert.match(rubric.factAssessmentPolicy.sourceMaterialRule, /writingExampleは判定に使用しない/);
  assert.match(
    rubric.reviewSource.observations.map(({ text }) => text).join("\n"),
    /同一の決済IDおよび通知ID/
  );

  const prompt = buildScoringPrompt({
    scenarioId: rubric.scenarioId,
    answer: {
      subject: "決済通知を再送すると同一決済の注文が重複作成される",
      sections: {
        detail: "初回処理済みの通知を同じ通知IDと決済IDで再送すると、異なる注文番号が2件作成された。",
      },
    },
    selectedEvidenceIds: ["webhook-replay-log", "duplicate-orders", "order-admin-screen"],
  });
  assert.match(prompt, /追跡用識別子/);
  assert.match(prompt, /本文に具体値がなくても不足にしない/);
  assert.match(prompt, /learnerVisibleContextを除く観測記録は、AI採点者だけが持つ/);
});

test("all bug rubrics share learner-visible judgement context with Gemini", () => {
  const bugRubrics = SUPPORTED_SCENARIO_IDS
    .map((scenarioId) => getScenarioRubric(scenarioId))
    .filter((rubric) => rubric.ticketType !== "qa");
  assert.equal(bugRubrics.length, 36);
  for (const rubric of bugRubrics) {
    assert.ok(rubric.reviewSource.learnerVisibleContext.confirmedImpactScope);
    assert.ok(rubric.reviewSource.learnerVisibleContext.confirmedWorkaround);
    assert.ok(rubric.reviewSource.learnerVisibleContext.confirmedRecovery);
    assert.ok(rubric.reviewSource.learnerVisibleContext.riskAssessment);
  }
});

test("confirmed tax impact scope is explicit scoring evidence, not a forbidden claim", () => {
  const scenarioId = "ec-tax-rounding-inconsistent";
  const rubric = getScenarioRubric(scenarioId);
  const confirmedScope = rubric.reviewSource.learnerVisibleContext.confirmedImpactScope;
  assert.match(confirmedScope, /商品一覧の表示、注文金額、会計連携の間で1円の差/);

  const prompt = buildScoringPrompt({
    scenarioId,
    answer: {
      subject: "消費税計算で1円未満の端数が発生する商品を複数選択すると、商品一覧の表示、注文金額、会計連携の間で1円の差が生じてしまう",
      sections: rubric.writingExample.sections,
    },
    selectedEvidenceIds: rubric.evidenceFiles.filter(({ required }) => required).map(({ id }) => id),
  });
  assert.match(prompt, /受講者にも提示された周辺情報/);
  assert.match(prompt, /意味的に一致する場合、未確認の範囲・影響・回避策として指摘せず/);
  assert.match(prompt, /商品一覧の表示、注文金額、会計連携の間で1円の差/);
  assert.match(prompt, /画面上で『追加で確認できること』として表示/);
  assert.match(prompt, /すでに確認済みの内容を、これから行う確認として重複提案してはいけません/);
  assert.match(prompt, /item=B base=105 tax=10% mode=round result=116/);
  assert.match(prompt, /B,105,10,floor/);
  assert.match(prompt, /商品Bだけ異なる端数処理が使われた計算過程/);
  assert.match(prompt, /入力設定は同一であり、商品マスタ差によるものではない/);
  assert.match(prompt, /内部フィールド名や証跡IDを表示せず/);
  assert.match(prompt, /設定値の変換箇所、呼び出し元、条件分岐、画面ごとの処理経路/);
  assert.match(prompt, /題名に書かれた発生操作や条件が操作手順に存在するか/);
});

test("attachment-description feedback uses filenames and only lowers investigation readiness", () => {
  const scenarioId = "ec-tax-rounding-inconsistent";
  const rubric = getScenarioRubric(scenarioId);
  const output = completeOutputForScenario(scenarioId);
  output.dimensions.informationCoverage = 85;
  output.dimensions.investigationReadiness = 75;
  output.dimensionFeedback.informationCoverage.reason = "evidenceDescriptionsが空欄です。";
  output.improvementItems = [{
    priority: "任意改善",
    title: "添付ファイルの説明を追加する",
    detail: "product-settings、price-comparison、pricing-traceの説明欄が空欄です。",
    whyItMatters: "証跡を開く前に内容を把握しやすくするためです。",
    relatedDimensionIds: ["informationCoverage", "investigationReadiness"],
  }];
  const normalized = normalizeModelOutput(output, scenarioId);
  assert.equal(normalized.dimensions.informationCoverage, 100);
  assert.equal(normalized.dimensions.investigationReadiness, 90);
  assert.deepEqual(
    normalized.improvementItems[0].relatedDimensionIds,
    ["investigationReadiness"]
  );
  assert.match(normalized.improvementItems[0].detail, /product_tax_settings_103010\.csv/);
  assert.match(normalized.improvementItems[0].detail, /product_tax_comparison_103014\.png/);
  assert.match(normalized.improvementItems[0].detail, /pricing_calculation_103013\.log/);
  assert.doesNotMatch(normalized.improvementItems[0].detail, /product-settings|price-comparison|pricing-trace/);
});

test("scoring results are reusable only with current rubric, prompt, and model", () => {
  const attempt = { scenarioId: "ec-tax-rounding-inconsistent" };
  const rubric = getScenarioRubric(attempt.scenarioId);
  const result = {
    status: "succeeded",
    totalScore: 90,
    rubricVersion: rubric.rubricVersion,
    promptVersion: PROMPT_VERSION,
    modelId: DEFAULT_MODEL,
  };
  assert.equal(isScoringResultCompatible(result, attempt), true);
  assert.equal(isScoringResultCompatible({ ...result, rubricVersion: "old" }, attempt), false);
  assert.equal(isScoringResultCompatible({ ...result, promptVersion: "old" }, attempt), false);
  assert.equal(isScoringResultCompatible({ ...result, modelId: "other-model" }, attempt), false);
});

test("bug reader questions never expose evaluator-only observations", () => {
  const scenarioId = "ec-payment-notification-double-order";
  const rubric = getScenarioRubric(scenarioId);
  const output = completeOutputForScenario(scenarioId);
  output.readerQuestions = [
    {
      reader: "バックエンドエンジニア",
      question: "比較検証で行った15回中1回発生したという事実との違いを確認させてください。",
      whyItMatters: "発生頻度を正確に把握するためです。",
      classification: "記述確認",
      factId: "not-applicable",
    },
    {
      reader: "バックエンドエンジニア",
      question: "2回発生した際は、いずれも同じ操作条件でしたか？",
      whyItMatters: "発生条件を絞り込むためです。",
      classification: "記述確認",
      factId: "not-applicable",
    },
  ];
  const normalized = normalizeModelOutput(output, scenarioId, {
    answer: rubric.writingExample,
    selectedEvidenceIds: rubric.evidenceFiles.filter(({ required }) => required).map(({ id }) => id),
  });
  assert.deepEqual(
    normalized.readerQuestions.map(({ question }) => question),
    ["2回発生した際は、いずれも同じ操作条件でしたか？"]
  );
});

test("trace identifiers are not requested when the ticket and evidence already identify the event", () => {
  const scenarioId = "ec-payment-notification-double-order";
  const output = completeOutputForScenario(scenarioId);
  output.improvementItems = [
    {
      priority: "任意改善",
      title: "検証時の通知IDや手順の具体化",
      detail: "操作手順や詳細に、対象の通知ID（PAY-4821など）を補足してください。",
      whyItMatters: "ログ調査を始めやすくするためです。",
      relatedDimensionIds: ["informationCoverage"],
    },
    {
      priority: "修正推奨",
      title: "再現手順の具体化",
      detail: "『任意の注文を確定する』手順を改め、同じ通知IDを再送する手順に書き換えてください。",
      whyItMatters: "第三者が検証を始めやすくするためです。",
      relatedDimensionIds: ["reproducibility"],
    },
  ];
  const normalized = normalizeModelOutput(output, scenarioId, {
    answer: {
      subject: "同一の決済通知で注文が重複作成される",
      sections: { detail: "同じ決済通知を再送すると異なる注文番号が2件作成される。" },
    },
    selectedEvidenceIds: ["webhook-replay-log", "duplicate-orders", "order-admin-screen"],
  });
  assert.equal(
    normalized.improvementItems.some((item) => /通知ID|決済ID|注文番号/u.test(item.title)),
    false
  );
  assert.equal(normalized.improvementItems[0].title, "確認済みの影響範囲を補足する");
  assert.equal(normalized.dimensions.informationCoverage, 90);
  assert.equal(normalized.dimensions.reproducibility, 100);
});

test("notification review treats standard delivery operations as known and unsupported additions as confirmation", () => {
  const scenarioId = "mobile-notification-opens-wrong-news";
  const rubric = getScenarioRubric(scenarioId);
  const prompt = buildScoringPrompt({
    scenarioId,
    answer: {
      subject: "プッシュ通知から直接開くと一つ前のお知らせを表示することがある",
      sections: {
        preconditions: "検証データ初期状態",
        steps: "1. NEWS-101をプッシュ通知する\n2. 届いた通知を開く\n3. NEWS-102をプッシュ通知する\n4. 届いた通知を開く",
        expected: "NEWS-102の内容が表示されること",
        actual: "NEWS-101が表示されることがある",
      },
    },
    selectedEvidenceIds: ["notification-payload", "notification-video", "navigation-log"],
  });
  assert.equal(rubric.rubricVersion, "mobile-notification-opens-wrong-news.v6");
  assert.match(prompt, /NEWS-101を送信して開封した端末/);
  assert.match(prompt, /手順書レベルの詳細を不足扱いしない/);
  assert.match(prompt, /実施済みの事実か、再現のために補った推測か/);
  assert.match(prompt, /classificationを『記述確認』/);
  assert.match(prompt, /受講者へ提示されていない情報を答えさせる質問/);
});

test("each scenario uses its own rubric, ticket fields, and evidence requirements", () => {
  const scenarioId = "customer-search-nonexistent-name-all-results";
  const rubric = getScenarioRubric(scenarioId);
  const attempt = {
    scenarioId,
    answer: {
      subject: "存在しない氏名で検索しても全件表示される",
      sections: { 詳細: "該当なしでも248件表示された" },
      ticketFields: rubric.expectedTicketFields,
    },
    selectedEvidenceIds: rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id),
    completedAt: "2026-08-05T01:30:00.000Z",
  };
  const prompt = buildScoringPrompt(attempt);
  assert.match(prompt, /customer-search-nonexistent-name-all-results\.v5/);
  assert.match(prompt, /selectedEvidenceIds/);
  assert.match(prompt, /検索結果は0件/);
});

test("a non-pilot scenario is scored with its own rubric version and findings", async () => {
  const scenarioId = "customer-search-nonexistent-name-all-results";
  const attempt = createAttemptRecord({
    scenarioId,
    projectId: "customer",
    answer: {
      subject: "存在しない氏名で検索しても全件表示される",
      sections: { detail: "該当なしでも248件表示された" },
    },
    selectedEvidenceIds: [],
  }, { userId: "verified-google-sub" });
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: "server-only-key",
    modelId: "test-model",
    fetchImplementation: async () => ({
      ok: true,
      async json() {
        return {
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(completeOutputForScenario(scenarioId)) }],
            },
          }],
        };
      },
    }),
  });
  assert.equal(result.schemaVersion, "scoring-result.v3");
  assert.equal(result.rubricVersion, `${scenarioId}.v5`);
  assert.equal(result.rubricFindings.factAssessments.length, 7);
  assert.equal(result.rubricFindings.evidenceCheck.matched, false);
});

test("rubric findings apply deterministic caps to critical omissions and unsupported claims", () => {
  const rubric = getScenarioRubric(pilotScenarioId);
  const output = {
    ...completeModelOutput,
    factAssessments: completeModelOutput.factAssessments.map((assessment, index) =>
      index === 0 ? { ...assessment, status: "missing", evidenceQuote: "" } : assessment
    ),
    forbiddenClaimIds: ["claim-database-lock"],
  };
  const findings = buildRubricFindings({
    scenarioId: pilotScenarioId,
    completedAt: "2026-08-05T01:30:00.000Z",
    answer: { ticketFields: rubric.expectedTicketFields },
    selectedEvidenceIds: rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id),
  }, output, 96);
  assert.equal(findings.appliedScoreCap, 74);
  assert.deepEqual(findings.forbiddenClaimIds, ["claim-database-lock"]);
  assert.equal(
    findings.ticketFieldChecks.find(({ field }) => field === "dueDate").expected,
    "2026-08-10"
  );
});

test("attempt v3 persists revision identity and normalized Redmine-style ticket fields", () => {
  const attempt = createAttemptRecord({
    scenarioId: "customer-context-menu-not-shown",
    projectId: "customer",
    answer: {
      subject: "題名",
      sections: { detail: "詳細" },
      ticketFields: {
        tracker: "bug",
        status: "new",
        severity: "s2",
        priority: "high",
        assigneeId: "tsunagi",
        category: "workflow",
        startDate: "2026-08-03",
        progress: 0,
        watcherIds: ["kikuta"],
      },
    },
  }, { userId: "verified-google-sub" });

  assert.equal(attempt.schemaVersion, "attempt.v3");
  assert.equal(attempt.ticketId, attempt.attemptId);
  assert.equal(attempt.revisionNumber, 1);
  assert.equal(attempt.parentAttemptId, null);
  assert.equal(attempt.answer.ticketFields.priority, "high");
  assert.equal(attempt.answer.ticketFields.assigneeId, "tsunagi");
  assert.deepEqual(attempt.answer.ticketFields.watcherIds, ["kikuta"]);
});

test("the attempt record exists before Gemini scoring starts", async () => {
  const attempt = createAttemptRecord({
    scenarioId: "customer-save-multiple-clicks-duplicate",
    projectId: "customer",
    answer: { subject: "題名", sections: { detail: "詳細" } },
  }, {
    userId: "verified-google-sub",
    attemptId: "9aa36eba-00ee-4ae0-a918-54eb5e11686f",
  });

  assert.equal(attempt.userId, "verified-google-sub");
  assert.equal(attempt.schemaVersion, "attempt.v3");
  assert.equal(attempt.attemptId, "9aa36eba-00ee-4ae0-a918-54eb5e11686f");
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: "server-only-key",
    modelId: "test-model",
    fetchImplementation: async (_url, request) => {
      const sentBody = JSON.parse(request.body);
      assert.equal(sentBody.contents[0].parts[0].text.includes("verified-google-sub"), false);
      assert.match(
        sentBody.systemInstruction.parts[0].text,
        /不具合票を受け取って調査を始めるシニア開発者兼QAリード/
      );
      assert.doesNotMatch(
        sentBody.contents[0].parts[0].text,
        /不具合票を受け取って調査を始めるシニア開発者兼QAリード/
      );
      assert.equal(Number.isInteger(sentBody.generationConfig.seed), true);
      assert.equal("temperature" in sentBody.generationConfig, false);
      return {
        ok: true,
        async json() {
          return {
            candidates: [{ content: { parts: [{ text: JSON.stringify(completeModelOutput) }] } }],
          };
        },
      };
    },
  });

  assert.equal(result.attemptId, attempt.attemptId);
  assert.equal(result.status, "succeeded");
  assert.equal(result.totalScore, 74);
});

test("a Gemini outage is represented without turning it into a zero score", () => {
  const result = createFailedScoringResult(
    { attemptId: "9aa36eba-00ee-4ae0-a918-54eb5e11686f" },
    Object.assign(new Error("quota"), { code: "RATE_LIMITED" }),
    { modelId: "test-model", scoredAt: "2026-08-01T00:00:00.000Z" }
  );

  assert.equal(result.status, "unavailable");
  assert.equal(result.totalScore, null);
  assert.equal(result.verdict, null);
  assert.equal(result.errorCode, "RATE_LIMITED");
});
