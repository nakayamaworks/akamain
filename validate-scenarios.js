const fs = require("node:fs");
const vm = require("node:vm");

const authoringSource = fs.readFileSync("scenario-authoring-library.js", "utf8");
const qaAuthoringSource = fs.readFileSync("qa-scenario-authoring-library.js", "utf8");
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
vm.runInNewContext(authoringSource, context, { filename: "scenario-authoring-library.js" });
vm.runInNewContext(source, context, { filename: "scenario-library.js" });
const qaContext = { window: {} };
vm.runInNewContext(qaAuthoringSource, qaContext, {
  filename: "qa-scenario-authoring-library.js",
});
const briefingContext = { window: {} };
vm.runInNewContext(authoringSource, briefingContext, { filename: "scenario-authoring-library.js" });
vm.runInNewContext(briefingSource, briefingContext, {
  filename: "scenario-briefing-library.js",
});
const scoringPreviewContext = { window: {} };
vm.runInNewContext(scoringPreviewSource, scoringPreviewContext, {
  filename: "scoring-preview.js",
});

const scenarios = context.window.TYPING_WORKBENCH_SCENARIOS;
const authoredScenarios = context.window.TYPING_WORKBENCH_SCENARIO_AUTHORING || {};
const qaAuthoredScenarios = qaContext.window.TYPING_WORKBENCH_QA_SCENARIO_AUTHORING || {};
const qaScenarios = qaContext.window.TYPING_WORKBENCH_QA_SCENARIOS || [];
const authoredSubjectSet = new Set(
  Object.values(authoredScenarios).map((profile) => profile.scenario?.subject).filter(Boolean)
);
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
const validProjectIds = new Set(["customer", ...projectIds]);
const difficulties = new Set(["intermediate", "advanced"]);
const allowedDifficulties = new Set(["beginner", ...difficulties]);
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
const hasConcreteSpecificationContent = (content) => (
  Array.isArray(content)
  && content.length > 0
  && content.every((text) => typeof text === "string" && text.trim().length >= 24)
  && content.join("").length >= 28
  && content.some((text) => /場合|際|時|後|前|状態|受信|入力|選択|操作|表示|登録|処理|対象|条件|算出|換算|更新|出力|削除|再計算|規定|候補|照合|受理|取得|保持|適用|判定/u.test(text))
);

if (mainSource.includes("記載内容：")) {
  errors.push("related material body must not repeat the redundant content label");
}

if (/<details class="scenario-rules[^"]*" open>/u.test(indexSource)) {
  errors.push("scenario decision criteria must be collapsed on initial display");
}

[
  "⊕ ウォッチャーを検索して追加",
  "主担当と関連担当者を選択",
].forEach((obsoleteWatcherCopy) => {
  if (indexSource.includes(obsoleteWatcherCopy) || stylesSource.includes(obsoleteWatcherCopy)) {
    errors.push(`obsolete watcher helper copy remains: ${obsoleteWatcherCopy}`);
  }
});

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
  !applicationHeaderSource.includes('id="ticketNavButton"') ||
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
  !indexSource.includes('src="./scenario-authoring-library.js') ||
  indexSource.indexOf("scenario-authoring-library.js") > indexSource.indexOf("scenario-library.js") ||
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
const ticketCreateSource = indexSource.slice(
  indexSource.indexOf('id="ticketCreateView"'),
  indexSource.indexOf('id="resultOverlay"')
);
if (
  ticketCreateSource.includes('id="privateCheckbox"') ||
  ticketCreateSource.includes("プライベート") ||
  stylesSource.includes(".ticket-private-toggle") ||
  mainSource.includes("privateCheckbox")
) {
  errors.push("new-ticket form must not expose the unused private setting");
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
  "resumeDraftButton",
  "draftSaveButton",
  "draftSaveStatus",
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
  "ticketListRetryButton",
  "practiceScoringRetryButton",
  "practiceScoringResult",
  "practiceScoringPreviewTotal",
  "practiceScoringVerdict",
  "practiceScoringOverallAssessment",
  "practiceScoringDetails",
  "practiceScoringImprovementSection",
  "practiceScoringPreviewStrengths",
  "practiceScoringReaderQuestions",
  "practiceScoringAmbiguityRisks",
  "practiceScoringInvestigationAdvice",
  "practiceScoringRewriteSuggestions",
  "practiceScoringNoImprovements",
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
if (
  !indexSource.includes('<button id="startButton" class="primary-button" type="button">バグ起票</button>')
  || !indexSource.includes('<button id="qaStartButton" class="qa-primary-button" type="button">QA起票</button>')
) {
  errors.push("the ticket list must provide separate bug and QA creation buttons");
}
if (indexSource.includes('id="practiceStartButton"')) {
  errors.push("the ticket list must not ask users to choose an authoring mode");
}
if ((indexSource.match(/記載例を入力/g) || []).length !== 1) {
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
  !attemptSchema?.required?.includes("evidenceDescriptions") ||
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
  !scoringResultSchema?.required?.includes("rubricFindings") ||
  !scoringResultSchema?.properties?.readerQuestions?.items?.properties?.classification?.enum?.includes("記述確認")
) {
  errors.push("scoring result schema must preserve grading provenance");
}

if (
  !backendScoringSource.includes('PROMPT_VERSION = "practice-review.v14"') ||
  !backendScoringSource.includes("手順書レベルの詳細を不足扱いしない") ||
  !backendScoringSource.includes("実施済みの事実か、再現のために補った推測か") ||
  !backendScoringSource.includes("受講者へ提示されていない情報を答えさせる質問") ||
  !backendScoringSource.includes("evidenceDescriptionsは起票内容の一部") ||
  !mainSource.includes('placeholder="説明（任意）"')
) {
  errors.push("AI review must assess optional attachment descriptions without adding a separate request");
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
  scoringPreview?.rubricVersion !== "customer-save-multiple-clicks-duplicate.v4" ||
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
    mainSource.indexOf("function getScenarioSpecificationReference")
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

    if (!validProjectIds.has(scenario.projectId)) {
      errors.push(`scenario ${index + 1}: unknown projectId "${scenario.projectId}"`);
    }
    if (!allowedDifficulties.has(scenario.difficulty)) {
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

  validProjectIds.forEach((projectId) => {
    const projectScenarios = scenarios.filter((scenario) => scenario.projectId === projectId);
    const projectDifficulties = new Set(projectScenarios.map((scenario) => scenario.difficulty));
    if (
      projectScenarios.length !== 4
      || [...allowedDifficulties].some((difficulty) => !projectDifficulties.has(difficulty))
    ) {
      errors.push(`${projectId}: bug bank must contain four scenarios and cover all difficulties`);
    }
  });
}

const allScenarioRefs = scenarios.map((scenario) => ({
  projectId: scenario.projectId,
  subject: scenario.subject,
}));
const allSubjects = scenarios.map((scenario) => scenario.subject);
const briefingProfiles = briefingContext.window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS || {};
const uniqueScenarioIds = Object.keys(authoredScenarios);
if (uniqueScenarioIds.length !== 36 || scenarios.length !== 36) {
  errors.push("authoring registry and compatibility view must both contain 36 scenarios");
}

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
Object.entries(authoredScenarios).forEach(([scenarioId, profile]) => {
  const report = profile.scenario?.report || [];
  const guide = profile.reviewGuide;
  const reviewSource = profile.reviewSource;
  const sectionNames = report
    .filter((entry) => entry.kind === "section")
    .map((entry) => entry.text);
  const operationStart = sectionNames.indexOf("■操作手順");
  const operationEnd = report.findIndex(
    (entry) => entry.kind === "section" && entry.text === "■期待結果"
  );
  const operationStartIndex = report.findIndex(
    (entry) => entry.kind === "section" && entry.text === "■操作手順"
  );
  const operationCount = report.slice(operationStartIndex + 1, operationEnd)
    .filter((entry) => entry.kind === "line").length;
  if (
    profile.schemaVersion !== "scenario-authoring.v2"
    || profile.scenario?.scenarioId !== scenarioId
    || JSON.stringify(briefingProfiles[scenarioId]) !== JSON.stringify(profile.briefing)
    || sectionNames.join(",") !== "■詳細,■前提条件,■操作手順,■期待結果,■実際の動作,■備考,■再現性"
    || operationStart < 0
    || operationCount < 1
    || operationCount > 4
    || !/Rev\.[^「]+「[^」]+」/.test(profile.specificationReference || "")
  ) {
    errors.push(`${scenarioId}: authored scenario and reference report must be complete`);
  }
  if (
    !hasConcreteSpecificationContent(profile.specificationContent)
    || profile.specificationContent.some(
      (text) => !text?.trim().endsWith("。") || /です|ます|原因箇所|現時点で特定|確認したところ/u.test(text)
    )
  ) {
    errors.push(`${scenarioId}: related material must state concrete conditions, operations, and behavior`);
  }
  if (
    !guide?.sourceBoundary
    || guide.sourceBoundary.includes("見本")
    || !Array.isArray(guide.strengthCriteria)
    || guide.strengthCriteria.length < 2
    || !Array.isArray(guide.nonScoringInvestigationIdeas)
    || !Array.isArray(guide.disallowedGenericPraise)
    || guide.disallowedGenericPraise.length < 3
  ) {
    errors.push(`${scenarioId}: review guide must define a source boundary and specific feedback policy`);
  }
  if (
    reviewSource?.schemaVersion !== "scenario-review-source.v1"
    || reviewSource?.sourceType !== "scenario-observations"
    || reviewSource?.testTarget !== profile.briefing?.testTarget
    || !Array.isArray(reviewSource?.observations)
    || reviewSource.observations.length < 3
    || reviewSource.observations.some(({ id, text }) => !id || !text)
    || !reviewSource?.specificationReference
    || !reviewSource?.alternativeExcellentAnswer?.subject
    || !reviewSource?.alternativeExcellentAnswer?.sections
  ) {
    errors.push(`${scenarioId}: review facts must be defined independently from the writing example`);
  }
  if (
    !reviewSource?.observations?.some(
      ({ role, text }) => role === "specification-and-context" && text?.trim().length >= 20
    )
  ) {
    errors.push(`${scenarioId}: the cited specification must include its concrete stated behavior`);
  }
});

const qaScenarioIds = Object.keys(qaAuthoredScenarios);
const requiredQaSections = [
  "■質問",
  "■確認した状況・事実",
  "■参照情報",
  "■現在の解釈",
  "■確認理由・影響",
  "■周辺確認・補足",
];
const requiredQaTypes = new Set(["specification", "behavior", "conflict"]);
if (
  qaScenarioIds.length !== 36
  || qaScenarios.length !== 36
  || new Set(qaScenarioIds).size !== 36
  || qaScenarios.some((scenario) => !requiredQaTypes.has(scenario.qaType))
) {
  errors.push("QA authoring registry and runtime view must both contain 36 valid scenarios");
}

validProjectIds.forEach((projectId) => {
  const projectQaScenarios = qaScenarios.filter((scenario) => scenario.projectId === projectId);
  const projectQaTypes = new Set(projectQaScenarios.map((scenario) => scenario.qaType));
  const projectDifficulties = new Set(projectQaScenarios.map((scenario) => scenario.difficulty));
  if (
    projectQaScenarios.length !== 4
    || [...requiredQaTypes].some((qaType) => !projectQaTypes.has(qaType))
    || [...allowedDifficulties].some((difficulty) => !projectDifficulties.has(difficulty))
  ) {
    errors.push(
      `${projectId}: QA bank must contain four scenarios and cover all QA types and difficulties`
    );
  }
});

Object.entries(qaAuthoredScenarios).forEach(([scenarioId, profile]) => {
  const scenario = profile.scenario;
  const report = scenario?.report || [];
  const sectionNames = report
    .filter((entry) => entry.kind === "section")
    .map((entry) => entry.text);
  const reportLines = report.filter((entry) => entry.kind === "line");
  const briefing = profile.briefing;
  const reviewSource = profile.reviewSource;
  const guide = profile.reviewGuide;
  if (
    profile.schemaVersion !== "qa-scenario-authoring.v1"
    || scenario?.scenarioId !== scenarioId
    || scenario?.ticketType !== "qa"
    || !requiredQaTypes.has(scenario?.qaType)
    || scenario?.evaluation?.tracker !== "qa"
    || scenario?.evaluation?.severity !== null
    || !scenario?.evaluation?.assignee
    || !Array.isArray(scenario?.evaluation?.watchers)
    || scenario.evaluation.watchers.length < 1
  ) {
    errors.push(`${scenarioId}: QA scenario metadata and ticket settings must be complete`);
  }
  if (
    sectionNames.join(",") !== requiredQaSections.join(",")
    || reportLines.length !== requiredQaSections.length
    || reportLines.some((entry) => !entry.text || !Array.isArray(entry.answers) || entry.answers.length < 1)
    || reportLines.some((entry) => entry.answers.some((answer) => !/^[a-z0-9 .,:/%-]+$/.test(answer)))
  ) {
    errors.push(`${scenarioId}: QA report must provide the six QA sections and typeable answers`);
  }
  if (
    !briefing?.testTarget
    || !Array.isArray(briefing?.notes)
    || briefing.notes.length < 3
    || scenario?.evaluation?.context?.workMemo?.includes("作成してください")
  ) {
    errors.push(`${scenarioId}: QA briefing must describe the unresolved situation without instructing the learner to create a test case`);
  }
  if (
    reviewSource?.schemaVersion !== "scenario-review-source.v1"
    || reviewSource?.sourceType !== "qa-materials"
    || !Array.isArray(reviewSource?.observations)
    || reviewSource.observations.length < 3
    || !reviewSource?.specificationReference
    || !reviewSource?.alternativeExcellentAnswer?.subject
    || !reviewSource?.alternativeExcellentAnswer?.sections
  ) {
    errors.push(`${scenarioId}: QA review facts must be independent from the writing example`);
  }
  if (
    !reviewSource?.observations?.some(
      ({ id, text }) => /^source(?:-|$)/.test(id || "") && text?.trim().length >= 20
    )
  ) {
    errors.push(`${scenarioId}: QA reference material must include the concrete statement or unresolved gap`);
  }
  if (
    !guide?.sourceBoundary
    || guide.sourceBoundary.includes("見本")
    || !Array.isArray(guide?.strengthCriteria)
    || guide.strengthCriteria.length < 2
    || !Array.isArray(guide?.disallowedGenericPraise)
    || guide.disallowedGenericPraise.length < 3
  ) {
    errors.push(`${scenarioId}: QA review guide must define source boundaries and scenario-specific praise`);
  }
  if (
    !hasConcreteSpecificationContent(profile.specificationContent)
    || profile.specificationContent.some(
      (text) => !text?.trim().endsWith("。") || /です|ます|原因箇所|現時点で特定|確認したところ/u.test(text)
    )
  ) {
    errors.push(`${scenarioId}: QA related material must state concrete rules or a concrete specification gap`);
  }
});

const judgementProfiles = Object.values(authoredScenarios).map((profile) => profile.judgement);
const specificationReferences = Object.values(authoredScenarios).map(
  (profile) => profile.specificationReference
);

Object.entries(authoredScenarios).forEach(([scenarioId, profile]) => {
  const judgement = profile.judgement;
  ["severity", "scope", "workaround", "recovery", "risk"].forEach((field) => {
    if (typeof judgement?.[field] !== "string" || judgement[field].trim() === "") {
      errors.push(`${scenarioId}: judgement.${field} is required`);
    }
  });
  if (!new Set(["s1", "s2", "s3", "s4"]).has(judgement?.severity)) {
    errors.push(`${scenarioId}: invalid severity "${judgement?.severity}"`);
  }
  if (!judgement?.scope?.startsWith("影響を受けるのは、")) {
    errors.push(`${scenarioId}: scope must identify the affected target`);
  }
  if (!/Rev\.[^「]+「[^」]+」/.test(profile.specificationReference || "")) {
    errors.push(`${scenarioId}: specification reference must include revision and section`);
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

let reportProcedureCount = 0;
let reportRemarkCount = 0;
Object.entries(authoredScenarios).forEach(([scenarioId, profile]) => {
  const report = profile.scenario.report || [];
  let currentSection = "";
  report.forEach((entry) => {
    if (entry.kind === "section") {
      currentSection = entry.text;
      return;
    }
    if (entry.kind !== "line") {
      return;
    }
    if (!entry.text || !Array.isArray(entry.answers) || entry.answers.length < 1) {
      errors.push(`${scenarioId}: every reference-answer line needs text and typing answers`);
    }
    if (currentSection === "■操作手順") {
      reportProcedureCount += 1;
      if (!/^\d+\. /.test(entry.text)) {
        errors.push(`${scenarioId}: operation steps must be numbered`);
      }
    }
    if (currentSection === "■備考") {
      reportRemarkCount += 1;
      if (entry.trainingRole !== "remark") {
        errors.push(`${scenarioId}: remarks must keep the training role`);
      }
    }
  });
});

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
    removeAttribute() {},
    toggleAttribute() {},
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
  const storageValues = new Map();
  const storage = {
    getItem(key) { return storageValues.has(key) ? storageValues.get(key) : null; },
    setItem(key, value) { storageValues.set(key, String(value)); },
    removeItem(key) { storageValues.delete(key); },
  };
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
    setInterval: smokeWindow.setInterval,
    clearInterval: smokeWindow.clearInterval,
    setTimeout: smokeWindow.setTimeout,
    clearTimeout: smokeWindow.clearTimeout,
  };
  vm.createContext(smokeContext);
  vm.runInContext(authoringSource, smokeContext, { filename: "scenario-authoring-library.js" });
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
        reviewGuide: window.TYPING_WORKBENCH_SCENARIO_AUTHORING?.[
          rawScenario.scenarioId
        ]?.reviewGuide || null,
      };
    })`,
    smokeContext
  );
  const scenarioAuthoringRegistry = vm.runInContext(
    `Object.fromEntries(scenarioBank.map((rawScenario) => {
      const briefing = window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS[rawScenario.scenarioId];
      const existingProfile = window.TYPING_WORKBENCH_SCENARIO_AUTHORING?.[
        rawScenario.scenarioId
      ];
      const baseReviewSource = existingProfile?.reviewSource || {
        schemaVersion: "scenario-review-source.v1",
        sourceType: "scenario-observations",
        testTarget: briefing.testTarget,
        environment: briefing.environment || rawScenario.environment.map((item) => item.text),
        observations: briefing.notes.map((text, index) => ({
          id: "observation-" + (index + 1),
          role: index === 0 ? "primary-observation" : index === 1 ? "comparison-check" : "specification-and-context",
          text,
        })),
        specificationReference: getScenarioSpecificationReference(rawScenario),
      };
      const primarySentences = baseReviewSource.observations[0].text.split("。").filter(Boolean);
      const comparisonSentences = baseReviewSource.observations[1].text.split("。").filter(Boolean);
      const reproductionSentences = comparisonSentences.filter((text) => /[0-9０-９]+回|[0-9０-９]+\\\/[0-9０-９]+|再現|いずれも/.test(text));
      const boundarySentences = comparisonSentences.filter((text) => !reproductionSentences.includes(text));
      const generatedAlternativeAnswer = {
        subject: baseReviewSource.observations[0].text.replaceAll("。", "、").replace(/、$/, ""),
        sections: {
          detail: baseReviewSource.observations[0].text,
          preconditions: "確認環境：" + baseReviewSource.environment.join("、"),
          steps: primarySentences.slice(0, -1).join("。") || primarySentences[0],
          expected: baseReviewSource.specificationReference + "\\n" + baseReviewSource.observations[2].text,
          actual: primarySentences.at(-1),
          remarks: (boundarySentences.length ? boundarySentences : comparisonSentences).join("。") + "。",
          reproducibility: (reproductionSentences.length ? reproductionSentences : comparisonSentences).join("。") + "。",
        },
      };
      const mobileRotationAlternative = {
        subject: "問い合わせフォームの未送信文が端末の横向き切替で消失する",
        sections: {
          detail: "App 3.4.0 (34018)／Android 15／Pixel 9で、問い合わせフォームへ約120文字を入力して端末を横向きにすると、入力欄が空になりました。",
          preconditions: "Pixel 9へApp 3.4.0 (34018)をインストールし、問い合わせフォームを開いていること",
          steps: "1. 問い合わせフォームへ送信前の文章を約120文字入力する\\n2. 端末を縦向きから横向きへ回転する",
          expected: "画面が再構成されても、未送信の入力内容が保持されること",
          actual: "回転直後に約120文字の入力内容が消失し、入力欄が空になる",
          remarks: "縦向きのまま送信する操作と保存済み内容の表示は正常です。文字サイズを標準に変更しても再現しました。",
          reproducibility: "3/3",
        },
      };
      const reviewSource = {
        ...baseReviewSource,
        alternativeExcellentAnswer: existingProfile?.reviewSource?.alternativeExcellentAnswer
          || (rawScenario.scenarioId === "mobile-rotation-clears-input"
            ? mobileRotationAlternative
            : generatedAlternativeAnswer),
      };
      const reviewGuide = {
        sourceBoundary: "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
        strengthCriteria: [
          "観測記録『" + reviewSource.observations[0].text + "』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
          "比較確認『" + reviewSource.observations[1].text + "』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
          "仕様・周辺情報『" + reviewSource.observations[2].text + "』について、期待動作と確認済み事実を推測から分けているか評価する",
        ],
        nonScoringInvestigationIdeas: existingProfile?.reviewGuide?.nonScoringInvestigationIdeas || [],
        ...((existingProfile?.reviewGuide?.acceptedConciseConditions || []).length
          ? { acceptedConciseConditions: existingProfile.reviewGuide.acceptedConciseConditions }
          : {}),
        disallowedGenericPraise: existingProfile?.reviewGuide?.disallowedGenericPraise || [
          "期待結果と実際の動作が分離されている",
          "再現回数が数値で明記されている",
          "操作手順が具体的に書かれている",
          "必要項目が埋められている",
        ],
      };
      return [rawScenario.scenarioId, {
        schemaVersion: "scenario-authoring.v2",
        scenario: rawScenario,
        briefing,
        specificationReference: getScenarioSpecificationReference(rawScenario),
        judgement: getScenarioJudgementProfile(rawScenario),
        reviewSource,
        reviewGuide,
      }];
    }))`,
    smokeContext
  );
  scoringRubricSeeds.forEach((seed) => {
    const authoringProfile = scenarioAuthoringRegistry[seed.scenarioId];
    seed.reviewSource = authoringProfile.reviewSource;
    seed.reviewGuide = authoringProfile.reviewGuide;
  });
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
  const factAssessmentPolicy = {
    semanticEquivalence: true,
    sourceMaterialRule: "reviewSourceに含まれる観測記録、仕様、環境が事実判定の基準であり、writingExampleは判定に使用しない",
    sectionFlexibilityRule: "必要な意味が起票全体から明確に読み取れるなら、記載例と異なる語句、文順、セクション構成を減点しない",
    standardOperationDetailRule: "チーム内で既知の標準ツールや業務操作は、操作経路そのものが発生条件でない限り、画面クリックやAPI実行方法までの説明を要求しない",
    unsupportedAdditionRule: "reviewSourceにないが矛盾もしない条件や手順を受講者が追加した場合は、ただちに事実誤認や不足とせず、実施済みの事実か推測で補った手順かを記述確認として扱う",
    trackingIdentifierRule: "通知ID、注文番号、患者ID、商品名などの具体値は追跡用の発生例であり、同一性や差異が本文で説明され、選択済み証跡から対象を追跡できる場合は、同じ具体値を本文へ記載することを要求しない",
    measuredValueRule: "金額、時刻、件数、再現回数、仕様閾値は、発生条件・期待値・実測結果を成立させる情報かを判断し、入力材料と異なる値を記載した場合は矛盾として扱う",
    evidenceRule: "選択済み証跡は追跡用識別子や証跡確認の事実を補完できるが、題名、主要な発生条件、期待結果、実際の動作の記載を代替しない",
  };
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
          description: "題名だけで対象機能と主要な異常を特定できる",
          importance: "critical",
          sourceRefs: ["observation-1"],
        }],
        detail: [{
          id: "detail-observation",
          description: "主要な操作条件と観測結果を、観測記録に反しない形で説明する",
          importance: "critical",
          sourceRefs: ["observation-1"],
        }],
        steps: [{
          id: "steps-reproducible",
          description: "第三者が主要事象を再現できる操作の流れを示す",
          importance: "important",
          sourceRefs: ["observation-1"],
        }],
        expected: [{
          id: "expected-from-specification",
          description: "提示された仕様または期待動作を、観測結果と分けて説明する",
          importance: "critical",
          sourceRefs: ["observation-3"],
        }],
        actual: [{
          id: "actual-observed-result",
          description: "実際に観測した結果を、原因の推測を交えず説明する",
          importance: "critical",
          sourceRefs: ["observation-1"],
        }],
        reproducibility: [{
          id: "reproducibility-observed",
          description: "実施済みの再現確認回数と結果を説明する",
          importance: "important",
          sourceRefs: ["observation-2"],
        }],
        boundary: [{
          id: "boundary-confirmed-comparison",
          description: "実施済みの正常系・比較条件・周辺確認から、切り分けに役立つ事実を示す",
          importance: "important",
          sourceRefs: ["observation-2"],
        }],
      };
      const isPilot = seed.scenarioId === pilotRubric.scenarioId;
      const {
        alternativeExcellentAnswer: _alternativeExcellentAnswer,
        ...reviewSourceForScoring
      } = seed.reviewSource;
      return [seed.scenarioId, {
        scenarioId: seed.scenarioId,
        projectId: seed.projectId,
        rubricVersion: isPilot
          ? "customer-save-multiple-clicks-duplicate.v5"
          : seed.scenarioId === "mobile-background-sync-data-lost"
            ? "mobile-background-sync-data-lost.v4"
            : seed.scenarioId === "mobile-notification-opens-wrong-news"
              ? "mobile-notification-opens-wrong-news.v4"
            : `${seed.scenarioId}.v3`,
        reviewSource: reviewSourceForScoring,
        requiredFacts: generatedRequiredFacts,
        factAssessmentPolicy,
        reviewGuide: seed.reviewGuide,
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
        writingExample: {
          subject: seed.subject,
          sections: Object.fromEntries(sectionDefinitions
            .map(([key, sectionTitle]) => [key, (seed.sections[sectionTitle] || []).join("\n")])
            .filter(([, value]) => value)),
        },
        rubricNotes: [
          "記載例は正解ではなく、採点時の事実源にも使用しない",
          "requiredFactsはreviewSourceから独立して定義した伝達要件であり、文面一致を要求しない",
          "標準的なツール操作は、操作経路自体が発生条件でない限り手順書レベルの詳細を要求しない",
          "観測記録にない追加手順は、矛盾と断定せず実施済みか推測かを確認する",
          "追跡用の固有IDは本文、周辺確認・補足、選択済み証跡のいずれかから対象を追跡できればよい",
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
      const exampleSections = rubric.writingExample.sections;
      const sectionEntries = Object.entries(exampleSections);
      const alternativeAnswer = scenarioAuthoringRegistry[
        rubric.scenarioId
      ].reviewSource.alternativeExcellentAnswer;
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
            fixtureId: "example-complete",
            label: "記載例に必要情報がそろっている回答",
            answer: rubric.writingExample,
            expected: { scoreMin: 85, scoreMax: 100, missingFactIds: [], forbiddenClaimIds: [] },
          },
          {
            fixtureId: "alternative-excellent",
            label: "記載例と異なる表現・構成で観測事実と切り分けを伝える回答",
            answer: alternativeAnswer,
            expected: { scoreMin: 85, scoreMax: 100, missingFactIds: [], forbiddenClaimIds: [] },
          },
          {
            fixtureId: "missing-critical-facts",
            label: "現象だけを記載し重要な条件と結果が不足した回答",
            answer: {
              subject: rubric.writingExample.subject,
              sections: {},
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
              subject: `実装不備により${rubric.writingExample.subject}`,
              sections: {
                ...exampleSections,
                detail: `${exampleSections.detail || "現象を確認しました。"}\n原因は実装不備であることを確認しました。`,
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
            answer: { subject: rubric.writingExample.subject, sections: rotatedSections },
            expected: { scoreMin: 0, scoreMax: 75, missingFactIds: [], forbiddenClaimIds: [] },
          },
          {
            fixtureId: "verbose",
            label: "必要情報はあるが重複表現が多い回答",
            answer: {
              subject: rubric.writingExample.subject,
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
    registryScenarioIds.length !== 36
    || new Set(registryScenarioIds).size !== 36
    || scoringRubricRegistry.dimensions.reduce(
      (sum, dimension) => sum + dimension.weight,
      0
    ) !== 100
  ) {
    errors.push("scoring rubric registry must cover 36 scenarios with dimensions totaling 100");
  }
  Object.values(scoringRubricRegistry.scenarios).forEach((rubric) => {
    const facts = Object.values(rubric.requiredFacts).flat();
    const factIds = new Set(facts.map((fact) => fact.id));
    const reviewSourceIds = new Set(
      (rubric.reviewSource?.observations || []).map((observation) => observation.id)
    );
    const requiredEvidenceIds = rubric.evidenceFiles
      .filter((file) => file.required)
      .map((file) => file.id);
    if (
      facts.length < 7
      || factIds.size !== facts.length
      || reviewSourceIds.size < 3
      || Object.hasOwn(rubric.reviewSource || {}, "alternativeExcellentAnswer")
      || facts.some((fact) => !Array.isArray(fact.sourceRefs)
        || fact.sourceRefs.some((sourceRef) => !reviewSourceIds.has(sourceRef)))
      || rubric.factAssessmentPolicy?.semanticEquivalence !== true
      || !rubric.factAssessmentPolicy?.sourceMaterialRule
      || !rubric.factAssessmentPolicy?.sectionFlexibilityRule
      || !rubric.factAssessmentPolicy?.standardOperationDetailRule
      || !rubric.factAssessmentPolicy?.unsupportedAdditionRule
      || !rubric.writingExample?.subject
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
        || fixtureSet.fixtures.length !== 6
        || new Set(fixtureSet.fixtures.map(({ fixtureId }) => fixtureId)).size !== 6
        || !fixtureSet.fixtures.some(({ fixtureId }) => fixtureId === "alternative-excellent");
    })
  ) {
    errors.push("scoring fixture registry must contain six fixtures, including an alternative excellent answer, for all 36 rubrics");
  }
  fixtureScenarioIds.forEach((scenarioId) => {
    const rubric = scoringRubricRegistry.scenarios[scenarioId];
    const validFactIds = new Set(
      Object.values(rubric?.requiredFacts || {}).flat().map((fact) => fact.id)
    );
    const validClaimIds = new Set(
      (rubric?.forbiddenClaims || []).map((claim) => claim.id)
    );
    const alternativeFixture = scoringFixtureRegistry.scenarios[scenarioId].fixtures
      .find(({ fixtureId }) => fixtureId === "alternative-excellent");
    if (
      !alternativeFixture
      || JSON.stringify(alternativeFixture.answer) === JSON.stringify(rubric.writingExample)
    ) {
      errors.push(`${scenarioId}: alternative excellent fixture must differ from the writing example`);
    }
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
  if (process.argv.includes("--write-authoring-library")) {
    fs.writeFileSync(
      "scenario-authoring-library.js",
      `(() => {\n  // 問題文・記載例・観測事実・AIレビュー方針の単一ソース。生成済みrubricは直接編集しない。\n  const scenarios = ${JSON.stringify(scenarioAuthoringRegistry, null, 2)};\n\n  window.TYPING_WORKBENCH_SCENARIO_AUTHORING = Object.freeze(scenarios);\n})();\n`
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
    "3件すべてが一覧から消失しました",
    "メモリ解放なしでは0/25",
    "Android 15／Pixel 9では0/25",
    "デグレとはまだ断定していません",
    "復帰後の端末内キューは0件でした",
    "未送信データは永続領域へ保存し",
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
  const peripheralCopy = vm.runInContext(
    `(() => {
      const previousScenario = state.scenario;
      state.scenario = buildScenario(scenarioBank.find((scenario) =>
        scenario.scenarioId === "customer-save-multiple-clicks-duplicate"
      ));
      renderScenarioBrief();
      const markup = elements.scenarioIntroDecision.innerHTML;
      state.scenario = previousScenario;
      return markup;
    })()`,
    smokeContext
  );
  if (
    !peripheralCopy.includes("顧客登録画面で必要項目を入力し保存操作を行った場合、操作1回につき顧客レコードを1件だけ作成する。")
    || peripheralCopy.includes("原因箇所は現時点で特定できていません")
    || !peripheralCopy.includes("受入後に対象機能の回帰試験を実施")
    || (peripheralCopy.match(/scenario-schedule-line/g) || []).length < 2
    || /対応日程[\\s\\S]*?(?:です|ます)/u.test(peripheralCopy)
  ) {
    errors.push("related material and schedule must use concise, line-separated peripheral copy");
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
    runtimeScenarioIds.length !== 36 ||
    new Set(runtimeScenarioIds).size !== runtimeScenarioIds.length ||
    runtimeScenarioIds.some(
      (scenarioId) =>
        typeof scenarioId !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenarioId)
    )
  ) {
    errors.push("runtime smoke test expected 36 unique persistent scenario IDs");
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
          elements.practiceScoringVerdict.textContent === "追加確認を推奨" &&
          elements.practiceRadarFactual.textContent === "78" &&
          elements.practiceScoringDimensionFeedback.innerHTML.includes("個別理由を取得できませんでした") &&
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
  const practiceDraftRoundTrip = vm.runInContext(
    `(() => {
      const previous = {
        authStatus: state.authStatus,
        authoringMode: state.authoringMode,
        projectId: state.projectId,
        scenario: state.scenario,
      };
      const target = scenarioBank.find((scenario) =>
        scenario.scenarioId === "customer-save-multiple-clicks-duplicate"
      );
      state.authStatus = "signed_in";
      state.authoringMode = "practice";
      state.projectId = target.projectId;
      state.scenario = buildScenario(target);
      resetSession();
      activateCreateSession();
      state.practiceSubject = "途中保存した利用者の題名";
      const groups = getPracticeSectionGroups().filter(
        (group) => group.referenceLines.length > 0
      );
      groups.forEach((group, index) => {
        state.practiceSections[group.key] = "利用者が入力した本文" + (index + 1);
      });
      elements.prioritySelect.value = "high";
      elements.environmentSelect.value = "Chrome 139 / macOS 15.6";
      const evidenceId = getCurrentEvidenceProfile().files[0].id;
      state.selectedEvidenceIds = [evidenceId];
      state.evidenceDescriptions[evidenceId] = "14:32付近の顧客登録APIログ";
      const savedWhileWriting = saveCurrentPracticeDraft();
      state.practiceSubject = "消去対象";
      state.practiceSections = {};
      state.selectedEvidenceIds = [];
      state.evidenceDescriptions = {};
      const resumedWhileWriting = resumePracticeDraft(
        getLatestPracticeDraft(target.projectId)
      );
      const writingState = {
        savedWhileWriting,
        resumedWhileWriting,
        subject: state.practiceSubject,
        sectionCount: Object.keys(state.practiceSections).length,
        expectedSectionCount: groups.length,
        priority: elements.prioritySelect.value,
        evidenceRestored: state.selectedEvidenceIds.includes(evidenceId),
        evidenceDescription: state.evidenceDescriptions[evidenceId],
        privateValue: getSelectedTicketFields().private,
        running: state.running,
        awaitingCreate: state.awaitingCreate,
        scoringStatus: state.practiceScoringStatus,
        attemptSaved: state.currentAttemptSaved,
      };
      state.practiceWritingComplete = true;
      state.running = false;
      state.awaitingCreate = true;
      const savedAfterWriting = saveCurrentPracticeDraft();
      resetSession();
      const resumedAfterWriting = resumePracticeDraft(
        getLatestPracticeDraft(target.projectId)
      );
      const completedState = {
        savedAfterWriting,
        resumedAfterWriting,
        writingComplete: state.practiceWritingComplete,
        running: state.running,
        awaitingCreate: state.awaitingCreate,
      };
      deletePracticeDraft(target.scenarioId);
      const removedAfterFinalSave = !getLatestPracticeDraft(target.projectId) &&
        !JSON.parse(window.localStorage.getItem(practiceDraftStorageKey)).drafts[target.scenarioId];
      state.authStatus = previous.authStatus;
      state.authoringMode = previous.authoringMode;
      state.projectId = previous.projectId;
      state.scenario = previous.scenario;
      resetSession();
      return { writingState, completedState, removedAfterFinalSave };
    })()`,
    smokeContext
  );
  if (
    !practiceDraftRoundTrip.writingState.savedWhileWriting ||
    !practiceDraftRoundTrip.writingState.resumedWhileWriting ||
    practiceDraftRoundTrip.writingState.subject !== "途中保存した利用者の題名" ||
    practiceDraftRoundTrip.writingState.sectionCount !==
      practiceDraftRoundTrip.writingState.expectedSectionCount ||
    practiceDraftRoundTrip.writingState.priority !== "high" ||
    !practiceDraftRoundTrip.writingState.evidenceRestored ||
    practiceDraftRoundTrip.writingState.evidenceDescription !== "14:32付近の顧客登録APIログ" ||
    practiceDraftRoundTrip.writingState.privateValue !== false ||
    !practiceDraftRoundTrip.writingState.running ||
    practiceDraftRoundTrip.writingState.awaitingCreate ||
    practiceDraftRoundTrip.writingState.scoringStatus !== "idle" ||
    practiceDraftRoundTrip.writingState.attemptSaved ||
    !practiceDraftRoundTrip.completedState.savedAfterWriting ||
    !practiceDraftRoundTrip.completedState.resumedAfterWriting ||
    !practiceDraftRoundTrip.completedState.writingComplete ||
    practiceDraftRoundTrip.completedState.running ||
    !practiceDraftRoundTrip.completedState.awaitingCreate ||
    !practiceDraftRoundTrip.removedAfterFinalSave
  ) {
    errors.push(
      `practice drafts must save and resume locally without creating or reviewing a ticket: ${JSON.stringify(
        practiceDraftRoundTrip
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
    scenarioNarrativeCoverage.length !== 36 ||
    invalidNarratives.length > 0 ||
    uniqueIncidentalNotes !== 36
  ) {
    errors.push(
      `runtime smoke test expected 36 distinct raw field reports without expected-result leakage: ${JSON.stringify(
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
  if (evidenceCoverage.length !== 36 || invalidEvidenceCoverage.length > 0) {
    errors.push(
      `runtime smoke test expected complete evidence profiles for all 36 scenarios: ${JSON.stringify(
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
  const evidenceOrderingPrototype = vm.runInContext(
    `(() => {
      const target = scenarioBank.find((scenario) =>
        /保存ボタンを連続クリック.*顧客データが重複登録/.test(scenario.subject.text)
      );
      const profile = buildScenario(target).evidenceProfile;
      const requiredIds = new Set(profile.requiredIds);
      const inspect = (files) => ({
        ids: files.map((file) => file.id),
        upperHasDecoy: files.slice(0, requiredIds.size).some((file) => !requiredIds.has(file.id)),
        lowerHasRequired: files.slice(requiredIds.size).some((file) => requiredIds.has(file.id)),
        uniqueCount: new Set(files.map((file) => file.id)).size,
      });
      return {
        first: inspect(shuffleEvidenceFiles(profile.files, profile.requiredIds, () => 0)),
        second: inspect(shuffleEvidenceFiles(profile.files, profile.requiredIds, () => 0.999999)),
        fileCount: profile.files.length,
      };
    })()`,
    smokeContext
  );
  if (
    evidenceOrderingPrototype.first.uniqueCount !== evidenceOrderingPrototype.fileCount ||
    evidenceOrderingPrototype.second.uniqueCount !== evidenceOrderingPrototype.fileCount ||
    !evidenceOrderingPrototype.first.upperHasDecoy ||
    !evidenceOrderingPrototype.first.lowerHasRequired ||
    !evidenceOrderingPrototype.second.upperHasDecoy ||
    !evidenceOrderingPrototype.second.lowerHasRequired ||
    JSON.stringify(evidenceOrderingPrototype.first.ids) === JSON.stringify(evidenceOrderingPrototype.second.ids)
  ) {
    errors.push(
      `runtime smoke test expected randomized evidence order with answers mixed across the list: ${JSON.stringify(
        evidenceOrderingPrototype
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
    `Validated ${scenarios.length} bug scenarios and ${qaScenarios.length} QA scenarios, ${uniqueScenarioIds.length} bug work memos and test targets, ${judgementProfiles.length} judgement profiles, ${specificationReferences.length} specification references, ${allSubjects.length} categories, assignments, and environment selections, ${allSubjects.length} schedules, ${reportProcedureCount} report steps, ${reportRemarkCount} report remarks, and typing score bounds across ${validProjectIds.size} projects.`
  );
}
