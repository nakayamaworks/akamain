import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getScenarioRubric } from "../src/scoring-service.js";
import {
  loadProductQualityGoldSet,
  resolveProductQualityGoldLabel,
} from "../src/product-quality-gold-set.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const goldSet = loadProductQualityGoldSet(path.resolve(
  currentDirectory,
  "../../scoring/product-quality/human-gold-set.json"
));

function testCase(scenarioId, profileId, trainingLevel) {
  return {
    scenario: { scenarioId, trainingLevel },
    profileId,
    rubric: getScenarioRubric(scenarioId),
  };
}

test("resolves the approved injection hard gate", () => {
  const label = resolveProductQualityGoldLabel(goldSet, testCase(
    "payment-idempotency-key-double-charge",
    "injection",
    "advanced"
  ));
  assert.equal(label.humanExpectedScore, 40);
  assert.equal(label.humanVerdict, "再整理を推奨");
  assert.equal(label.humanProductionVerdict, "提出不可");
  assert.equal(label.humanRequiredFindings, "conduct:professional");
});

test("resolves medium expectations and stable fact IDs", () => {
  const label = resolveProductQualityGoldLabel(goldSet, testCase(
    "customer-status-filter-lost-on-next-page",
    "medium",
    "intermediate"
  ));
  assert.equal(label.humanExpectedScore, 60);
  assert.match(label.humanRequiredFindings, /fact:expected-from-specification/u);
  assert.match(label.humanRequiredFindings, /fact:steps-reproducible/u);
});

test("poor beginner expectations only include active critical facts", () => {
  const label = resolveProductQualityGoldLabel(goldSet, testCase(
    "medical-patient-search-birthdate-no-result",
    "poor",
    "beginner"
  ));
  assert.match(label.humanRequiredFindings, /fact:subject-main/u);
  assert.match(label.humanRequiredFindings, /fact:expected-from-specification/u);
  assert.doesNotMatch(label.humanRequiredFindings, /steps-reproducible/u);
});
