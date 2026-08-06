import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getScenarioRubric } from "../src/scoring-service.js";
import {
  createFixtureAttempt,
  evaluateFixtureResult,
  isRetryableScoringError,
  summarizeFixtureResults,
} from "../src/scoring-fixture-validator.js";

const registry = JSON.parse(fs.readFileSync(
  new URL("../../scoring/fixtures/scenario-fixtures.json", import.meta.url),
  "utf8"
));
const scenarioId = "attendance-overnight-break-not-deducted";
const fixtureSet = registry.scenarios[scenarioId];
const rubric = getScenarioRubric(scenarioId);

test("fixture attempts isolate writing quality with correct ticket fields and evidence", () => {
  const fixture = fixtureSet.fixtures.find((item) => item.fixtureId === "excellent");
  const attempt = createFixtureAttempt({ fixtureSet, fixture, rubric });
  assert.equal(attempt.scenarioId, scenarioId);
  assert.equal(attempt.answer.ticketFields.dueDate, "2026-08-09");
  assert.equal(attempt.answer.ticketFields.severity, rubric.expectedTicketFields.severity);
  assert.deepEqual(
    attempt.selectedEvidenceIds,
    rubric.evidenceFiles.filter((file) => file.required).map((file) => file.id)
  );
});

test("fixture evaluation checks score, findings, and feedback shape", () => {
  const fixture = fixtureSet.fixtures.find((item) => item.fixtureId === "missing-critical-facts");
  const scoringResult = {
    status: "succeeded",
    totalScore: 70,
    rubricVersion: fixtureSet.rubricVersion,
    overallAssessment: "重要な情報が不足しています。",
    readerQuestions: [{}, {}],
    investigationAdvice: [{}, {}],
    rubricFindings: {
      missingCriticalFactIds: fixture.expected.missingFactIds,
      forbiddenClaimIds: [],
      ticketFieldChecks: [{ field: "severity", matched: true }],
      evidenceCheck: { matched: true },
    },
  };
  const evaluation = evaluateFixtureResult({ fixtureSet, fixture, scoringResult });
  assert.equal(evaluation.passed, true);
  assert.equal(evaluation.checks.every((item) => item.passed), true);
});

test("fixture evaluation reports specific mismatches", () => {
  const fixture = fixtureSet.fixtures.find((item) => item.fixtureId === "unsupported-root-cause");
  const scoringResult = {
    status: "succeeded",
    totalScore: 90,
    rubricVersion: fixtureSet.rubricVersion,
    overallAssessment: "問題ありません。",
    readerQuestions: [{}],
    investigationAdvice: [{}, {}],
    rubricFindings: {
      missingCriticalFactIds: [],
      forbiddenClaimIds: [],
      ticketFieldChecks: [{ field: "severity", matched: true }],
      evidenceCheck: { matched: true },
    },
  };
  const evaluation = evaluateFixtureResult({ fixtureSet, fixture, scoringResult });
  assert.equal(evaluation.passed, false);
  assert.deepEqual(
    evaluation.checks.filter((item) => !item.passed).map((item) => item.id),
    ["score-range", "forbidden-claims", "reader-questions"]
  );
});

test("fixture summaries separate failed expectations from API errors", () => {
  assert.deepEqual(summarizeFixtureResults([
    { status: "passed" },
    { status: "failed" },
    { status: "error" },
    { status: "passed" },
  ]), { total: 4, passed: 2, failed: 1, errors: 1, passRate: 50 });
});

test("depleted billing credit is terminal while temporary API failures are retried", () => {
  assert.equal(isRetryableScoringError({
    code: "RATE_LIMITED",
    message: "Your prepayment credits are depleted. Please manage billing.",
  }), false);
  assert.equal(isRetryableScoringError({
    code: "RATE_LIMITED",
    message: "Too many requests. Try again later.",
  }), true);
  assert.equal(isRetryableScoringError({ code: "INVALID_REQUEST", message: "bad input" }), false);
});
