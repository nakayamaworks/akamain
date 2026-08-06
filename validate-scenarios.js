const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("scenario-library.js", "utf8");
const briefingSource = fs.readFileSync("scenario-briefing-library.js", "utf8");
const evidenceSource = fs.readFileSync("evidence-library.js", "utf8");
const mainSource = fs.readFileSync("main.js", "utf8");
const indexSource = fs.readFileSync("index.html", "utf8");
const stylesSource = fs.readFileSync("styles.css", "utf8");
const scoringPreviewSource = fs.readFileSync("scoring-preview.js", "utf8");
const runtimeConfigSource = fs.readFileSync("runtime-config.js", "utf8");
const authClientSource = fs.readFileSync("auth-client.js", "utf8");
const scoringApiSource = fs.readFileSync("scoring-api.js", "utf8");
const profileApiSource = fs.readFileSync("profile-api.js", "utf8");
const backendScoringSource = fs.readFileSync(
  "backend/src/scoring-service.js",
  "utf8"
);
const backendServerSource = fs.readFileSync("backend/src/server.js", "utf8");
const attemptSchema = JSON.parse(
  fs.readFileSync("scoring/schemas/attempt-record.schema.json", "utf8")
);
const scoringResultSchema = JSON.parse(
  fs.readFileSync("scoring/schemas/scoring-result.schema.json", "utf8")
);
const pilotRubric = JSON.parse(
  fs.readFileSync(
    "scoring/rubrics/customer-save-multiple-clicks-duplicate.json",
    "utf8"
  )
);
const pilotFixtures = JSON.parse(
  fs.readFileSync(
    "scoring/fixtures/customer-save-multiple-clicks-duplicate.json",
    "utf8"
  )
);
const scoringRubricRegistryFile = JSON.parse(
  fs.readFileSync("scoring/rubrics/scenario-rubrics.json", "utf8")
);
const scoringFixtureRegistryFile = JSON.parse(
  fs.readFileSync("scoring/fixtures/scenario-fixtures.json", "utf8")
);
const context = { window: {} };
vm.runInNewContext(source, context, { filename: "scenario-library.js" });
const briefingContext = { window: {} };
vm.runInNewContext(briefingSource, briefingContext, {
  filename: "scenario-briefing-library.js",
});
const scoringPreviewContext = { window: {} };
vm.runInNewContext(scoringPreviewSource, scoringPreviewContext, {
  filename: "scoring-preview.js",
});

const scenarios = context.window.TYPING_WORKBENCH_SCENARIOS;
const projectIds = [
  "attendance",
  "salon",
  "ec",
  "inventory",
  "mobile",
  "automotive",
  "payment",
  "medical",
];
const difficulties = new Set(["intermediate", "advanced"]);
const requiredFields = [
  "scenarioId",
  "projectId",
  "difficulty",
  "subject",
  "subjectAnswer",
  "detail",
  "detailAnswer",
  "expected",
  "expectedAnswer",
  "reproducibility",
];
const errors = [];

const applicationHeaderSource = indexSource.slice(
  indexSource.indexOf('<header class="rm-topbar">'),
  indexSource.indexOf("</header>")
);
const removedNavigationLabels = [
  "プロジェクト",
  "管理",
  "ヘルプ",
  "概要",
  "活動",
  "ロードマップ",
  "チケット",
  "作業時間",
  "ガントチャート",
  "カレンダー",
  "ニュース",
  "文書",
  "Wiki",
  "フォーラム",
  "ファイル",
].filter((label) => applicationHeaderSource.includes(`>${label}</button>`));
if (
  removedNavigationLabels.length > 0 ||
  applicationHeaderSource.includes('aria-label="プロジェクトナビゲーション"') ||
  applicationHeaderSource.includes('class="rm-search-control"') ||
  applicationHeaderSource.includes('id="rmPlusButton"') ||
  applicationHeaderSource.includes('aria-disabled="true"')
) {
  errors.push(
    `application header must not expose unavailable navigation or search controls: ${removedNavigationLabels.join(", ")}`
  );
}
if (
  !applicationHeaderSource.includes('id="homeNavButton"') ||
  !applicationHeaderSource.includes('id="myPageNavButton"') ||
  !applicationHeaderSource.includes('id="rmProjectSwitcher"') ||
  !applicationHeaderSource.includes('aria-label="マイページナビゲーション"')
) {
  errors.push("application header must keep only working global, project, and my-page navigation");
}

if (
  indexSource.indexOf("runtime-config.js") > indexSource.indexOf("auth-client.js") ||
  indexSource.indexOf("auth-client.js") > indexSource.indexOf("scoring-api.js") ||
  indexSource.indexOf("scoring-api.js") > indexSource.indexOf("main.js")
) {
  errors.push("phase 3 runtime config, auth, and scoring clients must load before main.js");
}

if (
  indexSource.indexOf("evidence-library.js") < indexSource.indexOf("scenario-library.js") ||
  indexSource.indexOf("evidence-library.js") > indexSource.indexOf("main.js")
) {
  errors.push("evidence library must load after scenarios and before main.js");
}
if (
  !indexSource.includes('src="./scenario-briefing-library.js') ||
  indexSource.indexOf("scenario-briefing-library.js") < indexSource.indexOf("scenario-library.js") ||
  indexSource.indexOf("scenario-briefing-library.js") > indexSource.indexOf("main.js")
) {
  errors.push("scenario briefings must load after scenario definitions and before main.js");
}
if (
  /期待する動作：|確認結果：/.test(mainSource) ||
  /現場から届いた情報|>判断材料</.test(indexSource) ||
  /開発側からのコメント|一次確認担当|この件を知っている人|できますという対応/.test(mainSource) ||
  /一次報告（チャット抜粋）|追加連絡（確認範囲・懸念点）|追加連絡（復旧・暫定対応）|関連性が確認できていない情報/.test(mainSource) ||
  /周辺情報・社内メモ/.test(indexSource)
) {
  errors.push("scenario view must remain an unstructured field report, not a prewritten ticket outline");
}
if (/text:\s*"■環境"/.test(mainSource)) {
  errors.push("environment information must be selected in ticket fields, not typed in the description");
}
if (/操作後は「\$\{observedText\}/.test(mainSource)) {
  errors.push("scenario briefings must not be generated by copying the reference answer");
}
if (/仕様では/.test(`${mainSource}\n${source}`)) {
  errors.push("observed details must not claim a specification without a document reference");
}
if (!/id="statusSelect"\s+disabled/.test(indexSource)) {
  errors.push("new-ticket status must remain fixed and disabled");
}
if (indexSource.indexOf('id="severitySelect"') > indexSource.indexOf('id="statusSelect"')) {
  errors.push("severity must appear above status in the ticket form");
}
[
  "evidenceAttachmentSection",
  "openEvidencePickerButton",
  "evidencePickerOverlay",
  "evidenceFileList",
  "evidencePreviewMetadata",
  "resultEvidenceScore",
  "resultEvidenceReview",
].forEach((elementId) => {
  if (!indexSource.includes(`id="${elementId}"`)) {
    errors.push(`evidence prototype is missing #${elementId}`);
  }
});
[
  "startButton",
  "scenarioIntroStartButton",
  "scenarioIntroPracticeButton",
  "practiceWritingCompleteButton",
  "practiceWritingTransition",
  "practiceWritingStatus",
  "scenarioPanelMode",
  "sameScenarioPracticeButton",
  "nextScenarioButton",
  "practiceResultSection",
  "practiceResultAnswer",
  "practiceReferenceAnswer",
  "practiceScoringPreviewSection",
  "practiceScoringMessage",
  "practiceScoringRetryButton",
  "practiceScoringResult",
  "practiceScoringPreviewTotal",
  "practiceScoringVerdict",
  "practiceScoringOverallAssessment",
  "practiceScoringPreviewStrengths",
  "practiceScoringReaderQuestions",
  "practiceScoringAmbiguityRisks",
  "practiceScoringInvestigationAdvice",
  "practiceScoringRewriteSuggestions",
  "practiceScoringRadarValue",
  "practiceRadarFactual",
  "practiceRadarCoverage",
  "practiceRadarReproducibility",
  "practiceRadarSeparation",
  "practiceRadarClarity",
  "practiceRadarInvestigation",
].forEach((elementId) => {
  if (!indexSource.includes(`id="${elementId}"`)) {
    errors.push(`authoring mode prototype is missing #${elementId}`);
  }
});
const runtimeConfigKeys = [
  ...runtimeConfigSource.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*):/gm),
].map((match) => match[1]);
if (
  runtimeConfigKeys.join(",") !== "apiBaseUrl,googleClientId" ||
  /GEMINI_API_KEY|geminiApiKey|clientSecret/i.test(runtimeConfigSource)
) {
  errors.push("browser runtime config must contain only public endpoint and Google client settings");
}
if (
  !authClientSource.includes("getIdToken") ||
  !scoringApiSource.includes("Authorization: `Bearer ${idToken}`") ||
  !backendServerSource.includes("verifyIdToken") ||
  !backendScoringSource.includes('"x-goog-api-key": apiKey') ||
  !backendScoringSource.includes("calculateWeightedTotal")
) {
  errors.push("phase 3 scoring must verify Google identity and keep Gemini scoring server-side");
}
if (
  !indexSource.includes('src="./profile-api.js') ||
  !profileApiSource.includes("Authorization: `Bearer ${idToken}`") ||
  !profileApiSource.includes('request("/api/me")') ||
  !profileApiSource.includes('request("/api/progress")') ||
  !profileApiSource.includes("/api/history?") ||
  !profileApiSource.includes("/api/leaderboard?") ||
  !profileApiSource.includes('request("/api/me/ranking-profile"')
) {
  errors.push("my page must use authenticated profile, progress, history, and leaderboard APIs");
}
if (
  indexSource.indexOf('id="practiceWritingTransition"') <
    indexSource.indexOf('id="reportEditor"') ||
  indexSource.indexOf('id="practiceWritingTransition"') >
    indexSource.indexOf('class="ticket-form-details"') ||
  !indexSource.includes("チケット情報の設定へ")
) {
  errors.push("practice writing transition must sit directly after the description");
}
if (
  indexSource.includes("文章を入力できたら次へ") ||
  indexSource.includes("次に障害レベル、優先度などのチケット情報を設定します。")
) {
  errors.push("practice writing transition must show only the action button");
}
if (!mainSource.includes("未入力の項目があります：")) {
  errors.push("practice writing transition must keep missing-item validation");
}
const practiceRenderingSource = mainSource.slice(
  mainSource.indexOf("function renderPracticeReport"),
  mainSource.indexOf("function renderReport")
);
if (/practiceWritingComplete\s*\?\s*"disabled"/.test(practiceRenderingSource)) {
  errors.push("practice writing fields must remain editable after moving to ticket settings");
}
if (
  indexSource.includes('id="authoringModeSwitch"') ||
  indexSource.includes("training-mode-panel")
) {
  errors.push("the separate authoring mode panel must stay removed");
}
if (!indexSource.includes('<button id="startButton" class="primary-button" type="button">チケット作成</button>')) {
  errors.push("the ticket list must provide one neutral ticket creation button");
}
if (indexSource.includes('id="practiceStartButton"')) {
  errors.push("the ticket list must not ask users to choose an authoring mode");
}
if ((indexSource.match(/見本入力を開始/g) || []).length !== 1) {
  errors.push("reference mode must be selected only on the scenario intro");
}
if ((indexSource.match(/実践起票を開始/g) || []).length !== 1) {
  errors.push("practice mode must be selected only on the scenario intro");
}
const scenarioActionStyles = stylesSource.slice(
  stylesSource.indexOf(".scenario-intro-actions {"),
  stylesSource.indexOf(".scenario-mode-badge")
);
if (
  !scenarioActionStyles.includes("position: fixed") ||
  !scenarioActionStyles.includes("bottom: 0") ||
  !scenarioActionStyles.includes("#scenarioIntroBackButton")
) {
  errors.push("scenario actions must remain in a fixed footer with the back action separated");
}

if (
  attemptSchema?.properties?.schemaVersion?.const !== "attempt.v3" ||
  !attemptSchema?.required?.includes("attemptId") ||
  !attemptSchema?.required?.includes("ticketId") ||
  !attemptSchema?.required?.includes("revisionNumber") ||
  !attemptSchema?.required?.includes("parentAttemptId") ||
  !attemptSchema?.required?.includes("userId") ||
  !attemptSchema?.required?.includes("scenarioId") ||
  attemptSchema?.properties?.authoringMode?.enum?.length !== 2 ||
  !attemptSchema?.properties?.answer?.required?.includes("ticketFields")
) {
  errors.push("attempt record schema must remain storage-provider independent and versioned");
}
if (
  scoringResultSchema?.properties?.schemaVersion?.const !== "scoring-result.v3" ||
  !scoringResultSchema?.required?.includes("attemptId") ||
  !scoringResultSchema?.required?.includes("rubricVersion") ||
  !scoringResultSchema?.required?.includes("promptVersion") ||
  !scoringResultSchema?.required?.includes("modelId") ||
  !scoringResultSchema?.required?.includes("rubricFindings")
) {
  errors.push("scoring result schema must preserve grading provenance");
}

const rubricDimensionIds = new Set(
  pilotRubric.dimensions?.map((dimension) => dimension.id) || []
);
const rubricWeightTotal = (pilotRubric.dimensions || []).reduce(
  (sum, dimension) => sum + dimension.weight,
  0
);
const requiredRubricDimensionIds = new Set([
  "factualGrounding",
  "informationCoverage",
  "reproducibility",
  "expectedActualSeparation",
  "interpretiveClarity",
  "investigationReadiness",
]);
if (
  pilotRubric.scenarioId !== "customer-save-multiple-clicks-duplicate" ||
  rubricWeightTotal !== 100 ||
  rubricDimensionIds.size !== requiredRubricDimensionIds.size ||
  [...requiredRubricDimensionIds].some((dimensionId) => !rubricDimensionIds.has(dimensionId))
) {
  errors.push("pilot scoring rubric must define the six weighted review dimensions totaling 100");
}
const rubricFacts = Object.values(pilotRubric.requiredFacts || {}).flat();
const rubricFactIds = new Set(rubricFacts.map((fact) => fact.id));
const forbiddenClaimIds = new Set(
  (pilotRubric.forbiddenClaims || []).map((claim) => claim.id)
);
if (
  rubricFactIds.size !== rubricFacts.length ||
  forbiddenClaimIds.size !== (pilotRubric.forbiddenClaims || []).length ||
  rubricFacts.length < 10
) {
  errors.push("pilot scoring rubric must provide unique required fact and forbidden claim IDs");
}
if (
  pilotFixtures.scenarioId !== pilotRubric.scenarioId ||
  pilotFixtures.rubricVersion !== pilotRubric.rubricVersion ||
  pilotFixtures.fixtures?.length !== 5
) {
  errors.push("pilot scoring fixtures must contain five answers for the active rubric version");
} else {
  const fixtureIds = new Set();
  pilotFixtures.fixtures.forEach((fixture) => {
    fixtureIds.add(fixture.fixtureId);
    if (
      !fixture.answer?.subject ||
      typeof fixture.answer?.sections !== "object" ||
      fixture.expected?.scoreMin < 0 ||
      fixture.expected?.scoreMax > 100 ||
      fixture.expected?.scoreMin > fixture.expected?.scoreMax
    ) {
      errors.push(`invalid pilot scoring fixture: ${fixture.fixtureId}`);
    }
    (fixture.expected?.missingFactIds || []).forEach((factId) => {
      if (!rubricFactIds.has(factId)) {
        errors.push(`fixture ${fixture.fixtureId}: unknown missing fact ID ${factId}`);
      }
    });
    (fixture.expected?.forbiddenClaimIds || []).forEach((claimId) => {
      if (!forbiddenClaimIds.has(claimId)) {
        errors.push(`fixture ${fixture.fixtureId}: unknown forbidden claim ID ${claimId}`);
      }
    });
  });
  if (fixtureIds.size !== pilotFixtures.fixtures.length) {
    errors.push("pilot scoring fixture IDs must be unique");
  }
}

const scoringPreview =
  scoringPreviewContext.window.TYPING_WORKBENCH_SCORING_PREVIEWS?.[
    pilotRubric.scenarioId
  ];
const scoringPreviewDimensionScore = (pilotRubric.dimensions || []).reduce(
  (sum, dimension) =>
    sum + (scoringPreview?.dimensions?.[dimension.id] ?? 0) * dimension.weight / 100,
  0
);
if (
  scoringPreview?.schemaVersion !== "scoring-result.v3" ||
  scoringPreview?.rubricVersion !== "customer-save-multiple-clicks-duplicate.v3" ||
  scoringPreview?.modelId !== "mock-structured-result" ||
  scoringPreview?.totalScore !== Math.round(scoringPreviewDimensionScore)
) {
  errors.push("phase 2 scoring preview must conform to the rubric and structured result contract");
}
const scenarioViewStyles = stylesSource.slice(
  stylesSource.indexOf(".scenario-intro-view {"),
  stylesSource.indexOf(".scenario-intro-card {")
);
if (!/padding-bottom:\s*(?!0)/.test(scenarioViewStyles)) {
  errors.push("scenario content must reserve space for the fixed action footer");
}
[
  ['on(elements.startButton, "click", handleStartButton)', 'ticket creation handler'],
  [
    'on(elements.scenarioIntroStartButton, "click", handleScenarioIntroStart)',
    'scenario reference start handler',
  ],
  [
    'on(elements.scenarioIntroPracticeButton, "click", handleScenarioIntroPractice)',
    'scenario practice start handler',
  ],
  [
    'on(elements.nextScenarioButton, "click", handleNextScenarioButton)',
    'next unattempted scenario handler',
  ],
  [
    'on(elements.myPageProgressProjects, "click", handleMyPageProgressClick)',
    'my page retry handler',
  ],
].forEach(([binding, label]) => {
  if (!mainSource.includes(binding)) {
    errors.push(`authoring mode prototype is missing the ${label}`);
  }
});
if (
  indexSource.includes('id="scenarioIntroDifficulty"') ||
  indexSource.includes('id="scenarioDifficulty"')
) {
  errors.push("domain difficulty badges must not be mixed with authoring modes");
}
if (
  indexSource.indexOf('id="evidenceAttachmentSection"') >
    indexSource.indexOf('id="ticketWatchersList"') ||
  indexSource.indexOf('id="ticketWatchersList"') >
    indexSource.indexOf('id="createButton"')
) {
  errors.push("evidence attachment section must remain above watchers, with watchers last before create actions");
}
if (
  indexSource.includes("選択したファイルはチケット作成時に添付されます") ||
  indexSource.includes('class="result-chart-card"')
) {
  errors.push("redundant attachment guidance and detailed typing chart must stay removed");
}
if (!indexSource.includes('id="versionSelect"') || !indexSource.includes('id="environmentSelect"')) {
  errors.push("version and environment selection fields are required");
}
const setupFieldsSource = mainSource.slice(
  mainSource.indexOf("function getSetupFields"),
  mainSource.indexOf("function clearSetupHighlight")
);
if (setupFieldsSource.includes("statusSelect")) {
  errors.push("fixed new-ticket status must not be part of the selection flow");
}
if (!setupFieldsSource.includes("versionSelect") || !setupFieldsSource.includes("environmentSelect")) {
  errors.push("version and environment must be part of the selection flow");
}

const environmentConfigSource = mainSource
  .slice(
    mainSource.indexOf("const projectEnvironments = {"),
    mainSource.indexOf("const projectReportPreconditions = {")
  )
  .replace("const projectEnvironments", "var projectEnvironments")
  .replace("const projectEnvironmentChoices", "var projectEnvironmentChoices");
const environmentConfigContext = {};
vm.runInNewContext(environmentConfigSource, environmentConfigContext, {
  filename: "main.js#projectEnvironmentChoices",
});

projectIds.forEach((projectId) => {
  const environment = environmentConfigContext.projectEnvironments?.[projectId] || [];
  const choices = environmentConfigContext.projectEnvironmentChoices?.[projectId];
  const version = environment[0]?.text;
  const configuration = environment.slice(1).map((entry) => entry.text).join(" / ");
  if (!version || !configuration) {
    errors.push(`${projectId}: version and environment configuration are required`);
  }
  if (!choices?.versions?.includes(version)) {
    errors.push(`${projectId}: expected version is missing from choices`);
  }
  if (!choices?.configurations?.includes(configuration)) {
    errors.push(`${projectId}: expected environment configuration is missing from choices`);
  }
  if (choices?.versions?.length < 3 || choices?.configurations?.length < 3) {
    errors.push(`${projectId}: at least three version and environment choices are required`);
  }
});

const customerChoices = environmentConfigContext.projectEnvironmentChoices?.customer;
if (customerChoices?.versions?.length < 3 || customerChoices?.configurations?.length < 3) {
  errors.push("customer: at least three version and environment choices are required");
}

if (!Array.isArray(scenarios)) {
  errors.push("TYPING_WORKBENCH_SCENARIOS must be an array");
} else {
  scenarios.forEach((scenario, index) => {
    requiredFields.forEach((field) => {
      if (typeof scenario[field] !== "string" || scenario[field].trim() === "") {
        errors.push(`scenario ${index + 1}: ${field} is required`);
      }
    });

    if (!projectIds.includes(scenario.projectId)) {
      errors.push(`scenario ${index + 1}: unknown projectId "${scenario.projectId}"`);
    }
    if (!difficulties.has(scenario.difficulty)) {
      errors.push(`scenario ${index + 1}: invalid difficulty "${scenario.difficulty}"`);
    }
    if (!/^\d+\/\d+$/.test(scenario.reproducibility)) {
      errors.push(`scenario ${index + 1}: invalid reproducibility "${scenario.reproducibility}"`);
    }
    ["subjectAnswer", "detailAnswer", "expectedAnswer"].forEach((field) => {
      if (!/^[a-z0-9 .,:/%-]+$/.test(scenario[field])) {
        errors.push(`scenario ${index + 1}: ${field} contains unsupported characters`);
      }
    });
  });

  projectIds.forEach((projectId) => {
    const projectScenarios = scenarios.filter((scenario) => scenario.projectId === projectId);
    difficulties.forEach((difficulty) => {
      const count = projectScenarios.filter((scenario) => scenario.difficulty === difficulty).length;
      if (count !== 1) {
        errors.push(`${projectId}: expected one ${difficulty} scenario, found ${count}`);
      }
    });
  });
}

const initialSubjects = [...mainSource.matchAll(/subject:\s*\{\s*text:\s*"([^"]+)"/g)].map((match) => match[1]);
const generatedSubjects = [...mainSource.matchAll(/createProjectScenario\(\s*"[^"]+",\s*"([^"]+)"/g)].map(
  (match) => match[1]
);
const generatedScenarioRefs = [
  ...mainSource.matchAll(/createProjectScenario\(\s*"([^"]+)",\s*"([^"]+)"/g),
].map((match) => ({ projectId: match[1], subject: match[2] }));
const generatedDetails = [
  ...mainSource.matchAll(
    /createProjectScenario\(\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*"([^"]+)"/g
  ),
].map((match) => match[1]);
generatedDetails.forEach((detail, index) => {
});

const manualDetailTexts = [
  ...mainSource.matchAll(/text:\s*"■詳細"([\s\S]*?)text:\s*"■前提条件"/g),
].flatMap((match) => {
  const detailLines = [...match[1].matchAll(/text:\s*"([^"]+)"/g)].map((lineMatch) => lineMatch[1]);
  return detailLines.length > 0 ? [detailLines[detailLines.length - 1]] : [];
});
if (manualDetailTexts.length !== initialSubjects.length) {
  errors.push("every manual scenario must contain detail text");
}

const allScenarioRefs = [
  ...initialSubjects.map((subject) => ({ projectId: "customer", subject })),
  ...generatedScenarioRefs,
  ...(Array.isArray(scenarios)
    ? scenarios.map((scenario) => ({ projectId: scenario.projectId, subject: scenario.subject }))
    : []),
];
const allSubjects = [
  ...initialSubjects,
  ...generatedSubjects,
  ...(Array.isArray(scenarios) ? scenarios.map((scenario) => scenario.subject) : []),
];
const briefingProfiles = briefingContext.window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS || {};
const allScenarioIds = [
  ...mainSource.matchAll(/scenarioId:\s*"([a-z0-9-]+)"/g),
  ...(Array.isArray(scenarios)
    ? scenarios.map((scenario) => [null, scenario.scenarioId])
    : []),
].map((match) => match[1]);
const uniqueScenarioIds = [...new Set(allScenarioIds)];

uniqueScenarioIds.forEach((scenarioId) => {
  const briefing = briefingProfiles[scenarioId];
  if (!briefing || !Array.isArray(briefing.notes) || briefing.notes.length < 3) {
    errors.push(`${scenarioId}: at least three field-report notes are required`);
    return;
  }
  if (
    typeof briefing.testTarget !== "string"
    || briefing.testTarget.trim().length < 20
    || briefing.testTarget.trim().length > 55
    || !briefing.testTarget.endsWith("テストしています。")
  ) {
    errors.push(`${scenarioId}: test target must be a concise sentence ending with テストしています。`);
  }
  if (briefing.notes.some((note) => typeof note !== "string" || note.trim().length < 30)) {
    errors.push(`${scenarioId}: field-report notes must be concrete sentences of at least 30 characters`);
  }
});

Object.keys(briefingProfiles).forEach((scenarioId) => {
  if (!uniqueScenarioIds.includes(scenarioId)) {
    errors.push(`${scenarioId}: briefing exists for an unknown scenario`);
  }
});
const profileSource = mainSource
  .slice(
    mainSource.indexOf("const scenarioJudgementProfiles = ["),
    mainSource.indexOf("function getScenarioJudgementProfile")
  )
  .replace("const scenarioJudgementProfiles", "var scenarioJudgementProfiles");
const profileContext = {};
vm.runInNewContext(profileSource, profileContext, { filename: "main.js#scenarioJudgementProfiles" });
const judgementProfiles = profileContext.scenarioJudgementProfiles || [];

allSubjects.forEach((subject) => {
  const matches = judgementProfiles.filter((profile) => profile.match.test(subject));
  if (matches.length !== 1) {
    errors.push(`${subject}: expected one judgement profile, found ${matches.length}`);
  }
});

judgementProfiles.forEach((profile, index) => {
  ["severity", "scope", "workaround", "recovery", "risk"].forEach((field) => {
    if (typeof profile[field] !== "string" || profile[field].trim() === "") {
      errors.push(`judgement profile ${index + 1}: ${field} is required`);
    }
  });
  ["scope", "workaround", "recovery", "risk"].forEach((field) => {
    const value = profile[field];
    if (typeof value === "string" && (!value.endsWith("。") || value.length < 25 || value.length > 90)) {
      errors.push(`judgement profile ${index + 1}: ${field} must be a complete, concise Japanese sentence`);
    }
  });
  if (typeof profile.scope === "string" && !profile.scope.startsWith("影響を受けるのは、")) {
    errors.push(`judgement profile ${index + 1}: scope must clearly identify the affected target`);
  }
  if (new Set([profile.scope, profile.workaround, profile.recovery, profile.risk]).size !== 4) {
    errors.push(`judgement profile ${index + 1}: scope, risk, recovery, and workaround must be distinct`);
  }
  if (!new Set(["s1", "s2", "s3", "s4"]).has(profile.severity)) {
    errors.push(`judgement profile ${index + 1}: invalid severity "${profile.severity}"`);
  }
});

const specificationSource = mainSource
  .slice(
    mainSource.indexOf("const scenarioSpecificationReferences = ["),
    mainSource.indexOf("function getScenarioReportProcedure")
  )
  .replace("const scenarioSpecificationReferences", "var scenarioSpecificationReferences");
const specificationContext = {};
vm.runInNewContext(specificationSource, specificationContext, {
  filename: "main.js#scenarioSpecificationReferences",
});
const specificationReferences = specificationContext.scenarioSpecificationReferences || [];

allSubjects.forEach((subject) => {
  const matches = specificationReferences.filter(([pattern]) => pattern.test(subject));
  if (matches.length !== 1) {
    errors.push(`${subject}: expected one specification reference, found ${matches.length}`);
  }
});

specificationReferences.forEach(([, reference], index) => {
  if (!/Rev\.[^「]+「[^」]+」/.test(reference)) {
    errors.push(`specification reference ${index + 1}: document revision and section are required`);
  }
});

const scheduleSource = mainSource.slice(
  mainSource.indexOf("function formatJapaneseDate"),
  mainSource.indexOf("function buildScenarioDecisionContext")
);
const scheduleContext = {
  getLocalDateInputValue: () => "2026-07-27",
  addCalendarDays: (dateValue, days) => {
    const date = new Date(`${dateValue}T12:00:00`);
    date.setDate(date.getDate() + days);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  },
};
vm.runInNewContext(scheduleSource, scheduleContext, { filename: "main.js#getScenarioSchedule" });

let schedulesWithoutDueDate = 0;
allSubjects.forEach((subject) => {
  const schedule = scheduleContext.getScenarioSchedule({ subject: { text: subject } });
  if (!schedule || typeof schedule.text !== "string" || schedule.text.trim() === "") {
    errors.push(`${subject}: schedule text is required`);
  }
  if (!new Set(["low", "normal", "high", "urgent"]).has(schedule?.priority)) {
    errors.push(`${subject}: invalid schedule priority "${schedule?.priority}"`);
  }
  if (schedule?.dueDate === "") {
    schedulesWithoutDueDate += 1;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(schedule?.dueDate || "")) {
    errors.push(`${subject}: invalid schedule due date "${schedule?.dueDate}"`);
  }
});

if (schedulesWithoutDueDate === 0) {
  errors.push("expected at least one scenario where the due date remains unset");
}

const assignmentSource = mainSource
  .slice(
    mainSource.indexOf("const projectCategoryDefaults = {"),
    mainSource.indexOf("function getRawScenarioSection")
  )
  .replace("const projectCategoryDefaults", "var projectCategoryDefaults")
  .replace("const scenarioCategoryRules", "var scenarioCategoryRules")
  .replace("const projectAssignmentDefaults", "var projectAssignmentDefaults");
const assignmentContext = {};
vm.runInNewContext(assignmentSource, assignmentContext, {
  filename: "main.js#getScenarioCategoryAndAssignment",
});
const allowedCategories = new Set(["ui", "workflow", "input", "api"]);

allScenarioRefs.forEach(({ projectId, subject }) => {
  const categoryMatches = (assignmentContext.scenarioCategoryRules[projectId] || [])
    .filter(([pattern]) => pattern.test(subject));
  if (categoryMatches.length !== 1) {
    errors.push(`${subject}: expected one category rule, found ${categoryMatches.length}`);
  }
  const category = assignmentContext.getScenarioCategory({
    projectId,
    subject: { text: subject },
  });
  if (!allowedCategories.has(category)) {
    errors.push(`${subject}: invalid category "${category}"`);
  }

  const assignment = assignmentContext.getScenarioAssignment({
    projectId,
    subject: { text: subject },
  });
  if (!assignment.assignee) {
    errors.push(`${subject}: assignee is required`);
  }
  if (!assignment.watchers.includes(assignment.assignee)) {
    errors.push(`${subject}: watchers must include the assignee`);
  }
  if (assignment.watchers.length < 2) {
    errors.push(`${subject}: watchers must include an assignee and a related member`);
  }
  if (new Set(assignment.watchers).size !== assignment.watchers.length) {
    errors.push(`${subject}: watchers must not contain duplicates`);
  }
});

const procedureSource = mainSource
  .slice(
    mainSource.indexOf("const projectReportPreconditions = {"),
    mainSource.indexOf("function createProjectScenario")
  )
  .replace("const projectReportPreconditions", "var projectReportPreconditions")
  .replace("const scenarioReportOperations", "var scenarioReportOperations")
  .replace("const scenarioReportRemarks", "var scenarioReportRemarks");
const procedureContext = {};
vm.runInNewContext(procedureSource, procedureContext, { filename: "main.js#scenarioReportOperations" });
const procedureOperations = procedureContext.scenarioReportOperations || [];
const reportRemarks = procedureContext.scenarioReportRemarks || [];
const generatedAndExternalSubjects = [
  ...generatedSubjects,
  ...(Array.isArray(scenarios) ? scenarios.map((scenario) => scenario.subject) : []),
];

generatedAndExternalSubjects.forEach((subject) => {
  const matches = procedureOperations.filter(([pattern]) => pattern.test(subject));
  if (matches.length !== 1) {
    errors.push(`${subject}: expected one report procedure, found ${matches.length}`);
  }
  const remarkMatches = reportRemarks.filter(([pattern]) => pattern.test(subject));
  if (remarkMatches.length !== 1) {
    errors.push(`${subject}: expected one report remark, found ${remarkMatches.length}`);
  }
});

procedureOperations.forEach((operationConfig, index) => {
  const configuredSteps = Array.isArray(operationConfig[1])
    ? operationConfig[1]
    : [[operationConfig[1], operationConfig[2]]];
  if (configuredSteps.length < 1 || configuredSteps.length > 4) {
    errors.push(`report procedure ${index + 1}: expected 1 to 4 operation steps`);
  }
  configuredSteps.forEach(([text, answer], stepIndex) => {
    if (typeof text !== "string" || text.trim() === "") {
      errors.push(`report procedure ${index + 1}, step ${stepIndex + 1}: text is required`);
    }
    if (typeof answer !== "string" || answer.trim() === "") {
      errors.push(`report procedure ${index + 1}, step ${stepIndex + 1}: answer is required`);
    }
    if (text.length > 30) {
      errors.push(`report procedure ${index + 1}, step ${stepIndex + 1}: split operation text longer than 30 characters`);
    }
  });
});

reportRemarks.forEach(([, text, answer], index) => {
  if (typeof text !== "string" || text.trim() === "") {
    errors.push(`report remark ${index + 1}: text is required`);
  }
  if (!text.endsWith("ことを確認")) {
    errors.push(`report remark ${index + 1}: text must state that the fact was confirmed`);
  }
  if (typeof answer !== "string" || answer.trim() === "") {
    errors.push(`report remark ${index + 1}: answer is required`);
  }
});

const manualRemarkSectionCount = [...mainSource.matchAll(/text:\s*"■備考"/g)].length - 1;
if (manualRemarkSectionCount !== initialSubjects.length) {
  errors.push(`expected ${initialSubjects.length} manual report remarks, found ${manualRemarkSectionCount}`);
}

const manualRemarkTexts = [
  ...mainSource.matchAll(/trainingRole:\s*"remark",\s*text:\s*"([^"]+)"/g),
].map((match) => match[1]);
if (
  manualRemarkTexts.length !== initialSubjects.length
  || manualRemarkTexts.some((text) => !text.endsWith("ことを確認"))
) {
  errors.push("every manual report remark must state that the fact was confirmed");
}

const sectionsAfterExpected = [
  ...mainSource.matchAll(/text:\s*"■期待結果"[\s\S]*?text:\s*"■([^"]+)"/g),
].map((match) => match[1]);
if (
  sectionsAfterExpected.length !== initialSubjects.length + 1
  || sectionsAfterExpected.some((sectionName) => sectionName !== "実際の動作")
) {
  errors.push("every report must place the actual result immediately after the expected result");
}

const sectionsAfterActual = [
  ...mainSource.matchAll(/text:\s*"■実際の動作"[\s\S]*?text:\s*"■([^"]+)"/g),
].map((match) => match[1]);
if (
  sectionsAfterActual.length !== initialSubjects.length + 1
  || sectionsAfterActual.some((sectionName) => sectionName !== "備考")
) {
  errors.push("every report must place remarks immediately after the actual result");
}

if (/pa-sennto|pa-sento/.test(`${source}\n${mainSource}`)) {
  errors.push("type percentage signs as % instead of spelling out percent in typing answers");
}

const typingScoreSource = mainSource.slice(
  mainSource.indexOf("function getTypingScore"),
  mainSource.indexOf("function calculateResult")
);
const typingScoreContext = {};
vm.runInNewContext(typingScoreSource, typingScoreContext, { filename: "main.js#getTypingScore" });
[
  [0, 0],
  [50, 10],
  [100, 20],
  [195, 20],
].forEach(([accuracy, expectedScore]) => {
  const actualScore = typingScoreContext.getTypingScore(accuracy);
  if (actualScore !== expectedScore) {
    errors.push(`typing accuracy ${accuracy}: expected ${expectedScore} points, found ${actualScore}`);
  }
});

const typingNormalizationSource = mainSource.slice(
  mainSource.indexOf("function normalizeLineText"),
  mainSource.indexOf("function formatElapsedTime")
);
const typingNormalizationContext = {};
vm.runInNewContext(typingNormalizationSource, typingNormalizationContext, {
  filename: "main.js#normalizeTypingText",
});
if (typingNormalizationContext.normalizeTypingText("a、b,c，d") !== "abcd") {
  errors.push("Japanese and ASCII commas must not cause typing errors");
}
if (typingNormalizationContext.normalizeTypingText("1.test") !== "1.test") {
  errors.push("operation step periods must remain part of the typing target");
}
if (typingNormalizationContext.normalizeTypingText("kannri") !== "kannri") {
  errors.push("typing normalization must preserve the user's n/nn spelling");
}
if (!typingNormalizationContext.matchesTypingCandidate("kannri", "kanri", true)) {
  errors.push("n and nn must both be accepted at a syllabic-n position");
}
if (typingNormalizationContext.matchesTypingCandidate("nnaiyounno", "naiyouno", true)) {
  errors.push("nn must not be accepted at ordinary na/ni/nu/ne/no positions");
}
if (typingNormalizationContext.matchesTypingCandidate("kakunnin", "kakunin", true)) {
  errors.push("nn must not be accepted at the ni in kakunin");
}
[
  ["hisshuu", "必須"],
  ["hissyuu", "必須"],
  ["hissyuukoumoku", "必須項目"],
  ["tirisute", "切り捨て"],
  ["guramutannnitaijuu", "グラム単位の体重"],
  ["tekirusareteiru", "記録されている"],
  ["shouhinah115", "商品Aは115円"],
  ["kakunnin", "確認"],
].forEach(([incorrectReading, label]) => {
  if (`${mainSource}\n${source}`.includes(incorrectReading)) {
    errors.push(`${label}: known incorrect reading remains: ${incorrectReading}`);
  }
});
if (
  !indexSource.includes('id="resultRadarValue"') ||
  (indexSource.match(/id="resultRadar(?:Severity|Priority|Fields|People|Report|Typing)"/g) || []).length !== 6
) {
  errors.push("result score breakdown must include a six-axis radar chart");
}
if (!/\.scenario-panel-body\s*\{[^}]*overscroll-behavior:\s*none;/s.test(stylesSource)) {
  errors.push("scenario panel body must suppress scroll chaining and rubber-band overscroll");
}

try {
  const makeClassList = () => ({ add() {}, remove() {}, toggle() {} });
  const makeElement = () => ({
    value: "",
    checked: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    style: {},
    classList: makeClassList(),
    dataset: {},
    addEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    closest() { return null; },
    setAttribute() {},
    focus() {},
    getBoundingClientRect() {
      return { width: 1000, height: 240, top: 0, left: 0, right: 1000 };
    },
  });
  const smokeElements = new Map();
  const smokeDocument = {
    getElementById(id) {
      if (!smokeElements.has(id)) {
        smokeElements.set(id, makeElement());
      }
      return smokeElements.get(id);
    },
    querySelectorAll() { return []; },
  };
  const storage = { getItem() { return null; }, setItem() {} };
  const smokeWindow = {
    localStorage: storage,
    sessionStorage: storage,
    addEventListener() {},
    setInterval() { return 1; },
    clearInterval() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    requestAnimationFrame(callback) { callback(); },
  };
  const smokeContext = {
    window: smokeWindow,
    document: smokeDocument,
    console,
    Date,
    Math,
    Set,
    Map,
    String,
    Number,
    Array,
    Object,
    RegExp,
    JSON,
    Intl,
  };
  vm.createContext(smokeContext);
  vm.runInContext(source, smokeContext, { filename: "scenario-library.js" });
  vm.runInContext(briefingSource, smokeContext, { filename: "scenario-briefing-library.js" });
  vm.runInContext(evidenceSource, smokeContext, { filename: "evidence-library.js" });
  vm.runInContext(scoringPreviewSource, smokeContext, { filename: "scoring-preview.js" });
  vm.runInContext(mainSource, smokeContext, { filename: "main.js" });
  const workMemos = vm.runInContext(
    `scenarioBank.map((scenario) => {
      const profile = getScenarioJudgementProfile(scenario);
      const briefing = window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS[scenario.scenarioId];
      return {
        scenarioId: scenario.scenarioId,
        patternIndex: getScenarioNarrativePatternIndex(scenario.scenarioId),
        workMemo: getScenarioWorkMemo(scenario, profile),
        targetIntro: briefing.testTarget.replace(/をテストしています。$/, "のテスト中に確認した内容です。"),
        requiredFragments: briefing.notes.slice(0, 2),
        inferenceFragments: [
          briefing.notes[2],
          profile.scope,
          profile.risk,
          profile.workaround,
          profile.recovery,
        ],
      };
    })`,
    smokeContext
  );
  const scoringRubricSeeds = vm.runInContext(
    `scenarioBank.map((rawScenario) => {
      const scenario = buildScenario(rawScenario);
      let currentSection = "";
      const sections = {};
      scenario.reportEntries.forEach((entry) => {
        if (entry.kind === "section") {
          currentSection = entry.text;
          return;
        }
        if (entry.kind !== "line" || !currentSection) {
          return;
        }
        sections[currentSection] ||= [];
        sections[currentSection].push(entry.text);
      });
      const expected = scenario.evaluation || {};
      const evidenceProfile = scenario.evidenceProfile || { requiredIds: [], files: [] };
      return {
        scenarioId: rawScenario.scenarioId,
        projectId: rawScenario.projectId,
        subject: scenario.subjectEntry.text,
        sections,
        expectedTicketFields: {
          severity: expected.severity || null,
          priority: expected.priority || null,
          category: expected.category || null,
          version: expected.version || null,
          environment: expected.environment || null,
          dueDate: expected.dueDate || null,
          baseDate: getLocalDateInputValue(),
          assigneeId: expected.assignee || null,
          watcherIds: expected.watchers || [],
        },
        evidenceFiles: evidenceProfile.files.map((file) => ({
          id: file.id,
          name: file.name,
          summary: file.summary,
          required: evidenceProfile.requiredIds.includes(file.id),
        })),
      };
    })`,
    smokeContext
  );
  const sectionDefinitions = [
    ["detail", "■詳細", "critical"],
    ["preconditions", "■前提条件", "supporting"],
    ["steps", "■操作手順", "important"],
    ["expected", "■期待結果", "critical"],
    ["actual", "■実際の動作", "critical"],
    ["remarks", "■備考", "important"],
    ["reproducibility", "■再現性", "important"],
  ];
  const genericForbiddenClaims = [
    {
      id: "claim-unverified-root-cause",
      description: "入力内容や添付証跡で確認されていない実装上の原因を、確認済みの事実として断定する",
      severity: "major",
    },
    {
      id: "claim-unverified-scope",
      description: "確認していない利用者、環境、端末またはデータのすべてで発生すると断定する",
      severity: "major",
    },
    {
      id: "claim-unverified-impact",
      description: "確認されていない損失、安全影響またはデータ破損を、すでに発生した事実として断定する",
      severity: "major",
    },
  ];
  const scoringRubricRegistry = {
    schemaVersion: "scenario-rubric-registry.v1",
    dimensions: pilotRubric.dimensions,
    scenarios: Object.fromEntries(scoringRubricSeeds.map((seed) => {
      const { dueDate, baseDate, ...stableTicketFields } = seed.expectedTicketFields;
      const dueDateOffsetDays = dueDate
        ? Math.round(
            (new Date(`${dueDate}T12:00:00Z`) - new Date(`${baseDate}T12:00:00Z`))
            / 86400000
          )
        : null;
      const generatedRequiredFacts = {
        subject: [{
          id: "subject-main",
          description: seed.subject,
          importance: "critical",
        }],
        ...Object.fromEntries(sectionDefinitions
          .map(([key, sectionTitle, importance]) => [
            key,
            (seed.sections[sectionTitle] || []).map((description, index) => ({
              id: `${key}-${index + 1}`,
              description,
              importance,
            })),
          ])
          .filter(([, facts]) => facts.length > 0)),
      };
      const isPilot = seed.scenarioId === pilotRubric.scenarioId;
      return [seed.scenarioId, {
        scenarioId: seed.scenarioId,
        projectId: seed.projectId,
        rubricVersion: isPilot
          ? "customer-save-multiple-clicks-duplicate.v3"
          : `${seed.scenarioId}.v1`,
        requiredFacts: isPilot ? pilotRubric.requiredFacts : generatedRequiredFacts,
        forbiddenClaims: isPilot
          ? [...pilotRubric.forbiddenClaims, ...genericForbiddenClaims]
          : genericForbiddenClaims,
        optionalFacts: [
          { id: "optional-environment-detail", description: "確認したビルド、OS、ブラウザまたは端末を具体的に記載する" },
          { id: "optional-evidence-summary", description: "添付した証跡から確認できる内容を本文へ簡潔に記載する" },
          { id: "optional-scope-workaround", description: "確認済みの影響範囲または暫定回避策を、推測と区別して記載する" },
        ],
        expectedTicketFields: {
          ...stableTicketFields,
          dueDatePolicy: dueDateOffsetDays === null
            ? { mode: "unset" }
            : { mode: "days-after-attempt", offsetDays: dueDateOffsetDays },
        },
        evidenceFiles: seed.evidenceFiles,
        referenceAnswer: {
          subject: seed.subject,
          sections: Object.fromEntries(sectionDefinitions
            .map(([key, sectionTitle]) => [key, (seed.sections[sectionTitle] || []).join("\n")])
            .filter(([, value]) => value)),
        },
        rubricNotes: [
          "参考回答との表現一致は要求しない",
          "原因の仮説と確認済み事実を区別する",
          "事実誤認は文章の拙さより重く扱う",
          "同じ事実を複数セクションへ重複記載しても加点しない",
          "チケット項目と添付証跡はシナリオの期待値と照合する",
        ],
      }];
    })),
  };
  const scoringFixtureRegistry = {
    schemaVersion: "scenario-scoring-fixtures.v1",
    scenarios: Object.fromEntries(Object.values(scoringRubricRegistry.scenarios).map((rubric) => {
      const referenceSections = rubric.referenceAnswer.sections;
      const sectionEntries = Object.entries(referenceSections);
      const criticalFactIds = Object.values(rubric.requiredFacts)
        .flat()
        .filter((fact) => fact.importance === "critical")
        .map((fact) => fact.id);
      const rotatedSections = Object.fromEntries(sectionEntries.map(([key], index) => [
        key,
        sectionEntries[(index + 1) % sectionEntries.length][1],
      ]));
      return [rubric.scenarioId, {
        scenarioId: rubric.scenarioId,
        rubricVersion: rubric.rubricVersion,
        fixtures: [
          {
            fixtureId: "excellent",
            label: "見本と同等の必要情報がそろった回答",
            answer: rubric.referenceAnswer,
            expected: { scoreMin: 85, scoreMax: 100, missingFactIds: [], forbiddenClaimIds: [] },
          },
          {
            fixtureId: "missing-critical-facts",
            label: "現象だけを記載し重要な条件と結果が不足した回答",
            answer: {
              subject: rubric.referenceAnswer.subject,
              sections: { detail: "対象画面で問題を確認しました。" },
            },
            expected: {
              scoreMin: 0,
              scoreMax: 79,
              missingFactIds: criticalFactIds.filter((factId) => factId !== "subject-main"),
              forbiddenClaimIds: [],
            },
          },
          {
            fixtureId: "unsupported-root-cause",
            label: "未確認の実装原因を断定した回答",
            answer: {
              subject: `実装不備により${rubric.referenceAnswer.subject}`,
              sections: {
                ...referenceSections,
                detail: `${referenceSections.detail || "現象を確認しました。"}\n原因は実装不備であることを確認しました。`,
              },
            },
            expected: {
              scoreMin: 0,
              scoreMax: 74,
              missingFactIds: [],
              forbiddenClaimIds: ["claim-unverified-root-cause"],
            },
          },
          {
            fixtureId: "misplaced-sections",
            label: "必要情報はあるが記載場所が入れ替わった回答",
            answer: { subject: rubric.referenceAnswer.subject, sections: rotatedSections },
            expected: { scoreMin: 55, scoreMax: 90, missingFactIds: [], forbiddenClaimIds: [] },
          },
          {
            fixtureId: "verbose",
            label: "必要情報はあるが重複表現が多い回答",
            answer: {
              subject: rubric.referenceAnswer.subject,
              sections: Object.fromEntries(sectionEntries.map(([key, value]) => [
                key,
                `${value}\n上記について継続して確認が必要です。`,
              ])),
            },
            expected: { scoreMin: 65, scoreMax: 95, missingFactIds: [], forbiddenClaimIds: [] },
          },
        ],
      }];
    })),
  };
  const registryScenarioIds = Object.keys(scoringRubricRegistry.scenarios);
  if (
    registryScenarioIds.length !== 27
    || new Set(registryScenarioIds).size !== 27
    || scoringRubricRegistry.dimensions.reduce(
      (sum, dimension) => sum + dimension.weight,
      0
    ) !== 100
  ) {
    errors.push("scoring rubric registry must cover 27 scenarios with dimensions totaling 100");
  }
  Object.values(scoringRubricRegistry.scenarios).forEach((rubric) => {
    const facts = Object.values(rubric.requiredFacts).flat();
    const factIds = new Set(facts.map((fact) => fact.id));
    const requiredEvidenceIds = rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id);
    if (
      facts.length < 7
      || factIds.size !== facts.length
      || requiredEvidenceIds.length < 2
      || !rubric.expectedTicketFields.severity
      || !rubric.expectedTicketFields.priority
      || !rubric.expectedTicketFields.category
      || !rubric.expectedTicketFields.version
      || !rubric.expectedTicketFields.environment
      || !rubric.expectedTicketFields.assigneeId
      || rubric.expectedTicketFields.watcherIds.length < 2
      || !rubric.expectedTicketFields.dueDatePolicy?.mode
    ) {
      errors.push(`${rubric.scenarioId}: scoring rubric is incomplete`);
    }
  });
  const fixtureScenarioIds = Object.keys(scoringFixtureRegistry.scenarios);
  if (
    fixtureScenarioIds.length !== registryScenarioIds.length
    || fixtureScenarioIds.some((scenarioId) => {
      const fixtureSet = scoringFixtureRegistry.scenarios[scenarioId];
      const rubric = scoringRubricRegistry.scenarios[scenarioId];
      return !rubric
        || fixtureSet.rubricVersion !== rubric.rubricVersion
        || fixtureSet.fixtures.length !== 5
        || new Set(fixtureSet.fixtures.map(({ fixtureId }) => fixtureId)).size !== 5;
    })
  ) {
    errors.push("scoring fixture registry must contain five fixtures for all 27 rubrics");
  }
  fixtureScenarioIds.forEach((scenarioId) => {
    const rubric = scoringRubricRegistry.scenarios[scenarioId];
    const validFactIds = new Set(
      Object.values(rubric?.requiredFacts || {}).flat().map((fact) => fact.id)
    );
    const validClaimIds = new Set(
      (rubric?.forbiddenClaims || []).map((claim) => claim.id)
    );
    scoringFixtureRegistry.scenarios[scenarioId].fixtures.forEach((fixture) => {
      if (
        fixture.expected.scoreMin < 0
        || fixture.expected.scoreMax > 100
        || fixture.expected.scoreMin > fixture.expected.scoreMax
        || fixture.expected.missingFactIds.some((factId) => !validFactIds.has(factId))
        || fixture.expected.forbiddenClaimIds.some((claimId) => !validClaimIds.has(claimId))
      ) {
        errors.push(`${scenarioId}/${fixture.fixtureId}: invalid scoring fixture expectation`);
      }
    });
  });
  if (
    !process.argv.includes("--write-scoring-rubrics")
    && (
      JSON.stringify(scoringRubricRegistryFile) !== JSON.stringify(scoringRubricRegistry)
      || JSON.stringify(scoringFixtureRegistryFile) !== JSON.stringify(scoringFixtureRegistry)
    )
  ) {
    errors.push("scenario scoring rubrics or fixtures are out of sync; run --write-scoring-rubrics");
  }
  if (process.argv.includes("--write-scoring-rubrics")) {
    fs.writeFileSync(
      "scoring/rubrics/scenario-rubrics.json",
      `${JSON.stringify(scoringRubricRegistry, null, 2)}\n`
    );
    fs.writeFileSync(
      "scoring/fixtures/scenario-fixtures.json",
      `${JSON.stringify(scoringFixtureRegistry, null, 2)}\n`
    );
  }
  workMemos.forEach(({ scenarioId, workMemo, targetIntro, requiredFragments, inferenceFragments }) => {
    const paragraphs = workMemo.split("\n\n");
    const includedInferenceCount = inferenceFragments.filter((fragment) => workMemo.includes(fragment)).length;
    if (
      workMemo.length < 250
      || workMemo.length > 600
      || paragraphs.length < 4
      || paragraphs.length > 5
      || paragraphs.some((paragraph) => paragraph.trim().length < 30)
      || !workMemo.startsWith(targetIntro)
      || requiredFragments.some((fragment) => !workMemo.includes(fragment))
      || includedInferenceCount < 1
      || includedInferenceCount > 3
      || /■|テスト対象：|確認結果：|影響範囲：|想定される影響：|復旧方法：|回避策：/.test(workMemo)
      || /違和感を見つけ|手がかり|問題の輪郭|危険が浮かぶ|話は、|目へ飛び込|時間を最初へ戻|再現回数の向こう側|しのぐこと|画面の中だけに収まりません|ここから先は|時間順に戻|この対応を始めたのは|同じ条件を作|一覧からなくな|次の結果になった|作り直|やり直|使えています|移しない|影響するのは|発生したデータについては|原因箇所が.+いずれであるか|応答がタイムアウトした/.test(workMemo)
    ) {
      errors.push(`${scenarioId}: work memo must read naturally and leave some details for inference`);
    }
  });
  if (new Set(workMemos.map(({ patternIndex }) => patternIndex)).size !== 10) {
    errors.push("all ten QA work-memo patterns must be used across the scenario bank");
  }
  if (process.argv.includes("--print-work-memos")) {
    console.log(workMemos.map(({ scenarioId, patternIndex, workMemo }) => [
      `--- ${scenarioId} / pattern ${patternIndex} ---`,
      workMemo,
    ].join("\n")).join("\n\n"));
  }
  const backgroundSyncMemo = workMemos.find(
    ({ scenarioId }) => scenarioId === "mobile-background-sync-data-lost"
  )?.workMemo || "";
  [
    "未送信データ同期のテスト中に確認した内容です",
    "アプリをバックグラウンドへ移さない運用",
    "この対応を行うきっかけとなった現象",
    "作成した3件が一覧から消失していました",
    "同一条件で25回検証を行ったところ",
    "消失した3件は端末側にも残っていません",
    "未送信データを端末の永続領域に保存し",
  ].forEach((phrase) => {
    if (!backgroundSyncMemo.includes(phrase)) {
      errors.push(`background-sync work memo must include natural QA wording: ${phrase}`);
    }
  });
  const customerSearchMemo = workMemos.find(
    ({ scenarioId }) => scenarioId === "customer-search-nonexistent-name-all-results"
  )?.workMemo || "";
  [
    "氏名検索による絞り込みのテスト中に確認した内容です",
    "影響を受けるのは、顧客一覧で氏名検索を利用する一般ユーザーです",
    "検索条件に一致しない場合でも検索対象の顧客が全件表示されるため",
    "一般ユーザーアカウントで顧客一覧を開き",
    "一方、顧客番号「C-1001」を指定して検索した場合は",
    "検索結果は0件となる規定です",
    "取込処理自体は正常終了しています",
  ].forEach((phrase) => {
    if (!customerSearchMemo.includes(phrase)) {
      errors.push(`customer-search work memo must include natural QA wording: ${phrase}`);
    }
  });
  vm.runInContext("renderScenarioBrief()", smokeContext);
  const scenarioBriefMarkup = smokeElements.get("scenarioIntroFacts")?.innerHTML || "";
  if (
    !scenarioBriefMarkup.includes('class="is-unlabeled"')
    || !scenarioBriefMarkup.includes('data-brief-key="testTarget observation scope risk recovery workaround"')
    || scenarioBriefMarkup.includes("<dt>")
  ) {
    errors.push("scenario brief must render one unlabeled work memo without report-style sections");
  }
  const initialTicketMarkup = smokeElements.get("ticketListBody")?.innerHTML || "";
  const leakedInitialSubjects = vm.runInContext(
    `scenarioBank
      .filter((scenario) => scenario.projectId === state.projectId)
      .map((scenario) => scenario.subject.text)
      .filter((subject) => ${JSON.stringify(initialTicketMarkup)}.includes(subject))`,
    smokeContext
  );
  if (initialTicketMarkup.includes("ticket-subject-link") || leakedInitialSubjects.length > 0) {
    errors.push(
      `runtime smoke test expected no dummy tickets or answer leakage: ${JSON.stringify(
        leakedInitialSubjects
      )}`
    );
  }
  const runtimeScenarioIds = vm.runInContext(
    `scenarioBank.map((scenario) => scenario.scenarioId)`,
    smokeContext
  );
  if (
    runtimeScenarioIds.length !== 27 ||
    new Set(runtimeScenarioIds).size !== runtimeScenarioIds.length ||
    runtimeScenarioIds.some(
      (scenarioId) =>
        typeof scenarioId !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId)
    )
  ) {
    errors.push("runtime smoke test expected 27 unique persistent scenario IDs");
  }
  const runtimeEnvironmentFailures = vm.runInContext(
    `scenarioBank.map((scenario) => {
      const built = buildScenario(scenario);
      const choices = projectEnvironmentChoices[scenario.projectId];
      return {
        scenarioId: scenario.scenarioId,
        version: built.evaluation.version,
        environment: built.evaluation.environment,
        validVersion: choices?.versions.includes(built.evaluation.version),
        validEnvironment: choices?.configurations.includes(built.evaluation.environment),
      };
    }).filter((item) => !item.validVersion || !item.validEnvironment)`,
    smokeContext
  );
  if (runtimeEnvironmentFailures.length > 0) {
    errors.push(
      `runtime smoke test found scenario environments missing from ticket choices: ${JSON.stringify(
        runtimeEnvironmentFailures
      )}`
    );
  }
  const scenarioQueueCoverage = vm.runInContext(
    `projectCatalog.map((project) => {
      state.projectId = project.id;
      state.scenarioQueue = [];
      refillScenarioQueue();
      const expected = scenarioBank
        .map((scenario, index) => ({ scenario, index }))
        .filter(({ scenario }) => scenario.projectId === project.id)
        .map(({ index }) => index)
        .sort((left, right) => left - right);
      const actual = [...state.scenarioQueue].sort((left, right) => left - right);
      return {
        projectId: project.id,
        expected,
        actual,
        complete: JSON.stringify(expected) === JSON.stringify(actual),
      };
    }).filter((item) => !item.complete)`,
    smokeContext
  );
  if (scenarioQueueCoverage.length > 0) {
    errors.push(
      `ticket creation must reach every hidden scenario: ${JSON.stringify(scenarioQueueCoverage)}`
    );
  }
  const unattemptedSelection = vm.runInContext(
    `(() => {
      state.projectId = "customer";
      state.scenarioIndex = -1;
      state.scenarioQueue = [];
      state.sessionPracticeAttemptsByScenario = {};
      const projectScenarios = scenarioBank.filter((scenario) => scenario.projectId === state.projectId);
      const attempted = projectScenarios[0];
      state.myPageProgress = [{
        scenarioId: attempted.scenarioId,
        status: "in_progress",
        attemptCount: 1,
        bestScore: 65,
        latestScore: 65,
        latestAttemptAt: "2026-08-01T00:00:00.000Z",
      }];
      refillScenarioQueue();
      const queuedIds = state.scenarioQueue.map((index) => scenarioBank[index].scenarioId);
      const expectedUnattemptedIds = projectScenarios.slice(1).map((scenario) => scenario.scenarioId);
      state.myPageProgress = [];
      state.scenarioQueue = [];
      return {
        attemptedId: attempted.scenarioId,
        queuedIds,
        expectedUnattemptedIds,
      };
    })()`,
    smokeContext
  );
  if (
    unattemptedSelection.queuedIds.includes(unattemptedSelection.attemptedId) ||
    JSON.stringify([...unattemptedSelection.queuedIds].sort()) !==
      JSON.stringify([...unattemptedSelection.expectedUnattemptedIds].sort())
  ) {
    errors.push(
      `ticket creation must prioritize only unattempted scenarios: ${JSON.stringify(unattemptedSelection)}`
    );
  }
  const practiceAuthoringPrototype = vm.runInContext(
    `(() => {
      const previousMode = state.authoringMode;
      const previousScenario = state.scenario;
      const target = scenarioBank.find((scenario) =>
        /保存ボタンを連続クリック.*顧客データが重複登録/.test(
          scenario.subject.text
        )
      );
      state.authoringMode = "practice";
      state.scenario = buildScenario(target);
      state.running = true;
      state.practiceWritingComplete = false;
      state.practiceSubject = "保存ボタン連続クリックで顧客が重複登録される";
      const groups = getPracticeSectionGroups();
      groups
        .filter((group) => group.referenceLines.length > 0)
        .forEach((group) => {
          state.practiceSections[group.key] = \`\${group.title}の回答\`;
        });
      renderReport();
      const beforeComplete = {
        subjectInput: elements.subjectDocument.innerHTML.includes("practiceSubjectInput"),
        sectionInputCount: (
          elements.reportDocument.innerHTML.match(/data-practice-section=/g) || []
        ).length,
        expectedSectionInputCount: groups.filter(
          (group) => group.referenceLines.length > 0
        ).length,
      };
      completePracticeWriting();
      renderPracticeComparison();
      state.practiceScoringStatus = "succeeded";
      state.practiceScoringResult =
        window.TYPING_WORKBENCH_SCORING_PREVIEWS[state.scenario.scenarioId];
      renderPracticeScoringPreview();
      const firstEditableGroup = groups.find((group) => group.referenceLines.length > 0);
      const previousFirstGroupValue = state.practiceSections[firstEditableGroup.key];
      state.practiceSections[firstEditableGroup.key] = "";
      const finalValidationBlocked = !validatePracticeWriting({ focusFirst: false });
      state.practiceSections[firstEditableGroup.key] = previousFirstGroupValue;
      const afterComplete = {
        writingComplete: state.practiceWritingComplete,
        completedLines: state.completedLines,
        expectedLines: state.scenario.totalEditableLines,
        setupStepIndex: state.setupStepIndex,
        answerRendered: elements.practiceResultAnswer.innerHTML.includes(
          state.practiceSubject
        ),
        referenceRendered: elements.practiceReferenceAnswer.innerHTML.includes(
          state.scenario.subjectEntry.text
        ),
        scoringPreviewRendered:
          elements.practiceScoringPreviewTotal.textContent === "77" &&
          elements.practiceRadarFactual.textContent === "78" &&
          elements.practiceScoringReaderQuestions.innerHTML.includes("保存API") &&
          elements.practiceScoringAmbiguityRisks.innerHTML.includes("DBの排他制御"),
        writingRemainsEditable:
          !elements.subjectDocument.innerHTML.includes(" disabled") &&
          !elements.reportDocument.innerHTML.includes(" disabled"),
        finalValidationBlocked,
      };
      state.authoringMode = previousMode;
      state.scenario = previousScenario;
      state.running = false;
      state.practiceSubject = "";
      state.practiceSections = {};
      state.practiceWritingComplete = false;
      return { beforeComplete, afterComplete };
    })()`,
    smokeContext
  );
  if (
    !practiceAuthoringPrototype.beforeComplete.subjectInput ||
    practiceAuthoringPrototype.beforeComplete.sectionInputCount !==
      practiceAuthoringPrototype.beforeComplete.expectedSectionInputCount ||
    !practiceAuthoringPrototype.afterComplete.writingComplete ||
    practiceAuthoringPrototype.afterComplete.completedLines !==
      practiceAuthoringPrototype.afterComplete.expectedLines ||
    practiceAuthoringPrototype.afterComplete.setupStepIndex !== 0 ||
    !practiceAuthoringPrototype.afterComplete.answerRendered ||
    !practiceAuthoringPrototype.afterComplete.referenceRendered ||
    !practiceAuthoringPrototype.afterComplete.scoringPreviewRendered ||
    !practiceAuthoringPrototype.afterComplete.writingRemainsEditable ||
    !practiceAuthoringPrototype.afterComplete.finalValidationBlocked
  ) {
    errors.push(
      `runtime smoke test expected practice authoring to render, complete, and compare answers: ${JSON.stringify(
        practiceAuthoringPrototype
      )}`
    );
  }
  const canSpecification = vm.runInContext(
    `buildScenario(scenarioBank.find((scenario) =>
      /CAN信号.*DBC定義/.test(scenario.subject.text)
    )).reportEntries.find((entry) => entry.kind === "reference")?.text`,
    smokeContext
  );
  if (!/Little Endian/.test(canSpecification || "")) {
    errors.push("runtime smoke test did not attach the CAN byte-order specification reference");
  }
  const scenarioNarrativeCoverage = vm.runInContext(
    `scenarioBank.map((scenario) => {
      const built = buildScenario(scenario);
      const context = built.evaluation.context;
      const expectedIndex = built.reportEntries.findIndex(
        (entry) => entry.kind === "section" && entry.text === "■期待結果"
      );
      const detailIndex = built.reportEntries.findIndex(
        (entry) => entry.kind === "section" && entry.text === "■詳細"
      );
      const expectedText = built.reportEntries[expectedIndex + 1]?.text || "";
      const detailLines = built.reportEntries
        .slice(detailIndex + 1)
        .filter((entry, index, entries) =>
          entry.kind === "line" &&
          entries.slice(0, index).every((previous) => previous.kind !== "section")
        )
        .map((entry) => entry.text)
        .join("");
      const normalizedObservation = context.observation.replace(/\\s+/g, "");
      return {
        subject: scenario.subject.text,
        observation: context.observation,
        incidental: context.incidental,
        expectedLeak:
          Boolean(expectedText) &&
          normalizedObservation.includes(expectedText.replace(/\\s+/g, "")),
        subjectLeak: normalizedObservation.includes(scenario.subject.text.replace(/\\s+/g, "")),
        detailLeak:
          Boolean(detailLines) && normalizedObservation.includes(detailLines.replace(/\\s+/g, "")),
      };
    })`,
    smokeContext
  );
  const invalidNarratives = scenarioNarrativeCoverage.filter(
    ({ observation, incidental, expectedLeak, subjectLeak, detailLeak }) =>
      !observation ||
      !incidental ||
      expectedLeak ||
      subjectLeak ||
      detailLeak ||
      /期待する動作：|確認結果：|こと」状態|。。|できますという/.test(observation)
  );
  const uniqueIncidentalNotes = new Set(
    scenarioNarrativeCoverage.map(({ incidental }) => incidental)
  ).size;
  if (
    scenarioNarrativeCoverage.length !== 27 ||
    invalidNarratives.length > 0 ||
    uniqueIncidentalNotes !== 27
  ) {
    errors.push(
      `runtime smoke test expected 27 distinct raw field reports without expected-result leakage: ${JSON.stringify(
        invalidNarratives
      )}`
    );
  }
  const duplicateRegistrationObservation = vm.runInContext(
    `buildScenario(scenarioBank.find((scenario) =>
      /保存ボタンを連続クリック/.test(scenario.subject.text)
    )).evaluation.context.observation`,
    smokeContext
  );
  if (
    !/C-3012/.test(duplicateRegistrationObservation || "") ||
    !/毎回3件/.test(duplicateRegistrationObservation || "") ||
    /→/.test(duplicateRegistrationObservation || "") ||
    /開く\s+必須項目/.test(duplicateRegistrationObservation || "")
  ) {
    errors.push(
      `runtime smoke test expected one readable duplicate-registration field report: ${duplicateRegistrationObservation}`
    );
  }
  const overnightConsistency = vm.runInContext(
    `(() => {
      const scenario = scenarioBank.find((item) =>
        item.scenarioId === "attendance-overnight-break-not-deducted"
      );
      const built = buildScenario(scenario);
      const detail = built.reportEntries
        .filter((entry) => entry.kind === "line")
        .map((entry) => entry.text)
        .join(" ");
      const evidenceText = built.evidenceProfile.files
        .flatMap((file) => [file.summary, file.resultReason, JSON.stringify(file.preview)])
        .join(" ");
      return {
        detailHasNineHours: /8時間ではなく9時間/.test(detail),
        evidenceHasNineHours: /9時間|09:00/.test(evidenceText),
        evidenceHas540Minutes: /540/.test(evidenceText),
        evidenceHasImpossible600Minutes: /600/.test(evidenceText),
      };
    })()`,
    smokeContext
  );
  if (
    !overnightConsistency.detailHasNineHours ||
    !overnightConsistency.evidenceHasNineHours ||
    !overnightConsistency.evidenceHas540Minutes ||
    overnightConsistency.evidenceHasImpossible600Minutes
  ) {
    errors.push(
      `overnight attendance facts must represent 9 elapsed hours and 540 unadjusted minutes: ${JSON.stringify(
        overnightConsistency
      )}`
    );
  }
  const evidenceCoverage = vm.runInContext(
    `scenarioBank.map((scenario) => {
      const profile = buildScenario(scenario).evidenceProfile;
      return {
        subject: scenario.subject.text,
        fileCount: profile?.files.length || 0,
        requiredCount: profile?.requiredIds.length || 0,
        invalidFiles: profile?.files.filter((file) =>
          !file.id ||
          !file.name ||
          !file.type ||
          !file.size ||
          !file.createdAt ||
          !file.modifiedAt ||
          !file.source ||
          !file.environment ||
          !file.summary ||
          !file.previewKind ||
          !file.preview ||
          !file.resultReason
        ).length || 0,
      };
    })`,
    smokeContext
  );
  const invalidEvidenceCoverage = evidenceCoverage.filter(
    ({ fileCount, requiredCount, invalidFiles }) =>
      fileCount < 4 ||
      fileCount > 5 ||
      requiredCount < 2 ||
      requiredCount >= fileCount ||
      invalidFiles > 0
  );
  if (evidenceCoverage.length !== 27 || invalidEvidenceCoverage.length > 0) {
    errors.push(
      `runtime smoke test expected complete evidence profiles for all 27 scenarios: ${JSON.stringify(
        invalidEvidenceCoverage
      )}`
    );
  }
  const evidenceScoringCoverage = vm.runInContext(
    `(() => {
      const previousScenario = state.scenario;
      const previousSelectedIds = [...state.selectedEvidenceIds];
      const failures = [];
      scenarioBank.forEach((scenario) => {
        state.scenario = buildScenario(scenario);
        const profile = state.scenario.evidenceProfile;
        const decoy = profile.files.find((file) => !profile.requiredIds.includes(file.id));
        state.selectedEvidenceIds = [...profile.requiredIds];
        const perfect = calculateEvidenceResult().score;
        state.selectedEvidenceIds = [...profile.requiredIds, decoy.id];
        const withDecoy = calculateEvidenceResult().score;
        state.selectedEvidenceIds = profile.requiredIds.slice(0, -1);
        const withMissing = calculateEvidenceResult().score;
        profile.files.forEach((file) => renderEvidencePreview(file));
        const uniqueIds = new Set(profile.files.map((file) => file.id)).size;
        if (
          perfect !== 10 ||
          withDecoy >= perfect ||
          withMissing >= perfect ||
          uniqueIds !== profile.files.length ||
          profile.requiredIds.some((fileId) => !profile.files.some((file) => file.id === fileId))
        ) {
          failures.push({
            subject: scenario.subject.text,
            perfect,
            withDecoy,
            withMissing,
            uniqueIds,
            fileCount: profile.files.length,
          });
        }
      });
      state.scenario = previousScenario;
      state.selectedEvidenceIds = previousSelectedIds;
      return failures;
    })()`,
    smokeContext
  );
  if (evidenceScoringCoverage.length > 0) {
    errors.push(
      `runtime smoke test expected correct evidence scoring and renderable previews for every scenario: ${JSON.stringify(
        evidenceScoringCoverage
      )}`
    );
  }
  const typingAnswersWithSpaces = vm.runInContext(
    `scenarioBank.flatMap((scenario) => {
      const built = buildScenario(scenario);
      return built.typingEntries.flatMap((entry) =>
        entry.answers.filter((answer) => /\\s/.test(answer)).map((answer) => ({
          subject: built.subject.text,
          answer,
        }))
      );
    })`,
    smokeContext
  );
  if (typingAnswersWithSpaces.length > 0) {
    errors.push(
      `runtime smoke test found whitespace in typing answers: ${typingAnswersWithSpaces
        .map(({ subject, answer }) => `${subject} => ${answer}`)
        .join(", ")}`
    );
  }
  const operationTypingTargets = vm.runInContext(
    `scenarioBank.flatMap((scenario) =>
      buildScenario(scenario).reportEntries
        .filter((entry) => entry.kind === "line" && /^\\d+\\. /.test(entry.text))
        .map((entry) => ({ text: entry.text, answers: entry.answers }))
    )`,
    smokeContext
  );
  const operationWithoutTypedPeriod = operationTypingTargets.find(
    ({ answers }) => answers.some((answer) => !/^\d+\./.test(answer))
  );
  if (operationTypingTargets.length === 0 || operationWithoutTypedPeriod) {
    errors.push(
      `runtime smoke test expected every numbered operation to require its period${
        operationWithoutTypedPeriod ? `: ${operationWithoutTypedPeriod.text}` : ""
      }`
    );
  }
  const adaptiveNGuide = vm.runInContext(
    `getGuideCandidate(expandTypingAnswers(["kanri"]), "kann").normalized`,
    smokeContext
  );
  if (adaptiveNGuide !== "kannri") {
    errors.push(`runtime smoke test expected the guide to follow typed nn, found: ${adaptiveNGuide}`);
  }
  const normalizedNAnswers = vm.runInContext(
    `[normalizeAnswerNSpelling("shouhinnno"), normalizeAnswerNSpelling("naiyouno")]`,
    smokeContext
  );
  if (normalizedNAnswers[0] !== "shouhinno" || normalizedNAnswers[1] !== "naiyouno") {
    errors.push(`runtime smoke test changed an ordinary n-row syllable: ${normalizedNAnswers.join(", ")}`);
  }
  const evidencePrototype = vm.runInContext(
    `(() => {
      const previousScenario = state.scenario;
      const previousSelectedIds = [...state.selectedEvidenceIds];
      const target = scenarioBank.find((scenario) =>
        /保存ボタンを連続クリック.*顧客データが重複登録/.test(scenario.subject.text)
      );
      state.scenario = buildScenario(target);
      const profile = state.scenario.evidenceProfile;
      state.selectedEvidenceIds = [...profile.requiredIds];
      const perfectScore = calculateEvidenceResult().score;
      state.selectedEvidenceIds = [...profile.requiredIds, "normal-server-log"];
      const wrongFileScore = calculateEvidenceResult().score;
      state.selectedEvidenceIds = profile.requiredIds.slice(0, 2);
      const missingFileScore = calculateEvidenceResult().score;
      const snapshot = {
        fileCount: profile.files.length,
        requiredCount: profile.requiredIds.length,
        decoyCount: profile.files.filter((file) => !profile.requiredIds.includes(file.id)).length,
        perfectScore,
        wrongFileScore,
        missingFileScore,
      };
      state.scenario = previousScenario;
      state.selectedEvidenceIds = previousSelectedIds;
      return snapshot;
    })()`,
    smokeContext
  );
  if (
    evidencePrototype.fileCount !== 5 ||
    evidencePrototype.requiredCount !== 3 ||
    evidencePrototype.decoyCount !== 2 ||
    evidencePrototype.perfectScore !== 10 ||
    evidencePrototype.wrongFileScore >= evidencePrototype.perfectScore ||
    evidencePrototype.missingFileScore >= evidencePrototype.perfectScore
  ) {
    errors.push(
      `runtime smoke test expected 3 correct and 2 decoy evidence files with score penalties: ${JSON.stringify(
        evidencePrototype
      )}`
    );
  }
  const evidenceSetupFlow = vm.runInContext(
    `(() => {
      const previousScenario = state.scenario;
      const target = scenarioBank.find((scenario) =>
        /保存ボタンを連続クリック.*顧客データが重複登録/.test(scenario.subject.text)
      );
      state.scenario = buildScenario(target);
      state.running = true;
      state.awaitingCreate = false;
      state.setupStepIndex = getSetupFields().length;
      beginEvidenceSetup();
      const beforeAttachment = {
        evidenceActive: state.evidenceSetupActive,
        awaitingCreate: state.awaitingCreate,
        createDisabled: elements.createButton.disabled,
        pickerDisabled: elements.openEvidencePickerButton.disabled,
      };
      state.evidencePickerDraftIds = [...state.scenario.evidenceProfile.requiredIds];
      applyEvidenceSelection();
      const afterAttachment = {
        evidenceActive: state.evidenceSetupActive,
        awaitingCreate: state.awaitingCreate,
        createDisabled: elements.createButton.disabled,
      };
      state.scenario = previousScenario;
      state.running = false;
      state.awaitingCreate = false;
      state.evidenceSetupActive = false;
      state.selectedEvidenceIds = [];
      return { beforeAttachment, afterAttachment };
    })()`,
    smokeContext
  );
  if (
    !evidenceSetupFlow.beforeAttachment.evidenceActive ||
    !evidenceSetupFlow.beforeAttachment.awaitingCreate ||
    !evidenceSetupFlow.beforeAttachment.createDisabled ||
    evidenceSetupFlow.beforeAttachment.pickerDisabled ||
    evidenceSetupFlow.afterAttachment.evidenceActive ||
    !evidenceSetupFlow.afterAttachment.awaitingCreate ||
    evidenceSetupFlow.afterAttachment.createDisabled
  ) {
    errors.push(
      `runtime smoke test expected evidence focus before watcher focus: ${JSON.stringify(
        evidenceSetupFlow
      )}`
    );
  }
  const watcherStageState = vm.runInContext(
    `(() => {
      state.running = true;
      state.awaitingCreate = false;
      state.setupStepIndex = getSetupFields().length;
      beginWatcherSetup();
      handleWatcherSelection();
      const snapshot = {
        running: state.running,
        awaitingCreate: state.awaitingCreate,
        setupStepIndex: state.setupStepIndex,
      };
      state.running = false;
      state.awaitingCreate = false;
      return snapshot;
    })()`,
    smokeContext
  );
  if (
    !watcherStageState.running ||
    !watcherStageState.awaitingCreate ||
    watcherStageState.setupStepIndex !== 7
  ) {
    errors.push(
      `runtime smoke test expected watcher focus to remain active until create: ${JSON.stringify(
        watcherStageState
      )}`
    );
  }
  const busOffDetailLines = vm.runInContext(
    `(() => {
      const built = buildScenario(scenarioBank.find((scenario) =>
        /Bus-Off復帰後/.test(scenario.subject.text)
      ));
      const detailIndex = built.reportEntries.findIndex(
        (entry) => entry.kind === "section" && entry.text === "■詳細"
      );
      return built.reportEntries
        .slice(detailIndex + 1)
        .filter((entry, index, entries) =>
          entry.kind === "line" &&
          entries.slice(0, index).every((previous) => previous.kind !== "section")
        )
        .map((entry) => entry.text);
    })()`,
    smokeContext
  );
  if (
    busOffDetailLines.length !== 1 ||
    !/90%以上/.test(busOffDetailLines[0] || "") ||
    !/30秒/.test(busOffDetailLines[0] || "") ||
    !/受信.*(?:停止|再開されない)/.test(busOffDetailLines[0] || "")
  ) {
    errors.push(
      `runtime smoke test expected the Bus-Off detail to contain the condition, elapsed time, and result: ${busOffDetailLines.join(
        " / "
      )}`
    );
  }
  const concealedProgress = vm.runInContext(
    `(() => {
      renderMyPageProgress([]);
      const markup = elements.myPageProgressProjects.innerHTML;
      const leakedSubjects = scenarioBank
        .map((scenario) => scenario.subject.text)
        .filter((subject) => markup.includes(subject));
      return {
        hasPlaceholder: markup.includes("未挑戦シナリオ 1"),
        leakedSubjects,
      };
    })()`,
    smokeContext
  );
  if (!concealedProgress.hasPlaceholder || concealedProgress.leakedSubjects.length > 0) {
    errors.push(
      `unstarted progress must conceal scenario answers: ${JSON.stringify(concealedProgress)}`
    );
  }
  const retryableProgress = vm.runInContext(
    `(() => {
      const scenario = scenarioBank[0];
      renderMyPageProgress([{
        scenarioId: scenario.scenarioId,
        status: "in_progress",
        attemptCount: 3,
        bestScore: 84,
        latestScore: 71,
        latestAttemptAt: "2026-08-02T00:00:00.000Z",
      }]);
      const markup = elements.myPageProgressProjects.innerHTML;
      state.myPageProgress = [];
      return {
        hasTitle: markup.includes(scenario.subject.text),
        hasRetry: markup.includes('data-retry-scenario-id="' + scenario.scenarioId + '"'),
        hasBest: markup.includes("84点"),
        hasLatest: markup.includes("71点"),
        hasAttempts: markup.includes("3回"),
        hasProjectChallenge: markup.includes("data-start-project-id"),
      };
    })()`,
    smokeContext
  );
  if (Object.values(retryableProgress).some((value) => !value)) {
    errors.push(
      `attempted progress must expose retry, best, latest, and count: ${JSON.stringify(retryableProgress)}`
    );
  }
  const persistedPracticeTicket = vm.runInContext(
    `(() => {
      state.ticketListItems = [{
        attemptId: "9aa36eba-00ee-4ae0-a918-54eb5e11686f",
        displayId: "9AA36EBA",
        projectId: "customer",
        subject: "利用者が整理して作成した題名",
        priority: "high",
        assigneeId: "tsunagi",
        reviewStatus: "succeeded",
        totalScore: 84,
        completedAt: "2026-08-03T00:00:00.000Z",
      }];
      renderTicketList();
      return elements.ticketListBody.innerHTML;
    })()`,
    smokeContext
  );
  if (
    !persistedPracticeTicket.includes("ticket-subject-link") ||
    !persistedPracticeTicket.includes("利用者が整理して作成した題名") ||
    !persistedPracticeTicket.includes("84点") ||
    !persistedPracticeTicket.includes("繋木 円")
  ) {
    errors.push(
      `persisted practice attempts must render as linked ticket rows: ${JSON.stringify(persistedPracticeTicket)}`
    );
  }
  const persistedTicketDetail = vm.runInContext(
    `(() => {
      state.ticketDetail = {
        attemptId: "9aa36eba-00ee-4ae0-a918-54eb5e11686f",
        displayId: "9AA36EBA",
        projectId: "customer",
        scenarioId: "customer-save-multiple-clicks-duplicate",
        answer: {
          subject: "利用者が整理して作成した題名",
          sections: { "事象": "保存結果が2件になる" },
          ticketFields: {
            tracker: "bug",
            status: "new",
            severity: "s2",
            priority: "high",
            assigneeId: "tsunagi",
            category: "workflow",
            progress: 0,
            watcherIds: ["kikuta"],
          },
        },
        selectedEvidenceIds: [],
        completedAt: "2026-08-03T00:00:00.000Z",
        scoringSupported: true,
        scoringResults: [],
      };
      renderTicketDetail();
      return elements.ticketDetailContent.innerHTML;
    })()`,
    smokeContext
  );
  if (
    !persistedTicketDetail.includes("保存結果が2件になる") ||
    !persistedTicketDetail.includes("S2：高") ||
    !persistedTicketDetail.includes("繋木 円") ||
    !persistedTicketDetail.includes("AIレビュー")
  ) {
    errors.push("persisted attempt detail must render ticket fields, description, and review state");
  }
} catch (error) {
  errors.push(`runtime smoke test failed: ${error.message}`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated runtime startup, ${scenarios.length} external scenarios, ${uniqueScenarioIds.length} QA work memos and test targets, ${judgementProfiles.length} judgement profiles, ${specificationReferences.length} specification references, ${allSubjects.length} categories, assignments, and environment selections, ${allSubjects.length} schedules, ${procedureOperations.length} report procedures, ${reportRemarks.length + manualRemarkSectionCount} report remarks, and typing score bounds across ${projectIds.length} projects.`
  );
}
