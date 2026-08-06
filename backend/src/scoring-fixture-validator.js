import { createAttemptRecord } from "./scoring-service.js";

export const FIXTURE_VALIDATION_SCHEMA_VERSION = "scoring-fixture-validation.v1";

export function isRetryableScoringError(error) {
  const terminalBillingMessage = /prepayment credits? (?:are )?depleted|billing|payment required/i;
  if (terminalBillingMessage.test(String(error?.message || ""))) {
    return false;
  }
  return new Set([
    "RATE_LIMITED",
    "GEMINI_ERROR",
    "EMPTY_RESULT",
    "INVALID_MODEL_OUTPUT",
  ]).has(error?.code);
}

function dateInJapan(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("startedAt must be a valid date");
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(dateText, days) {
  const date = new Date(`${dateText}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function ticketFieldsForRubric(rubric, startedAt) {
  const expected = rubric.expectedTicketFields || {};
  const { dueDatePolicy, ...ticketFields } = expected;
  const dueDate = dueDatePolicy?.mode === "days-after-attempt"
    ? addDays(dateInJapan(startedAt), Number(dueDatePolicy.offsetDays || 0))
    : null;
  return {
    tracker: "bug",
    private: false,
    status: "new",
    ...ticketFields,
    startDate: null,
    dueDate,
    progress: 0,
  };
}

export function createFixtureAttempt({
  fixtureSet,
  fixture,
  rubric,
  startedAt = "2026-08-06T00:00:00.000Z",
  userId = "live-fixture-validation",
}) {
  if (fixtureSet.scenarioId !== rubric.scenarioId) {
    throw new Error("fixture and rubric scenario IDs do not match");
  }
  if (fixtureSet.rubricVersion !== rubric.rubricVersion) {
    throw new Error("fixture and rubric versions do not match");
  }
  return createAttemptRecord({
    scenarioId: fixtureSet.scenarioId,
    projectId: rubric.projectId,
    answer: {
      ...fixture.answer,
      ticketFields: ticketFieldsForRubric(rubric, startedAt),
    },
    selectedEvidenceIds: (rubric.evidenceFiles || [])
      .filter((file) => file.required)
      .map((file) => file.id),
    startedAt,
    completedAt: startedAt,
  }, { userId });
}

function sameStringSet(left, right) {
  const normalize = (value) => [...new Set(Array.isArray(value) ? value : [])].sort();
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function check(id, passed, expected, actual) {
  return { id, passed: Boolean(passed), expected, actual };
}

export function evaluateFixtureResult({ fixtureSet, fixture, scoringResult }) {
  const expected = fixture.expected;
  const findings = scoringResult?.rubricFindings || {};
  const checks = [
    check("status", scoringResult?.status === "succeeded", "succeeded", scoringResult?.status ?? null),
    check(
      "score-range",
      Number.isInteger(scoringResult?.totalScore)
        && scoringResult.totalScore >= expected.scoreMin
        && scoringResult.totalScore <= expected.scoreMax,
      { min: expected.scoreMin, max: expected.scoreMax },
      scoringResult?.totalScore ?? null
    ),
    check(
      "missing-critical-facts",
      sameStringSet(findings.missingCriticalFactIds, expected.missingFactIds),
      expected.missingFactIds,
      findings.missingCriticalFactIds || []
    ),
    check(
      "forbidden-claims",
      sameStringSet(findings.forbiddenClaimIds, expected.forbiddenClaimIds),
      expected.forbiddenClaimIds,
      findings.forbiddenClaimIds || []
    ),
    check(
      "rubric-version",
      scoringResult?.rubricVersion === fixtureSet.rubricVersion,
      fixtureSet.rubricVersion,
      scoringResult?.rubricVersion ?? null
    ),
    check(
      "reader-questions",
      Array.isArray(scoringResult?.readerQuestions)
        && scoringResult.readerQuestions.length >= 2
        && scoringResult.readerQuestions.length <= 4,
      "2..4",
      Array.isArray(scoringResult?.readerQuestions) ? scoringResult.readerQuestions.length : null
    ),
    check(
      "investigation-advice",
      Array.isArray(scoringResult?.investigationAdvice)
        && scoringResult.investigationAdvice.length >= 2
        && scoringResult.investigationAdvice.length <= 4,
      "2..4",
      Array.isArray(scoringResult?.investigationAdvice)
        ? scoringResult.investigationAdvice.length
        : null
    ),
    check(
      "overall-assessment",
      typeof scoringResult?.overallAssessment === "string"
        && scoringResult.overallAssessment.trim().length > 0,
      "non-empty string",
      scoringResult?.overallAssessment || null
    ),
    check(
      "ticket-fields",
      Array.isArray(findings.ticketFieldChecks)
        && findings.ticketFieldChecks.every((item) => item.matched),
      "all matched",
      (findings.ticketFieldChecks || [])
        .filter((item) => !item.matched)
        .map((item) => item.field)
    ),
    check(
      "evidence",
      findings.evidenceCheck?.matched === true,
      true,
      findings.evidenceCheck?.matched ?? null
    ),
  ];
  return {
    passed: checks.every((item) => item.passed),
    checks,
  };
}

export function summarizeFixtureResults(results) {
  const passed = results.filter((result) => result.status === "passed").length;
  const failed = results.filter((result) => result.status === "failed").length;
  const errors = results.filter((result) => result.status === "error").length;
  return {
    total: results.length,
    passed,
    failed,
    errors,
    passRate: results.length ? Number(((passed / results.length) * 100).toFixed(1)) : 0,
  };
}
