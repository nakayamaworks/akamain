import fs from "node:fs";
import {
  DEFAULT_MODEL,
  createAttemptRecord,
  getScenarioRubric,
  scoreAttemptRecordWithGemini,
} from "../src/scoring-service.js";

const argv = process.argv.slice(2);
const answerFileIndex = argv.indexOf("--answer-json");
const answerFile = answerFileIndex >= 0 ? argv[answerFileIndex + 1] : "";
const scenarioIds = argv.filter((value, index) =>
  value !== "--answer-json" && index !== answerFileIndex + 1
);
const answerOverride = answerFile
  ? JSON.parse(fs.readFileSync(answerFile, "utf8"))
  : null;
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}
if (scenarioIds.length === 0) {
  throw new Error("at least one scenarioId is required");
}
if (answerOverride && scenarioIds.length !== 1) {
  throw new Error("--answer-json can only be used with one scenarioId");
}

for (const scenarioId of scenarioIds) {
  const rubric = getScenarioRubric(scenarioId);
  if (!rubric) {
    throw new Error(`unknown scenarioId: ${scenarioId}`);
  }
  const expected = rubric.expectedTicketFields;
  const expectedCategory = expected.category?.recommended ?? expected.category;
  const timestamp = new Date().toISOString();
  const attempt = createAttemptRecord({
    scenarioId,
    projectId: rubric.projectId,
    answer: {
      subject: answerOverride?.subject || rubric.writingExample.subject,
      sections: answerOverride?.sections || rubric.writingExample.sections,
      ticketFields: {
        tracker: rubric.ticketType === "qa" ? "qa" : "bug",
        private: false,
        status: "new",
        severity: expected.severity,
        priority: expected.priority,
        assigneeId: expected.assigneeId,
        category: expectedCategory,
        version: expected.version,
        environment: expected.environment,
        startDate: null,
        dueDate: null,
        progress: 0,
        watcherIds: expected.watcherIds,
      },
    },
    selectedEvidenceIds: rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id),
    startedAt: timestamp,
    completedAt: timestamp,
  }, { userId: "live-scoring-contract-check" });
  const result = await scoreAttemptRecordWithGemini(attempt, {
    apiKey: process.env.GEMINI_API_KEY,
    modelId: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  });
  console.log(JSON.stringify({
    scenarioId,
    status: result.status,
    totalScore: result.totalScore,
    verdict: result.verdict,
    overallAssessment: result.overallAssessment,
    dimensions: result.dimensions,
    improvementItems: result.improvementItems,
    rubricVersion: result.rubricVersion,
    assessedFacts: result.rubricFindings.factAssessments.length,
    forbiddenClaims: result.rubricFindings.forbiddenClaimIds.length,
  }));
}
