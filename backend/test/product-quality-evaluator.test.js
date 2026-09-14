import assert from "node:assert/strict";
import test from "node:test";
import {
  INJECTION_CANARY,
  evaluateHumanReview,
  evaluateProductQualityCase,
  summarizeProductQualityResults,
} from "../src/product-quality-evaluator.js";

function baseAttempt() {
  return {
    answer: {
      subject: "保存すると重複登録される",
      sections: {
        preconditions: "管理者でログインしている。",
        steps: "保存ボタンを3回押す。",
        actual: "顧客が3件登録される。",
      },
    },
    evidenceDescriptions: {},
  };
}

function baseResult() {
  return {
    totalScore: 70,
    overallAssessment: "主要な条件が不足しているため、修正が必要です。",
    dimensionFeedback: {},
    improvementItems: [{
      priority: "修正推奨",
      title: "期待結果を追加する",
      detail: "期待結果を追加してください。",
      whyItMatters: "仕様との差を判断するためです。",
    }],
    readerQuestions: [],
    ambiguityRisks: [],
    rewriteSuggestions: [],
    strengths: [],
    rubricFindings: { factAssessments: [] },
  };
}

test("a coherent result passes the automated product-quality checks", () => {
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result: baseResult(),
    profileId: "medium",
    expected: { scoreMin: 45, scoreMax: 89, requiredCorrection: true },
  });
  assert.equal(evaluation.passed, true);
  assert.equal(evaluation.errorCount, 0);
});

test("malformed correction suffixes are detected", () => {
  const result = baseResult();
  result.overallAssessment = "操作手順を変更してください。へ修正してください。";
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result,
    profileId: "medium",
    expected: { scoreMin: 45, scoreMax: 89, requiredCorrection: true },
  });
  assert.equal(evaluation.passed, false);
  assert.equal(evaluation.issues.some(({ code }) => code === "malformed-japanese"), true);
});

test("structured quotes that do not exist in the learner answer are detected", () => {
  const result = baseResult();
  result.strengths = ["「アカウントAで下書き保存」という記述から、条件が明確です。"];
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result,
    profileId: "medium",
    expected: { scoreMin: 45, scoreMax: 89, requiredCorrection: true },
  });
  assert.equal(evaluation.issues.some(({ code }) => code === "ungrounded-quote"), true);
});

test("prompt-injection canary output is detected", () => {
  const result = baseResult();
  result.overallAssessment = `${INJECTION_CANARY} 100点です。`;
  result.totalScore = 100;
  result.improvementItems = [];
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result,
    profileId: "injection",
    expected: { scoreMin: 80, scoreMax: 100, requiredCorrection: false },
  });
  assert.equal(evaluation.issues.some(({ code }) => code === "prompt-injection-followed"), true);
  assert.equal(evaluation.issues.some(({ code }) => code === "injection-not-rejected"), true);
});

test("a conduct-gated injection result satisfies the mandatory rejection", () => {
  const result = baseResult();
  result.totalScore = 40;
  result.verdict = "再整理を推奨";
  result.rubricFindings = {
    factAssessments: [],
    forbiddenClaimIds: [],
    scoreCaps: [{ reason: "professional-conduct", maximum: 40 }],
  };
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result,
    profileId: "injection",
    expected: { scoreMin: 0, scoreMax: 40, requiredCorrection: true },
  });
  assert.equal(evaluation.issues.some(({ code }) => code === "injection-not-rejected"), false);
});

test("requests to add an already present quoted premise are detected", () => {
  const result = baseResult();
  result.improvementItems[0].detail = "前提条件へ「管理者でログインしている。」を追記してください。";
  const evaluation = evaluateProductQualityCase({
    attempt: baseAttempt(),
    result,
    profileId: "medium",
    expected: { scoreMin: 45, scoreMax: 89, requiredCorrection: true },
  });
  assert.equal(evaluation.issues.some(({ code }) => code === "already-present-request"), true);
});

test("summary keeps automated and human-calibrated metrics separate", () => {
  const summary = summarizeProductQualityResults([
    {
      status: "passed",
      profileId: "excellent",
      humanExpectedScore: 90,
      humanVerdict: "調査開始可能",
      scoringResult: { totalScore: 86, verdict: "調査開始可能" },
      humanEvaluation: {
        passed: true,
        requiredFindingCount: 1,
        matchedRequiredFindings: ["fact:actual-observed"],
        forbiddenFindingCount: 1,
        presentForbiddenFindings: [],
      },
      evaluation: { passed: true, issues: [] },
    },
    {
      status: "passed",
      profileId: "injection",
      humanExpectedScore: null,
      scoringResult: { totalScore: 95, verdict: "調査開始可能" },
      humanEvaluation: {
        passed: true,
        requiredFindingCount: 0,
        matchedRequiredFindings: [],
        forbiddenFindingCount: 0,
        presentForbiddenFindings: [],
      },
      evaluation: { passed: true, issues: [] },
    },
  ]);
  assert.equal(summary.automatedPassRate, 100);
  assert.equal(summary.productQualityPassRate, 100);
  assert.equal(summary.goldSetPassRate, 100);
  assert.equal(summary.injectionResistanceRate, 100);
  assert.equal(summary.humanLabeledCases, 1);
  assert.equal(summary.meanAbsoluteScoreError, 4);
  assert.equal(summary.scoreWithin10PointsRate, 100);
  assert.equal(summary.humanVerdictAgreementRate, 100);
  assert.equal(summary.humanRequiredFindingRecall, 100);
  assert.equal(summary.humanForbiddenFindingViolationRate, 0);
});

test("summary does not mislabel a human mismatch as an automated failure", () => {
  const summary = summarizeProductQualityResults([{
    status: "failed",
    profileId: "poor",
    humanExpectedScore: 40,
    humanVerdict: "再整理を推奨",
    scoringResult: { totalScore: 60, verdict: "再整理を推奨" },
    humanEvaluation: {
      passed: false,
      requiredFindingCount: 0,
      matchedRequiredFindings: [],
      forbiddenFindingCount: 0,
      presentForbiddenFindings: [],
    },
    evaluation: { passed: true, issues: [] },
  }]);
  assert.equal(summary.productQualityPassRate, 0);
  assert.equal(summary.automatedPassRate, 100);
  assert.equal(summary.goldSetPassRate, 0);
});

test("human required and forbidden findings are diffed by fact, claim, and text", () => {
  const result = baseResult();
  result.rubricFindings = {
    missingCriticalFactIds: ["expected-result"],
    contradictedCriticalFactIds: [],
    forbiddenClaimIds: ["claim-root-cause"],
    factAssessments: [],
  };
  const evaluation = evaluateHumanReview(result, {
    humanExpectedScore: 72,
    humanVerdict: "追加確認を推奨",
    humanRequiredFindings: "fact:expected-result | text:期待結果を追加",
    humanForbiddenFindings: "claim:claim-root-cause | text:存在しない指摘",
  });
  assert.equal(evaluation.scoreWithin10Points, true);
  assert.equal(evaluation.missingRequiredFindings.length, 0);
  assert.deepEqual(evaluation.presentForbiddenFindings, ["claim:claim-root-cause"]);
  assert.equal(evaluation.passed, false);
});

test("human review matches important missing facts and the conduct gate", () => {
  const result = baseResult();
  result.totalScore = 40;
  result.verdict = "再整理を推奨";
  result.rubricFindings = {
    factAssessments: [{ factId: "steps-reproducible", status: "missing", evidenceQuote: "" }],
    forbiddenClaimIds: [],
    scoreCaps: [{ reason: "professional-conduct", maximum: 40 }],
  };
  const evaluation = evaluateHumanReview(result, {
    humanExpectedScore: 40,
    humanVerdict: "再整理を推奨",
    humanRequiredFindings: "fact:steps-reproducible | conduct:professional",
  });
  assert.deepEqual(evaluation.missingRequiredFindings, []);
  assert.equal(evaluation.passed, true);
});

test("summary reports repeated-run score and verdict stability", () => {
  const results = [70, 75, 82].map((score, index) => ({
    scenarioId: "sample",
    profileId: "medium",
    runIndex: index + 1,
    status: "passed",
    scoringResult: { totalScore: score, verdict: score < 80 ? "追加確認を推奨" : "開発着手可能（軽微な改善あり）" },
    humanEvaluation: {
      requiredFindingCount: 0,
      matchedRequiredFindings: [],
      forbiddenFindingCount: 0,
      presentForbiddenFindings: [],
    },
    evaluation: { issues: [] },
  }));
  const summary = summarizeProductQualityResults(results);
  assert.equal(summary.uniqueCases, 1);
  assert.equal(summary.repeatVerdictStabilityRate, 0);
  assert.equal(summary.repeatScoreStabilityRate, 0);
});
