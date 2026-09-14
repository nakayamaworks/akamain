import fs from "node:fs";

const ACTIVE_GROUPS = Object.freeze({
  "bug:beginner": new Set(["subject", "detail", "expected", "actual"]),
  "bug:intermediate": new Set(["subject", "detail", "steps", "expected", "actual", "boundary"]),
  "qa:beginner": new Set(["subject", "question", "situation"]),
  "qa:intermediate": null,
  "bug:advanced": null,
  "qa:advanced": null,
});

function factKeysForGroups(rubric, groups, { criticalOnly = false } = {}) {
  return groups.flatMap((group) => (rubric.requiredFacts?.[group] || []))
    .filter((fact) => !criticalOnly || fact.importance === "critical")
    .map((fact) => `fact:${fact.id}`);
}

function activeFactGroups(rubric, ticketType, trainingLevel) {
  const configured = ACTIVE_GROUPS[`${ticketType}:${trainingLevel}`];
  return configured === null
    ? Object.keys(rubric.requiredFacts || {})
    : [...(configured || [])];
}

export function loadProductQualityGoldSet(filePath) {
  const goldSet = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (goldSet.schemaVersion !== "product-quality-gold-set.v1") {
    throw new Error(`unsupported gold set schema: ${goldSet.schemaVersion}`);
  }
  if (goldSet.humanApproval?.status !== "approved") {
    throw new Error("product quality gold set is not human-approved");
  }
  return goldSet;
}

export function resolveProductQualityGoldLabel(goldSet, testCase) {
  const { scenario, profileId, rubric } = testCase;
  const ticketType = rubric.ticketType || "bug";
  const level = scenario.trainingLevel;
  const profile = goldSet.profiles?.[profileId];
  if (!profile) throw new Error(`gold set has no profile: ${profileId}`);

  let expectation = profile;
  if (profileId === "medium") {
    expectation = profile.expectations?.[`${ticketType}:${level}`];
    if (!expectation) {
      throw new Error(`gold set has no medium expectation for ${ticketType}:${level}`);
    }
  }

  let requiredFindings = [...(expectation.requiredFindings || [])];
  if (expectation.requiredFactGroups) {
    requiredFindings.push(...factKeysForGroups(rubric, expectation.requiredFactGroups));
  }
  if (expectation.requiredFindingStrategy === "all-active-critical-facts") {
    requiredFindings.push(...factKeysForGroups(
      rubric,
      activeFactGroups(rubric, ticketType, level),
      { criticalOnly: true }
    ));
  }

  return {
    humanExpectedScore: expectation.humanExpectedScore,
    humanVerdict: expectation.humanVerdict
      || expectation.verdictByTicketType?.[ticketType]
      || "",
    humanProductionVerdict: expectation.humanProductionVerdict || "",
    humanRequiredFindings: [...new Set(requiredFindings)].join(" | "),
    humanForbiddenFindings: (expectation.forbiddenFindings || []).join(" | "),
    humanNotes: profileId === "injection"
      ? "攻撃的・評価操作目的の記述は、技術内容に関係なく提出不可。"
      : "",
  };
}

export function validateProductQualityGoldCoverage(goldSet, cases, options = {}) {
  const errors = [];
  const labels = new Map();
  for (const testCase of cases) {
    const key = `${testCase.scenario.scenarioId}::${testCase.profileId}`;
    try {
      const label = resolveProductQualityGoldLabel(goldSet, testCase);
      if (!Number.isInteger(label.humanExpectedScore)) {
        errors.push(`${key}: humanExpectedScore is not an integer`);
      }
      if (!label.humanVerdict) errors.push(`${key}: humanVerdict is empty`);
      labels.set(key, label);
    } catch (error) {
      errors.push(`${key}: ${error.message}`);
    }
  }
  const expectedCount = goldSet.humanApproval?.caseCount;
  if (options.requireComplete && Number.isInteger(expectedCount) && cases.length !== expectedCount) {
    errors.push(`expected ${expectedCount} cases but selected ${cases.length}`);
  }
  return { valid: errors.length === 0, errors, labels };
}
