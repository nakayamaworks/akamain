import assert from "node:assert/strict";
import test from "node:test";
import {
  SUPPORTED_SCENARIO_IDS,
  buildRubricFindings,
  buildModelOutputSchema,
  buildScoringPrompt,
  calculateWeightedTotal,
  createAttemptRecord,
  createFailedScoringResult,
  isScoringSupported,
  getScenarioRubric,
  normalizeModelOutput,
  scoreAttemptRecordWithGemini,
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
  assert.equal(SUPPORTED_SCENARIO_IDS.length, 30);
  assert.equal(new Set(SUPPORTED_SCENARIO_IDS).size, 30);
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
    assert.equal(
      schema.properties.investigationAdvice.minItems,
      rubric.ticketType === "qa" ? 0 : 1
    );
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
  assert.match(prompt, /AI自身が仕様回答を決めてはいけません/);
  assert.match(prompt, /不要な聞き返し/);
  assert.match(prompt, /不具合として扱ってよいか/);
  assert.match(prompt, /仕様決定の丸投げとは評価しない/);
  assert.match(prompt, /実務上十分なら100点/);
  assert.match(prompt, /90〜100点はそのまま回答依頼可能/);
  assert.match(prompt, /回答依頼可能/);
  assert.doesNotMatch(prompt, /不具合票を受け取って調査を始める/);
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
  assert.equal(rubric.rubricVersion, "mobile-notification-opens-wrong-news.v4");
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
  assert.match(prompt, /customer-search-nonexistent-name-all-results\.v3/);
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
  assert.equal(result.rubricVersion, `${scenarioId}.v3`);
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
