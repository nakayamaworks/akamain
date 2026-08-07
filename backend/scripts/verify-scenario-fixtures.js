import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_MODEL,
  getScenarioRubric,
  scoreAttemptRecordWithGemini,
} from "../src/scoring-service.js";
import {
  FIXTURE_VALIDATION_SCHEMA_VERSION,
  createFixtureAttempt,
  evaluateFixtureResult,
  isRetryableScoringError,
  summarizeFixtureResults,
} from "../src/scoring-fixture-validator.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "../..");
const fixtureRegistryPath = path.join(
  projectDirectory,
  "scoring/fixtures/scenario-fixtures.json"
);
const scenarioLibraryPath = path.join(projectDirectory, "scenario-library.js");

function usage() {
  return `Usage:
  npm run verify:scoring-fixtures -- [options]

Options:
  --dry-run                 APIを呼ばず対象件数だけ確認する
  --all-rubrics             現行16件ではなく登録済み27件を対象にする
  --scenario <id>           対象シナリオを限定する（複数指定可）
  --fixture <id>            excellent等の回答種別を限定する（複数指定可）
  --delay-ms <number>       API呼び出し間隔。既定値4000
  --max-retries <number>    一時エラー時の再試行回数。既定値2
  --output <path>           JSONレポートの保存先
  --resume <path>           前回レポートの合格済み項目を再利用する
  --help                    この説明を表示する`;
}

function readValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    allRubrics: false,
    scenarios: [],
    fixtures: [],
    delayMs: 4000,
    maxRetries: 2,
    output: "",
    resume: "",
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--all-rubrics") options.allRubrics = true;
    else if (argument === "--help") options.help = true;
    else if (argument === "--scenario") options.scenarios.push(readValue(argv, index++, argument));
    else if (argument === "--fixture") options.fixtures.push(readValue(argv, index++, argument));
    else if (argument === "--delay-ms") options.delayMs = Number(readValue(argv, index++, argument));
    else if (argument === "--max-retries") options.maxRetries = Number(readValue(argv, index++, argument));
    else if (argument === "--output") options.output = readValue(argv, index++, argument);
    else if (argument === "--resume") options.resume = readValue(argv, index++, argument);
    else throw new Error(`unknown option: ${argument}`);
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative integer");
  }
  if (!Number.isInteger(options.maxRetries) || options.maxRetries < 0 || options.maxRetries > 10) {
    throw new Error("--max-retries must be an integer from 0 to 10");
  }
  return options;
}

function loadActiveScenarioIds() {
  const source = fs.readFileSync(scenarioLibraryPath, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: scenarioLibraryPath });
  return context.window.TYPING_WORKBENCH_SCENARIOS.map((scenario) => scenario.scenarioId);
}

function defaultReportPath() {
  const timestamp = new Date().toISOString().replaceAll(":", "-").replace(".", "-");
  return path.join(scriptDirectory, "../reports", `scoring-fixtures-${timestamp}.json`);
}

function caseKey(scenarioId, fixtureId) {
  return `${scenarioId}::${fixtureId}`;
}

function selectCases(registry, options) {
  const registeredIds = Object.keys(registry.scenarios);
  const defaultIds = options.allRubrics ? registeredIds : loadActiveScenarioIds();
  const scenarioIds = options.scenarios.length ? options.scenarios : defaultIds;
  const unknownIds = scenarioIds.filter((scenarioId) => !registry.scenarios[scenarioId]);
  if (unknownIds.length) {
    throw new Error(`unknown scenario IDs: ${unknownIds.join(", ")}`);
  }
  const cases = [];
  scenarioIds.forEach((scenarioId) => {
    const fixtureSet = registry.scenarios[scenarioId];
    fixtureSet.fixtures
      .filter((fixture) => !options.fixtures.length || options.fixtures.includes(fixture.fixtureId))
      .forEach((fixture) => cases.push({ fixtureSet, fixture }));
  });
  if (options.fixtures.length) {
    const foundFixtureIds = new Set(cases.map(({ fixture }) => fixture.fixtureId));
    const unknownFixtures = options.fixtures.filter((fixtureId) => !foundFixtureIds.has(fixtureId));
    if (unknownFixtures.length) {
      throw new Error(`unknown fixture IDs: ${unknownFixtures.join(", ")}`);
    }
  }
  return cases;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function scoreWithRetry(attempt, options) {
  let retryCount = 0;
  while (true) {
    try {
      const scoringResult = await scoreAttemptRecordWithGemini(attempt, {
        apiKey: process.env.GEMINI_API_KEY,
        modelId: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      });
      return { scoringResult, requestAttempts: retryCount + 1 };
    } catch (error) {
      if (!isRetryableScoringError(error) || retryCount >= options.maxRetries) {
        error.requestAttempts = retryCount + 1;
        throw error;
      }
      retryCount += 1;
      const retryDelay = Math.max(options.delayMs, 1000) * (2 ** retryCount);
      const detail = error.cause?.message ? ` (${error.cause.message})` : "";
      console.warn(
        `  一時エラー ${error.code || "UNKNOWN"}${detail}。${retryDelay}ms後に再試行します。`
      );
      await wait(retryDelay);
    }
  }
}

function writeReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function loadResumeResults(resumePath) {
  if (!resumePath) return [];
  const report = JSON.parse(fs.readFileSync(path.resolve(resumePath), "utf8"));
  if (report.schemaVersion !== FIXTURE_VALIDATION_SCHEMA_VERSION) {
    throw new Error("resume report schema version is not supported");
  }
  return Array.isArray(report.results) ? report.results : [];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const registry = JSON.parse(fs.readFileSync(fixtureRegistryPath, "utf8"));
  const cases = selectCases(registry, options);
  const scenarioCount = new Set(cases.map(({ fixtureSet }) => fixtureSet.scenarioId)).size;
  console.log(`対象: ${scenarioCount}シナリオ / ${cases.length}回答`);
  if (options.dryRun) {
    console.log(cases.map(({ fixtureSet, fixture }) =>
      `${fixtureSet.scenarioId}/${fixture.fixtureId}`).join("\n"));
    return;
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required. backend/.envへ設定してください。");
  }

  const reportPath = path.resolve(options.output || options.resume || defaultReportPath());
  const resumedResults = loadResumeResults(options.resume);
  const reusableResults = new Map(
    resumedResults
      .filter((result) => result.status === "passed")
      .map((result) => [caseKey(result.scenarioId, result.fixtureId), result])
  );
  const report = {
    schemaVersion: FIXTURE_VALIDATION_SCHEMA_VERSION,
    startedAt: new Date().toISOString(),
    completedAt: null,
    modelId: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    selection: {
      activeScenariosOnly: !options.allRubrics && options.scenarios.length === 0,
      scenarioCount,
      fixtureCount: cases.length,
      delayMs: options.delayMs,
      maxRetries: options.maxRetries,
    },
    summary: { total: 0, passed: 0, failed: 0, errors: 0, passRate: 0 },
    results: [],
  };

  for (let index = 0; index < cases.length; index += 1) {
    const { fixtureSet, fixture } = cases[index];
    const key = caseKey(fixtureSet.scenarioId, fixture.fixtureId);
    const resumed = reusableResults.get(key);
    if (resumed) {
      console.log(`[${index + 1}/${cases.length}] ${key} PASS（再利用）`);
      report.results.push({ ...resumed, resumed: true });
      continue;
    }
    const rubric = getScenarioRubric(fixtureSet.scenarioId);
    const attempt = createFixtureAttempt({ fixtureSet, fixture, rubric });
    const startedAtMs = Date.now();
    console.log(`[${index + 1}/${cases.length}] ${key}`);
    try {
      const { scoringResult, requestAttempts } = await scoreWithRetry(attempt, options);
      const evaluation = evaluateFixtureResult({ fixtureSet, fixture, scoringResult });
      const status = evaluation.passed ? "passed" : "failed";
      console.log(`  ${status.toUpperCase()} ${scoringResult.totalScore}点`);
      report.results.push({
        scenarioId: fixtureSet.scenarioId,
        fixtureId: fixture.fixtureId,
        label: fixture.label,
        status,
        resumed: false,
        durationMs: Date.now() - startedAtMs,
        requestAttempts,
        expected: fixture.expected,
        evaluation,
        scoringResult,
      });
    } catch (error) {
      const detail = error.cause?.message ? ` (${error.cause.message})` : "";
      console.error(`  ERROR ${error.code || "UNKNOWN"}: ${error.message}${detail}`);
      report.results.push({
        scenarioId: fixtureSet.scenarioId,
        fixtureId: fixture.fixtureId,
        label: fixture.label,
        status: "error",
        resumed: false,
        durationMs: Date.now() - startedAtMs,
        requestAttempts: error.requestAttempts || 1,
        expected: fixture.expected,
        error: { code: error.code || "UNKNOWN", message: error.message },
      });
    }
    report.summary = summarizeFixtureResults(report.results);
    writeReport(reportPath, report);
    if (index < cases.length - 1 && options.delayMs > 0) {
      await wait(options.delayMs);
    }
  }

  report.completedAt = new Date().toISOString();
  report.summary = summarizeFixtureResults(report.results);
  writeReport(reportPath, report);
  console.log(`\n完了: ${report.summary.passed}/${report.summary.total} PASS (${report.summary.passRate}%)`);
  console.log(`レポート: ${reportPath}`);
  if (report.summary.failed > 0 || report.summary.errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
