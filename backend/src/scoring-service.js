import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const rubricRegistryPath = path.resolve(
  moduleDirectory,
  "../../scoring/rubrics/scenario-rubrics.json"
);
const rubricRegistry = JSON.parse(fs.readFileSync(rubricRegistryPath, "utf8"));

export const DEFAULT_SCENARIO_ID = "customer-save-multiple-clicks-duplicate";
export const SUPPORTED_SCENARIO_IDS = Object.freeze(Object.keys(rubricRegistry.scenarios));
export const PROMPT_VERSION = "practice-review.v3";
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

const verdicts = ["開発着手可能", "追加確認を推奨", "再整理を推奨"];
const questionClassifications = ["不足情報", "調査提案"];
const factAssessmentStatuses = ["present", "missing", "contradicted"];

export function getScenarioRubric(scenarioId) {
  const rubric = rubricRegistry.scenarios[scenarioId];
  if (!rubric) {
    return null;
  }
  return {
    ...rubric,
    dimensions: rubricRegistry.dimensions,
  };
}

function getFactIds(rubric) {
  return Object.values(rubric.requiredFacts).flat().map((fact) => fact.id);
}

export function buildModelOutputSchema(rubric) {
  const factIdValues = ["not-applicable", ...getFactIds(rubric)];
  const forbiddenClaimIds = rubric.forbiddenClaims.map((claim) => claim.id);
  return {
  type: "object",
  required: [
    "dimensions",
    "verdict",
    "overallAssessment",
    "readerQuestions",
    "ambiguityRisks",
    "investigationAdvice",
    "rewriteSuggestions",
    "strengths",
    "factAssessments",
    "forbiddenClaimIds",
  ],
  properties: {
    dimensions: {
      type: "object",
      required: rubric.dimensions.map((dimension) => dimension.id),
      properties: Object.fromEntries(
        rubric.dimensions.map((dimension) => [
          dimension.id,
          { type: "integer", minimum: 0, maximum: 100 },
        ])
      ),
    },
    verdict: {
      type: "string",
      enum: verdicts,
    },
    overallAssessment: {
      type: "string",
    },
    readerQuestions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        required: ["reader", "question", "whyItMatters", "classification", "factId"],
        properties: {
          reader: { type: "string" },
          question: { type: "string" },
          whyItMatters: { type: "string" },
          classification: { type: "string", enum: questionClassifications },
          factId: { type: "string", enum: factIdValues },
        },
      },
    },
    ambiguityRisks: {
      type: "array",
      items: {
        type: "object",
        required: ["quote", "risk", "advice"],
        properties: {
          quote: { type: "string" },
          risk: { type: "string" },
          advice: { type: "string" },
        },
      },
    },
    investigationAdvice: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        required: ["action", "purpose"],
        properties: {
          action: { type: "string" },
          purpose: { type: "string" },
        },
      },
    },
    rewriteSuggestions: {
      type: "array",
      items: {
        type: "object",
        required: ["section", "original", "suggested", "reason"],
        properties: {
          section: { type: "string" },
          original: { type: "string" },
          suggested: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    factAssessments: {
      type: "array",
      items: {
        type: "object",
        required: ["factId", "status", "evidenceQuote"],
        properties: {
          factId: { type: "string", enum: getFactIds(rubric) },
          status: { type: "string", enum: factAssessmentStatuses },
          evidenceQuote: { type: "string" },
        },
      },
    },
    forbiddenClaimIds: {
      type: "array",
      items: forbiddenClaimIds.length
        ? { type: "string", enum: forbiddenClaimIds }
        : { type: "string" },
    },
  },
  };
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function requireScore(value, fieldName) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${fieldName} must be an integer from 0 to 100`);
  }
  return value;
}

function normalizeStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  return value.map((item, index) => requireNonEmptyString(item, `${fieldName}[${index}]`));
}

function requireEnum(value, values, fieldName) {
  const normalized = requireNonEmptyString(value, fieldName);
  if (!values.includes(normalized)) {
    throw new Error(`${fieldName} must be one of: ${values.join(", ")}`);
  }
  return normalized;
}

function requireArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  return value;
}

function optionalString(value, fieldName, maxLength = 500) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} is too long`);
  }
  return normalized || null;
}

function optionalEnum(value, values, fieldName) {
  const normalized = optionalString(value, fieldName, 100);
  if (normalized === null) {
    return null;
  }
  if (!values.includes(normalized)) {
    throw new Error(`${fieldName} must be one of: ${values.join(", ")}`);
  }
  return normalized;
}

function optionalDate(value, fieldName) {
  const normalized = optionalString(value, fieldName, 10);
  if (normalized === null) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD`);
  }
  return normalized;
}

function normalizeTicketFields(value) {
  const fields = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const progress = Number(fields.progress ?? 0);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100 || progress % 10 !== 0) {
    throw new Error("answer.ticketFields.progress must be a multiple of 10 from 0 to 100");
  }
  return {
    tracker: optionalEnum(fields.tracker ?? "bug", ["bug", "feature", "support"], "answer.ticketFields.tracker"),
    private: Boolean(fields.private),
    status: optionalEnum(fields.status ?? "new", ["new", "in-progress", "resolved", "closed", "on-hold"], "answer.ticketFields.status"),
    severity: optionalEnum(fields.severity, ["s1", "s2", "s3", "s4"], "answer.ticketFields.severity"),
    priority: optionalEnum(fields.priority, ["low", "normal", "high", "urgent"], "answer.ticketFields.priority"),
    assigneeId: optionalString(fields.assigneeId, "answer.ticketFields.assigneeId", 100),
    category: optionalEnum(fields.category, ["ui", "workflow", "input", "api"], "answer.ticketFields.category"),
    version: optionalString(fields.version, "answer.ticketFields.version"),
    environment: optionalString(fields.environment, "answer.ticketFields.environment", 1000),
    startDate: optionalDate(fields.startDate, "answer.ticketFields.startDate"),
    dueDate: optionalDate(fields.dueDate, "answer.ticketFields.dueDate"),
    progress,
    watcherIds: Array.isArray(fields.watcherIds)
      ? fields.watcherIds
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 50)
      : [],
  };
}

export function isScoringSupported(scenarioId) {
  return Boolean(getScenarioRubric(scenarioId));
}

export function validateAttemptInput(input) {
  try {
    if (!input || typeof input !== "object") {
      throw new Error("request body must be an object");
    }
    const scenarioId = requireNonEmptyString(input.scenarioId, "scenarioId");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId)) {
      throw new Error("scenarioId has an invalid format");
    }
    const subject = requireNonEmptyString(input.answer?.subject, "answer.subject");
    const rawSections = input.answer?.sections;
    if (!rawSections || typeof rawSections !== "object" || Array.isArray(rawSections)) {
      throw new Error("answer.sections must be an object");
    }
    const sections = Object.fromEntries(
      Object.entries(rawSections).slice(0, 30).map(([key, value]) => [
        requireNonEmptyString(key, "section key"),
        requireNonEmptyString(value, `answer.sections.${key}`),
      ])
    );
    const completedAt = input.completedAt || new Date().toISOString();
    return {
      scenarioId,
      projectId: requireNonEmptyString(input.projectId, "projectId"),
      authoringMode: "practice",
      answer: {
        subject,
        sections,
        ticketFields: normalizeTicketFields(input.answer?.ticketFields),
      },
      selectedEvidenceIds: Array.isArray(input.selectedEvidenceIds)
        ? input.selectedEvidenceIds.filter((value) => typeof value === "string")
        : [],
      startedAt: input.startedAt || completedAt,
      completedAt,
    };
  } catch (error) {
    if (!error.code) {
      error.code = "INVALID_REQUEST";
    }
    throw error;
  }
}

export function buildScoringPrompt(attempt) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  if (!rubric) {
    const error = new Error("このシナリオはAI採点の対象外です。");
    error.code = "SCENARIO_NOT_SUPPORTED";
    throw error;
  }
  const { referenceAnswer: _referenceAnswer, ...scoringRubric } = rubric;
  return [
    "あなたは、不具合票を受け取って調査を始めるシニア開発者兼QAリードです。",
    "参考回答との文面一致ではなく、採点基準と入力材料に照らして評価してください。",
    "点数だけでなく、実際の読み手が疑問に思うこと、誤解される表現、有効な切り分けを具体的に助言してください。",
    "回答にない事実を断定してはいけません。確認できない原因や影響を推測で補完しないでください。",
    "一般論だけの助言は禁止です。受講者の記述を引用し、この不具合に即して説明してください。",
    "確定した不足と、調査を進めるための追加提案を混同しないでください。",
    "readerQuestionsのclassificationが不足情報の場合は該当するrequiredFactsのfactIdを使用し、調査提案の場合はfactIdをnot-applicableにしてください。",
    "factAssessmentsにはrequiredFactsの全factIdを重複なく1回ずつ含め、present・missing・contradictedのいずれかで判定してください。",
    "presentまたはcontradictedの場合は、受講者の回答から根拠となる短い文言をevidenceQuoteへ入れてください。missingの場合は空文字にしてください。",
    "forbiddenClaimsに該当する断定がある場合だけ、そのIDをforbiddenClaimIdsへ入れてください。",
    "expectedTicketFieldsとevidenceFilesも情報充足・切り分け支援の評価に含めてください。requiredがtrueの証跡が必要な証跡です。",
    "readerQuestionsとinvestigationAdviceはそれぞれ2〜4件を目安にしてください。",
    "文章が十分明確な場合は無理に欠点を作らず、調査開始後に読み手が確認したくなる点を調査提案として示してください。",
    "rewriteSuggestionsは本当に改善効果がある場合だけ返してください。",
    "各評価軸は0〜100の整数で採点してください。",
    "",
    "採点基準:",
    JSON.stringify(scoringRubric),
    "",
    "受講者の回答:",
    JSON.stringify({
      answer: attempt.answer,
      selectedEvidenceIds: attempt.selectedEvidenceIds || [],
    }),
  ].join("\n");
}

export function normalizeModelOutput(rawOutput, scenarioId = DEFAULT_SCENARIO_ID) {
  if (!rawOutput || typeof rawOutput !== "object") {
    throw new Error("Gemini output must be an object");
  }
  const rubric = getScenarioRubric(scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  const validFactIds = new Set(getFactIds(rubric));
  const factIdValues = ["not-applicable", ...validFactIds];
  const dimensions = Object.fromEntries(
    rubric.dimensions.map((dimension) => [
      dimension.id,
      requireScore(rawOutput.dimensions?.[dimension.id], `dimensions.${dimension.id}`),
    ])
  );
  const readerQuestions = requireArray(rawOutput.readerQuestions, "readerQuestions")
    .map((item, index) => {
      let classification = requireEnum(
        item.classification,
        questionClassifications,
        `readerQuestions[${index}].classification`
      );
      let factId = requireEnum(
        item.factId,
        factIdValues,
        `readerQuestions[${index}].factId`
      );
      if (classification === "不足情報" && factId === "not-applicable") {
        classification = "調査提案";
      }
      if (classification === "調査提案" && factId !== "not-applicable") {
        factId = "not-applicable";
      }
      return {
        reader: requireNonEmptyString(item.reader, `readerQuestions[${index}].reader`),
        question: requireNonEmptyString(item.question, `readerQuestions[${index}].question`),
        whyItMatters: requireNonEmptyString(
          item.whyItMatters,
          `readerQuestions[${index}].whyItMatters`
        ),
        classification,
        factId,
      };
    });
  const ambiguityRisks = requireArray(rawOutput.ambiguityRisks, "ambiguityRisks")
    .map((item, index) => ({
      quote: requireNonEmptyString(item.quote, `ambiguityRisks[${index}].quote`),
      risk: requireNonEmptyString(item.risk, `ambiguityRisks[${index}].risk`),
      advice: requireNonEmptyString(item.advice, `ambiguityRisks[${index}].advice`),
    }));
  const investigationAdvice = requireArray(rawOutput.investigationAdvice, "investigationAdvice")
    .map((item, index) => ({
      action: requireNonEmptyString(item.action, `investigationAdvice[${index}].action`),
      purpose: requireNonEmptyString(item.purpose, `investigationAdvice[${index}].purpose`),
    }));
  const rewriteSuggestions = requireArray(rawOutput.rewriteSuggestions, "rewriteSuggestions")
    .map((item, index) => ({
      section: requireNonEmptyString(item.section, `rewriteSuggestions[${index}].section`),
      original: optionalString(item.original, `rewriteSuggestions[${index}].original`)
        || "（未記載）",
      suggested: requireNonEmptyString(item.suggested, `rewriteSuggestions[${index}].suggested`),
      reason: requireNonEmptyString(item.reason, `rewriteSuggestions[${index}].reason`),
    }));
  const factAssessments = requireArray(rawOutput.factAssessments, "factAssessments")
    .map((item, index) => ({
      factId: requireEnum(item.factId, [...validFactIds], `factAssessments[${index}].factId`),
      status: requireEnum(
        item.status,
        factAssessmentStatuses,
        `factAssessments[${index}].status`
      ),
      evidenceQuote: item.status === "missing"
        ? ""
        : requireNonEmptyString(
            item.evidenceQuote,
            `factAssessments[${index}].evidenceQuote`
          ),
    }));
  const assessedFactIds = new Set(factAssessments.map(({ factId }) => factId));
  if (
    assessedFactIds.size !== factAssessments.length
    || assessedFactIds.size !== validFactIds.size
    || [...validFactIds].some((factId) => !assessedFactIds.has(factId))
  ) {
    throw new Error("factAssessments must cover every required fact exactly once");
  }
  const validForbiddenClaimIds = new Set(
    rubric.forbiddenClaims.map((claim) => claim.id)
  );
  const forbiddenClaimIds = requireArray(rawOutput.forbiddenClaimIds, "forbiddenClaimIds")
    .map((claimId, index) => requireEnum(
      claimId,
      [...validForbiddenClaimIds],
      `forbiddenClaimIds[${index}]`
    ));
  if (new Set(forbiddenClaimIds).size !== forbiddenClaimIds.length) {
    throw new Error("forbiddenClaimIds must not contain duplicates");
  }
  return {
    dimensions,
    verdict: requireEnum(rawOutput.verdict, verdicts, "verdict"),
    overallAssessment: requireNonEmptyString(rawOutput.overallAssessment, "overallAssessment"),
    readerQuestions,
    ambiguityRisks,
    investigationAdvice,
    rewriteSuggestions,
    strengths: normalizeStringArray(rawOutput.strengths, "strengths"),
    factAssessments,
    forbiddenClaimIds,
  };
}

export function calculateWeightedTotal(dimensions, scenarioId = DEFAULT_SCENARIO_ID) {
  const rubric = getScenarioRubric(scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  return Math.round(
    rubric.dimensions.reduce(
      (total, dimension) => total + dimensions[dimension.id] * dimension.weight / 100,
      0
    )
  );
}

function dateInJapan(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
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

function sameStringSet(left, right) {
  const leftValues = [...new Set(Array.isArray(left) ? left : [])].sort();
  const rightValues = [...new Set(Array.isArray(right) ? right : [])].sort();
  return JSON.stringify(leftValues) === JSON.stringify(rightValues);
}

export function buildRubricFindings(attempt, normalizedOutput, rawWeightedScore) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  const actualFields = attempt.answer?.ticketFields || {};
  const expectedFields = rubric.expectedTicketFields || {};
  const ticketFieldChecks = Object.entries(expectedFields).map(([field, expected]) => {
    if (field === "dueDatePolicy") {
      const attemptDate = dateInJapan(attempt.startedAt || attempt.completedAt);
      const expectedDueDate = expected?.mode === "unset"
        ? null
        : addDays(attemptDate, Number(expected?.offsetDays || 0));
      const actualDueDate = actualFields.dueDate || null;
      return {
        field: "dueDate",
        expected: expectedDueDate,
        actual: actualDueDate,
        matched: expectedDueDate === actualDueDate,
      };
    }
    const actual = actualFields[field] ?? null;
    const matched = Array.isArray(expected)
      ? sameStringSet(actual, expected)
      : actual === expected;
    return { field, expected, actual, matched };
  });
  const expectedEvidenceIds = rubric.evidenceFiles
    .filter((file) => file.required)
    .map((file) => file.id);
  const selectedEvidenceIds = [...new Set(attempt.selectedEvidenceIds || [])];
  const missingEvidenceIds = expectedEvidenceIds.filter(
    (fileId) => !selectedEvidenceIds.includes(fileId)
  );
  const unrelatedEvidenceIds = selectedEvidenceIds.filter(
    (fileId) => !expectedEvidenceIds.includes(fileId)
  );
  const factById = new Map(
    Object.values(rubric.requiredFacts).flat().map((fact) => [fact.id, fact])
  );
  const missingCriticalFactIds = normalizedOutput.factAssessments
    .filter(({ factId, status }) =>
      status === "missing" && factById.get(factId)?.importance === "critical"
    )
    .map(({ factId }) => factId);
  const contradictedCriticalFactIds = normalizedOutput.factAssessments
    .filter(({ factId, status }) =>
      status === "contradicted" && factById.get(factId)?.importance === "critical"
    )
    .map(({ factId }) => factId);
  const majorForbiddenClaimIds = normalizedOutput.forbiddenClaimIds.filter(
    (claimId) => rubric.forbiddenClaims.find((claim) => claim.id === claimId)?.severity === "major"
  );
  const scoreCaps = [];
  if (missingCriticalFactIds.length > 0) {
    scoreCaps.push({ reason: "missing-critical-fact", maximum: 79 });
  }
  if (majorForbiddenClaimIds.length > 0) {
    scoreCaps.push({ reason: "unsupported-major-claim", maximum: 74 });
  }
  if (contradictedCriticalFactIds.length > 0) {
    scoreCaps.push({ reason: "contradicted-critical-fact", maximum: 64 });
  }
  const appliedScoreCap = scoreCaps.length
    ? Math.min(...scoreCaps.map(({ maximum }) => maximum))
    : null;
  return {
    factAssessments: normalizedOutput.factAssessments,
    forbiddenClaimIds: normalizedOutput.forbiddenClaimIds,
    missingCriticalFactIds,
    contradictedCriticalFactIds,
    ticketFieldChecks,
    evidenceCheck: {
      expectedEvidenceIds,
      selectedEvidenceIds,
      missingEvidenceIds,
      unrelatedEvidenceIds,
      matched: missingEvidenceIds.length === 0 && unrelatedEvidenceIds.length === 0,
    },
    rawWeightedScore,
    scoreCaps,
    appliedScoreCap,
  };
}

export function createAttemptRecord(attemptInput, options = {}) {
  const normalized = validateAttemptInput(attemptInput);
  const attemptId = options.attemptId || crypto.randomUUID();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId)) {
    const error = new Error("attemptId must be a UUID");
    error.code = "INVALID_REQUEST";
    throw error;
  }
  const ticketId = options.ticketId || attemptId;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticketId)) {
    const error = new Error("ticketId must be a UUID");
    error.code = "INVALID_REQUEST";
    throw error;
  }
  return {
    schemaVersion: "attempt.v3",
    attemptId,
    ticketId,
    revisionNumber: 1,
    parentAttemptId: null,
    userId: requireNonEmptyString(options.userId, "userId"),
    ...normalized,
  };
}

export function createFailedScoringResult(attempt, error, options = {}) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  const modelId = options.modelId || DEFAULT_MODEL;
  const errorCode = error?.code || "SCORING_FAILED";
  const unavailableCodes = new Set(["RATE_LIMITED", "GEMINI_ERROR"]);
  return {
    schemaVersion: "scoring-result.v3",
    scoringResultId: options.scoringResultId || crypto.randomUUID(),
    attemptId: requireNonEmptyString(attempt?.attemptId, "attempt.attemptId"),
    status: unavailableCodes.has(errorCode) ? "unavailable" : "failed",
    totalScore: null,
    dimensions: Object.fromEntries(
      (rubric?.dimensions || rubricRegistry.dimensions).map((dimension) => [dimension.id, null])
    ),
    verdict: null,
    overallAssessment: null,
    readerQuestions: [],
    ambiguityRisks: [],
    investigationAdvice: [],
    rewriteSuggestions: [],
    strengths: [],
    rubricFindings: null,
    rubricVersion: rubric?.rubricVersion || "unknown",
    promptVersion: PROMPT_VERSION,
    modelId,
    scoredAt: options.scoredAt || new Date().toISOString(),
    errorCode,
  };
}

export async function scoreAttemptRecordWithGemini(attempt, options) {
  if (!isScoringSupported(attempt?.scenarioId)) {
    const error = new Error("このシナリオはAI採点の対象外です。");
    error.code = "SCENARIO_NOT_SUPPORTED";
    throw error;
  }
  const apiKey = requireNonEmptyString(options.apiKey, "GEMINI_API_KEY");
  const rubric = getScenarioRubric(attempt.scenarioId);
  const modelId = options.modelId || DEFAULT_MODEL;
  const fetchImplementation = options.fetchImplementation || fetch;
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;
  const response = await fetchImplementation(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildScoringPrompt(attempt) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: buildModelOutputSchema(rubric),
        temperature: 0.25,
      },
    }),
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(responseBody.error?.message || "Gemini API request failed");
    error.code = response.status === 429 ? "RATE_LIMITED" : "GEMINI_ERROR";
    throw error;
  }
  const responseText = responseBody.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");
  if (!responseText) {
    const error = new Error("Gemini returned no scoring result");
    error.code = "EMPTY_RESULT";
    throw error;
  }
  let modelOutput;
  try {
    modelOutput = JSON.parse(responseText);
  } catch (cause) {
    const error = new Error("Gemini returned invalid JSON", { cause });
    error.code = "INVALID_MODEL_OUTPUT";
    throw error;
  }
  let normalized;
  try {
    normalized = normalizeModelOutput(modelOutput, attempt.scenarioId);
  } catch (cause) {
    const error = new Error("Gemini returned an invalid scoring result", { cause });
    error.code = "INVALID_MODEL_OUTPUT";
    throw error;
  }
  const rawWeightedScore = calculateWeightedTotal(
    normalized.dimensions,
    attempt.scenarioId
  );
  const rubricFindings = buildRubricFindings(
    attempt,
    normalized,
    rawWeightedScore
  );
  const totalScore = rubricFindings.appliedScoreCap === null
    ? rawWeightedScore
    : Math.min(rawWeightedScore, rubricFindings.appliedScoreCap);
  const { factAssessments: _factAssessments, forbiddenClaimIds: _forbiddenClaimIds, ...review } = normalized;
  return {
    schemaVersion: "scoring-result.v3",
    scoringResultId: crypto.randomUUID(),
    attemptId: attempt.attemptId,
    status: "succeeded",
    totalScore,
    ...review,
    rubricFindings,
    rubricVersion: rubric.rubricVersion,
    promptVersion: PROMPT_VERSION,
    modelId,
    scoredAt: new Date().toISOString(),
    errorCode: null,
  };
}

export async function scoreAttemptWithGemini(attemptInput, options) {
  const attempt = createAttemptRecord(attemptInput, options);
  const scoringResult = await scoreAttemptRecordWithGemini(attempt, options);
  return { attempt, scoringResult };
}
