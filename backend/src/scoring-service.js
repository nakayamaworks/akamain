import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const rubricRegistryPath = path.resolve(
  moduleDirectory,
  "../../scoring/rubrics/scenario-rubrics.json"
);
const rubricRegistry = JSON.parse(fs.readFileSync(rubricRegistryPath, "utf8"));
const qaScenarioSource = fs.readFileSync(
  path.resolve(moduleDirectory, "../../qa-scenario-authoring-library.js"),
  "utf8"
);
const qaScenarioContext = { window: {} };
vm.runInNewContext(qaScenarioSource, qaScenarioContext, {
  filename: "qa-scenario-authoring-library.js",
});
const qaAuthoringRegistry = qaScenarioContext.window.TYPING_WORKBENCH_QA_SCENARIO_AUTHORING || {};

const qaDimensions = [
  { id: "questionFocus", label: "論点の焦点", weight: 20, guidance: "一つの主要な判断事項が明確で、100点は題名と質問だけで回答対象を誤解なく特定できる状態" },
  { id: "answerability", label: "回答しやすさ", weight: 20, guidance: "回答者が不足前提を聞き返さず判断または訂正でき、100点は短い回答で次の行動を確定できる状態" },
  { id: "sourceGrounding", label: "根拠の明瞭さ", weight: 15, guidance: "確認済み資料と未記載・矛盾箇所が具体的で、100点は判断根拠を読み手が再確認できる状態" },
  { id: "factInterpretationSeparation", label: "事実・解釈", weight: 15, guidance: "観測事実と質問者の解釈を分け、100点は未確定事項を確定仕様と誤認する余地がない状態" },
  { id: "impactClarity", label: "影響の明瞭さ", weight: 15, guidance: "回答により変わるテストや不具合判定が具体的で、100点は回答後の行動が明確な状態" },
  { id: "responseEfficiency", label: "やり取り削減", weight: 15, guidance: "判断に必要な比較・条件が過不足なく、100点は不要な往復が想定されない状態" },
];

function qaSectionText(report, sectionTitle) {
  const lines = [];
  let active = false;
  for (const entry of report || []) {
    if (entry.kind === "section") {
      active = entry.text === sectionTitle;
      continue;
    }
    if (active && entry.kind === "line") {
      lines.push(entry.text);
    }
  }
  return lines.join("\n");
}

function buildQaRubric(profile) {
  const scenario = profile.scenario;
  const sourceIds = profile.reviewSource.observations.map(({ id }) => id);
  const sourceRefs = (pattern, fallback = sourceIds) => {
    const matched = sourceIds.filter((id) => pattern.test(id));
    return matched.length ? matched : fallback;
  };
  const { alternativeExcellentAnswer: _example, ...reviewSource } = profile.reviewSource;
  return {
    scenarioId: scenario.scenarioId,
    projectId: scenario.projectId,
    ticketType: "qa",
    qaType: scenario.qaType,
    rubricVersion: `${scenario.scenarioId}.qa-v1`,
    dimensions: qaDimensions,
    reviewSource,
    requiredFacts: {
      subject: [{
        id: "subject-question-target",
        description: "題名だけで確認対象と判断してほしい論点が分かる",
        importance: "important",
        sourceRefs: sourceIds,
      }],
      question: [{
        id: "question-single-decision",
        description: "回答者が何を判断すればよいか、一つの主要論点として明確に質問する",
        importance: "critical",
        sourceRefs: sourceIds,
      }],
      situation: [{
        id: "situation-confirmed-facts",
        description: "確認した条件と事実を、推測や期待値と区別して示す",
        importance: "critical",
        sourceRefs: sourceRefs(/^situation|^comparison/),
      }],
      references: [{
        id: "references-checked-materials",
        description: "確認済みの仕様や関連情報と、そこに記載されていない点または矛盾点を示す",
        importance: "important",
        sourceRefs: sourceRefs(/^source/),
      }],
      interpretation: [{
        id: "interpretation-current-understanding",
        description: "現在の解釈を、確定仕様と断定せず根拠とともに示す",
        importance: "important",
        sourceRefs: sourceIds,
      }],
      impact: [{
        id: "impact-decision-consequence",
        description: "回答によって変わるテスト、バグ判定または業務上の判断を示す",
        importance: "important",
        sourceRefs: sourceRefs(/^(impact|user-impact)/),
      }],
    },
    factAssessmentPolicy: {
      semanticEquivalence: true,
      sourceMaterialRule: "reviewSourceに含まれる状況、確認済み事実、参照情報が事実判定の基準であり、writingExampleは判定に使用しない",
      sectionFlexibilityRule: "必要な意味がQA起票全体から明確に読み取れるなら、記載例と異なる語句、文順、セクション配置を減点しない",
      standardOperationDetailRule: "チーム内で既知の標準操作は、操作経路そのものが質問の論点でない限り手順書レベルの詳細を要求しない",
      unsupportedAdditionRule: "提示材料にない追加確認を事実として書いた場合は、矛盾と即断せず実施済みか推測かを記述確認として扱う",
      trackingIdentifierRule: "追跡用IDは論点特定に必要な場合だけ求め、一律に本文への具体値記載を要求しない",
      measuredValueRule: "金額、時刻、件数など質問成立に必要な値は提示材料と整合するか評価する",
      evidenceRule: "添付資料は参照情報を補完できるが、主要な質問と現在の解釈の記載を代替しない",
    },
    reviewGuide: profile.reviewGuide,
    forbiddenClaims: [
      { id: "claim-unconfirmed-specification", description: "未確定の解釈を確認済み仕様として断定する", severity: "major" },
      { id: "claim-unverified-cause", description: "提示材料で確認されていない実装原因を断定する", severity: "major" },
      { id: "claim-unverified-scope", description: "確認していない環境や機能にも同じ判断が適用されると断定する", severity: "major" },
    ],
    optionalFacts: [
      { id: "optional-answer-shortcut", description: "回答者が短時間で判断できる具体例や境界値を示す" },
      { id: "optional-comparison", description: "類似仕様や比較条件を、同一仕様と断定せず補足する" },
    ],
    expectedTicketFields: {
      priority: scenario.evaluation.priority || null,
      category: {
        recommended: scenario.evaluation.category || null,
        accepted: scenario.evaluation.acceptedCategories || [scenario.evaluation.category || null],
        rationale: scenario.evaluation.categoryRationale || null,
      },
      version: scenario.evaluation.version || null,
      environment: scenario.evaluation.environment || null,
      assigneeId: scenario.evaluation.assignee || null,
      watcherIds: scenario.evaluation.watchers || [],
      dueDatePolicy: { mode: "unset" },
    },
    evidenceFiles: [],
    writingExample: {
      subject: scenario.subject.text,
      sections: {
        question: qaSectionText(scenario.report, "■質問"),
        situation: qaSectionText(scenario.report, "■確認した状況・事実"),
        references: qaSectionText(scenario.report, "■参照情報"),
        interpretation: qaSectionText(scenario.report, "■現在の解釈"),
        impact: qaSectionText(scenario.report, "■確認理由・影響"),
        remarks: qaSectionText(scenario.report, "■周辺確認・補足"),
      },
    },
    rubricNotes: [
      "記載例は正解ではなく採点時の事実源にも使用しない",
      "仕様の正誤ではなく回答者が判断しやすい質問になっているかを評価する",
      "YesまたはNoだけを強制せず、必要な訂正を短く返せる質問を評価する",
      "一つのQAへ複数の独立した判断事項を詰め込まない",
      "質問者が確認できる資料の読み直しを回答者へ丸投げしない",
    ],
  };
}

const qaRubrics = Object.fromEntries(
  Object.entries(qaAuthoringRegistry).map(([scenarioId, profile]) => [
    scenarioId,
    buildQaRubric(profile),
  ])
);

export const DEFAULT_SCENARIO_ID = "customer-save-multiple-clicks-duplicate";
export const SUPPORTED_SCENARIO_IDS = Object.freeze([
  ...Object.keys(rubricRegistry.scenarios),
  ...Object.keys(qaRubrics),
]);
export const PROMPT_VERSION = "practice-review.v32";
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

const SCORE_MAXIMUMS_BY_LEVEL = Object.freeze({
  beginner: Object.freeze({
    writingQuality: 100,
    ticketSettings: 0,
    evidenceSelection: 0,
  }),
  intermediate: Object.freeze({
    writingQuality: 80,
    ticketSettings: 20,
    evidenceSelection: 0,
  }),
  advanced: Object.freeze({
    writingQuality: 70,
    ticketSettings: 20,
    evidenceSelection: 10,
  }),
});

function normalizeTrainingLevel(value) {
  return ["beginner", "intermediate", "advanced"].includes(value)
    ? value
    : "advanced";
}

function getTrainingLevelScope(rubric, requestedLevel = "advanced") {
  const trainingLevel = normalizeTrainingLevel(requestedLevel);
  const beginnerDimensionIds = rubric.ticketType === "qa"
    ? ["questionFocus", "answerability", "factInterpretationSeparation"]
    : [
        "factualGrounding",
        "informationCoverage",
        "expectedActualSeparation",
        "interpretiveClarity",
      ];
  return {
    trainingLevel,
    scoreMaximums: SCORE_MAXIMUMS_BY_LEVEL[trainingLevel],
    activeDimensionIds: trainingLevel === "beginner"
      ? new Set(beginnerDimensionIds)
      : null,
    activeTicketFields: trainingLevel === "beginner"
      ? new Set()
      : trainingLevel === "intermediate"
        ? new Set(["category", "version", "environment"])
        : null,
    activeFactGroups: rubric.ticketType === "qa"
      ? trainingLevel === "beginner"
        ? new Set(["subject", "question", "situation"])
        : trainingLevel === "intermediate"
          ? new Set(["subject", "question", "situation", "references", "interpretation", "impact"])
          : null
      : trainingLevel === "beginner"
        ? new Set(["subject", "detail", "expected", "actual"])
        : trainingLevel === "intermediate"
          ? new Set(["subject", "detail", "steps", "expected", "actual", "boundary"])
          : null,
  };
}

function buildTrainingScopedModelRubric(rubric, requestedLevel = "advanced") {
  const { activeFactGroups } = getTrainingLevelScope(rubric, requestedLevel);
  return {
    ...rubric,
    requiredFacts: Object.fromEntries(
      Object.entries(rubric.requiredFacts || {}).filter(
        ([group]) => activeFactGroups === null || activeFactGroups.has(group)
      )
    ),
  };
}

const BUG_SCORING_SYSTEM_INSTRUCTION = [
  "あなたは、不具合票を受け取って調査を始めるシニア開発者兼QAリードです。",
  "提示された観測記録、仕様、選択済み証跡に基づき、事実と推測を区別して評価してください。",
  "回答にない事実を断定せず、確認できない原因や影響を推測で補完しないでください。",
  "一般論や無理に作った欠点ではなく、この不具合の調査に役立つ具体的なレビューを返してください。",
  "操作手順は、操作を実行できることだけでなく、記載された実際の動作を観測できる状態まで到達するか検証してください。",
  "実務上十分な記述は正当に評価し、改善点がなければ無理に指摘を生成しないでください。",
].join("\n");

const WORKFLOW_CONSISTENCY_SYSTEM_INSTRUCTION = [
  "あなたは不具合票の再現経路だけを監査するQAリードです。",
  "文章品質、チケット設定、証跡の十分さは評価せず、操作手順どおり進んだとき、観測記録にある結果を同じ場所・状態・対象で確認できるかだけを厳密に判定してください。",
  "明記されていない画面遷移や確認操作を推測で補ってはいけません。",
].join("\n");

const QA_SCORING_SYSTEM_INSTRUCTION = [
  "あなたは、開発者または仕様作成者としてQA起票を受け取り、判断するシニア担当者です。",
  "評価対象は仕様の正解ではなく、回答者が短時間で論点を理解し、判断または訂正できる質問になっているかです。AI自身が仕様回答を決めてはいけません。",
  "提示されたreviewSourceと受講者のQA起票に基づき、確認済みの事実、現在の解釈、未確定事項を区別して評価してください。",
  "回答にない事実を断定せず、一般論や無理に作った欠点ではなく、このQAの回答判断に役立つ具体的なレビューを返してください。",
  "実務上十分な記述は正当に評価し、改善点がなければ無理に指摘を生成しないでください。",
].join("\n");

const questionClassifications = ["不足情報", "記述確認", "調査提案"];
const factAssessmentStatuses = ["present", "missing", "contradicted"];

function canonicalizeFingerprintValue(value) {
  if (typeof value === "string") {
    return value.normalize("NFKC").replace(/\r\n?/gu, "\n").trim();
  }
  if (Array.isArray(value)) {
    return value.map(canonicalizeFingerprintValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeFingerprintValue(value[key])])
    );
  }
  return value ?? null;
}

export function attemptContentFingerprint(attempt) {
  const ticketFields = {
    ...(attempt?.answer?.ticketFields || {}),
    watcherIds: [...new Set(attempt?.answer?.ticketFields?.watcherIds || [])].sort(),
  };
  const selectedEvidenceIds = [...new Set(attempt?.selectedEvidenceIds || [])].sort();
  const evidenceDescriptions = Object.fromEntries(
    selectedEvidenceIds.map((fileId) => [
      fileId,
      attempt?.evidenceDescriptions?.[fileId] || "",
    ])
  );
  const content = canonicalizeFingerprintValue({
    scenarioId: attempt?.scenarioId || "",
    projectId: attempt?.projectId || "",
    answer: {
      trainingLevel: optionalEnum(
        attempt?.answer?.trainingLevel ?? "advanced",
        ["beginner", "intermediate", "advanced"],
        "answer.trainingLevel"
      ),
      subject: attempt?.answer?.subject || "",
      sections: attempt?.answer?.sections || {},
      ticketFields,
    },
    selectedEvidenceIds,
    evidenceDescriptions,
  });
  return crypto.createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

function scoringSeedForAttempt(attempt) {
  const seed = Number.parseInt(attemptContentFingerprint(attempt).slice(0, 8), 16) & 0x7fffffff;
  return seed || 1;
}

export function getScenarioRubric(scenarioId) {
  const rubric = rubricRegistry.scenarios[scenarioId] || qaRubrics[scenarioId];
  if (!rubric) {
    return null;
  }
  return {
    ...rubric,
    dimensions: rubric.dimensions || rubricRegistry.dimensions,
  };
}

function getFactIds(rubric) {
  return Object.values(rubric.requiredFacts).flat().map((fact) => fact.id);
}

function getRubricVerdicts(rubric) {
  return rubric.ticketType === "qa"
    ? ["回答依頼可能", "回答依頼可能（軽微な改善あり）", "追加整理を推奨", "質問の再整理を推奨"]
    : ["開発着手可能", "開発着手可能（軽微な改善あり）", "追加確認を推奨", "再整理を推奨"];
}

function verdictForScore(totalScore, ticketType) {
  if (ticketType === "qa") {
    if (totalScore >= 90) return "回答依頼可能";
    if (totalScore >= 80) return "回答依頼可能（軽微な改善あり）";
    if (totalScore >= 70) return "追加整理を推奨";
    return "質問の再整理を推奨";
  }
  if (totalScore >= 90) return "開発着手可能";
  if (totalScore >= 80) return "開発着手可能（軽微な改善あり）";
  if (totalScore >= 70) return "追加確認を推奨";
  return "再整理を推奨";
}

export function buildModelOutputSchema(rubric) {
  const factIdValues = ["not-applicable", ...getFactIds(rubric)];
  const forbiddenClaimIds = rubric.forbiddenClaims.map((claim) => claim.id);
  return {
  type: "object",
  required: [
    "dimensions",
    "dimensionFeedback",
    "improvementItems",
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
    dimensionFeedback: {
      type: "object",
      required: rubric.dimensions.map((dimension) => dimension.id),
      properties: Object.fromEntries(
        rubric.dimensions.map((dimension) => [
          dimension.id,
          {
            type: "object",
            required: ["reason"],
            properties: {
              reason: { type: "string" },
            },
          },
        ])
      ),
    },
    improvementItems: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: {
        type: "object",
        required: ["priority", "title", "detail", "whyItMatters", "relatedDimensionIds"],
        properties: {
          priority: { type: "string", enum: ["修正推奨", "任意改善"] },
          title: { type: "string" },
          detail: { type: "string" },
          whyItMatters: { type: "string" },
          relatedDimensionIds: {
            type: "array",
            minItems: 1,
            items: { type: "string", enum: rubric.dimensions.map((dimension) => dimension.id) },
          },
        },
      },
    },
    verdict: {
      type: "string",
      enum: getRubricVerdicts(rubric),
    },
    overallAssessment: {
      type: "string",
    },
    readerQuestions: {
      type: "array",
      minItems: 0,
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
      minItems: 0,
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
      minItems: 0,
      maxItems: 2,
      items: {
        type: "object",
        required: ["evidenceQuote", "evaluation", "whyItHelps"],
        properties: {
          evidenceQuote: { type: "string" },
          evaluation: { type: "string" },
          whyItHelps: { type: "string" },
        },
      },
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

export function buildWorkflowConsistencyOutputSchema(rubric) {
  const workflowFactIds = (rubric.requiredFacts?.steps || []).map(({ id }) => id);
  return {
    type: "object",
    required: [
      "status",
      "factId",
      "sourceObservation",
      "answerQuote",
      "reason",
      "suggestedCorrection",
    ],
    properties: {
      status: { type: "string", enum: ["consistent", "inconsistent", "not-applicable"] },
      factId: { type: "string", enum: ["not-applicable", ...workflowFactIds] },
      sourceObservation: { type: "string" },
      answerQuote: { type: "string" },
      reason: { type: "string" },
      suggestedCorrection: { type: "string" },
    },
  };
}

function answerSectionText(attempt, names) {
  const sections = attempt?.answer?.sections || {};
  for (const name of names) {
    const value = sections[name];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return "";
}

export function buildWorkflowConsistencyPrompt(attempt) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  return [
    "観測記録:",
    JSON.stringify(rubric.reviewSource?.observations || []),
    "",
    "再現手順に必要な意味:",
    JSON.stringify(rubric.requiredFacts?.steps || []),
    "",
    "受講者の操作手順:",
    answerSectionText(attempt, ["steps", "操作手順", "■操作手順"]),
    "",
    "受講者の実際の動作:",
    answerSectionText(attempt, ["actual", "実際の動作", "■実際の動作"]),
    "",
    "観測記録と受講者手順の主要操作、遷移後の最終状態、結果を観測した場所または対象を比較してください。",
    "観測記録と操作手順がそれぞれ観測先を明示し、その意味が異なる場合はinconsistentです。明記されていない遷移を推測で補完しないでください。",
    "呼称が違っても同じ画面・状態を意味することが明らかな場合はconsistentです。",
    "inconsistentの場合、factIdには該当する操作手順のrequiredFact、answerQuoteには『受講者の操作手順』内に実在する不一致部分だけを原文のまま返してください。実際の動作や他セクションをanswerQuoteへ入れないでください。",
    "不足していると考えた操作が受講者の操作手順にすでに書かれている場合はconsistentです。suggestedCorrectionには観測記録に基づく確認操作を返してください。",
  ].join("\n");
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
    tracker: optionalEnum(fields.tracker ?? "bug", ["bug", "qa", "feature", "support"], "answer.ticketFields.tracker"),
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
    const selectedEvidenceIds = [...new Set(
      Array.isArray(input.selectedEvidenceIds)
        ? input.selectedEvidenceIds.filter((value) => typeof value === "string")
        : []
    )];
    const rawEvidenceDescriptions = input.evidenceDescriptions
      && typeof input.evidenceDescriptions === "object"
      && !Array.isArray(input.evidenceDescriptions)
      ? input.evidenceDescriptions
      : {};
    const evidenceDescriptions = Object.fromEntries(
      selectedEvidenceIds.map((fileId) => [
        fileId,
        typeof rawEvidenceDescriptions[fileId] === "string"
          ? rawEvidenceDescriptions[fileId].trim().slice(0, 200)
          : "",
      ])
    );
    return {
      scenarioId,
      projectId: requireNonEmptyString(input.projectId, "projectId"),
      authoringMode: "practice",
      answer: {
        trainingLevel: optionalEnum(
          input.answer?.trainingLevel ?? "advanced",
          ["beginner", "intermediate", "advanced"],
          "answer.trainingLevel"
        ),
        subject,
        sections,
        ticketFields: normalizeTicketFields(input.answer?.ticketFields),
      },
      selectedEvidenceIds,
      evidenceDescriptions,
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

function buildRevisionPromptParts(options = {}) {
  const previousAttempt = options.previousAttempt;
  const previousResult = options.previousScoringResult;
  if (!previousAttempt || previousResult?.status !== "succeeded") {
    return [];
  }
  return [
    "",
    "前回版との比較:",
    "これは前回のAI指摘を受けて修正された起票です。修正版をゼロから別基準で採点せず、前回と同じ記述・同じ品質の評価軸は前回点を維持してください。",
    "前回の改善点が解消した評価軸だけを加点し、前回より明確に悪化した事実・記述がある評価軸だけを減点してください。単なる表現の違いや新しい好みを、修正版だけの減点理由にしてはいけません。",
    "dimensionFeedbackとimprovementItemsでは、前回から変わった評価について、何が解消・未解消・悪化したのかが分かるようにしてください。",
    JSON.stringify({
      previousAnswer: previousAttempt.answer,
      previousSelectedEvidenceIds: previousAttempt.selectedEvidenceIds || [],
      previousEvidenceDescriptions: previousAttempt.evidenceDescriptions || {},
      previousScore: previousResult.totalScore,
      previousDimensions: previousResult.dimensions,
      previousImprovementItems: previousResult.improvementItems || [],
      previousFactAssessments: previousResult.rubricFindings?.factAssessments || [],
      previousForbiddenClaimIds: previousResult.rubricFindings?.forbiddenClaimIds || [],
    }),
  ];
}

export function buildScoringPrompt(attempt, options = {}) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  if (!rubric) {
    const error = new Error("このシナリオはAI採点の対象外です。");
    error.code = "SCENARIO_NOT_SUPPORTED";
    throw error;
  }
  const {
    referenceAnswer: _legacyReferenceAnswer,
    writingExample: _writingExample,
    ...scoringRubric
  } = rubric;
  const selectedEvidenceIds = new Set(attempt.selectedEvidenceIds || []);
  const selectedEvidenceContext = (scoringRubric.evidenceFiles || [])
    .filter(({ id }) => selectedEvidenceIds.has(id))
    .map(({ id, name, summary, contentPreview, confirmedFinding }) => ({
      id,
      name,
      summary,
      contentPreview,
      confirmedFinding,
    }));
  const trainingLevel = normalizeTrainingLevel(attempt.answer?.trainingLevel);
  const trainingScope = getTrainingLevelScope(scoringRubric, trainingLevel);
  const trainingScopedRubric = buildTrainingScopedModelRubric(scoringRubric, trainingLevel);
  const activeDimensionIds = trainingScope.activeDimensionIds;
  const activeFactGroups = trainingScope.activeFactGroups;
  const activeTicketFields = trainingScope.activeTicketFields;
  const scoringRubricForPrompt = {
    ...scoringRubric,
    dimensions: scoringRubric.dimensions.filter(
      ({ id }) => activeDimensionIds === null || activeDimensionIds.has(id)
    ),
    requiredFacts: trainingScopedRubric.requiredFacts,
    expectedTicketFields: Object.fromEntries(
      Object.entries(scoringRubric.expectedTicketFields || {}).filter(
        ([field]) =>
          (scoringRubric.ticketType !== "qa" || field !== "severity")
          && (activeTicketFields === null || activeTicketFields.has(field))
      )
    ),
    evidenceFiles: trainingLevel === "advanced"
      ? (scoringRubric.evidenceFiles || []).map(
          ({ contentPreview: _contentPreview, confirmedFinding: _confirmedFinding, ...file }) => file
        )
      : [],
    trainingScope: {
      level: trainingLevel,
      evaluatedDimensionIds: scoringRubric.dimensions
        .filter(({ id }) => activeDimensionIds === null || activeDimensionIds.has(id))
        .map(({ id }) => id),
      evaluatedFactGroups: Object.keys(scoringRubric.requiredFacts || {})
        .filter((group) => activeFactGroups === null || activeFactGroups.has(group)),
      excludedFactGroups: Object.keys(scoringRubric.requiredFacts || {})
        .filter((group) => activeFactGroups !== null && !activeFactGroups.has(group)),
      excludedDimensionIds: scoringRubric.dimensions
        .filter(({ id }) => activeDimensionIds !== null && !activeDimensionIds.has(id))
        .map(({ id }) => id),
    },
  };
  const trainingLevelInstruction = trainingLevel === "beginner"
    ? "これは初級課題です。この指示は後続の一般的な実務レビュー指示より優先されます。評価対象は題名、確認した事実、期待結果と実際結果の分離だけです。画面で出題していない再現手順、再現率、比較確認、切り分け、影響範囲、復帰方法、チケット設定、添付証跡の不足を減点・改善提案・聞き返し・書き換えの理由にしてはいけません。初級の学習目標を満たした記述は、フォーム上の基本事項であってもstrengthsとして具体的に評価してください。評価対象外のdimensionsは100点にしてください。"
    : trainingLevel === "intermediate"
      ? "これは中級課題です。簡潔さ、再現手順、期待結果と実際結果、切り分けに必要な情報を評価してください。画面で出題していない再現率、周辺補足、影響範囲、復帰方法、担当者、期日、添付証跡の不足を減点・改善提案・聞き返しの理由にしてはいけません。評価対象外のdimensionsは100点にしてください。"
      : "これは上級課題です。採点基準に含まれる全項目を実務形式で評価してください。";
  if (rubric.ticketType === "qa") {
    return [
      trainingLevelInstruction,
      "このレビューに唯一の正解文はありません。記載例との文面・構成・情報量の一致ではなく、reviewSourceと受講者のQA起票を照合してください。",
      "質問をYesまたはNoだけに制限する必要はありません。必要なら回答者が正しい条件を短く補足でき、不要な聞き返しが生じにくいことを評価してください。",
      "一つのQAに独立した複数の判断事項が混在している場合は、どの回答がどの論点に対応するか曖昧になる点を指摘してください。",
      "仕様どおりかという事実確認と、その動作を許容するかという判断依頼を混同していないか確認してください。",
      "確認した事実、参照資料の記載、現在の解釈、未確定事項を区別できているか評価してください。未確定の解釈を確定仕様として扱ってはいけません。",
      "回答者へ仕様書の読み直しや状況整理を丸投げしている場合は指摘してください。一方、回答者しか判断できない仕様決定そのものを質問者の不足にしてはいけません。",
      "チーム内で既知の標準操作は、その操作経路自体が論点でない限り手順書レベルの詳細を要求しないでください。",
      "reviewSourceにない追加記述は、矛盾しない限りただちに誤りとせず、必要なら『記述確認』として実施済みかを尋ねてください。",
      "readerQuestionsのclassificationが不足情報の場合は該当するrequiredFactsのfactIdを使い、記述確認または調査提案はnot-applicableにしてください。",
      "QAのreaderQuestionsは、仕様担当者などの回答者が回答前に起票者へ聞き返さなければならない不足情報だけです。元のQA質問を回答者向けに言い換えたり、『不具合として扱ってよいか』『仕様を変更するか』を再質問したりしてはいけません。該当がなければ空配列にしてください。",
      "factAssessmentsにはrequiredFactsの全factIdを重複なく1回ずつ含めてください。presentまたはcontradictedでは受講者の回答から短く正確に引用し、missingでは空文字にしてください。",
      "readerQuestions、ambiguityRisks、rewriteSuggestionsは必要な場合だけ返し、件数を満たすために作らないでください。",
      "investigationAdviceは0〜4件です。起票前に質問者自身が確認できること、または回答後に行う判断が本当にある場合だけ返してください。",
      "rewriteSuggestionsは受講者の有効な文章を残した最小修正とし、記載例のコピーに置き換えないでください。",
      "strengthsは0〜2件です。『質問欄がある』『項目が埋まっている』などフォーム上当然のことを評価せず、このQA固有の論点整理が回答負荷をどう減らすかを示してください。",
      "dimensionsはQA本文の品質だけを採点してください。チケット設定と添付証跡はシステムが別途採点するため、dimensionsの減点理由に含めないでください。総合点と最終verdictはシステム側で確定します。",
      "仕様書の未記載、観測事実、比較根拠、利用者影響を整理したうえで『不具合として扱ってよいか』『現在の理解で合っているか』を仕様担当者へ確認することは、正当なQA確認です。仕様決定の丸投げとは評価しないでください。",
      "質問者に『仕様を変更するか現状維持か』などの設計選択肢を作らせないでください。QA担当者が仕様決定へ踏み込みすぎる場合があります。質問者が判断材料と現在の解釈を示していれば十分です。",
      "『考えています』『認識です』『相違ないでしょうか』は未確定の解釈を示す表現です。確定仕様の断定として扱わず、重複や冗長さがある場合は文章上の任意改善として扱ってください。",
      "『不具合として起票すべきだと考えています』という現在の解釈は、質問欄で認識確認を行っている限り断定ではありません。『べきだと考え』の重複は、必要な修正ではなく任意の簡潔化として扱ってください。",
      "dimensionFeedbackには各評価軸の点数の理由だけを具体的に記載してください。実務上十分なら100点を使用し、到達不能な理想との差を作らないでください。",
      "improvementItemsは最大4件です。回答前に直す価値が高い不足は『修正推奨』、回答は依頼できるが表現を磨ける点は『任意改善』としてください。同じ原因を複数項目へ分割せず、各項目のrelatedDimensionIdsに関係する評価軸をまとめてください。detailには抽象論ではなく、この起票へそのまま反映できる具体的な修正内容を示してください。",
      "90〜100点はそのまま回答依頼可能、80〜89点は良好で軽微な改善あり、70〜79点は確認前の整理を推奨、69点以下は主要情報不足の目安です。語句の好みや軽微な重複だけで80点台前半まで下げないでください。",
      "点数を下げるのは、improvementItemsに挙げるだけの具体的な修正または任意改善がある評価軸だけです。relatedDimensionIdsに含まれない評価軸はシステムが100点として扱います。",
      "verdictは点数帯に合わせて選びますが、最終判定はシステム側で総合点から確定します。",
      "各評価軸は0〜100の整数で採点してください。",
      "",
      "採点基準:",
      JSON.stringify(scoringRubricForPrompt),
      "",
      "受講者の回答:",
      JSON.stringify({
        answer: attempt.answer,
        selectedEvidenceIds: attempt.selectedEvidenceIds || [],
        evidenceDescriptions: attempt.evidenceDescriptions || {},
      }),
      "",
      "選択済み添付証跡の内容:",
      JSON.stringify(selectedEvidenceContext),
      ...buildRevisionPromptParts(options),
    ].join("\n");
  }
  return [
    trainingLevelInstruction,
    "このレビューに唯一の正解文はありません。記載例との文面・構成・情報量の一致ではなく、提示された観測記録、仕様、証跡と受講者の起票内容に照らして評価してください。",
    "記載例と異なる表現や構成でも、事実に根差し、読み手が調査を始めやすい内容なら同等以上に評価してください。記載例より有効な比較確認や切り分けが含まれる場合は積極的に評価してください。",
    "点数だけでなく、実際の読み手が疑問に思うこと、誤解される表現、有効な切り分けを具体的に助言してください。",
    "受講者の記述を引用し、この不具合に即して説明してください。",
    "確定した不足と、調査を進めるための追加提案を混同しないでください。",
    "reviewSourceが評価の事実源です。requiredFactsはreviewSourceのどの意味を読み手へ伝える必要があるかを示すもので、特定の文面や記載欄を指定する正解ではありません。語句、文順、セクション配置の一致を要求しないでください。",
    "reviewSource.learnerVisibleContextは問題画面で受講者にも提示された周辺情報です。confirmedImpactScope、confirmedWorkaround、confirmedRecoveryは確認済み事実として扱ってください。受講者の記述がこれらと意味的に一致する場合、未確認の範囲・影響・回避策として指摘せず、forbiddenClaimIdsにも入れないでください。",
    "reviewSource.learnerVisibleContext.riskAssessmentは、記載された確度を維持して扱ってください。『可能性がある』というリスクを発生済みの事実へ強めた場合は指摘できますが、記載どおり潜在リスクとして書いた場合は未確認影響にしないでください。",
    "reviewSourceのうちlearnerVisibleContextを除く観測記録は、AI採点者だけが持つ研修用の事実源であり、チケットの開発担当者やQA担当者が読める情報ではありません。reviewSourceと起票内容の不一致は、AIレビュー自身のimprovementItemsまたはrewriteSuggestionsで事実訂正として示し、readerQuestionsで開発担当者がその事実を知っているように質問させてはいけません。",
    "チーム内で既知と考えられる標準ツールや業務操作は、操作経路そのものが発生条件でない限り、画面クリック、コマンド、API実行方法など手順書レベルの詳細を不足扱いしないでください。第三者が主要な操作と順序を理解できれば十分です。",
    "reviewSourceにないが矛盾もしない条件や手順を受講者が追加した場合は、事実誤認や不足と即断しないでください。確認が必要ならclassificationを『記述確認』、factIdをnot-applicableとし、『実施済みの事実か、再現のために補った推測か』を尋ねてください。reviewSourceにない詳細そのものを教えるよう要求してはいけません。",
    "追加記述がrequiredFactの意味を満たしている場合、reviewSourceと両立する限りfactAssessmentをcontradictedにしないでください。明確に両立しない場合だけcontradictedと判定してください。",
    "提示された観測記録を説明するときは『実際の不具合は』と正解を断定せず、『提示された観測記録では』『今回の確認内容では』と表現してください。",
    "通知ID、注文番号、患者ID、商品名などの追跡用識別子は、同一性や差異が説明され、選択済み証跡から対象を追跡できるなら、本文に具体値がなくても不足にしないでください。",
    "金額、時刻、件数、再現回数、仕様閾値は一律に例示扱いせず、発生条件・期待値・実測結果を成立させる値かを判断してください。入力材料と異なる値の記載は矛盾として扱ってください。",
    "添付証跡は追跡用識別子や証跡確認の事実を補完できますが、題名、主要な発生条件、期待結果、実際の動作そのものの記載を代替しません。",
    "選択済み添付証跡のsummary、contentPreview、confirmedFindingは、その証跡から確認できる事実として扱ってください。シナリオ本文にない事実でも、選択済み証跡で確認できるならレビュー判断に使用できます。未選択の証跡は、受講者が確認した事実として使わないでください。",
    "investigationAdviceは画面上で『追加で確認できること』として表示します。選択済み証跡や起票本文ですでに確認済みの内容を、これから行う確認として重複提案してはいけません。確認済み事実からさらに先へ進める具体的な調査候補がある場合だけ返し、なければ空配列にしてください。",
    "選択済み証跡から、入力設定と実際の処理モードの差、正常系と異常系の分岐、処理順序など原因箇所を絞れる具体的な手がかりが得られる場合は、その確認済み事実を土台に一段先の調査候補をinvestigationAdviceへ1〜2件示してください。actionの冒頭で根拠となる確認済みの差異を簡潔に示し、証跡をもう一度開く提案ではなく、設定値の変換箇所、呼び出し元、条件分岐、画面ごとの処理経路など次に追う対象を具体化してください。",
    "題名に書かれた発生操作や条件が操作手順に存在するかも確認してください。例えば題名では『複数選択』、手順では『複数商品を登録して一覧表示』となっている場合、同じ操作か判断できないため、実際に行った操作へ表現をそろえる任意改善として扱ってください。",
    "操作手順の整合性は、(1) reviewSourceから主要操作・遷移後の状態・結果を観測した場所または対象を抽出し、(2) 受講者の操作手順から同じ3要素を抽出し、(3) 再現担当者が手順どおり進めて実際の動作を観測できるか、の順で必ず検証してください。操作自体が実行できても、手順の最終状態や確認先では記載された結果を観測できない場合、または観測に必要な遷移・確認操作が欠ける場合は、該当する再現手順のrequiredFactをpresentにせずcontradictedまたはmissingと判定し、reproducibilityの具体的な修正対象として指摘してください。reviewSourceと操作手順がそれぞれ観測先を明示し、その意味が異なる場合はcontradictedとし、reproducibilityは75点以下、improvementItemsは『修正推奨』にしてください。これは任意の表現改善として扱いません。ただし、呼称が違っても同じ画面・状態を意味することが明らかな場合は一致とみなしてください。選択済み証跡や実際の動作欄が結果を裏付けていても、それらで操作手順の不整合を補完してはいけません。固有名詞や定型文の一致ではなく、意味と観測可能性で判断してください。",
    "readerQuestionsのclassificationが不足情報の場合は該当するrequiredFactsのfactIdを使用してください。記述確認または調査提案の場合はfactIdをnot-applicableにしてください。受講者へ提示されていない情報を答えさせる質問を、不足情報として生成してはいけません。",
    "factAssessmentsにはrequiredFactsの全factIdを重複なく1回ずつ含め、present・missing・contradictedのいずれかで判定してください。",
    "presentまたはcontradictedの場合は、受講者の回答に連続して実在する短い文言をevidenceQuoteへそのまま引用してください。reviewSourceの文章を受講者の記述として引用してはいけません。追跡用識別子を選択済み証跡で補完した場合は『添付証跡: <evidence id>』としてください。missingの場合は空文字にしてください。",
    "forbiddenClaimsに該当する断定がある場合だけ、そのIDをforbiddenClaimIdsへ入れてください。",
    "チケット設定と添付証跡の選択正誤はシステムが別途採点します。expectedTicketFields、および必要なevidenceFilesを選べたかどうかをdimensionsの減点理由に含めないでください。総合点と最終verdictはシステム側で確定します。",
    "一方、選択した添付ファイルごとのevidenceDescriptionsは起票内容の一部です。ファイル名だけでは内容を判別しにくい証跡について、読み手がファイルの内容や確認箇所を把握できる説明になっているかをinvestigationReadinessだけで評価してください。未入力や『ログです』『エラーあり』のような汎用説明があれば軽微な改善として扱い、根拠のない原因断定やファイル内容と矛盾する説明は明確に指摘してください。",
    "evidenceDescriptionsが全件具体的で、対象処理・時刻・確認箇所などを簡潔に把握できる場合は、添付説明を理由にinvestigationReadinessを減点しないでください。説明が未入力でも送信自体は可能であり、添付説明だけを理由に主要情報不足や再整理を推奨してはいけません。",
    "利用者向けレビューではevidenceDescriptionsなどの内部フィールド名や証跡IDを表示せず、『添付ファイルの説明』と実際のファイル名を使用してください。",
    "readerQuestionsは確定した不足がなければ0件で構いません。最大4件とし、件数を満たすための質問を作らないでください。",
    "readerQuestionsはチケット本文と選択済み証跡だけを読んだ実際の担当者が、起票者へ聞き返す質問です。観測記録、提示材料、シナリオ、記載例だけにある情報を引用したり、その情報との違いを質問したりしないでください。",
    "investigationAdviceは起票の不足とは分けて0〜4件示してください。",
    "文章が十分明確な場合は無理に欠点を作らず、調査開始後に読み手が確認したくなる点を調査提案として示してください。",
    "rewriteSuggestionsは本当に改善効果がある場合だけ返してください。受講者の有効な表現を残した最小限の修正とし、記載例を丸ごと再現した文章へ置き換えないでください。",
    "受講者向けの表示では『備考』欄を『周辺確認・補足』と呼びます。レビュー本文やrewriteSuggestionsのsectionでこの欄を指す場合も『周辺確認・補足』と表記してください。",
    "strengthsは0〜2件とします。根拠のある長所がなければ空配列にしてください。無意味な文字列や項目を分けただけの回答を、形式面だけで無理に評価してはいけません。各項目では受講者の起票から短い文言をevidenceQuoteへ引用し、その記述から読み取れるこの不具合固有の判断・観察をevaluationへ、調査や意思決定にどう役立つかをwhyItHelpsへ記載してください。",
    "フォームの構造上当然となる『期待結果と実際の動作が分かれている』『再現回数が数値で書かれている』『操作手順がある』『項目が埋まっている』だけをstrengthsとして評価してはいけません。再現性を評価する場合は、具体的な比較条件と結果から何を絞り込めるかまで述べてください。",
    "採点基準にreviewGuideがある場合、strengthCriteriaは内容固有の着眼点として使い、disallowedGenericPraiseは単独の称賛として使用しないでください。nonScoringInvestigationIdeasは不足情報や減点理由ではなく、今後の調査提案としてのみ扱ってください。",
    "reviewGuide.acceptedConciseConditionsがある場合、そこに記載した簡潔な表現はこのシナリオで十分な記述です。overallAssessment、dimensionFeedback、improvementItems、readerQuestions、rewriteSuggestionsのいずれでも、その具体化や書き換えを要求しないでください。",
    "dimensionFeedbackには各評価軸の点数の理由だけを具体的に記載してください。実務上十分なら100点を使用し、到達不能な理想との差を作らないでください。",
    "improvementItemsは最大4件です。調査開始前に直す価値が高い不足は『修正推奨』、調査は開始できるが表現や補足を磨ける点は『任意改善』としてください。同じ原因を複数項目へ分割せず、各項目のrelatedDimensionIdsに関係する評価軸をまとめてください。detailには抽象論ではなく、この起票へそのまま反映できる具体的な修正内容を示してください。",
    "同じ問題をoverallAssessment、improvementItems、ambiguityRisks、rewriteSuggestionsへ重複して並べないでください。総評で短く触れ、具体的な修正はimprovementItemsの1件へ集約してください。",
    "一部に事実誤認があっても、ほかにこの不具合固有の良い記述があればstrengthsとして独立に評価してください。1件の誤りを理由に起票全体の長所を消さないでください。",
    "90〜100点はそのまま調査着手可能、80〜89点は良好で軽微な改善あり、70〜79点は追加確認を推奨、69点以下は主要情報不足の目安です。語句の好みや軽微な重複だけで80点台前半まで下げないでください。",
    "点数を下げるのは、improvementItemsに挙げるだけの具体的な修正または任意改善がある評価軸だけです。relatedDimensionIdsに含まれない評価軸はシステムが100点として扱います。",
    "各評価軸は0〜100の整数で採点してください。",
    "",
    "採点基準:",
    JSON.stringify(scoringRubricForPrompt),
    "",
    "受講者の回答:",
    JSON.stringify({
      answer: attempt.answer,
      selectedEvidenceIds: attempt.selectedEvidenceIds || [],
      evidenceDescriptions: attempt.evidenceDescriptions || {},
    }),
    "",
    "選択済み添付証跡の内容:",
    JSON.stringify(selectedEvidenceContext),
    ...buildRevisionPromptParts(options),
  ].join("\n");
}

export function buildScoringSystemInstruction(attempt) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  if (!rubric) {
    const error = new Error("このシナリオはAI採点の対象外です。");
    error.code = "SCENARIO_NOT_SUPPORTED";
    throw error;
  }
  return rubric.ticketType === "qa"
    ? QA_SCORING_SYSTEM_INSTRUCTION
    : BUG_SCORING_SYSTEM_INSTRUCTION;
}

function removeTerminalPunctuation(value) {
  return value.replace(/[。．.！!？?]+$/u, "");
}

function isGenericStructurePraise(evaluation, whyItHelps) {
  const text = `${evaluation} ${whyItHelps}`;
  return [
    /期待(?:結果|する動作).{0,30}実際(?:の動作|結果).{0,40}(分け|分離|枠組み|構造)/u,
    /再現(?:回数|性).{0,30}(数値|明記|記載)/u,
    /操作手順.{0,30}(具体|記載|用意|ある)/u,
    /(?:項目|フォーム).{0,30}(埋|分け|構造|形式)/u,
    /質問(?:欄|項目).{0,30}(ある|埋|分け|構造|形式)/u,
    /形式面|枠組み/u,
  ].some((pattern) => pattern.test(text));
}

function normalizedQuoteText(value) {
  return String(value || "").normalize("NFKC").replace(/\s+/gu, "");
}

function normalizePublicSectionLabel(value) {
  const label = String(value || "");
  return label === "備考" || label === "■備考" ? "周辺確認・補足" : label;
}

function publicReviewText(value, rubric) {
  let text = String(value || "").replaceAll("evidenceDescriptions", "添付ファイルの説明");
  (rubric?.evidenceFiles || []).forEach(({ id, name }) => {
    if (id && name) {
      text = text.replaceAll(id, name);
    }
  });
  return text;
}

function isAttachmentDescriptionOnlyImprovement(item) {
  const text = `${item.title || ""} ${item.detail || ""} ${item.whyItMatters || ""}`;
  return /(?:添付ファイル|添付証跡).{0,35}(?:説明|概要|確認箇所)/u.test(text)
    && /(?:空欄|未入力|入力|補足|追加|記載)/u.test(text)
    && !/(?:矛盾|誤り|原因断定|事実と異なる)/u.test(text);
}

function isQaDecisionRestatement(question) {
  return /(?:不具合|正常|仕様|修正).{0,35}(?:扱って|変更|維持|問題ありませんか|よいでしょうか|しますか)/u.test(
    String(question || "")
  );
}

function referencesEvaluatorOnlyContext(question) {
  return /(?:観測記録|提示材料|入力材料|出題シナリオ|研修シナリオ|記載例|見本回答|比較検証で行った|事実との違い)/u.test(
    String(question || "")
  );
}

function requestsRedundantTrackingIdentifier(item, rubric, attempt) {
  if (!attempt || !rubric?.factAssessmentPolicy?.trackingIdentifierRule) {
    return false;
  }
  const text = `${item.title || ""} ${item.detail || ""}`;
  const requestsIdentifier = /(?:通知ID|決済ID|注文番号|患者ID|商品ID|SKU|追跡用識別子).{0,45}(?:記載|明記|追記|補足|具体化|追加)/u.test(text);
  if (!requestsIdentifier) {
    return false;
  }
  const answerText = JSON.stringify(attempt.answer || {});
  const identityIsExplained = /(?:同一|同じ|異なる|重複|再送)/u.test(answerText);
  const selectedIds = new Set(attempt.selectedEvidenceIds || []);
  const selectedEvidenceText = (rubric.evidenceFiles || [])
    .filter(({ id }) => selectedIds.has(id))
    .map(({ name, summary }) => `${name || ""} ${summary || ""}`)
    .join(" ");
  const evidenceCanTraceTarget = /(?:ID|番号|識別子|ログ|DB)/iu.test(selectedEvidenceText);
  return identityIsExplained && evidenceCanTraceTarget;
}

function requestsUnsupportedEcOrderDetails(item, scenarioId) {
  if (scenarioId !== "ec-payment-notification-double-order") {
    return false;
  }
  const text = `${item.title || ""} ${item.detail || ""} ${item.question || ""}`;
  return /(?:任意の注文|対象の注文データ|商品種別|決済金額).{0,55}(?:前提条件|具体|明確|補足|意識すべき|書き換え|改め)/u.test(text);
}

function requestsAlreadyStatedEcRecoveryStatus(item, scenarioId, attempt) {
  if (scenarioId !== "ec-payment-notification-double-order" || !attempt) {
    return false;
  }
  const feedbackText = `${item.title || ""} ${item.detail || ""}`;
  const answerText = JSON.stringify(attempt.answer || {});
  return /(?:復旧|キャンセル|取り消し).{0,50}(?:確認済み|推測|対応案|区別|明確)/u.test(feedbackText)
    && /(?:復旧できることを確認|取り消し.{0,30}確認)/u.test(answerText);
}

function isEcReproducibilityCorrection(item, scenarioId) {
  if (scenarioId !== "ec-payment-notification-double-order") {
    return false;
  }
  const text = `${item.title || ""} ${item.detail || ""} ${item.original || ""} ${item.suggested || ""} ${item.reason || ""}`;
  return /(?:2\s*\/\s*15|15回中1回|再現(?:性|回数).{0,30}(?:訂正|修正|発生回数)|発生回数.{0,30}(?:訂正|修正))/u.test(text);
}

function requestsUnhelpfulEcUnknownCauseNote(item, scenarioId) {
  if (scenarioId !== "ec-payment-notification-double-order") {
    return false;
  }
  const text = `${item.title || ""} ${item.detail || ""} ${item.reason || ""}`;
  return /(?:注文API側.{0,45}周辺処理側|周辺処理側.{0,45}注文API側)/u.test(text)
    && /(?:原因|切り分け)/u.test(text)
    && /(?:未分明|未確認|できていない|補足|追記)/u.test(text);
}

function hasEcSurroundingComparison(answerText) {
  return /通知メール.{0,25}(?:1通|一通)/u.test(answerText)
    && /売上.{0,25}(?:1件|一件)/u.test(answerText);
}

function isEcSurroundingComparisonImprovement(item, scenarioId) {
  if (scenarioId !== "ec-payment-notification-double-order") {
    return false;
  }
  const text = `${item.title || ""} ${item.detail || ""} ${item.whyItMatters || ""}`;
  return /通知メール/u.test(text) && /売上/u.test(text);
}

function rewritesAcceptedEcDescription(item, scenarioId) {
  if (scenarioId !== "ec-payment-notification-double-order") {
    return false;
  }
  return /^(?:■)?詳細$/u.test(item.section)
    && /(?:同一の決済通知|決済通知ID)/u.test(item.original)
    && /異なる注文番号/u.test(item.original);
}

function createAttemptEvidenceChecker(attempt) {
  if (!attempt) {
    return () => true;
  }
  const answerText = normalizedQuoteText(JSON.stringify({
    answer: attempt.answer || {},
    evidenceDescriptions: attempt.evidenceDescriptions || {},
  }));
  const selectedEvidenceIds = new Set(attempt.selectedEvidenceIds || []);
  return (quote) => {
    const normalizedQuote = normalizedQuoteText(quote);
    if (!normalizedQuote) {
      return false;
    }
    const evidenceMatch = /^添付証跡[:：](.+)$/u.exec(normalizedQuote);
    if (evidenceMatch) {
      return selectedEvidenceIds.has(evidenceMatch[1]);
    }
    return answerText.includes(normalizedQuote);
  };
}

function createAnswerSectionQuoteChecker(attempt, names) {
  const sectionText = normalizedQuoteText(answerSectionText(attempt, names));
  return (quote) => {
    const normalizedQuote = normalizedQuoteText(quote);
    return Boolean(normalizedQuote) && sectionText.includes(normalizedQuote);
  };
}

export function normalizeModelOutput(
  rawOutput,
  scenarioId = DEFAULT_SCENARIO_ID,
  attempt = null,
  rubricOverride = null
) {
  if (!rawOutput || typeof rawOutput !== "object") {
    throw new Error("Gemini output must be an object");
  }
  const rubric = rubricOverride || getScenarioRubric(scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  const validFactIds = new Set(getFactIds(rubric));
  const factIdValues = ["not-applicable", ...validFactIds];
  const isGroundedQuote = createAttemptEvidenceChecker(attempt);
  const isStepQuote = createAnswerSectionQuoteChecker(
    attempt,
    ["steps", "操作手順", "■操作手順"]
  );
  const attemptAnswerText = JSON.stringify(attempt?.answer || {});
  const trainingLevel = normalizeTrainingLevel(attempt?.answer?.trainingLevel);
  const workflowFactIds = new Set(
    (rubric.requiredFacts?.steps || []).map(({ id }) => id)
  );
  let workflowConsistency = {
    status: "not-applicable",
    factId: "not-applicable",
    sourceObservation: "",
    answerQuote: "",
    reason: "",
    suggestedCorrection: "",
  };
  if (rubric.ticketType !== "qa") {
    const workflow = rawOutput.workflowConsistency;
    if (workflow && typeof workflow === "object" && !Array.isArray(workflow)) {
      const allowedStatuses = ["consistent", "inconsistent", "not-applicable"];
      const status = allowedStatuses.includes(workflow.status)
        ? workflow.status
        : "not-applicable";
      const firstWorkflowFactId = [...workflowFactIds][0] || "not-applicable";
      const requestedFactId = workflowFactIds.has(workflow.factId)
        ? workflow.factId
        : firstWorkflowFactId;
      const rawAnswerQuote = typeof workflow.answerQuote === "string"
        ? workflow.answerQuote.trim().slice(0, 500)
        : "";
      const answerQuote = rawAnswerQuote && isStepQuote(rawAnswerQuote)
        ? rawAnswerQuote
        : "";
      const workflowFact = (rubric.requiredFacts?.steps || [])
        .find(({ id }) => id === requestedFactId);
      const observationById = new Map(
        (rubric.reviewSource?.observations || []).map((observation) => [
          observation.id,
          observation.text,
        ])
      );
      const groundedSourceObservation = (workflowFact?.sourceRefs || [])
        .map((sourceRef) => observationById.get(sourceRef))
        .filter(Boolean)
        .join(" ");
      const rawReason = typeof workflow.reason === "string"
        ? workflow.reason.trim().slice(0, 500)
        : "";
      const rawCorrection = typeof workflow.suggestedCorrection === "string"
        ? workflow.suggestedCorrection.trim().slice(0, 500)
        : "";
      const rawSourceObservation = typeof workflow.sourceObservation === "string"
        ? workflow.sourceObservation.trim().slice(0, 500)
        : "";
      const canApplyMismatch = status === "inconsistent"
        && requestedFactId !== "not-applicable"
        && Boolean(answerQuote)
        && Boolean(workflowFact);
      const isConsistent = status === "consistent";
      workflowConsistency = {
        status: canApplyMismatch ? "inconsistent" : isConsistent ? "consistent" : "not-applicable",
        factId: canApplyMismatch || isConsistent ? requestedFactId : "not-applicable",
        sourceObservation: canApplyMismatch
          ? groundedSourceObservation || rawSourceObservation
          : isConsistent ? rawSourceObservation : "",
        answerQuote: canApplyMismatch ? answerQuote : isConsistent ? rawAnswerQuote : "",
        reason: canApplyMismatch
          ? publicReviewText(
              rawReason || "操作手順の最終状態では、観測記録にある結果を同じ場所・対象で確認できないためです。",
              rubric
            )
          : isConsistent ? publicReviewText(rawReason, rubric) : "",
        suggestedCorrection: canApplyMismatch
          ? publicReviewText(rawCorrection || workflowFact.description, rubric)
          : isConsistent ? publicReviewText(rawCorrection, rubric) : "",
      };
    }
  }
  const ecReproducibilityMismatch = scenarioId === "ec-payment-notification-double-order"
    && /2\s*\/\s*15/u.test(attemptAnswerText);
  const ecSurroundingComparisonMissing = scenarioId === "ec-payment-notification-double-order"
    && !hasEcSurroundingComparison(attemptAnswerText);
  const dimensions = Object.fromEntries(
    rubric.dimensions.map((dimension) => [
      dimension.id,
      requireScore(rawOutput.dimensions?.[dimension.id], `dimensions.${dimension.id}`),
    ])
  );
  const dimensionFeedback = Object.fromEntries(
    rubric.dimensions.map((dimension) => {
      const feedback = rawOutput.dimensionFeedback?.[dimension.id];
      if (!feedback || typeof feedback !== "object" || Array.isArray(feedback)) {
        throw new Error(`dimensionFeedback.${dimension.id} must be an object`);
      }
      const reason = publicReviewText(requireNonEmptyString(
        feedback.reason,
        `dimensionFeedback.${dimension.id}.reason`
      ), rubric);
      return [dimension.id, { reason }];
    })
  );
  const validDimensionIds = new Set(rubric.dimensions.map(({ id }) => id));
  let improvementItems = requireArray(rawOutput.improvementItems, "improvementItems")
    .slice(0, 4)
    .map((item, index) => {
      const relatedDimensionIds = normalizeStringArray(
        item.relatedDimensionIds,
        `improvementItems[${index}].relatedDimensionIds`
      );
      if (
        relatedDimensionIds.length === 0
        || relatedDimensionIds.some((dimensionId) => !validDimensionIds.has(dimensionId))
      ) {
        throw new Error(`improvementItems[${index}].relatedDimensionIds contains an invalid dimension`);
      }
      const normalizedItem = {
        priority: requireEnum(
          item.priority,
          ["修正推奨", "任意改善"],
          `improvementItems[${index}].priority`
        ),
        title: publicReviewText(
          requireNonEmptyString(item.title, `improvementItems[${index}].title`),
          rubric
        ),
        detail: publicReviewText(
          requireNonEmptyString(item.detail, `improvementItems[${index}].detail`),
          rubric
        ),
        whyItMatters: publicReviewText(requireNonEmptyString(
          item.whyItMatters,
          `improvementItems[${index}].whyItMatters`
        ), rubric),
        relatedDimensionIds: [...new Set(relatedDimensionIds)],
      };
      if (
        rubric.ticketType !== "qa"
        && validDimensionIds.has("investigationReadiness")
        && isAttachmentDescriptionOnlyImprovement(normalizedItem)
      ) {
        normalizedItem.relatedDimensionIds = ["investigationReadiness"];
      }
      return normalizedItem;
    })
    .filter((item) => !requestsRedundantTrackingIdentifier(item, rubric, attempt))
    .filter((item) => !requestsUnsupportedEcOrderDetails(item, scenarioId))
    .filter((item) => !requestsAlreadyStatedEcRecoveryStatus(item, scenarioId, attempt))
    .filter((item) => !isEcReproducibilityCorrection(item, scenarioId))
    .filter((item) => !requestsUnhelpfulEcUnknownCauseNote(item, scenarioId))
    .filter((item) => !isEcSurroundingComparisonImprovement(item, scenarioId));
  if (ecReproducibilityMismatch) {
    improvementItems.unshift({
      priority: "修正推奨",
      title: "再現回数の記述を訂正する",
      detail: "再現性の『2/15』を、提示された検証結果に合わせて『15回中1回発生』へ修正してください。",
      whyItMatters: "実際の発生頻度と異なる数値は、再現試験と調査優先度の判断を誤らせるためです。",
      relatedDimensionIds: ["factualGrounding", "reproducibility"],
    });
    dimensions.factualGrounding = 90;
    dimensions.reproducibility = 90;
    dimensionFeedback.factualGrounding = {
      reason: "主要事象は正確ですが、再現性の『2/15』が提示された検証結果と一致していません。",
    };
    dimensionFeedback.reproducibility = {
      reason: "試行回数は分かりますが、発生回数は『15回中1回』への訂正が必要です。",
    };
  }
  if (ecSurroundingComparisonMissing) {
    improvementItems.push({
      priority: "任意改善",
      title: "確認済みの影響範囲を補足する",
      detail: "確認済みの『顧客への通知メールは1通』『決済側の売上は1件』を周辺確認・補足へ追記すると、注文だけが重複したことを伝えられます。",
      whyItMatters: "重複が注文作成に限定されるのか、通知や決済まで波及しているのかを調査担当者が判断しやすくなるためです。",
      relatedDimensionIds: ["informationCoverage", "investigationReadiness"],
    });
    dimensions.informationCoverage = Math.max(dimensions.informationCoverage, 90);
    dimensions.investigationReadiness = Math.max(dimensions.investigationReadiness, 90);
    dimensionFeedback.informationCoverage = {
      reason: "主要情報は揃っています。確認済みの通知メールと決済売上の件数を補足すると、影響範囲がさらに明確になります。",
    };
    dimensionFeedback.investigationReadiness = {
      reason: "調査は開始できます。注文以外への波及有無を追記すると、初動の切り分けがより速くなります。",
    };
  }
  if (workflowConsistency.status === "inconsistent") {
    const workflowImprovementIndex = improvementItems.findIndex(({ relatedDimensionIds }) =>
      relatedDimensionIds.includes("reproducibility")
    );
    if (workflowImprovementIndex >= 0) {
      improvementItems[workflowImprovementIndex] = {
        ...improvementItems[workflowImprovementIndex],
        priority: "修正推奨",
      };
    } else {
      improvementItems.unshift({
        priority: "修正推奨",
        title: "操作手順の確認先を修正する",
        detail: `操作手順の「${workflowConsistency.answerQuote}」を、${workflowConsistency.suggestedCorrection}へ修正してください。`,
        whyItMatters: workflowConsistency.reason,
        relatedDimensionIds: ["reproducibility"],
      });
    }
    dimensions.reproducibility = Math.min(dimensions.reproducibility, 75);
    dimensionFeedback.reproducibility = {
      reason: `操作手順の「${workflowConsistency.answerQuote}」は、観測記録上の確認経路と一致せず、その手順だけでは結果を確認できません。`,
    };
  }
  improvementItems = improvementItems.slice(0, 4);
  const explainedDimensionIds = new Set(
    improvementItems.flatMap(({ relatedDimensionIds }) => relatedDimensionIds)
  );
  const readinessImprovements = improvementItems.filter(({ relatedDimensionIds }) =>
    relatedDimensionIds.includes("investigationReadiness")
  );
  if (
    readinessImprovements.length > 0
    && readinessImprovements.every(isAttachmentDescriptionOnlyImprovement)
    && dimensions.investigationReadiness < 90
  ) {
    dimensions.investigationReadiness = 90;
    dimensionFeedback.investigationReadiness = {
      reason: "調査に必要な本文と証跡は揃っています。添付ファイルの説明を補足すると、証跡を開く前の確認コストをさらに下げられます。",
    };
  }
  rubric.dimensions.forEach(({ id }) => {
    if (dimensions[id] < 100 && !explainedDimensionIds.has(id)) {
      dimensions[id] = 100;
      dimensionFeedback[id] = {
        reason: "実務上の修正点または任意改善に該当する問題はありません。",
      };
    }
  });
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
      if (classification !== "不足情報" && factId !== "not-applicable") {
        factId = "not-applicable";
      }
      return {
        reader: publicReviewText(
          requireNonEmptyString(item.reader, `readerQuestions[${index}].reader`), rubric
        ),
        question: publicReviewText(
          requireNonEmptyString(item.question, `readerQuestions[${index}].question`), rubric
        ),
        whyItMatters: publicReviewText(requireNonEmptyString(
          item.whyItMatters,
          `readerQuestions[${index}].whyItMatters`
        ), rubric),
        classification,
        factId,
      };
    })
    .filter((item) => !referencesEvaluatorOnlyContext(`${item.question} ${item.whyItMatters}`))
    .filter((item) => !requestsUnsupportedEcOrderDetails(item, scenarioId))
    .filter((item) => !ecReproducibilityMismatch || !/2\s*\/\s*15/u.test(item.question))
    .filter((item) =>
      rubric.ticketType !== "qa"
      || (
        item.classification === "不足情報"
        && !isQaDecisionRestatement(item.question)
      )
    );
  const ambiguityRisks = requireArray(rawOutput.ambiguityRisks, "ambiguityRisks")
    .map((item, index) => ({
      quote: requireNonEmptyString(item.quote, `ambiguityRisks[${index}].quote`),
      risk: publicReviewText(
        requireNonEmptyString(item.risk, `ambiguityRisks[${index}].risk`), rubric
      ),
      advice: publicReviewText(
        requireNonEmptyString(item.advice, `ambiguityRisks[${index}].advice`), rubric
      ),
    }))
    .filter((item) => isGroundedQuote(item.quote));
  const investigationAdvice = requireArray(rawOutput.investigationAdvice, "investigationAdvice")
    .map((item, index) => ({
      action: publicReviewText(
        requireNonEmptyString(item.action, `investigationAdvice[${index}].action`), rubric
      ),
      purpose: publicReviewText(
        requireNonEmptyString(item.purpose, `investigationAdvice[${index}].purpose`), rubric
      ),
    }));
  let rewriteSuggestions = requireArray(rawOutput.rewriteSuggestions, "rewriteSuggestions")
    .map((item, index) => ({
      section: normalizePublicSectionLabel(
        requireNonEmptyString(item.section, `rewriteSuggestions[${index}].section`)
      ),
      original: optionalString(item.original, `rewriteSuggestions[${index}].original`)
        || "（未記載）",
      suggested: publicReviewText(
        requireNonEmptyString(item.suggested, `rewriteSuggestions[${index}].suggested`), rubric
      ),
      reason: publicReviewText(
        requireNonEmptyString(item.reason, `rewriteSuggestions[${index}].reason`), rubric
      ),
    }))
    .filter((item) => item.original === "（未記載）" || isGroundedQuote(item.original))
    .filter((item) => !isEcReproducibilityCorrection(item, scenarioId))
    .filter((item) => !rewritesAcceptedEcDescription(item, scenarioId));
  if (
    workflowConsistency.status === "inconsistent"
    && !rewriteSuggestions.some(({ original }) => original === workflowConsistency.answerQuote)
  ) {
    rewriteSuggestions.unshift({
      section: "操作手順",
      original: workflowConsistency.answerQuote,
      suggested: workflowConsistency.suggestedCorrection,
      reason: workflowConsistency.reason,
    });
  }
  const factAssessments = requireArray(rawOutput.factAssessments, "factAssessments")
    .map((item, index) => {
      const factId = requireEnum(item.factId, [...validFactIds], `factAssessments[${index}].factId`);
      let status = requireEnum(
        item.status,
        factAssessmentStatuses,
        `factAssessments[${index}].status`
      );
      if (ecReproducibilityMismatch && factId === "reproducibility-observed") {
        status = "contradicted";
      }
      if (
        workflowConsistency.status === "inconsistent"
        && factId === workflowConsistency.factId
      ) {
        status = "contradicted";
      }
      const evidenceQuote = workflowConsistency.status === "inconsistent"
        && factId === workflowConsistency.factId
        ? workflowConsistency.answerQuote
        : ecReproducibilityMismatch && factId === "reproducibility-observed"
        ? "2/15"
        : status === "missing"
          ? ""
          : requireNonEmptyString(
              item.evidenceQuote,
              `factAssessments[${index}].evidenceQuote`
            );
      return { factId, status, evidenceQuote };
    });
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
  const overallAssessment = workflowConsistency.status === "inconsistent"
    ? `主要な事象と期待結果は整理されていますが、操作手順の確認経路に不一致があります。${workflowConsistency.suggestedCorrection}へ修正してください。`
    : ecReproducibilityMismatch
    ? "主要な事象、仕様に基づく期待結果、実際の動作は整理されており、調査を開始できる状態です。再現性の『2/15』のみ、確認済みの『15回中1回発生』へ訂正してください。"
    : publicReviewText(
        requireNonEmptyString(rawOutput.overallAssessment, "overallAssessment"), rubric
      );
  let strengths = requireArray(rawOutput.strengths, "strengths").map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`strengths[${index}] must be an object`);
    }
    const evidenceQuote = requireNonEmptyString(
      item.evidenceQuote,
      `strengths[${index}].evidenceQuote`
    );
    const evaluation = publicReviewText(requireNonEmptyString(
      item.evaluation,
      `strengths[${index}].evaluation`
    ), rubric);
    const whyItHelps = publicReviewText(requireNonEmptyString(
      item.whyItHelps,
      `strengths[${index}].whyItHelps`
    ), rubric);
    return { evidenceQuote, evaluation, whyItHelps };
  }).filter((item) =>
    isGroundedQuote(item.evidenceQuote)
    && (
      trainingLevel === "beginner"
      || !isGenericStructurePraise(item.evaluation, item.whyItHelps)
    )
  ).map(({ evidenceQuote, evaluation, whyItHelps }) =>
    `「${evidenceQuote}」という記述から、${removeTerminalPunctuation(evaluation)}。${whyItHelps}`
  );
  const ecExpectedQuote = "処理済みの通知IDを再受信した場合、初回の注文結果を返すこと";
  if (
    scenarioId === "ec-payment-notification-double-order"
    && attemptAnswerText.includes(ecExpectedQuote)
    && !strengths.some((strength) => strength.includes(ecExpectedQuote))
  ) {
    strengths.unshift(
      `「${ecExpectedQuote}」という記述から、仕様に基づく期待動作を具体的に示しています。二重作成という実際の動作とのずれを、調査担当者がすぐ判断できます。`
    );
  }
  return {
    dimensions,
    dimensionFeedback,
    improvementItems,
    verdict: requireEnum(rawOutput.verdict, getRubricVerdicts(rubric), "verdict"),
    overallAssessment,
    readerQuestions,
    ambiguityRisks,
    investigationAdvice,
    rewriteSuggestions,
    strengths: strengths.slice(0, 2),
    factAssessments,
    forbiddenClaimIds,
    workflowConsistency,
  };
}

function textFallsOutsideTrainingScope(value, trainingLevel) {
  if (trainingLevel !== "beginner") {
    return false;
  }
  return /(?:再現手順|操作手順|再現率|比較確認|比較条件|別条件|切り分け|影響範囲|復帰方法|回避方法|担当者|期日|ウォッチャー|添付証跡|添付ファイル|ログ確認)/u.test(
    String(value || "")
  );
}

function scopedDimensionAverage(dimensions, rubric, activeDimensionIds = null) {
  const activeDimensions = rubric.dimensions.filter(
    ({ id }) => activeDimensionIds === null || activeDimensionIds.has(id)
  );
  const totalWeight = activeDimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  if (totalWeight <= 0) {
    return 100;
  }
  return Math.round(
    activeDimensions.reduce(
      (total, dimension) => total + dimensions[dimension.id] * dimension.weight,
      0
    ) / totalWeight
  );
}

function buildTrainingLevelOverallAssessment(trainingLevel, rubric, score) {
  const qaTicket = rubric.ticketType === "qa";
  if (trainingLevel === "beginner") {
    if (score >= 90) {
      return qaTicket
        ? "初級の学習目標である、質問の焦点と確認した事実・解釈の分離ができています。"
        : "初級の学習目標である、題名と確認した事実、期待結果と実際の動作の分離ができています。";
    }
    if (score >= 75) {
      return qaTicket
        ? "質問の焦点と確認した事実は概ね整理できています。下の改善点に絞って、事実と解釈の伝わり方を見直しましょう。"
        : "題名と確認した事実は概ね整理できています。下の改善点に絞って、事実と推測の分け方を見直しましょう。";
    }
    return qaTicket
      ? "初級で確認する質問の焦点と事実の書き方に不足があります。表示された基本項目だけを見直しましょう。"
      : "初級で確認する題名と事実の書き方に不足があります。表示された基本項目だけを見直しましょう。";
  }
  if (trainingLevel === "intermediate") {
    if (score >= 90) {
      return qaTicket
        ? "中級の学習目標に沿って、回答に必要な根拠と影響を簡潔に整理できています。"
        : "中級の学習目標に沿って、再現手順と切り分けに必要な情報を簡潔に整理できています。";
    }
    if (score >= 75) {
      return qaTicket
        ? "回答に必要な情報は概ね整理できています。下の改善点に絞って、根拠と影響を見直しましょう。"
        : "再現に必要な情報は概ね整理できています。下の改善点に絞って、手順と切り分け情報を見直しましょう。";
    }
    return qaTicket
      ? "中級で確認する根拠と影響の整理に不足があります。表示された改善点を順に見直しましょう。"
      : "中級で確認する再現手順と切り分け情報に不足があります。表示された改善点を順に見直しましょう。";
  }
  return null;
}

function buildGroundedTrainingStrength(attempt, rubric) {
  if (rubric.ticketType === "qa") {
    const question = answerSectionText(
      attempt,
      ["question", "質問", "■質問"]
    ).trim();
    return question
      ? `「${question.slice(0, 120)}」と確認事項を一つに絞っており、回答者が判断すべき論点を直接読み取れます。`
      : "";
  }
  const stepLines = answerSectionText(
    attempt,
    ["steps", "操作手順", "■操作手順"]
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (stepLines.length === 0) {
    return "";
  }
  const firstStep = stepLines[0].slice(0, 100);
  const lastStep = stepLines.at(-1).slice(0, 100);
  return firstStep === lastStep
    ? `「${firstStep}」と操作対象を明示しており、再現担当者が確認を始める条件を特定できます。`
    : `「${firstStep}」から「${lastStep}」までの操作順序が示され、再現担当者が同じ確認経路をたどれます。`;
}

function applyTrainingLevelReviewScope(normalized, attempt, rubric) {
  const scope = getTrainingLevelScope(rubric, attempt?.answer?.trainingLevel);
  if (scope.trainingLevel === "advanced") {
    return normalized;
  }
  const activeDimensionIds = scope.activeDimensionIds;
  const activeFactIds = new Set(
    Object.entries(rubric.requiredFacts || {})
      .filter(([group]) => scope.activeFactGroups === null || scope.activeFactGroups.has(group))
      .flatMap(([, facts]) => facts.map(({ id }) => id))
  );
  const dimensions = { ...normalized.dimensions };
  const dimensionFeedback = { ...normalized.dimensionFeedback };
  rubric.dimensions.forEach(({ id }) => {
    if (activeDimensionIds !== null && !activeDimensionIds.has(id)) {
      dimensions[id] = 100;
      dimensionFeedback[id] = { reason: "このレベルでは評価対象外です。" };
    }
  });
  const improvementItems = normalized.improvementItems
    .map((item) => ({
      ...item,
      relatedDimensionIds: item.relatedDimensionIds.filter(
        (id) => activeDimensionIds === null || activeDimensionIds.has(id)
      ),
    }))
    .filter((item) => item.relatedDimensionIds.length > 0)
    .filter((item) => !textFallsOutsideTrainingScope(
      `${item.title} ${item.detail} ${item.whyItMatters}`,
      scope.trainingLevel
    ));
  const readerQuestions = normalized.readerQuestions
    .filter((item) => item.factId === "not-applicable" || activeFactIds.has(item.factId))
    .filter((item) => !textFallsOutsideTrainingScope(
      `${item.question} ${item.whyItMatters}`,
      scope.trainingLevel
    ));
  const ambiguityRisks = normalized.ambiguityRisks.filter((item) =>
    !textFallsOutsideTrainingScope(`${item.risk} ${item.advice}`, scope.trainingLevel)
  );
  const rewriteSuggestions = normalized.rewriteSuggestions.filter((item) =>
    !textFallsOutsideTrainingScope(
      `${item.section} ${item.suggested} ${item.reason}`,
      scope.trainingLevel
    )
  );
  const activeScore = scopedDimensionAverage(dimensions, rubric, activeDimensionIds);
  let strengths = normalized.strengths;
  if (scope.trainingLevel === "beginner" && strengths.length === 0) {
    const separationDimension = rubric.ticketType === "qa"
      ? dimensions.factInterpretationSeparation
      : dimensions.expectedActualSeparation;
    if (separationDimension >= 90) {
      strengths = [rubric.ticketType === "qa"
        ? "確認した事実と現在の解釈を分けており、回答者が未確定事項を判別しやすくなっています。"
        : "期待結果と実際の動作を分けており、確認した事実を推測と混ぜずに伝えています。"
      ];
    }
  }
  if (
    scope.trainingLevel !== "beginner"
    && strengths.length === 0
    && activeScore >= 90
  ) {
    const groundedStrength = buildGroundedTrainingStrength(attempt, rubric);
    if (groundedStrength) {
      strengths = [groundedStrength];
    }
  }
  return {
    ...normalized,
    dimensions,
    dimensionFeedback,
    improvementItems,
    overallAssessment: buildTrainingLevelOverallAssessment(
      scope.trainingLevel,
      rubric,
      activeScore
    ),
    readerQuestions,
    ambiguityRisks,
    investigationAdvice: scope.trainingLevel === "beginner"
      ? []
      : normalized.investigationAdvice,
    rewriteSuggestions,
    strengths,
    factAssessments: normalized.factAssessments.filter(({ factId }) => activeFactIds.has(factId)),
  };
}

export function calculateWeightedTotal(
  dimensions,
  scenarioId = DEFAULT_SCENARIO_ID,
  trainingLevel = "advanced"
) {
  const rubric = getScenarioRubric(scenarioId);
  if (!rubric) {
    throw new Error("scenario rubric was not found");
  }
  const scope = getTrainingLevelScope(rubric, trainingLevel);
  return scopedDimensionAverage(dimensions, rubric, scope.activeDimensionIds);
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
  const {
    trainingLevel,
    activeTicketFields,
    activeFactGroups,
  } = getTrainingLevelScope(rubric, attempt.answer?.trainingLevel);
  const actualFields = attempt.answer?.ticketFields || {};
  const expectedFields = Object.fromEntries(
    Object.entries(rubric.expectedTicketFields || {}).filter(
      ([field]) =>
        (rubric.ticketType !== "qa" || field !== "severity")
        && (activeTicketFields === null || activeTicketFields.has(field))
    )
  );
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
    if (
      expected
      && typeof expected === "object"
      && !Array.isArray(expected)
      && Array.isArray(expected.accepted)
    ) {
      const actual = actualFields[field] ?? null;
      return {
        field,
        expected: expected.recommended ?? null,
        recommended: expected.recommended ?? null,
        accepted: expected.accepted,
        rationale: expected.rationale ?? null,
        actual,
        matched: expected.accepted.includes(actual),
        recommendedMatch: actual === expected.recommended,
      };
    }
    const actual = actualFields[field] ?? null;
    const matched = Array.isArray(expected)
      ? sameStringSet(actual, expected)
      : actual === expected;
    return { field, expected, actual, matched };
  });
  const expectedEvidenceIds = (trainingLevel === "advanced" ? rubric.evidenceFiles : [])
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
    Object.entries(rubric.requiredFacts)
      .filter(([group]) => activeFactGroups === null || activeFactGroups.has(group))
      .flatMap(([, facts]) => facts)
      .map((fact) => [fact.id, fact])
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
    trainingLevel,
    factAssessments: normalizedOutput.factAssessments.filter(
      ({ factId }) => factById.has(factId)
    ),
    forbiddenClaimIds: normalizedOutput.forbiddenClaimIds,
    workflowConsistency: normalizedOutput.workflowConsistency,
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

export function calculateScoreBreakdown(rubricFindings, writingQualityRawScore) {
  const trainingLevel = normalizeTrainingLevel(rubricFindings?.trainingLevel);
  const scoreMaximums = SCORE_MAXIMUMS_BY_LEVEL[trainingLevel];
  const writingRaw = Math.max(0, Math.min(100, Math.round(writingQualityRawScore || 0)));
  const writingQuality = Math.round(
    writingRaw * scoreMaximums.writingQuality / 100
  );

  const ticketChecks = rubricFindings?.ticketFieldChecks || [];
  const matchedTicketFields = ticketChecks.filter(({ matched }) => matched).length;
  const ticketSettings = scoreMaximums.ticketSettings === 0
    ? 0
    : ticketChecks.length === 0
      ? scoreMaximums.ticketSettings
    : Math.round(
        matchedTicketFields * scoreMaximums.ticketSettings / ticketChecks.length
      );

  const evidenceCheck = rubricFindings?.evidenceCheck || {};
  const expectedEvidenceIds = evidenceCheck.expectedEvidenceIds || [];
  const selectedEvidenceIds = new Set(evidenceCheck.selectedEvidenceIds || []);
  const correctEvidenceCount = expectedEvidenceIds.filter((id) => selectedEvidenceIds.has(id)).length;
  const unrelatedEvidenceCount = (evidenceCheck.unrelatedEvidenceIds || []).length;
  const evidenceSelection = scoreMaximums.evidenceSelection === 0
    ? 0
    : expectedEvidenceIds.length === 0
      ? (selectedEvidenceIds.size === 0 ? scoreMaximums.evidenceSelection : 0)
    : Math.round(
        Math.max(0, correctEvidenceCount - unrelatedEvidenceCount)
        * scoreMaximums.evidenceSelection
        / expectedEvidenceIds.length
      );
  const uncappedTotalScore = writingQuality + ticketSettings + evidenceSelection;
  const appliedMaximum = Number.isInteger(rubricFindings?.appliedScoreCap)
    ? rubricFindings.appliedScoreCap
    : null;
  const totalScore = appliedMaximum === null
    ? uncappedTotalScore
    : Math.min(uncappedTotalScore, appliedMaximum);

  return {
    writingQuality: {
      rawScore: writingRaw,
      awardedPoints: writingQuality,
      maximumPoints: scoreMaximums.writingQuality,
    },
    ticketSettings: {
      matchedCount: matchedTicketFields,
      totalCount: ticketChecks.length,
      awardedPoints: ticketSettings,
      maximumPoints: scoreMaximums.ticketSettings,
    },
    evidenceSelection: {
      correctCount: correctEvidenceCount,
      requiredCount: expectedEvidenceIds.length,
      unrelatedCount: unrelatedEvidenceCount,
      awardedPoints: evidenceSelection,
      maximumPoints: scoreMaximums.evidenceSelection,
    },
    uncappedTotalScore,
    appliedMaximum,
    totalScore,
  };
}

function appendSelectionAssessment(overallAssessment, scoreBreakdown) {
  const notes = [];
  const ticket = scoreBreakdown.ticketSettings;
  const evidence = scoreBreakdown.evidenceSelection;
  if (ticket.awardedPoints < ticket.maximumPoints) {
    notes.push(`チケット設定は${ticket.matchedCount}/${ticket.totalCount}項目が正解です`);
  }
  if (evidence.awardedPoints < evidence.maximumPoints) {
    notes.push("添付証跡の選択に不足または不要なファイルがあります");
  }
  if (notes.length === 0) {
    return overallAssessment;
  }
  return `${overallAssessment} 文章内容とは別に、${notes.join("。")}。`.trim();
}

function successfulScoringResult(result) {
  return result?.status === "succeeded" && Number.isInteger(result.totalScore);
}

export function isScoringResultCompatible(result, attempt, options = {}) {
  const rubric = getScenarioRubric(attempt?.scenarioId);
  const modelId = options.modelId || DEFAULT_MODEL;
  return Boolean(
    successfulScoringResult(result)
    && rubric
    && result.rubricVersion === rubric.rubricVersion
    && result.promptVersion === PROMPT_VERSION
    && result.modelId === modelId
  );
}

export function createReusedScoringResult(attempt, sourceResult, options = {}) {
  if (!successfulScoringResult(sourceResult)) {
    throw new Error("a successful scoring result is required for reuse");
  }
  return {
    ...structuredClone(sourceResult),
    scoringResultId: options.scoringResultId || crypto.randomUUID(),
    attemptId: requireNonEmptyString(attempt?.attemptId, "attempt.attemptId"),
    scoredAt: options.scoredAt || new Date().toISOString(),
  };
}

function scoringFactMap(result) {
  return new Map(
    (result?.rubricFindings?.factAssessments || []).map((assessment) => [
      assessment.factId,
      assessment,
    ])
  );
}

function currentAttemptContainsEvidenceQuote(attempt, quote) {
  const normalizedQuote = normalizedQuoteText(quote);
  const evidenceMatch = /^添付証跡[:：](.+)$/u.exec(normalizedQuote);
  if (evidenceMatch) {
    return new Set(attempt?.selectedEvidenceIds || []).has(evidenceMatch[1]);
  }
  const currentText = normalizedQuoteText(JSON.stringify({
    answer: attempt?.answer || {},
    evidenceDescriptions: attempt?.evidenceDescriptions || {},
  }));
  return Boolean(normalizedQuote) && currentText.includes(normalizedQuote);
}

function getObjectiveRevisionRegressions(
  currentAttempt,
  currentResult,
  previousAttempt,
  previousResult
) {
  const regressions = [];
  const previousFacts = scoringFactMap(previousResult);
  const currentFacts = scoringFactMap(currentResult);
  previousFacts.forEach((previous, factId) => {
    const current = currentFacts.get(factId);
    if (!current) {
      return;
    }
    const presentFactWasLost = previous.status === "present"
      && current.status !== "present"
      && currentAttemptContainsEvidenceQuote(previousAttempt, previous.evidenceQuote)
      && !currentAttemptContainsEvidenceQuote(currentAttempt, previous.evidenceQuote);
    const missingFactBecameContradicted = previous.status === "missing"
      && current.status === "contradicted";
    if (presentFactWasLost || missingFactBecameContradicted) {
      regressions.push(`fact:${factId}`);
    }
  });

  const previousClaims = new Set(previousResult?.rubricFindings?.forbiddenClaimIds || []);
  (currentResult?.rubricFindings?.forbiddenClaimIds || []).forEach((claimId) => {
    if (!previousClaims.has(claimId)) {
      regressions.push(`claim:${claimId}`);
    }
  });

  const previousFields = new Map(
    (previousResult?.rubricFindings?.ticketFieldChecks || []).map((check) => [check.field, check])
  );
  (currentResult?.rubricFindings?.ticketFieldChecks || []).forEach((check) => {
    if (previousFields.get(check.field)?.matched === true && check.matched === false) {
      regressions.push(`ticket-field:${check.field}`);
    }
  });

  if (
    previousResult?.rubricFindings?.evidenceCheck?.matched === true
    && currentResult?.rubricFindings?.evidenceCheck?.matched === false
  ) {
    regressions.push("evidence-selection");
  }

  return regressions;
}

function resultWritingQualityScore(result) {
  return result?.rubricFindings?.scoreBreakdown?.writingQuality?.rawScore
    ?? result?.rubricFindings?.rawWeightedScore
    ?? result?.totalScore
    ?? 0;
}

export function stabilizeRevisionScoringResult(
  currentAttempt,
  currentResult,
  previousAttempt,
  previousResult
) {
  if (!successfulScoringResult(currentResult) || !successfulScoringResult(previousResult)) {
    return currentResult;
  }
  if (attemptContentFingerprint(currentAttempt) === attemptContentFingerprint(previousAttempt)) {
    return createReusedScoringResult(currentAttempt, previousResult, {
      scoredAt: currentResult.scoredAt,
    });
  }
  if (currentResult.totalScore >= previousResult.totalScore) {
    return currentResult;
  }
  const regressions = getObjectiveRevisionRegressions(
    currentAttempt,
    currentResult,
    previousAttempt,
    previousResult
  );
  if (regressions.length > 0) {
    return currentResult;
  }

  const dimensions = { ...(currentResult.dimensions || {}) };
  const dimensionFeedback = structuredClone(currentResult.dimensionFeedback || {});
  const rubric = getScenarioRubric(currentAttempt.scenarioId);
  const raisedDimensionIds = new Set();
  const previousWritingScore = resultWritingQualityScore(previousResult);
  let adjustedWritingScore = calculateWeightedTotal(
    dimensions,
    currentAttempt.scenarioId,
    currentAttempt.answer?.trainingLevel
  );
  while (adjustedWritingScore < previousWritingScore) {
    const candidate = rubric.dimensions
      .map(({ id, weight }) => ({
        id,
        weight,
        gap: Math.max(0, (previousResult.dimensions?.[id] || 0) - (dimensions[id] || 0)),
      }))
      .filter(({ gap }) => gap > 0)
      .sort((left, right) => right.gap * right.weight - left.gap * left.weight)[0];
    if (!candidate) {
      break;
    }
    dimensions[candidate.id] += 1;
    raisedDimensionIds.add(candidate.id);
    adjustedWritingScore = calculateWeightedTotal(
      dimensions,
      currentAttempt.scenarioId,
      currentAttempt.answer?.trainingLevel
    );
  }
  raisedDimensionIds.forEach((dimensionId) => {
    dimensionFeedback[dimensionId] = {
      reason: "前回から明確な悪化が確認されないため、採点の一貫性を保って前回評価を維持しました。",
    };
  });
  const scoreBreakdown = calculateScoreBreakdown(
    currentResult.rubricFindings,
    adjustedWritingScore
  );
  const totalScore = scoreBreakdown.totalScore;
  const stabilityNote = "明確な事実後退がない評価軸は、AIの採点揺れで点数が下がらないよう前回評価を維持しています。";
  return {
    ...currentResult,
    totalScore,
    dimensions,
    dimensionFeedback,
    verdict: verdictForScore(totalScore, rubric.ticketType),
    overallAssessment: `${currentResult.overallAssessment} ${stabilityNote}`.trim(),
    rubricFindings: currentResult.rubricFindings
      ? {
          ...currentResult.rubricFindings,
          rawWeightedScore: adjustedWritingScore,
          scoreBreakdown,
        }
      : currentResult.rubricFindings,
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
    dimensionFeedback: {},
    improvementItems: [],
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

async function requestWorkflowConsistencyAssessment(attempt, options) {
  const rubric = getScenarioRubric(attempt.scenarioId);
  if (
    attempt.answer?.trainingLevel === "beginner"
    || rubric.ticketType === "qa"
    || !(rubric.requiredFacts?.steps || []).length
  ) {
    return {
      status: "not-applicable",
      factId: "not-applicable",
      sourceObservation: "",
      answerQuote: "",
      reason: "",
      suggestedCorrection: "",
    };
  }
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.modelId)}:generateContent`;
  const response = await options.fetchImplementation(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": options.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: WORKFLOW_CONSISTENCY_SYSTEM_INSTRUCTION }],
      },
      contents: [{
        role: "user",
        parts: [{ text: buildWorkflowConsistencyPrompt(attempt) }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: buildWorkflowConsistencyOutputSchema(rubric),
        seed: scoringSeedForAttempt(attempt) ^ 0x5f3759df,
      },
    }),
  });
  const responseBody = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      responseBody.error?.message || "Gemini workflow consistency request failed"
    );
    error.code = response.status === 429 ? "RATE_LIMITED" : "GEMINI_ERROR";
    throw error;
  }
  const responseText = responseBody.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");
  if (!responseText) {
    const error = new Error("Gemini returned no workflow consistency result");
    error.code = "EMPTY_RESULT";
    throw error;
  }
  try {
    return JSON.parse(responseText);
  } catch (cause) {
    const error = new Error("Gemini returned invalid workflow consistency JSON", { cause });
    error.code = "INVALID_MODEL_OUTPUT";
    throw error;
  }
}

export async function scoreAttemptRecordWithGemini(attempt, options) {
  if (!isScoringSupported(attempt?.scenarioId)) {
    const error = new Error("このシナリオはAI採点の対象外です。");
    error.code = "SCENARIO_NOT_SUPPORTED";
    throw error;
  }
  const apiKey = requireNonEmptyString(options.apiKey, "GEMINI_API_KEY");
  const rubric = getScenarioRubric(attempt.scenarioId);
  const modelRubric = buildTrainingScopedModelRubric(
    rubric,
    attempt.answer?.trainingLevel
  );
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
      systemInstruction: {
        parts: [{ text: buildScoringSystemInstruction(attempt) }],
      },
      contents: [{ role: "user", parts: [{ text: buildScoringPrompt(attempt, options) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: buildModelOutputSchema(modelRubric),
        seed: scoringSeedForAttempt(attempt),
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
  if (options.workflowConsistencyAssessment) {
    modelOutput.workflowConsistency = options.workflowConsistencyAssessment;
  } else {
    try {
      modelOutput.workflowConsistency = await requestWorkflowConsistencyAssessment(attempt, {
        apiKey,
        modelId,
        fetchImplementation,
      });
    } catch (error) {
      console.warn(
        `[workflow-consistency] ${error.code || "UNKNOWN"}: ${error.message}`
      );
      modelOutput.workflowConsistency = {
        status: "not-applicable",
        factId: "not-applicable",
        sourceObservation: "",
        answerQuote: "",
        reason: "",
        suggestedCorrection: "",
      };
    }
  }
  let normalized;
  try {
    normalized = normalizeModelOutput(
      modelOutput,
      attempt.scenarioId,
      attempt,
      modelRubric
    );
  } catch (cause) {
    const error = new Error("Gemini returned an invalid scoring result", { cause });
    error.code = "INVALID_MODEL_OUTPUT";
    throw error;
  }
  normalized = applyTrainingLevelReviewScope(normalized, attempt, rubric);
  const rawWeightedScore = calculateWeightedTotal(
    normalized.dimensions,
    attempt.scenarioId,
    attempt.answer?.trainingLevel
  );
  const rubricFindings = buildRubricFindings(
    attempt,
    normalized,
    rawWeightedScore
  );
  const writingQualityRawScore = rawWeightedScore;
  const scoreBreakdown = calculateScoreBreakdown(
    rubricFindings,
    writingQualityRawScore
  );
  rubricFindings.scoreBreakdown = scoreBreakdown;
  const totalScore = scoreBreakdown.totalScore;
  const {
    factAssessments: _factAssessments,
    forbiddenClaimIds: _forbiddenClaimIds,
    workflowConsistency: _workflowConsistency,
    ...review
  } = normalized;
  const hasContradictedFacts = rubricFindings.factAssessments
    .some(({ status }) => status === "contradicted");
  const improvementItems = review.improvementItems.map((item) =>
    writingQualityRawScore >= 90 && !hasContradictedFacts && item.priority === "修正推奨"
      ? { ...item, priority: "任意改善" }
      : item
  );
  const scoringResult = {
    schemaVersion: "scoring-result.v3",
    scoringResultId: crypto.randomUUID(),
    attemptId: attempt.attemptId,
    status: "succeeded",
    totalScore,
    ...review,
    overallAssessment: appendSelectionAssessment(review.overallAssessment, scoreBreakdown),
    improvementItems,
    verdict: verdictForScore(totalScore, rubric.ticketType),
    rubricFindings,
    rubricVersion: rubric.rubricVersion,
    promptVersion: PROMPT_VERSION,
    modelId,
    scoredAt: new Date().toISOString(),
    errorCode: null,
  };
  return options.previousAttempt && options.previousScoringResult
    ? stabilizeRevisionScoringResult(
        attempt,
        scoringResult,
        options.previousAttempt,
        options.previousScoringResult
      )
    : scoringResult;
}

export async function scoreAttemptWithGemini(attemptInput, options) {
  const attempt = createAttemptRecord(attemptInput, options);
  const scoringResult = await scoreAttemptRecordWithGemini(attempt, options);
  return { attempt, scoringResult };
}
