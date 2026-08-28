const scenarioBank = [];

const projectEnvironments = {
  attendance: [
    { text: "Web version: 4.12.0", answer: "web version 4.12.0" },
    { text: "Google Chrome 126.0.6478.127", answer: "google chrome 126.0.6478.127" },
    { text: "Windows 11 23H2", answer: "windows 11 23h2" },
  ],
  salon: [
    { text: "Release 2026.07.2", answer: "release 2026.07.2" },
    { text: "Safari 18.5", answer: "safari 18.5" },
    { text: "macOS 15.5", answer: "macos 15.5" },
  ],
  ec: [
    { text: "Storefront v8.4.2", answer: "storefront v8.4.2" },
    { text: "Google Chrome 126.0.6478.127", answer: "google chrome 126.0.6478.127" },
    { text: "Windows 11 23H2", answer: "windows 11 23h2" },
  ],
  inventory: [
    { text: "Client 5.7.0 (Build 1842)", answer: "client 5.7.0 build 1842" },
    { text: "Microsoft Edge 126.0.2592.102", answer: "microsoft edge 126.0.2592.102" },
    { text: "Windows 10 22H2", answer: "windows 10 22h2" },
  ],
  mobile: [
    { text: "App 3.4.0 (34018)", answer: "app 3.4.0 34018" },
    { text: "iOS 18.5", answer: "ios 18.5" },
    { text: "iPhone 15", answer: "iphone 15" },
  ],
  automotive: [
    { text: "ECU Software: v5.12.3", answer: "ecu software v5.12.3" },
    { text: "Hardware Rev: C", answer: "hardware rev c" },
    { text: "Vehicle profile: TEST-02", answer: "vehicle profile test-02" },
  ],
  "automotive-multimedia": [
    { text: "IVI Software: v3.8.0", answer: "ivi software v3.8.0" },
    { text: "Display Unit Rev: D", answer: "display unit rev d" },
    { text: "Vehicle profile: MM-04", answer: "vehicle profile mm-04" },
  ],
  payment: [
    { text: "API version: 2024-06-20", answer: "api version 2024-06-20" },
    { text: "Environment: Sandbox", answer: "environment sandbox" },
    { text: "Gateway build: 7.18.4", answer: "gateway build 7.18.4" },
  ],
  medical: [
    { text: "Client version: 4.8.2", answer: "client version 4.8.2" },
    { text: "Database schema: 2026.07", answer: "database schema 2026.07" },
    { text: "Windows 11 Enterprise 23H2", answer: "windows 11 enterprise 23h2" },
  ],
};

const projectEnvironmentChoices = {
  customer: {
    versions: ["App version: 2.3.1", "Web release: 2026.07.24", "Build 2.3.1-20260724.1"],
    configurations: [
      "Google Chrome 126.0.6478.127 / Windows 11 23H2",
      "Microsoft Edge 126.0.2592.102 / Windows 11 23H2",
      "Firefox 128.0 / macOS 15.5",
    ],
  },
  attendance: {
    versions: ["Web version: 4.11.2", "Web version: 4.12.0", "Web version: 4.12.1"],
    configurations: [
      "Google Chrome 125.0.6422.142 / Windows 10 22H2",
      "Google Chrome 126.0.6478.127 / Windows 11 23H2",
      "Microsoft Edge 126.0.2592.102 / Windows 11 23H2",
    ],
  },
  salon: {
    versions: ["Release 2026.06.3", "Release 2026.07.1", "Release 2026.07.2"],
    configurations: ["Safari 18.4 / macOS 15.4", "Safari 18.5 / macOS 15.5", "Google Chrome 126.0.6478.127 / macOS 15.5"],
  },
  ec: {
    versions: ["Storefront v8.3.9", "Storefront v8.4.1", "Storefront v8.4.2"],
    configurations: [
      "Google Chrome 126.0.6478.127 / Windows 11 23H2",
      "Microsoft Edge 126.0.2592.102 / Windows 11 23H2",
      "Safari 18.5 / macOS 15.5",
    ],
  },
  inventory: {
    versions: ["Client 5.6.8 (Build 1791)", "Client 5.7.0 (Build 1842)", "Client 5.7.1 (Build 1856)"],
    configurations: [
      "Microsoft Edge 125.0.2535.92 / Windows 10 22H2",
      "Microsoft Edge 126.0.2592.102 / Windows 10 22H2",
      "Google Chrome 126.0.6478.127 / Windows 11 23H2",
    ],
  },
  mobile: {
    versions: ["App 3.3.2 (33204)", "App 3.4.0 (34018)", "App 3.4.1 (34103)"],
    configurations: [
      "iOS 18.4 / iPhone 14",
      "iOS 18.5 / iPhone 15",
      "iOS 18.5 / iPhone 16",
      "Android 15 / Pixel 9",
    ],
  },
  automotive: {
    versions: ["ECU Software: v5.11.8", "ECU Software: v5.12.3", "ECU Software: v5.13.0"],
    configurations: [
      "Hardware Rev: B / Vehicle profile: TEST-01",
      "Hardware Rev: C / Vehicle profile: TEST-02",
      "Hardware Rev: C / Vehicle profile: TEST-03",
    ],
  },
  "automotive-multimedia": {
    versions: ["IVI Software: v3.7.4", "IVI Software: v3.8.0", "IVI Software: v3.8.1"],
    configurations: [
      "Display Unit Rev: C / Vehicle profile: MM-03",
      "Display Unit Rev: D / Vehicle profile: MM-04",
      "Display Unit Rev: D / Vehicle profile: MM-05",
    ],
  },
  payment: {
    versions: ["API version: 2024-03-15", "API version: 2024-06-20", "API version: 2025-01-10"],
    configurations: [
      "Environment: Sandbox / Gateway build: 7.17.9",
      "Environment: Sandbox / Gateway build: 7.18.4",
      "Environment: Staging / Gateway build: 7.18.4",
    ],
  },
  medical: {
    versions: ["Client version: 4.7.9", "Client version: 4.8.2", "Client version: 4.8.3"],
    configurations: [
      "Database schema: 2026.06 / Windows 11 Enterprise 23H2",
      "Database schema: 2026.07 / Windows 11 Enterprise 23H2",
      "Database schema: 2026.07 / Windows 10 Enterprise 22H2",
    ],
  },
};

const environmentLabelRules = [
  [/^ECU Software$/i, "ECUソフトウェア"],
  [/^IVI Software$/i, "IVIソフトウェア"],
  [/^Hardware Rev$/i, "ハードウェア"],
  [/^Display Unit Rev$/i, "ディスプレイユニット"],
  [/^Vehicle profile$/i, "車両プロファイル"],
  [/^(App|Web|Client) version$/i, "ソフトウェア"],
  [/^Release$/i, "リリース"],
  [/^Storefront$/i, "ストアフロント"],
  [/^Build$/i, "ビルド"],
  [/^API version$/i, "APIバージョン"],
  [/^Environment$/i, "実行環境"],
  [/^Gateway build$/i, "Gatewayビルド"],
  [/^Database schema$/i, "DBスキーマ"],
];

function getScenarioAuthoringProfile(scenarioId) {
  return window.TYPING_WORKBENCH_SCENARIO_AUTHORING?.[scenarioId]
    || window.TYPING_WORKBENCH_QA_SCENARIO_AUTHORING?.[scenarioId]
    || null;
}

function getScenarioBriefingProfile(scenarioId) {
  return window.TYPING_WORKBENCH_SCENARIO_BRIEFINGS?.[scenarioId]
    || window.TYPING_WORKBENCH_QA_SCENARIO_BRIEFINGS?.[scenarioId]
    || null;
}

function getScenarioSpecificationReference(rawScenario) {
  return getScenarioAuthoringProfile(rawScenario.scenarioId)?.specificationReference || "";
}

function getScenarioSpecificationDetails(rawScenario) {
  const specificationContent = getScenarioAuthoringProfile(rawScenario.scenarioId)
    ?.specificationContent || [];
  return specificationContent
    .map((text) => text?.trim())
    .filter(Boolean);
}

scenarioBank.push(
  ...Object.values(window.TYPING_WORKBENCH_SCENARIO_AUTHORING || {}).map(
    ({ scenario }) => scenario
  ),
  ...(window.TYPING_WORKBENCH_QA_SCENARIOS || [])
);

const projectCatalog = [
  {
    id: "customer",
    name: "顧客管理システム",
    level: "初級",
    testTargetImage: "./assets/images/test-targets/customer-management.webp",
    members: [
      { id: "kyakuno", name: "客野 迎", role: "顧客問い合わせ" },
      { id: "madoguchi", name: "窓口 結", role: "顧客管理業務" },
      { id: "kikuta", name: "聞田 応", role: "品質検証" },
      { id: "tsunagi", name: "繋木 円", role: "画面・検索機能" },
    ],
  },
  {
    id: "attendance", name: "勤怠管理システム", level: "初級",
    testTargetImage: "./assets/images/test-targets/attendance-management.webp",
    members: [
      { id: "tokito", name: "時任 勤", role: "勤怠業務担当" },
      { id: "yasuda", name: "休田 憩", role: "労務QA" },
      { id: "uchikoshi", name: "打越 刻", role: "打刻機能担当" },
      { id: "hayaoki", name: "早起 朝子", role: "品質検証" },
    ],
  },
  {
    id: "salon", name: "美容室予約システム", level: "初級",
    testTargetImage: "./assets/images/test-targets/salon-booking.webp",
    members: [
      { id: "kamino", name: "髪野 美咲", role: "予約運用担当" },
      { id: "hasamida", name: "鋏田 切子", role: "スタイリスト連携担当" },
      { id: "kagami", name: "鏡 美照", role: "UIデザイナー" },
      { id: "soroi", name: "揃井 梢", role: "品質保証担当" },
    ],
  },
  {
    id: "ec", name: "ECサイト", level: "中級",
    testTargetImage: "./assets/images/test-targets/ecommerce.webp",
    members: [
      { id: "kagotani", name: "籠谷 買", role: "カート・注文機能" },
      { id: "haishima", name: "配島 迅", role: "物流連携担当" },
      { id: "urino", name: "売野 伸", role: "商品管理担当" },
      { id: "warita", name: "割田 得", role: "販促機能担当" },
    ],
  },
  {
    id: "inventory", name: "在庫管理システム", level: "中級",
    testTargetImage: "./assets/images/test-targets/inventory-management.webp",
    members: [
      { id: "kuramoto", name: "倉本 在", role: "倉庫業務担当" },
      { id: "tanahashi", name: "棚橋 数馬", role: "在庫数管理" },
      { id: "nimotsu", name: "荷持 守", role: "入出庫機能担当" },
      { id: "kazuae", name: "数合 正", role: "データ品質担当" },
    ],
  },
  {
    id: "mobile", name: "スマホアプリ", level: "中級",
    testTargetImage: "./assets/images/test-targets/mobile-app.webp",
    members: [
      { id: "yubisaki", name: "指先 滑", role: "iOS機能" },
      { id: "gamen", name: "画面 回", role: "Android画面機能" },
      { id: "otoha", name: "通知 響", role: "プッシュ通知担当" },
      { id: "hashiru", name: "走井 軽", role: "モバイルQA" },
    ],
  },
  {
    id: "automotive", name: "車載ソフト", level: "上級",
    testTargetImage: "./assets/images/test-targets/automotive-software.webp",
    members: [
      { id: "kurumatani", name: "車谷 走", role: "車両システム連携" },
      { id: "hayami", name: "速水 駆", role: "走行制御担当" },
      { id: "wajima", name: "輪島 操", role: "HMI担当" },
      { id: "michigami", name: "道上 守", role: "機能安全担当" },
    ],
  },
  {
    id: "automotive-multimedia", name: "車載マルチメディア", level: "上級",
    testTargetImage: "./assets/images/test-targets/automotive-multimedia.webp",
    members: [
      { id: "michibe", name: "道辺 案", role: "ナビゲーション担当" },
      { id: "otowa", name: "音羽 奏", role: "オーディオ・Bluetooth担当" },
      { id: "kurumado", name: "車戸 連", role: "車両連携担当" },
      { id: "mamoriya", name: "守屋 安", role: "先進安全HMI担当" },
    ],
  },
  {
    id: "payment", name: "決済システム", level: "上級",
    testTargetImage: "./assets/images/test-targets/payment-system.webp",
    members: [
      { id: "kinjo", name: "金城 決", role: "決済・売上計上" },
      { id: "haraikawa", name: "払川 済", role: "加盟店連携担当" },
      { id: "tsuburaya", name: "円谷 信", role: "与信機能担当" },
      { id: "modorikawa", name: "戻川 返", role: "返金機能担当" },
    ],
  },
  {
    id: "medical", name: "医療システム", level: "上級",
    testTargetImage: "./assets/images/test-targets/medical-system.webp",
    members: [
      { id: "yakushiji", name: "薬師寺 治", role: "医療安全担当" },
      { id: "shinno", name: "診野 守", role: "臨床検証担当" },
      { id: "kenmi", name: "検見 結", role: "検査連携担当" },
      { id: "karute", name: "軽部 記", role: "電子カルテ担当" },
    ],
  },
];

const sessionLength = 60;
const chartSampleIntervalMs = 100;

const typingVariantGroups = [
  ["sha", "sya"],
  ["shu", "syu"],
  ["sho", "syo"],
  ["she", "sye"],
  ["cha", "cya", "tya"],
  ["chu", "cyu", "tyu"],
  ["cho", "cyo", "tyo"],
  ["che", "cye", "tye"],
  ["ja", "jya", "zya"],
  ["ju", "jyu", "zyu"],
  ["jo", "jyo", "zyo"],
  ["je", "jye", "zye"],
  ["shi", "si"],
  ["ji", "zi"],
  ["chi", "ti"],
  ["tsu", "tu"],
  ["fu", "hu"],
  ["kwa", "qa"],
  ["menu-", "menyuu"],
  ["yu-za-", "yuuzaa"],
  ["de-ta", "deeta"],
  ["me-ta-", "meetaa"],
  ["ka-do", "kaado"],
  ["fo-mu", "foomu"],
  ["era-", "eraa"],
];

function expandTypingAnswers(answers = []) {
  const seen = new Set();
  const queue = answers.map((answer) => normalizeAnswerNSpelling(answer.replace(/\s+/g, "")));

  while (queue.length > 0) {
    const current = queue.pop();
    if (seen.has(current)) {
      continue;
    }

    seen.add(current);

    for (const group of typingVariantGroups) {
      for (const source of group) {
        if (!current.includes(source)) {
          continue;
        }

        for (const replacement of group) {
          if (replacement === source) {
            continue;
          }

          const swapped = current.split(source).join(replacement);
          if (!seen.has(swapped)) {
            queue.push(swapped);
          }
        }
      }
    }

  }

  return [...seen].sort((left, right) => left.length - right.length);
}

function normalizeAnswerNSpelling(value) {
  return value.replace(/n+/g, (run, offset) => {
    const nextCharacter = value[offset + run.length] || "";
    if (/[aeiouy]/.test(nextCharacter)) {
      return run.length >= 2 ? "nn" : "n";
    }
    return "n";
  });
}

const scenarioEvidenceProfiles = [
  {
    match: /保存ボタンを連続クリック.*顧客データが重複登録/,
    folder: "PC > ドキュメント > BugEvidence > CR-20260729",
    requiredIds: ["network-har", "duplicate-screen", "database-export"],
    files: [
      {
        id: "network-har",
        name: "customer_register_103015.har",
        icon: "🌐",
        type: "HTTP Archive",
        size: "84 KB",
        createdAt: "2026/07/29 10:30:15",
        modifiedAt: "2026/07/29 10:30:16",
        source: "Firefox 開発ツール",
        environment: "Build 2.3.1-20260724.1 / Firefox 128.0",
        summary: "保存操作直後の顧客登録API通信。412ms以内に3件のPOSTが成功している。",
        previewKind: "har",
        preview: [
          "10:30:15.184  POST /api/customers  201  request-id: req-a81f",
          "10:30:15.391  POST /api/customers  201  request-id: req-a820",
          "10:30:15.596  POST /api/customers  201  request-id: req-a821",
          "payload.name: 山田 テスト / payload.tel: 090-0000-0000",
        ],
        resultReason: "同じ入力内容の登録要求が短時間に3回成功したことを示している。",
      },
      {
        id: "duplicate-screen",
        name: "duplicate_customer_rows_103018.png",
        icon: "🖼️",
        type: "PNG 画像",
        size: "196 KB",
        createdAt: "2026/07/29 10:30:18",
        modifiedAt: "2026/07/29 10:30:18",
        source: "Firefox 画面キャプチャ",
        environment: "Build 2.3.1-20260724.1 / Firefox 128.0",
        summary: "顧客一覧に同じ氏名・電話番号のデータが異なるIDで3件表示されている。",
        previewKind: "table",
        preview: [
          ["C-3012", "山田 テスト", "090-0000-0000", "10:30:15"],
          ["C-3013", "山田 テスト", "090-0000-0000", "10:30:15"],
          ["C-3014", "山田 テスト", "090-0000-0000", "10:30:15"],
        ],
        resultReason: "利用者が確認できる重複登録結果と、異なる顧客IDの採番を示している。",
      },
      {
        id: "database-export",
        name: "customer_rows_103020.csv",
        icon: "📊",
        type: "CSV ファイル",
        size: "2 KB",
        createdAt: "2026/07/29 10:30:20",
        modifiedAt: "2026/07/29 10:30:20",
        source: "検証DB 読み取り専用クエリ",
        environment: "customer_test / schema 2.3.1",
        summary: "保存後のcustomerテーブルから対象電話番号で抽出した3行。",
        previewKind: "csv",
        preview: [
          "customer_id,name,tel,created_at",
          "C-3012,山田 テスト,090-0000-0000,2026-07-29 10:30:15.201",
          "C-3013,山田 テスト,090-0000-0000,2026-07-29 10:30:15.407",
          "C-3014,山田 テスト,090-0000-0000,2026-07-29 10:30:15.612",
        ],
        resultReason: "画面上だけでなく、DBへ3件が永続化されたことを示している。",
      },
      {
        id: "normal-server-log",
        name: "customer_api_094800.log",
        icon: "📄",
        type: "LOG ファイル",
        size: "18 KB",
        createdAt: "2026/07/29 09:48:00",
        modifiedAt: "2026/07/29 09:48:03",
        source: "顧客APIサーバー",
        environment: "Build 2.3.1-20260724.1 / Chrome 126",
        summary: "同日09:48に行った通常登録のログ。保存要求は1回だけで正常終了している。",
        previewKind: "log",
        preview: [
          "09:48:01.022 INFO  POST /api/customers request-id=req-771a",
          "09:48:01.119 INFO  INSERT customer_id=C-2988",
          "09:48:01.154 INFO  response=201 duration=132ms",
        ],
        resultReason: "発生時刻と操作条件が異なり、今回の重複登録を証明しない。",
      },
      {
        id: "search-screen",
        name: "customer_search_zero_results_102200.png",
        icon: "🖼️",
        type: "PNG 画像",
        size: "142 KB",
        createdAt: "2026/07/29 10:22:00",
        modifiedAt: "2026/07/29 10:22:00",
        source: "Microsoft Edge 画面キャプチャ",
        environment: "Web release 2026.07.24 / Edge 126",
        summary: "存在しない氏名を検索した際の顧客一覧画面。別の検索不具合を確認した画像。",
        previewKind: "search",
        preview: ["検索条件: ZZZZZZ", "検索結果: 248件", "キャプチャ時刻: 10:22:00"],
        resultReason: "別の検索不具合の画像で、保存ボタン連続クリックとの関係がない。",
      },
    ],
  },
  ...(window.TYPING_WORKBENCH_EVIDENCE_PROFILES || []),
];

function getScenarioEvidenceProfile(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  const normalizedSubject = subject.replace(/ことがある$/, "");
  return scenarioEvidenceProfiles.find(
    (profile) =>
      profile.subject?.replace(/ことがある$/, "") === normalizedSubject ||
      profile.match?.test(subject)
  ) || null;
}

function getReportSectionTitlesForTraining(level, ticketType) {
  if (level === "advanced") return null;
  if (ticketType === "qa") {
    return new Set(level === "beginner"
      ? ["■質問", "■確認した状況・事実"]
      : ["■質問", "■確認した状況・事実", "■参照情報", "■現在の解釈", "■確認理由・影響"]
    );
  }
  return new Set(level === "beginner"
    ? ["■詳細", "■期待結果", "■実際の動作"]
    : ["■詳細", "■前提条件", "■操作手順", "■期待結果", "■実際の動作"]
  );
}

function buildScenario(rawScenario, requestedTrainingLevel = "advanced") {
  let editableOrder = 1;
  const trainingLevel = ["beginner", "intermediate", "advanced"].includes(requestedTrainingLevel)
    ? requestedTrainingLevel
    : "advanced";
  const ticketType = rawScenario.ticketType || "bug";
  const specificationReference = getScenarioSpecificationReference(rawScenario);

  const subjectEntry = {
    kind: "line",
    text: rawScenario.subject.text,
    answers: expandTypingAnswers(rawScenario.subject.answers),
    order: 0,
  };

  const visibleSectionTitles = getReportSectionTitlesForTraining(trainingLevel, ticketType);
  let includeCurrentSection = visibleSectionTitles === null;
  const visibleReport = rawScenario.report.filter((entry) => {
    if (entry.kind === "section") {
      includeCurrentSection = visibleSectionTitles === null || visibleSectionTitles.has(entry.text);
    }
    return includeCurrentSection;
  });

  const reportSource = visibleReport.flatMap((entry) => {
    if (entry.kind === "section" && entry.text === "■期待結果" && specificationReference) {
      return [
        { kind: "section", text: "■仕様根拠" },
        { kind: "reference", text: specificationReference },
        entry,
      ];
    }
    return [entry];
  });

  let currentReportSection = "";
  const reportEntries = reportSource.map((entry) => {
    if (entry.kind === "section") {
      currentReportSection = entry.text;
    }
    if (entry.kind === "line") {
      const stepNumber = currentReportSection === "■操作手順"
        ? entry.text.match(/^(\d+)\.\s/)?.[1]
        : null;
      const typingAnswers = stepNumber
        ? entry.answers.map((answer) => {
            const withoutExistingStep = answer.replace(new RegExp(`^${stepNumber}\\.?`), "");
            return `${stepNumber}.${withoutExistingStep}`;
          })
        : entry.answers;
      const next = { ...entry, answers: expandTypingAnswers(typingAnswers), order: editableOrder };
      editableOrder += 1;
      return next;
    }
    return { ...entry, order: null };
  });

  const typingEntries = [subjectEntry, ...reportEntries.filter((entry) => entry.kind === "line")];
  const totalTargetTypingChars = typingEntries.reduce((sum, entry) => {
    const candidateLengths = entry.answers.map((candidate) => normalizeTypingText(candidate).length);
    const lineTarget = candidateLengths.length > 0 ? Math.max(...candidateLengths) : normalizeTypingText(entry.text).length;
    return sum + Math.max(1, lineTarget);
  }, 0);

  return {
    scenarioId: rawScenario.scenarioId,
    projectId: rawScenario.projectId,
    ticketType,
    trainingLevel,
    qaType: rawScenario.qaType || null,
    difficulty: rawScenario.difficulty || "beginner",
    evaluation: rawScenario.evaluation || buildDefaultEvaluation(rawScenario),
    evidenceProfile: getScenarioEvidenceProfile(rawScenario),
    subjectEntry,
    reportEntries,
    typingEntries,
    totalEditableLines: typingEntries.length,
    totalTargetTypingChars,
  };
}

const projectCategoryDefaults = {
  customer: "ui",
  attendance: "workflow",
  salon: "workflow",
  ec: "workflow",
  inventory: "workflow",
  mobile: "ui",
  automotive: "api",
  "automotive-multimedia": "ui",
  payment: "api",
  medical: "api",
};

const scenarioCategoryRules = {
  customer: [
    [/右クリック|メニュー/, "ui"],
    [/検索|氏名/, "input"],
    [/保存ボタン|重複登録/, "workflow"],
    [/退会済み.*2ページ/, "input"],
    [/CSV取込/, "workflow"],
  ],
  attendance: [[/退勤|休憩|打刻|残業/, "workflow"]],
  salon: [[/予約|キャンセル/, "workflow"]],
  ec: [
    [/決済通知|注文API/, "api"],
    [/在庫切れ|税込価格|端数/, "workflow"],
    [/クーポン/, "workflow"],
    [/カートから商品を削除/, "workflow"],
  ],
  inventory: [
    [/在庫数を超える|出庫数を登録/, "input"],
    [/ロット|同時出庫|在庫数がマイナス/, "workflow"],
    [/在庫移動/, "workflow"],
    [/棚卸.*出荷API/, "api"],
  ],
  mobile: [
    [/画面回転|プッシュ通知から開く|別のお知らせ/, "ui"],
    [/バックグラウンド|同期データ/, "api"],
    [/ダークモード/, "ui"],
    [/端末トークン|再登録/, "api"],
    [/別アカウント|未送信下書き/, "api"],
  ],
  automotive: [
    [/速度表示/, "ui"],
    [/速度単位/, "ui"],
    [/CAN|Bus-Off/, "api"],
    [/ウインカー/, "ui"],
  ],
  "automotive-multimedia": [
    [/ナビ|案内|オーディオ|音量/, "ui"],
    [/先進安全|車線逸脱|車両状態|CAN|信号/, "api"],
    [/後方カメラ|着信/, "ui"],
  ],
  payment: [[/決済|返金|冪等キー|与信|タイムアウト/, "api"]],
  medical: [
    [/別の患者/, "ui"],
    [/患者サマリー/, "ui"],
    [/投薬量|単位変換/, "workflow"],
    [/検査結果の再送|重複登録/, "api"],
    [/生年月日.*患者.*検索/, "input"],
  ],
};

function getScenarioCategory(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  const matchedRule = (scenarioCategoryRules[rawScenario.projectId] || [])
    .find(([pattern]) => pattern.test(subject));
  return matchedRule?.[1] || projectCategoryDefaults[rawScenario.projectId] || "ui";
}

const projectAssignmentDefaults = {
  customer: { assignee: "tsunagi", watchers: ["kikuta"] },
  attendance: { assignee: "uchikoshi", watchers: ["yasuda"] },
  salon: { assignee: "kamino", watchers: ["soroi"] },
  ec: { assignee: "kagotani", watchers: ["urino"] },
  inventory: { assignee: "nimotsu", watchers: ["tanahashi"] },
  mobile: { assignee: "gamen", watchers: ["hashiru"] },
  automotive: { assignee: "wajima", watchers: ["michigami"] },
  "automotive-multimedia": { assignee: "kurumado", watchers: ["mamoriya"] },
  payment: { assignee: "kinjo", watchers: ["haraikawa"] },
  medical: { assignee: "kenmi", watchers: ["yakushiji"] },
};

function getScenarioAssignment(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  const projectId = rawScenario.projectId;
  const rules = {
    customer: [
      [/検索|氏名/, { assignee: "tsunagi", watchers: ["kyakuno"] }],
      [/右クリック|メニュー/, { assignee: "tsunagi", watchers: ["kikuta"] }],
    ],
    attendance: [
      [/打刻|退勤/, { assignee: "uchikoshi", watchers: ["yasuda"] }],
      [/休憩|残業/, { assignee: "tokito", watchers: ["yasuda"] }],
    ],
    ec: [
      [/税込|端数/, { assignee: "urino", watchers: ["warita"] }],
      [/在庫切れ|カート/, { assignee: "kagotani", watchers: ["urino"] }],
    ],
    inventory: [
      [/出庫|在庫数/, { assignee: "nimotsu", watchers: ["tanahashi"] }],
      [/ロット|期限/, { assignee: "kuramoto", watchers: ["tanahashi"] }],
    ],
    mobile: [
      [/通知/, { assignee: "otoha", watchers: ["yubisaki"] }],
      [/画面回転/, { assignee: "gamen", watchers: ["hashiru"] }],
      [/バックグラウンド|同期データ/, { assignee: "yubisaki", watchers: ["hashiru"] }],
    ],
    automotive: [
      [/速度表示|メーター/, { assignee: "wajima", watchers: ["michigami"] }],
      [/CAN|Bus-Off/, { assignee: "kurumatani", watchers: ["michigami"] }],
    ],
    "automotive-multimedia": [
      [/ナビ|案内/, { assignee: "michibe", watchers: ["otowa"] }],
      [/オーディオ|音量|Bluetooth/, { assignee: "otowa", watchers: ["mamoriya"] }],
      [/先進安全|車線逸脱|車両状態|CAN|信号/, { assignee: "kurumado", watchers: ["mamoriya"] }],
    ],
    payment: [
      [/返金/, { assignee: "modorikawa", watchers: ["kinjo"] }],
      [/与信|タイムアウト/, { assignee: "tsuburaya", watchers: ["kinjo"] }],
    ],
    medical: [
      [/投薬量|処方/, { assignee: "yakushiji", watchers: ["shinno"] }],
      [/検査結果|患者/, { assignee: "kenmi", watchers: ["yakushiji"] }],
    ],
  };
  const matchedRule = (rules[projectId] || []).find(([pattern]) => pattern.test(subject));
  const assignment = matchedRule?.[1]
    || projectAssignmentDefaults[projectId]
    || { assignee: "", watchers: [] };
  return {
    ...assignment,
    watchers: [...new Set([assignment.assignee, ...(assignment.watchers || [])])].filter(Boolean),
  };
}

function getRawScenarioSectionLines(rawScenario, sectionName) {
  const entries = rawScenario.report || [];
  const sectionIndex = entries.findIndex((entry) => entry.kind === "section" && entry.text === sectionName);
  if (sectionIndex < 0) {
    return [];
  }
  const lines = [];
  for (let index = sectionIndex + 1; index < entries.length && entries[index].kind !== "section"; index += 1) {
    lines.push(entries[index].text);
  }
  return lines;
}

function getRawScenarioSection(rawScenario, sectionName) {
  return getRawScenarioSectionLines(rawScenario, sectionName).join(" ");
}

function joinFieldReportLines(lines) {
  return lines.reduce((joined, line) => {
    const current = trimJapanesePeriod(line);
    if (!joined) {
      return current;
    }
    const separator = /(?:と|すると|では|が|ため|かかわらず)$/.test(joined) ? "、" : "。";
    return `${joined}${separator}${current}`;
  }, "");
}

function getScenarioEnvironmentSelection(rawScenario) {
  const briefingEnvironment = getScenarioBriefingProfile(rawScenario.scenarioId)?.environment;
  const environmentLines = Array.isArray(briefingEnvironment)
    ? briefingEnvironment.map((text) => ({ text }))
    : rawScenario.environment || [];
  return {
    version: environmentLines[0]?.text || "",
    environment: environmentLines.slice(1).map((entry) => entry.text).join(" / "),
    facts: formatEnvironmentFacts(environmentLines.map((entry) => entry.text)),
  };
}

const scenarioIncidentalNotes = [
  [/右クリック/, "報告者は午前中にマウスの電池を交換しています。交換後も別画面の右クリックは使えており、この件との関連は分かっていません"],
  [/存在しない氏名/, "前日に顧客CSVを取り込み、登録件数は248件になっています。取込処理自体は正常終了しています"],
  [/保存ボタンを連続クリック/, "応答が遅く感じたため3回押したとのことです。同じ時間帯の社内ネットワーク監視には異常がありません"],
  [/退勤時刻.*翌日の18:00/, "対象者は先月まで夜勤チームに所属していましたが、今回登録した勤務は日勤です"],
  [/日をまたぐ休憩時間/, "休憩中に一度ブラウザを閉じています。自動保存された入力値は再ログイン後も残っていました"],
  [/月末処理中の同時打刻/, "端末AとBは機種が違いますが、どちらも時刻同期済みです。当日の食堂打刻は正常でした"],
  [/予約済みの時間帯/, "2人目の顧客は初回来店で、クーポンを選択していました。料金計算には問題がありません"],
  [/予約をキャンセル/, "キャンセル通知メールは顧客へ1通だけ届いています。メール送信処理との関連は分かっていません"],
  [/同時予約/, "片方の端末だけダークモードでした。画面テーマをそろえても発生条件は変わりませんでした"],
  [/在庫切れの商品/, "対象商品は前日に商品画像を差し替えています。在庫APIが返す数量は差し替え前後とも0です"],
  [/税込価格の端数/, "商品Bだけ説明文に全角記号を含みます。説明文を削除しても価格表示は変わりませんでした"],
  [/決済通知.*再送/, "再送は決済事業者の検証画面から行いました。通知メールは1通だけで、メール側に重複はありません"],
  [/在庫数を超える出庫数/, "対象倉庫では同日に棚卸を予定していましたが、現時点では棚卸処理を開始していません"],
  [/期限切れのロット/, "倉庫端末の表示言語は日本語です。英語表示へ変更しても候補順は同じでした"],
  [/同時出庫/, "端末BはWi-Fi接続、端末Aは有線接続です。どちらの要求もサーバーには届いています"],
  [/画面回転/, "端末の文字サイズは標準より一段階大きく設定されています。標準サイズでも同じ現象を確認しています"],
  [/通知から開く/, "通知音とバッジ件数は正しく更新されています。アプリ内一覧から開く場合は正しいお知らせが表示されます"],
  [/バックグラウンド復帰/, "端末の空き容量は42GBありました。写真アプリも同時に開いていましたが、ストレージ警告は出ていません"],
  [/速度表示/, "オーディオ再生とナビ案内は同時に動作していましたが、どちらを停止しても表示遅延は変わりませんでした"],
  [/CAN信号.*DBC定義/, "同じフレーム内の1バイト信号は正しく表示されています。問題が見えるのは複数バイトの対象信号です"],
  [/Bus-Off/, "計測PCの省電力設定は無効です。別のCANチャンネルでは同じ時間帯も通信が継続していました"],
  [/決済失敗時/, "顧客へ決済完了メールは送信されていません。加盟店の日次売上画面だけに金額が現れています"],
  [/同じ冪等キー/, "2回目の要求時だけAPIクライアントの画面幅を変えています。送信したJSON本文は同一です"],
  [/タイムアウト後/, "検証カードのブランド表示はVISAです。別ブランドでもタイムアウト自体は発生しました"],
  [/別の患者の検査結果/, "患者Aと患者Bは同じ診療科ですが担当医は異なります。両者の氏名は似ていません"],
  [/体重の単位変換/, "検証端末の表示倍率は125%です。倍率を100%に戻しても計算値は変わりませんでした"],
  [/検査結果.*再送/, "再送時に検査装置の画面テーマが切り替わっていますが、連携メッセージの内容は初回と同じです"],
  [/最終ページ.*最後の1件を削除/, "削除対象の顧客には関連履歴がなく、削除処理自体は正常終了しています"],
  [/打刻修正を承認/, "修正申請には理由を入力しており、承認履歴にも同じ理由が保存されています"],
  [/指名なし予約の自動割当/, "顧客はクーポンを使用していません。料金計算と通知メールは正常でした"],
  [/署名ヘッダー名が小文字/, "検証時の接続元IPと通知本文は成功時と同一で、署名値も一致しています"],
  [/ロット番号をCSV出力/, "対象ロットには商品画像が登録されていますが、PDF出力では画像の有無にかかわらず番号が保持されます"],
  [/通知許可を再度オン/, "端末の省電力モードは無効で、同じ時間帯のアプリ内お知らせは取得できています"],
  [/ローリングカウンタが15から0/, "計測中のバス負荷は28%で、同じフレームのデータ値とチェックサムは正常でした"],
  [/ハンズフリー通話終了後.*音声案内/, "通話中のルート線と自車位置更新は正常で、案内音声だけが復帰しませんでした"],
  [/オーディオ音量が最大値/, "音量異常の発生時も選局中の放送局と再生位置は保持されていました"],
  [/車線逸脱警報をOFF/, "同じ画面にある車間距離設定は車両ECUへ正しく反映されていました"],
  [/右後席ドア.*閉状態/, "運転席と左後席ドアの開閉状態は同じ試験中も正しく更新されていました"],
  [/返金WebhookがAPI応答より先/, "検証用カードのブランドを変えてもイベントの到着順と状態遷移は同じでした"],
  [/ng\/dLをμg\/Lへ換算/, "検査装置の表示言語は日本語ですが、英語へ変更しても受信値と単位は同一でした"],
  [/退会済みを除外.*2ページ目/, "確認に使用した顧客名には同姓同名が含まれていますが、ステータス条件を再指定すると表示対象は正しく戻りました"],
  [/休憩時間を修正.*日次勤務合計/, "休憩理由の備考欄も同時に変更しましたが、備考だけを変更した場合は勤務合計に影響しませんでした"],
  [/数量を変更.*クーポン/, "商品の配送方法は通常便のままで、数量変更の前後に配送先と会員ランクは変えていません"],
  [/在庫移動.*移動先ロケーション/, "移動伝票には備考を入力しましたが、備考なしで登録しても移動先の表示結果は同じでした"],
  [/速度単位.*平均速度/, "試験中はオーディオを停止していました。オーディオ再生中でも単位切替の結果は同じでした"],
  [/一部返金後.*返金可能額/, "返金理由には検証用の定型文を入力しました。理由を変更しても返金可能額の表示結果は同じでした"],
  [/検査結果を訂正.*患者サマリー/, "対象患者には同日の別検査結果もありますが、訂正していない検査値の表示は変わりませんでした"],
  [/出勤打刻が完了.*打刻一覧/, "対象者は同じ日に有給申請も登録していますが、有給申請の表示と出勤打刻の保存には影響していません"],
  [/予約を登録.*顧客名が空欄/, "顧客の電話番号にはハイフンが含まれていますが、別の顧客を選択しても確認画面の氏名は空欄になりました"],
  [/カートから商品を削除.*合計金額/, "削除した商品には商品画像が登録されていますが、画像のない商品でも合計金額の表示結果は同じでした"],
  [/ダークモード.*保存ボタン/, "端末の文字サイズは標準です。文字サイズを一段階大きくしても保存ボタンの配色は変わりませんでした"],
  [/右ウインカー.*矢印/, "試験車両のハザードランプでは左右両方の矢印が点滅し、メーターの照度設定も正常に変更できました"],
  [/領収書PDF.*支払金額/, "決済に使用したカードは検証用VISAです。別の検証カードでもPDFの金額欄は空欄になりました"],
  [/生年月日.*患者を検索/, "患者の氏名には外字を含みません。同じ生年月日の別患者でも検索結果は0件になりました"],
  [/ミュートを解除.*消音アイコン/, "通話機能は使用していません。ラジオとBluetoothオーディオのどちらでも消音アイコンが残りました"],
  [/顧客CSV取込.*エラー行より前/, "CSVの文字コードはUTF-8で、同じファイルの画像項目と住所項目には入力エラーがありませんでした"],
  [/予約キャンセル.*来店受付.*状態が一致しない/, "対象予約ではクーポンを使用しておらず、キャンセル通知メールと来店受付通知はそれぞれ1通送信されました"],
  [/棚卸中.*出荷API.*在庫減少/, "棚卸端末とAPIクライアントの時刻は同期済みで、対象商品以外の棚卸数量には差異がありませんでした"],
  [/別アカウント.*未送信下書き/, "端末の生体認証は無効です。認証方法をパスコードへ固定してもアカウント間の表示結果は変わりませんでした"],
  [/後退中の着信.*後方カメラ/, "着信元は連絡先登録済みの検証番号です。未登録番号からの着信でも画面優先度は同じでした"],
];

function getScenarioIncidentalNote(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  return scenarioIncidentalNotes.find(([pattern]) => pattern.test(subject))?.[1]
    || "同じ時間帯に別の確認作業も行われていますが、この事象との関連はまだ確認できていません";
}

function trimJapanesePeriod(value) {
  return String(value || "").trim().replace(/[。．.]+$/, "");
}

function buildFieldObservation(rawScenario) {
  const briefingNotes = getScenarioBriefingProfile(rawScenario.scenarioId)?.notes;
  if (Array.isArray(briefingNotes) && briefingNotes.length > 0) {
    return briefingNotes.join("\n\n");
  }
  return "このシナリオの現場メモはまだ設定されていません。管理者へ連絡してください。";
}

function getScenarioTestTarget(rawScenario) {
  return getScenarioBriefingProfile(rawScenario.scenarioId)?.testTarget
    || "対象機能の動作をテストしています。";
}

function getIntermediateComparison(scenarioId) {
  const verification = getScenarioBriefingProfile(scenarioId)?.notes?.[1] || "";
  const comparisonSentence = verification
    .split("。")
    .map((sentence) => trimJapanesePeriod(sentence))
    .find((sentence) =>
      sentence
      && !/(?:[0-9]+回|[0-9]+\/[0-9]+|再現|いずれも|毎回)/u.test(sentence)
    );
  return comparisonSentence || "";
}

function stripScenarioStepNumber(value) {
  return String(value || "").replace(/^\s*\d+[.．、):：]\s*/u, "").trim();
}

function buildIntermediateBugTestMemo(context, sectionText) {
  const precondition = sectionText("■前提条件");
  const steps = sectionText("■操作手順", "\n")
    .split("\n")
    .map(stripScenarioStepNumber)
    .filter(Boolean);
  const actual = sectionText("■実際の動作");
  return [
    context.testTarget ? `対象　${context.testTarget}` : "",
    precondition ? `開始時　${trimJapanesePeriod(precondition)}` : "",
    ...steps.map((step, index) => `操作${String(index + 1).padStart(2, "0")}　${trimJapanesePeriod(step)}`),
    actual ? `観測　${trimJapanesePeriod(actual)}` : "",
  ].filter(Boolean).join("\n");
}

function buildIntermediateQaWorkMemo(context, sectionText) {
  return [
    context.testTarget,
    sectionText("■確認した状況・事実"),
    sectionText("■確認理由・影響"),
    sectionText("■参照情報"),
    sectionText("■現在の解釈"),
  ]
    .filter(Boolean)
    .map((line) => `・${trimJapanesePeriod(line)}`)
    .join("\n");
}

function getScenarioNarrativePatternIndex(scenarioId, patternCount = 10) {
  let hash = 5381;
  for (const character of String(scenarioId || "")) {
    hash = ((hash << 5) + hash) ^ character.charCodeAt(0);
  }
  return (hash >>> 0) % patternCount;
}

function getScenarioWorkMemo(rawScenario, profile) {
  const briefing = getScenarioBriefingProfile(rawScenario.scenarioId);
  const notes = Array.isArray(briefing?.notes) ? briefing.notes : [];
  const targetIntro = String(briefing?.testTarget || "対象機能の動作をテストしています。")
    .replace(/をテストしています。$/, "のテスト中に確認した内容です。");
  const observation = notes[0] || "";
  const verification = notes[1] || "";
  const specification = notes[2] || "";
  const scope = profile?.scope || "";
  const risk = profile?.risk || "";
  const workaround = profile?.workaround || "";
  const recovery = profile?.recovery || "";
  const temporaryOperation = workaround
    .replace(/^修正までは、/, "")
    .replace(/。$/, "")
    .replace(/戻します$/, "戻す")
    .replace(/しません$/, "しない")
    .replace(/移しない$/, "移さない")
    .replace(/します$/, "する")
    .replace(/できます$/, "できる");
  const subject = String(rawScenario.subject?.text || "対象機能で想定外の結果になる");
  const patterns = [
    [
      `${targetIntro}実施した操作と確認結果は以下のとおりです。${observation}`,
      `検証データを初期状態に戻して再現確認を行いました。比較条件での確認結果もあわせて記載します。${verification}`,
      `関連仕様および確認時の補足事項は以下のとおりです。${specification}`,
      `現時点で確認できている影響範囲は次のとおりです。${scope}`,
    ],
    [
      `${targetIntro}先に関連する仕様を確認しました。${specification}`,
      `この記載を前提に、実際の画面で操作しました。${observation}`,
      `再現確認および比較確認の結果は以下のとおりです。${verification}`,
      `改修版の確認までは、${temporaryOperation}運用とします。`,
    ],
    [
      `${targetIntro}「${subject}」という問い合わせを受け、記載された条件で確認しました。`,
      observation,
      `記載された現象の再現有無を確認するため、再現確認と別条件での比較確認を実施しました。${verification}`,
      `あわせて、関連仕様および確認時の周辺情報を確認しました。${specification}`,
      `現時点で確認できている影響範囲は以下のとおりです。${scope}`,
    ],
    [
      `${targetIntro}再現確認を先に実施しました。${verification}`,
      `再現時に実施した操作と確認結果を記載します。${observation}`,
      `関連資料を確認したところ、期待動作は以下のとおりです。${specification}`,
      `事象発生後の復旧手順は以下のとおりです。${recovery}`,
    ],
    [
      `${targetIntro}事象が対象機能に限定されるかを切り分けるため、別条件との比較確認から実施しました。${verification}`,
      `続いて、比較時と同一の手順で対象機能を操作しました。${observation}`,
      `関連仕様および確認時の補足事項は以下のとおりです。${specification}`,
      `本事象が利用時に発生した場合、以下の影響が想定されます。${risk}`,
    ],
    [
      `${targetIntro}実施した操作の順に記録します。${observation}`,
      `初回確認後、検証データを初期状態に戻して再現確認と比較確認を実施しました。${verification}`,
      `現時点で確認できている影響範囲は以下のとおりです。${scope}`,
      `改修版の確認までは、${temporaryOperation}運用とします。`,
    ],
    [
      `${targetIntro}確認環境と仕様の前提を整理しました。${specification}`,
      `その後、実際の画面で操作しました。${observation}`,
      `検証データを初期状態に戻し、再現確認を実施しました。${verification}`,
      `現時点で確認できている影響範囲は以下のとおりです。${scope}`,
    ],
    [
      `${targetIntro}業務への影響を確認したところ、現時点では次の内容が考えられます。${scope}${risk}`,
      `実際に行った操作と結果は次のとおりです。${observation}`,
      `事象の発生条件を確認するため、再現確認と正常に動作する条件との比較を実施しました。${verification}`,
      `関連資料と周辺情報も確認済みです。${specification}`,
    ],
    [
      `${targetIntro}暫定対応として、現在は${temporaryOperation}運用で確認作業を継続しています。`,
      `この対応を行うきっかけとなった現象は以下のとおりです。${observation}`,
      `再現確認および比較確認の結果は以下のとおりです。${verification}`,
      `関連資料で期待動作と補足情報を確認したところ、以下の記載がありました。${specification}`,
    ],
    [
      `${targetIntro}追加確認を依頼するため、現時点の実施内容を残します。`,
      `実際の操作と結果は次のとおりでした。${observation}`,
      `再現確認および比較確認の結果は以下のとおりです。${verification}`,
      `関連仕様および確認時の補足事項は以下のとおりです。${specification}`,
      `事象発生後に行った復旧操作は以下のとおりです。${recovery}`,
    ],
  ];
  return patterns[
    getScenarioNarrativePatternIndex(rawScenario.scenarioId, patterns.length)
  ].filter(Boolean).join("\n\n");
}

function getScenarioJudgementProfile(rawScenario) {
  const authoredProfile = getScenarioAuthoringProfile(rawScenario.scenarioId)?.judgement;
  if (authoredProfile) {
    return authoredProfile;
  }
  return null;
}

function formatJapaneseDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

function formatPeripheralSchedule(value) {
  return String(value || "")
    .replace(/受入後すぐに(.+?)を実施します$/u, "受入後すぐに$1を実施")
    .replace(/受入後に(.+?)を実施します$/u, "受入後に$1を実施")
    .replace(/決定します/u, "決定")
    .replace(/必要があります$/u, "必要")
    .replace(/必要です$/u, "必要")
    .replace(/未定です$/u, "未定")
    .replace(/[。．]+$/u, "")
    .replace(/。(?=\S)/gu, "。\n");
}

function getScenarioSchedule(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  const today = getLocalDateInputValue();
  const dateAfter = (days) => addCalendarDays(today, days);

  if (/別の患者|投薬量/.test(subject)) {
    const dueDate = dateAfter(0);
    return {
      dueDate,
      priority: "urgent",
      text: `修正版受入期限：${formatJapaneseDate(dueDate)}。受入後すぐに医療安全確認を実施`,
    };
  }

  if (/決済失敗|決済通知|冪等キー/.test(subject)) {
    const dueDate = dateAfter(1);
    const releaseDate = dateAfter(4);
    return {
      dueDate,
      priority: "urgent",
      text: `緊急リリース予定：${formatJapaneseDate(releaseDate)}。修正版受入期限：${formatJapaneseDate(dueDate)}`,
    };
  }

  if (/速度表示/.test(subject)) {
    const dueDate = dateAfter(1);
    const retestDate = dateAfter(3);
    return {
      dueDate,
      priority: "high",
      text: `法規適合の再試験開始：${formatJapaneseDate(retestDate)}。修正版受入期限：${formatJapaneseDate(dueDate)}`,
    };
  }

  if (/Bus-Off|バックグラウンド復帰|同時出庫|月末の同時打刻/.test(subject)) {
    const dueDate = dateAfter(3);
    const retestDate = dateAfter(4);
    return {
      dueDate,
      priority: "high",
      text: `再試験開始：${formatJapaneseDate(retestDate)}。修正版受入期限：${formatJapaneseDate(dueDate)}`,
    };
  }

  if (/退勤時刻|休憩時間/.test(subject)) {
    const dueDate = dateAfter(3);
    const closingDate = dateAfter(6);
    return {
      dueDate,
      priority: "high",
      text: `給与締め処理：${formatJapaneseDate(closingDate)}。修正版受入期限：${formatJapaneseDate(dueDate)}`,
    };
  }

  if (/右クリック|存在しない氏名|税込価格|画面回転/.test(subject)) {
    const triageDate = dateAfter(2);
    return {
      dueDate: "",
      priority: "normal",
      text: `バグ判定会：${formatJapaneseDate(triageDate)}。修正期限：未定`,
    };
  }

  if (/予約|カート|在庫数を超える|期限切れ|CAN信号|タイムアウト|検査結果.*再送/.test(subject)) {
    const dueDate = dateAfter(5);
    const releaseDate = dateAfter(10);
    return {
      dueDate,
      priority: "normal",
      text: `次回リリース予定：${formatJapaneseDate(releaseDate)}。修正版受入期限：${formatJapaneseDate(dueDate)}`,
    };
  }

  const dueDate = dateAfter(5);
  return {
    dueDate,
    priority: "normal",
    text: `修正版受入期限：${formatJapaneseDate(dueDate)}。受入後に対象機能の回帰試験を実施`,
  };
}

function buildScenarioDecisionContext(rawScenario, severity, profile, schedule) {
  const environmentSelection = getScenarioEnvironmentSelection(rawScenario);
  return {
    occurredAt: `${getLocalDateInputValue()} 10:30`,
    testTarget: getScenarioTestTarget(rawScenario),
    workMemo: getScenarioWorkMemo(rawScenario, profile),
    observation: buildFieldObservation(rawScenario),
    incidental: getScenarioIncidentalNote(rawScenario),
    scope: profile?.scope || "影響対象を調査中です",
    workaround: profile?.workaround || "回避策は確認されていません",
    recovery: profile?.recovery || "復旧方法は確認されていません",
    risk: profile?.risk || "業務・安全・データへの影響を調査中です",
    specification: getScenarioSpecificationReference(rawScenario),
    schedule: schedule.text,
    environmentFacts: environmentSelection.facts,
  };
}

function buildDefaultEvaluation(rawScenario) {
  const subject = rawScenario.subject?.text || "";
  const judgementProfile = getScenarioJudgementProfile(rawScenario);
  const critical = /別の患者|投薬量|決済|売上|データが消|在庫数がマイナス/.test(subject);
  const legalRisk = ["automotive", "automotive-multimedia"].includes(rawScenario.projectId)
    && /速度|メーター|CAN|先進安全|車線逸脱|車両状態/.test(subject);
  const highImpact = critical || legalRisk || /二重|重複|登録でき|同期データ/.test(subject);
  const difficulty = rawScenario.difficulty || "beginner";
  const severity = judgementProfile?.severity
    || (critical ? "s1" : highImpact ? "s2" : difficulty === "advanced" ? "s2" : difficulty === "intermediate" ? "s3" : "s4");
  const schedule = getScenarioSchedule(rawScenario);
  const assignment = getScenarioAssignment(rawScenario);
  const environmentSelection = getScenarioEnvironmentSelection(rawScenario);

  return {
    tracker: "bug",
    severity,
    priority: schedule.priority,
    status: "new",
    category: getScenarioCategory(rawScenario),
    version: environmentSelection.version,
    environment: environmentSelection.environment,
    progress: "0",
    dueDate: schedule.dueDate,
    assignee: assignment.assignee,
    watchers: assignment.watchers,
    context: buildScenarioDecisionContext(rawScenario, severity, judgementProfile, schedule),
  };
}

function shuffleIndices(length) {
  const indices = Array.from({ length }, (_, index) => index);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }

  return indices;
}

function getScenarioTicketType(scenario) {
  return scenario?.ticketType === "qa" ? "qa" : "bug";
}

function isQaScenario(scenario = state.scenario) {
  return getScenarioTicketType(scenario) === "qa";
}

function getQaTypeLabel(qaType) {
  return {
    specification: "仕様確認",
    behavior: "動作確認",
    conflict: "仕様矛盾",
  }[qaType] || "—";
}

function getLastScenarioIndex(projectId, ticketType = state.trainingTicketType) {
  try {
    const storedValue = window.sessionStorage.getItem(
      `typing-workbench:last-scenario:${projectId}:${ticketType}:${state.trainingLevel}`
    );
    const parsedValue = Number.parseInt(storedValue ?? "", 10);
    return Number.isInteger(parsedValue) ? parsedValue : -1;
  } catch {
    return -1;
  }
}

function saveLastScenarioIndex(projectId, scenarioIndex, ticketType = state.trainingTicketType) {
  try {
    window.sessionStorage.setItem(
      `typing-workbench:last-scenario:${projectId}:${ticketType}:${state.trainingLevel}`,
      String(scenarioIndex)
    );
  } catch {
    // Storage can be unavailable on restricted file origins; gameplay must continue.
  }
}

function getProjectScenarioEntries(
  projectId = state.projectId,
  ticketType = state.trainingTicketType
) {
  const selectedLevel = normalizeTrainingLevel(state.trainingLevel);
  return scenarioBank
    .map((scenario, index) => ({ scenario, index }))
    .filter(({ scenario }) =>
      scenario.projectId === projectId
      && getScenarioTicketType(scenario) === ticketType
      && scenario.difficulty === selectedLevel
    );
}

function getAvailableScenarioEntries(ticketType = state.trainingTicketType) {
  const projectEntries = getProjectScenarioEntries(state.projectId, ticketType);
  if (projectEntries.length > 0 || ticketType === "bug") {
    return projectEntries;
  }
  return scenarioBank
    .map((scenario, index) => ({ scenario, index }))
    .filter(({ scenario }) =>
      getScenarioTicketType(scenario) === ticketType
      && scenario.difficulty === normalizeTrainingLevel(state.trainingLevel)
    );
}

function getKnownAttemptedScenarioIds() {
  return new Set([
    ...state.myPageProgress.map((progress) => progress.scenarioId),
    ...Object.keys(state.sessionPracticeAttemptsByScenario),
  ]);
}

function getUnattemptedScenarioEntries(projectId = state.projectId) {
  const attemptedScenarioIds = getKnownAttemptedScenarioIds();
  const availableEntries = getAvailableScenarioEntries(state.trainingTicketType);
  return availableEntries
    .filter(({ scenario }) => !attemptedScenarioIds.has(scenario.scenarioId));
}

function getReviewPriority(entry) {
  const progress = state.myPageProgress.find(
    (item) => item.scenarioId === entry.scenario.scenarioId
  );
  const sessionAttempt = state.sessionPracticeAttemptsByScenario[entry.scenario.scenarioId];
  return {
    bestScore: Number.isInteger(progress?.bestScore)
      ? progress.bestScore
      : Number.isInteger(sessionAttempt?.latestScore)
        ? sessionAttempt.latestScore
        : -1,
    latestAttemptAt: progress?.latestAttemptAt || sessionAttempt?.latestAttemptAt || "",
  };
}

function orderReviewScenarioEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftPriority = getReviewPriority(left);
    const rightPriority = getReviewPriority(right);
    return leftPriority.bestScore - rightPriority.bestScore
      || leftPriority.latestAttemptAt.localeCompare(rightPriority.latestAttemptAt)
      || left.scenario.scenarioId.localeCompare(right.scenario.scenarioId);
  });
}

function avoidImmediateScenarioRepeat(entries) {
  const previousScenarioIndex =
    state.scenarioIndex >= 0
      ? state.scenarioIndex
      : getLastScenarioIndex(state.projectId, state.trainingTicketType);
  if (previousScenarioIndex >= 0 && entries.length > 1 && entries[0]?.index === previousScenarioIndex) {
    [entries[0], entries[1]] = [entries[1], entries[0]];
  }
  return entries;
}

function refillScenarioQueue() {
  const projectScenarios = getAvailableScenarioEntries();
  const unattemptedScenarios = getUnattemptedScenarioEntries();
  const eligibleEntries = unattemptedScenarios.length
    ? shuffleIndices(unattemptedScenarios.length).map((position) => unattemptedScenarios[position])
    : orderReviewScenarioEntries(projectScenarios);

  state.scenarioQueue = avoidImmediateScenarioRepeat(eligibleEntries)
    .map(({ index }) => index);
}

function drawNextScenario() {
  if (state.scenarioQueue.length === 0) {
    refillScenarioQueue();
  }

  const nextIndex = state.scenarioQueue.shift();
  if (!Number.isInteger(nextIndex)) {
    return false;
  }
  state.scenarioIndex = nextIndex;
  const rawScenario = scenarioBank[nextIndex];
  state.trainingTicketType = getScenarioTicketType(rawScenario);
  state.projectId = rawScenario.projectId;
  saveLastScenarioIndex(state.projectId, nextIndex, state.trainingTicketType);
  state.scenario = buildScenario(rawScenario, state.trainingLevel);
  saveListPreferences();
  renderProject();
  return true;
}

function selectScenarioById(scenarioId, trainingLevel = "advanced") {
  const scenarioIndex = scenarioBank.findIndex((scenario) => scenario.scenarioId === scenarioId);
  if (scenarioIndex < 0) {
    return false;
  }
  state.projectId = scenarioBank[scenarioIndex].projectId;
  state.trainingTicketType = getScenarioTicketType(scenarioBank[scenarioIndex]);
  state.trainingLevel = normalizeTrainingLevel(trainingLevel);
  state.scenarioIndex = scenarioIndex;
  state.scenarioQueue = [];
  state.scenario = buildScenario(scenarioBank[scenarioIndex], state.trainingLevel);
  saveLastScenarioIndex(state.projectId, scenarioIndex, state.trainingTicketType);
  saveListPreferences();
  renderProject();
  return true;
}

function beginSessionForCurrentScenario() {
  resetSession();
  activateCreateSession();
}

function activateCreateSession() {
  setView("create");
  state.running = true;
  state.awaitingCreate = false;
  state.sessionStartAt = Date.now();

  if (elements.typingInput) {
    elements.typingInput.disabled = isPracticeMode();
  }

  startSessionTimers();
  getSetupFields().forEach((field) => {
    field.disabled = true;
  });
  if (elements.dueDateUnsetButton) {
    elements.dueDateUnsetButton.disabled = true;
  }
  elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]').forEach((checkbox) => {
    checkbox.disabled = true;
  });
  renderReport();
  renderScenarioBrief();
  pushMetrics();
  syncControls();
  if (isPracticeMode()) {
    elements.subjectDocument?.querySelector("#practiceSubjectInput")?.focus();
  } else {
    elements.typingInput?.focus();
  }
}

function beginTicketRevision(ticket) {
  if (!ticket?.scenarioId || !selectAuthoringMode("practice")) {
    return false;
  }
  if (!selectScenarioById(ticket.scenarioId, ticket.answer?.trainingLevel)) {
    return false;
  }
  const previousScore = successfulTicketScore(ticket);
  resetSession();
  const ticketId = ticket.ticketId || state.ticketDetailId || ticket.attemptId;
  state.revisionTicketId = ticketId;
  state.revisionPreviousScore = previousScore;
  state.practiceSubject = String(ticket.answer?.subject || "");
  const savedSections = ticket.answer?.sections || {};
  state.practiceSections = Object.fromEntries(
    getPracticeSectionGroups().map((group) => [
      group.key,
      String(savedSections[group.title.replace(/^■/, "")] || ""),
    ])
  );
  state.selectedEvidenceIds = [...(ticket.selectedEvidenceIds || [])];
  state.evidenceDescriptions = { ...(ticket.evidenceDescriptions || {}) };
  applyTicketDefaults();
  applyTicketFieldValues(ticket.answer?.ticketFields || {});
  renderEvidenceAttachment();
  setTextContent(
    elements.ticketCreateTitle,
    `チケット #${ticket.displayId || ""} を修正`
  );
  leaveMyPageRouteForTraining();
  activateCreateSession();
  state.practiceWritingComplete = true;
  state.completedLines = state.scenario.totalEditableLines;
  state.currentEditableOrder = state.scenario.totalEditableLines;
  state.setupStepIndex = getSetupFields().length;
  finishSetupFlow();
  setTextContent(elements.createButton, "保存");
  syncControls();
  return true;
}

const elements = {
  homeNavButton: document.getElementById("homeNavButton"),
  ticketNavButton: document.getElementById("ticketNavButton"),
  myPageNavButton: document.getElementById("myPageNavButton"),
  rmProjectHeader: document.getElementById("rmProjectHeader"),
  rmMyPageHeader: document.getElementById("rmMyPageHeader"),
  rmMyPageNavigation: document.getElementById("rmMyPageNavigation"),
  typingInput: document.getElementById("typingInput"),
  startButton: document.getElementById("startButton"),
  resumeDraftButton: document.getElementById("resumeDraftButton"),
  draftSaveButton: document.getElementById("draftSaveButton"),
  draftSaveStatus: document.getElementById("draftSaveStatus"),
  stopButton: document.getElementById("stopButton"),
  createButton: document.getElementById("createButton"),
  practiceWritingCompleteButton: document.getElementById("practiceWritingCompleteButton"),
  practiceWritingTransition: document.getElementById("practiceWritingTransition"),
  practiceWritingStatus: document.getElementById("practiceWritingStatus"),
  retryButton: document.getElementById("retryButton"),
  nextScenarioButton: document.getElementById("nextScenarioButton"),
  sameScenarioPracticeButton: document.getElementById("sameScenarioPracticeButton"),
  reportDocument: document.getElementById("reportDocument"),
  subjectEditor: document.getElementById("subjectEditor"),
  subjectDocument: document.getElementById("subjectDocument"),
  subjectLineClearCue: document.getElementById("subjectLineClearCue"),
  trackerSelect: document.getElementById("trackerSelect"),
  statusSelect: document.getElementById("statusSelect"),
  prioritySelect: document.getElementById("prioritySelect"),
  assigneeSelect: document.getElementById("assigneeSelect"),
  categorySelect: document.getElementById("categorySelect"),
  versionSelect: document.getElementById("versionSelect"),
  environmentSelect: document.getElementById("environmentSelect"),
  severitySelect: document.getElementById("severitySelect"),
  ticketWatchersList: document.getElementById("ticketWatchersList"),
  evidenceAttachmentSection: document.getElementById("evidenceAttachmentSection"),
  openEvidencePickerButton: document.getElementById("openEvidencePickerButton"),
  attachedEvidenceList: document.getElementById("attachedEvidenceList"),
  evidencePickerOverlay: document.getElementById("evidencePickerOverlay"),
  closeEvidencePickerButton: document.getElementById("closeEvidencePickerButton"),
  cancelEvidencePickerButton: document.getElementById("cancelEvidencePickerButton"),
  attachEvidenceButton: document.getElementById("attachEvidenceButton"),
  evidenceFolderPath: document.getElementById("evidenceFolderPath"),
  evidenceFileList: document.getElementById("evidenceFileList"),
  evidenceSelectionCount: document.getElementById("evidenceSelectionCount"),
  evidencePreviewEmpty: document.getElementById("evidencePreviewEmpty"),
  evidencePreview: document.getElementById("evidencePreview"),
  evidencePreviewIcon: document.getElementById("evidencePreviewIcon"),
  evidencePreviewName: document.getElementById("evidencePreviewName"),
  evidencePreviewSummary: document.getElementById("evidencePreviewSummary"),
  evidencePreviewMetadata: document.getElementById("evidencePreviewMetadata"),
  evidencePreviewContent: document.getElementById("evidencePreviewContent"),
  startDateInput: document.getElementById("startDateInput"),
  dueDateInput: document.getElementById("dueDateInput"),
  dueDateUnsetButton: document.getElementById("dueDateUnsetButton"),
  progressSelect: document.getElementById("progressSelect"),
  reportEditor: document.getElementById("reportEditor"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultCompletedLines: document.getElementById("resultCompletedLines"),
  resultTotalTyping: document.getElementById("resultTotalTyping"),
  resultSuccessCount: document.getElementById("resultSuccessCount"),
  resultFailureCount: document.getElementById("resultFailureCount"),
  resultAccuracy: document.getElementById("resultAccuracy"),
  resultElapsedTime: document.getElementById("resultElapsedTime"),
  resultKicker: document.getElementById("resultKicker"),
  resultTitle: document.getElementById("resultTitle"),
  resultTicketSubject: document.getElementById("resultTicketSubject"),
  resultRankBlock: document.getElementById("resultRankBlock"),
  resultReviewLayout: document.getElementById("resultReviewLayout"),
  resultSummaryCard: document.getElementById("resultSummaryCard"),
  practiceResultSection: document.getElementById("practiceResultSection"),
  practiceResultAnswer: document.getElementById("practiceResultAnswer"),
  practiceReferenceAnswer: document.getElementById("practiceReferenceAnswer"),
  authStatusLabel: document.getElementById("authStatusLabel"),
  authUserName: document.getElementById("authUserName"),
  googleSignInButton: document.getElementById("googleSignInButton"),
  googleSignOutButton: document.getElementById("googleSignOutButton"),
  practiceScoringPreviewSection: document.getElementById("practiceScoringPreviewSection"),
  practiceScoringBadge: document.getElementById("practiceScoringBadge"),
  practiceScoringMessage: document.getElementById("practiceScoringMessage"),
  practiceScoringRetryButton: document.getElementById("practiceScoringRetryButton"),
  practiceSaveRetryButton: document.getElementById("practiceSaveRetryButton"),
  practiceScoringResult: document.getElementById("practiceScoringResult"),
  practiceAiReviewHero: document.getElementById("practiceAiReviewHero"),
  practiceAiRadarPanel: document.getElementById("practiceAiRadarPanel"),
  practiceAiRadarTitle: document.getElementById("practiceAiRadarTitle"),
  practiceScoringPreviewTotal: document.getElementById("practiceScoringPreviewTotal"),
  practiceScoringComparison: document.getElementById("practiceScoringComparison"),
  practiceScoringBreakdown: document.getElementById("practiceScoringBreakdown"),
  practiceScoringVerdict: document.getElementById("practiceScoringVerdict"),
  practiceScoringOverallAssessment: document.getElementById("practiceScoringOverallAssessment"),
  practiceScoringDetails: document.getElementById("practiceScoringDetails"),
  practiceScoringDimensionFeedbackSection: document.getElementById("practiceScoringDimensionFeedbackSection"),
  practiceScoringDimensionFeedbackTitle: document.getElementById("practiceScoringDimensionFeedbackTitle"),
  practiceScoringDimensionFeedback: document.getElementById("practiceScoringDimensionFeedback"),
  practiceScoringImprovementSection: document.getElementById("practiceScoringImprovementSection"),
  practiceScoringRequiredImprovementsGroup: document.getElementById("practiceScoringRequiredImprovementsGroup"),
  practiceScoringRequiredImprovements: document.getElementById("practiceScoringRequiredImprovements"),
  practiceScoringOptionalImprovementsGroup: document.getElementById("practiceScoringOptionalImprovementsGroup"),
  practiceScoringOptionalImprovements: document.getElementById("practiceScoringOptionalImprovements"),
  practiceScoringPreviewStrengths: document.getElementById("practiceScoringPreviewStrengths"),
  practiceScoringReaderQuestions: document.getElementById("practiceScoringReaderQuestions"),
  practiceScoringReaderQuestionsSection: document.getElementById("practiceScoringReaderQuestionsSection"),
  practiceScoringReaderQuestionsTitle: document.getElementById("practiceScoringReaderQuestionsTitle"),
  practiceScoringAmbiguitySection: document.getElementById("practiceScoringAmbiguitySection"),
  practiceScoringAmbiguityRisks: document.getElementById("practiceScoringAmbiguityRisks"),
  practiceScoringInvestigationAdvice: document.getElementById("practiceScoringInvestigationAdvice"),
  practiceScoringRewriteSection: document.getElementById("practiceScoringRewriteSection"),
  practiceScoringRewriteSuggestions: document.getElementById("practiceScoringRewriteSuggestions"),
  practiceScoringNoImprovements: document.getElementById("practiceScoringNoImprovements"),
  practiceScoringRadar: document.getElementById("practiceScoringRadar"),
  practiceScoringRadarValue: document.getElementById("practiceScoringRadarValue"),
  practiceRadarFactual: document.getElementById("practiceRadarFactual"),
  practiceRadarLabelFactual: document.getElementById("practiceRadarLabelFactual"),
  practiceRadarCoverage: document.getElementById("practiceRadarCoverage"),
  practiceRadarLabelCoverage: document.getElementById("practiceRadarLabelCoverage"),
  practiceRadarReproducibility: document.getElementById("practiceRadarReproducibility"),
  practiceRadarLabelReproducibility: document.getElementById("practiceRadarLabelReproducibility"),
  practiceRadarSeparation: document.getElementById("practiceRadarSeparation"),
  practiceRadarLabelSeparation: document.getElementById("practiceRadarLabelSeparation"),
  practiceRadarClarity: document.getElementById("practiceRadarClarity"),
  practiceRadarLabelClarity: document.getElementById("practiceRadarLabelClarity"),
  practiceRadarInvestigation: document.getElementById("practiceRadarInvestigation"),
  practiceRadarLabelInvestigation: document.getElementById("practiceRadarLabelInvestigation"),
  resultRank: document.getElementById("resultRank"),
  resultScore: document.getElementById("resultScore"),
  resultDecisionScoreRow: document.getElementById("resultDecisionScoreRow"),
  resultDecisionScore: document.getElementById("resultDecisionScore"),
  resultReportScoreRow: document.getElementById("resultReportScoreRow"),
  resultReportScore: document.getElementById("resultReportScore"),
  resultEvidenceScoreRow: document.getElementById("resultEvidenceScoreRow"),
  resultEvidenceScore: document.getElementById("resultEvidenceScore"),
  resultTypingScoreRow: document.getElementById("resultTypingScoreRow"),
  resultTypingScore: document.getElementById("resultTypingScore"),
  resultTimeScoreRow: document.getElementById("resultTimeScoreRow"),
  resultTimeScore: document.getElementById("resultTimeScore"),
  resultRadar: document.getElementById("resultRadar"),
  resultRadarShell: document.getElementById("resultRadarShell"),
  resultRadarValue: document.getElementById("resultRadarValue"),
  resultRadarPrimaryLabel: document.getElementById("resultRadarPrimaryLabel"),
  resultRadarSeverity: document.getElementById("resultRadarSeverity"),
  resultRadarPriority: document.getElementById("resultRadarPriority"),
  resultRadarFields: document.getElementById("resultRadarFields"),
  resultRadarPeople: document.getElementById("resultRadarPeople"),
  resultRadarReport: document.getElementById("resultRadarReport"),
  resultRadarTyping: document.getElementById("resultRadarTyping"),
  resultFieldReview: document.getElementById("resultFieldReview"),
  resultFieldReviewCard: document.getElementById("resultFieldReviewCard"),
  resultEvidenceReviewSection: document.getElementById("resultEvidenceReviewSection"),
  resultEvidenceReview: document.getElementById("resultEvidenceReview"),
  resultChart: document.getElementById("resultChart"),
  resultChartY300: document.getElementById("resultChartY300"),
  resultChartY200: document.getElementById("resultChartY200"),
  resultChartY100: document.getElementById("resultChartY100"),
  resultChartY0: document.getElementById("resultChartY0"),
  resultChartTimeStart: document.getElementById("resultChartTimeStart"),
  resultChartTimeMid: document.getElementById("resultChartTimeMid"),
  resultChartTimeEnd: document.getElementById("resultChartTimeEnd"),
  resultExitButton: document.getElementById("resultExitButton"),
  lineClearCue: document.getElementById("lineClearCue"),
  ticketListView: document.getElementById("ticketListView"),
  trainingLevelView: document.getElementById("trainingLevelView"),
  trainingLevelTitle: document.getElementById("trainingLevelTitle"),
  trainingLevelBackButton: document.getElementById("trainingLevelBackButton"),
  trainingLevelButtons: document.querySelectorAll("[data-training-level]"),
  ticketDetailView: document.getElementById("ticketDetailView"),
  scenarioIntroView: document.getElementById("scenarioIntroView"),
  ticketCreateView: document.getElementById("ticketCreateView"),
  myPageView: document.getElementById("myPageView"),
  myPageTabs: document.querySelectorAll("[data-my-page-tab]"),
  myPageRefreshButtons: document.querySelectorAll("[data-my-page-refresh]"),
  myPageAuthGate: document.getElementById("myPageAuthGate"),
  myPageContent: document.getElementById("myPageContent"),
  myPageProgressPanel: document.getElementById("myPageProgressPanel"),
  myPageHistoryPanel: document.getElementById("myPageHistoryPanel"),
  myPageRankingPanel: document.getElementById("myPageRankingPanel"),
  myPageProgressStatus: document.getElementById("myPageProgressStatus"),
  myPageProgressBody: document.getElementById("myPageProgressBody"),
  myPagePracticedCount: document.getElementById("myPagePracticedCount"),
  myPageScenarioTotal: document.getElementById("myPageScenarioTotal"),
  myPageAchievedCount: document.getElementById("myPageAchievedCount"),
  myPageBestScore: document.getElementById("myPageBestScore"),
  myPageAttemptCount: document.getElementById("myPageAttemptCount"),
  myPageProgressProjects: document.getElementById("myPageProgressProjects"),
  myPageHistoryStatus: document.getElementById("myPageHistoryStatus"),
  myPageHistoryBody: document.getElementById("myPageHistoryBody"),
  myPageHistoryRows: document.getElementById("myPageHistoryRows"),
  myPageHistoryMoreButton: document.getElementById("myPageHistoryMoreButton"),
  rankingProfileForm: document.getElementById("rankingProfileForm"),
  rankingNameInput: document.getElementById("rankingNameInput"),
  rankingOptInInput: document.getElementById("rankingOptInInput"),
  rankingProfileSaveButton: document.getElementById("rankingProfileSaveButton"),
  rankingProfileStatus: document.getElementById("rankingProfileStatus"),
  rankingIdentityNote: document.getElementById("rankingIdentityNote"),
  myPageRankingStatus: document.getElementById("myPageRankingStatus"),
  myPageRankingBody: document.getElementById("myPageRankingBody"),
  myPageRankingRows: document.getElementById("myPageRankingRows"),
  myPageRankingMoreButton: document.getElementById("myPageRankingMoreButton"),
  scenarioIntroFacts: document.getElementById("scenarioIntroFacts"),
  scenarioIntroDecision: document.getElementById("scenarioIntroDecision"),
  scenarioIntroGlossary: document.getElementById("scenarioIntroGlossary"),
  scenarioIntroTargetCard: document.getElementById("scenarioIntroTargetCard"),
  scenarioIntroTargetImage: document.getElementById("scenarioIntroTargetImage"),
  scenarioIntroTargetName: document.getElementById("scenarioIntroTargetName"),
  scenarioIntroChangeButton: document.getElementById("scenarioIntroChangeButton"),
  scenarioIntroStartButton: document.getElementById("scenarioIntroStartButton"),
  scenarioIntroPracticeButton: document.getElementById("scenarioIntroPracticeButton"),
  scenarioIntroBackButton: document.getElementById("scenarioIntroBackButton"),
  scenarioIntroTitle: document.getElementById("scenarioIntroTitle"),
  scenarioIntroLevelBadge: document.getElementById("scenarioIntroLevelBadge"),
  scenarioIntroSeverityRules: document.getElementById("scenarioIntroSeverityRules"),
  scenarioPanel: document.getElementById("scenarioPanel"),
  scenarioPanelTitle: document.getElementById("scenarioPanelTitle"),
  scenarioPanelSeverityRules: document.getElementById("scenarioPanelSeverityRules"),
  scenarioPanelTargetCard: document.getElementById("scenarioPanelTargetCard"),
  scenarioPanelTargetImage: document.getElementById("scenarioPanelTargetImage"),
  scenarioPanelTargetName: document.getElementById("scenarioPanelTargetName"),
  rmProjectTitle: document.getElementById("rmProjectTitle"),
  rmProjectSwitcher: document.getElementById("rmProjectSwitcher"),
  ticketListBody: document.getElementById("ticketListBody"),
  ticketListAuthGate: document.getElementById("ticketListAuthGate"),
  ticketListStatus: document.getElementById("ticketListStatus"),
  ticketListRetry: document.getElementById("ticketListRetry"),
  ticketListRetryButton: document.getElementById("ticketListRetryButton"),
  ticketListContent: document.getElementById("ticketListContent"),
  ticketListMoreButton: document.getElementById("ticketListMoreButton"),
  qaStartButton: document.getElementById("qaStartButton"),
  ticketTypeFilterButtons: document.querySelectorAll("[data-ticket-type-filter]"),
  ticketDetailNumber: document.getElementById("ticketDetailNumber"),
  ticketDetailBackButton: document.getElementById("ticketDetailBackButton"),
  ticketDetailAuthGate: document.getElementById("ticketDetailAuthGate"),
  ticketDetailStatus: document.getElementById("ticketDetailStatus"),
  ticketDetailContent: document.getElementById("ticketDetailContent"),
  ticketCreateTitle: document.getElementById("ticketCreateTitle"),
  severityField: document.getElementById("severityField"),
  ticketStatusFilter: document.getElementById("ticketStatusFilter"),
  ticketExtraFilter: document.getElementById("ticketExtraFilter"),
  applyTicketFiltersButton: document.getElementById("applyTicketFiltersButton"),
  clearTicketFiltersButton: document.getElementById("clearTicketFiltersButton"),
  ticketSortButtons: document.querySelectorAll(".ticket-sort-button"),
  scenarioPanelMode: document.getElementById("scenarioPanelMode"),
  scenarioPanelLevelBadge: document.getElementById("scenarioPanelLevelBadge"),
  ticketFormDetails: document.getElementById("ticketFormDetails"),
  scenarioBrief: document.getElementById("scenarioBrief"),
  scenarioGlossary: document.getElementById("scenarioGlossary"),
  scenarioPanelBody: document.getElementById("scenarioPanelBody"),
  scenarioReferenceHint: document.getElementById("scenarioReferenceHint"),
  practiceScoringInvestigationSection: document.getElementById("practiceScoringInvestigationSection"),
  practiceScoringInvestigationTitle: document.getElementById("practiceScoringInvestigationTitle"),
};

const listPreferenceDefaults = {
  projectId: "customer",
  authoringMode: "reference",
  sortKey: "completedAt",
  sortDirection: "desc",
  statusFilter: "all",
  extraFilter: "all",
  ticketTypeFilter: "all",
};

function loadListPreferences() {
  try {
    const storedValue = window.localStorage.getItem("typing-workbench:list-preferences");
    if (!storedValue) {
      return { ...listPreferenceDefaults };
    }

    const parsedValue = JSON.parse(storedValue);
    const validProjectIds = new Set(projectCatalog.map((project) => project.id));
    const validSortKeys = new Set(["completedAt"]);
    const validAuthoringModes = new Set(["reference", "practice"]);

    return {
      projectId: validProjectIds.has(parsedValue.projectId) ? parsedValue.projectId : listPreferenceDefaults.projectId,
      authoringMode: validAuthoringModes.has(parsedValue.authoringMode)
        ? parsedValue.authoringMode
        : listPreferenceDefaults.authoringMode,
      sortKey: validSortKeys.has(parsedValue.sortKey) ? parsedValue.sortKey : listPreferenceDefaults.sortKey,
      sortDirection: parsedValue.sortDirection === "asc" ? "asc" : "desc",
      statusFilter: "all",
      extraFilter: "all",
      ticketTypeFilter: new Set(["all", "bug", "qa"]).has(parsedValue.ticketTypeFilter)
        ? parsedValue.ticketTypeFilter
        : "all",
    };
  } catch {
    return { ...listPreferenceDefaults };
  }
}

function saveListPreferences() {
  try {
    window.localStorage.setItem(
      "typing-workbench:list-preferences",
      JSON.stringify({
        projectId: state.projectId,
        authoringMode: state.authoringMode,
        sortKey: state.ticketSortKey,
        sortDirection: state.ticketSortDirection,
        statusFilter: state.ticketStatusFilter,
        extraFilter: state.ticketExtraFilter,
        ticketTypeFilter: state.ticketTypeFilter,
      })
    );
  } catch {
    // Restricted file origins can deny storage access; the app must still load.
  }
}

const practiceDraftStorageKey = "typing-workbench:practice-drafts:v1";
const practiceDraftSchemaVersion = "practice-drafts.v1";

function normalizePracticeDraft(rawDraft) {
  if (!rawDraft || typeof rawDraft !== "object") {
    return null;
  }
  const scenario = scenarioBank.find(({ scenarioId }) => scenarioId === rawDraft.scenarioId);
  if (!scenario || scenario.projectId !== rawDraft.projectId) {
    return null;
  }
  const sections = rawDraft.answer?.sections;
  const ticketFields = rawDraft.answer?.ticketFields;
  if (
    typeof rawDraft.answer?.subject !== "string" ||
    !sections || typeof sections !== "object" || Array.isArray(sections) ||
    !ticketFields || typeof ticketFields !== "object" || Array.isArray(ticketFields)
  ) {
    return null;
  }
  return {
    schemaVersion: "practice-draft.v1",
    scenarioId: rawDraft.scenarioId,
    projectId: rawDraft.projectId,
    trainingLevel: new Set(["beginner", "intermediate", "advanced"]).has(rawDraft.trainingLevel)
      ? rawDraft.trainingLevel
      : "advanced",
    savedAt: typeof rawDraft.savedAt === "string" ? rawDraft.savedAt : "",
    startedAt: typeof rawDraft.startedAt === "string" ? rawDraft.startedAt : "",
    practiceWritingComplete: Boolean(rawDraft.practiceWritingComplete),
    answer: {
      subject: rawDraft.answer.subject,
      sections: Object.fromEntries(
        Object.entries(sections)
          .filter(([key, value]) => typeof key === "string" && typeof value === "string")
      ),
      ticketFields: { ...ticketFields, private: false },
    },
    selectedEvidenceIds: Array.isArray(rawDraft.selectedEvidenceIds)
      ? rawDraft.selectedEvidenceIds.filter((fileId) => typeof fileId === "string")
      : [],
    evidenceDescriptions: rawDraft.evidenceDescriptions
      && typeof rawDraft.evidenceDescriptions === "object"
      && !Array.isArray(rawDraft.evidenceDescriptions)
      ? Object.fromEntries(
          Object.entries(rawDraft.evidenceDescriptions)
            .filter(([fileId, description]) =>
              typeof fileId === "string" && typeof description === "string"
            )
            .map(([fileId, description]) => [fileId, description.slice(0, 200)])
        )
      : {},
  };
}

function loadPracticeDrafts() {
  try {
    const storedValue = window.localStorage.getItem(practiceDraftStorageKey);
    if (!storedValue) {
      return {};
    }
    const parsedValue = JSON.parse(storedValue);
    if (parsedValue?.schemaVersion !== practiceDraftSchemaVersion) {
      return {};
    }
    return Object.fromEntries(
      Object.values(parsedValue.drafts || {})
        .map(normalizePracticeDraft)
        .filter(Boolean)
        .map((draft) => [draft.scenarioId, draft])
    );
  } catch {
    return {};
  }
}

function persistPracticeDrafts(drafts) {
  try {
    window.localStorage.setItem(
      practiceDraftStorageKey,
      JSON.stringify({
        schemaVersion: practiceDraftSchemaVersion,
        drafts,
      })
    );
    return true;
  } catch {
    return false;
  }
}

const initialListPreferences = loadListPreferences();

const state = {
  running: false,
  awaitingCreate: false,
  view: "list",
  projectId: initialListPreferences.projectId,
  trainingTicketType: "bug",
  trainingLevel: "advanced",
  authoringMode: initialListPreferences.authoringMode,
  completedSessionsByProject: {},
  scenarioIndex: -1,
  scenario: buildScenario(scenarioBank[0]),
  scenarioQueue: [],
  scenarioSelectionPending: false,
  practiceDrafts: loadPracticeDrafts(),
  draftSaveStatusTimerId: null,
  sessionPracticeAttemptsByScenario: {},
  ticketSortKey: initialListPreferences.sortKey,
  ticketSortDirection: initialListPreferences.sortDirection,
  ticketStatusFilter: initialListPreferences.statusFilter,
  ticketExtraFilter: initialListPreferences.extraFilter,
  ticketTypeFilter: initialListPreferences.ticketTypeFilter,
  ticketListItems: [],
  ticketListNextCursor: null,
  ticketListRequestId: 0,
  ticketListLoadingKey: "",
  ticketListStatus: "idle",
  ticketDetail: null,
  ticketDetailId: "",
  ticketDetailRevisions: [],
  ticketDetailRequestId: 0,
  revisionTicketId: "",
  currentAttemptId: "",
  currentAttemptSaved: false,
  currentSavedAttempt: null,
  revisionPreviousScore: null,
  currentEditableOrder: 0,
  currentDraft: "",
  totalInputChars: 0,
  correctChars: 0,
  wrongChars: 0,
  completedLines: 0,
  currentError: false,
  sessionStartAt: null,
  timerId: null,
  sampleTimerId: null,
  lineClearCueTimerId: null,
  lineClearCueToken: 0,
  resultRadarDelayTimerId: null,
  resultRadarAnimationToken: 0,
  chartSamples: [],
  inputTimestamps: [],
  finalElapsedMs: 0,
  setupComplete: false,
  setupStepIndex: 0,
  selectedEvidenceIds: [],
  evidenceDescriptions: {},
  evidencePickerDraftIds: [],
  evidencePreviewId: "",
  evidencePickerFileOrder: [],
  evidencePickerOpen: false,
  evidenceSetupActive: false,
  practiceSubject: "",
  practiceSections: {},
  practiceWritingComplete: false,
  practiceScoringStatus: "idle",
  practiceScoringResult: null,
  practiceScoringError: null,
  practiceScoringRequestId: 0,
  authStatus: "loading",
  myPageTab: "progress",
  myPageRequestId: 0,
  myPageProfile: null,
  myPageProgress: [],
  myPageHistoryItems: [],
  myPageHistoryNextCursor: null,
  myPageLeaderboardItems: [],
  myPageLeaderboardNextCursor: null,
};

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ticketDefaults = {
  subject: "右クリックメニューが表示されない",
  tracker: "bug",
  status: "new",
  priority: "",
  severity: "",
  category: "",
  startDate: getLocalDateInputValue(),
  dueDate: "",
  progress: "0",
};

const authoringModeConfig = {
  reference: {
    label: "見本入力",
  },
  practice: {
    label: "実践起票",
  },
};

function isAccountIdentityStatus(status) {
  return status === "anonymous" || status === "signed_in";
}

function hasAccountIdentity() {
  return isAccountIdentityStatus(state.authStatus);
}

const trainingLevelConfig = {
  beginner: {
    label: "初級",
  },
  intermediate: {
    label: "中級",
  },
  advanced: {
    label: "上級",
  },
};

function normalizeTrainingLevel(value) {
  return trainingLevelConfig[value] ? value : "advanced";
}

function getTrainingLevelConfig(level = state.trainingLevel) {
  return trainingLevelConfig[normalizeTrainingLevel(level)];
}

function renderTrainingLevel() {
  const level = normalizeTrainingLevel(state.trainingLevel);
  const config = getTrainingLevelConfig(level);
  [elements.scenarioIntroLevelBadge, elements.scenarioPanelLevelBadge].forEach((badge) => {
    if (!badge) return;
    badge.textContent = config.label;
    badge.classList.remove("is-beginner", "is-intermediate", "is-advanced");
    badge.classList.add(`is-${level}`);
  });
  elements.ticketFormDetails?.classList.toggle("training-level-hidden", level === "beginner");
  document.querySelectorAll(".training-field-advanced").forEach((field) => {
    field.classList.toggle("training-level-hidden", level !== "advanced");
  });
  setTextContent(
    elements.practiceWritingCompleteButton,
    level === "beginner" ? "入力内容を確認する" : "チケット情報の設定へ"
  );
}

function getAuthoringModeConfig() {
  return authoringModeConfig[state.authoringMode] || authoringModeConfig.reference;
}

function isPracticeMode() {
  return state.authoringMode === "practice";
}

function renderAuthoringMode() {
  const config = getAuthoringModeConfig();
  setTextContent(elements.scenarioPanelMode, config.label);
}

function getCurrentProject() {
  return projectCatalog.find((project) => project.id === state.projectId) || projectCatalog[0];
}

const ticketStatusLabels = {
  new: "新規",
  "in-progress": "進行中",
};

const ticketPriorityLabels = {
  low: "低め",
  normal: "通常",
  high: "高め",
  urgent: "緊急",
};

const ticketReviewLabels = {
  succeeded: "レビュー済み",
  pending: "採点待ち",
  unavailable: "採点保留",
  failed: "採点失敗",
  not_supported: "レビュー準備中",
};

function getProjectMemberName(projectId, memberId) {
  if (!memberId) {
    return "未設定";
  }
  const project = projectCatalog.find((item) => item.id === projectId);
  return project?.members.find((member) => member.id === memberId)?.name || memberId;
}

function getTicketListEmptyFieldLabel(row) {
  return normalizeTrainingLevel(row.trainingLevel) === "beginner" ? "—" : "未設定";
}

function formatTicketListDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function recordSessionPracticeAttempt() {
  if (!isPracticeMode() || !state.scenario?.scenarioId) {
    return;
  }
  const previous = state.sessionPracticeAttemptsByScenario[state.scenario.scenarioId];
  state.sessionPracticeAttemptsByScenario[state.scenario.scenarioId] = {
    attemptCount: Number(previous?.attemptCount || 0) + 1,
    latestAttemptAt: new Date().toISOString(),
    latestScore: previous?.latestScore ?? null,
  };
}

function updateSessionPracticeScore(score) {
  const scenarioId = state.scenario?.scenarioId;
  if (!scenarioId || !Number.isInteger(score)) {
    return;
  }
  const previous = state.sessionPracticeAttemptsByScenario[scenarioId] || {};
  state.sessionPracticeAttemptsByScenario[scenarioId] = {
    ...previous,
    latestScore: score,
  };
}

function renderTicketList() {
  if (!elements.ticketListBody) {
    return;
  }

  const filteredRows = state.ticketListItems
    .filter((row) => state.ticketStatusFilter === "all" || row.reviewStatus === state.ticketStatusFilter)
    .filter((row) => state.ticketExtraFilter === "all" || row.priority === state.ticketExtraFilter)
    .filter((row) => state.ticketTypeFilter === "all" || row.tracker === state.ticketTypeFilter);

  elements.ticketListBody.innerHTML = filteredRows.length > 0
    ? filteredRows
        .map(
          (row) => `
            <tr>
              <td>#${escapeHtml(String(row.displayId || ""))}</td>
              <td><span class="ticket-type-pill is-${row.tracker === "qa" ? "qa" : "bug"}">${row.tracker === "qa" ? "QA" : "バグ"}</span></td>
              <td><span class="training-level-pill is-${escapeHtml(normalizeTrainingLevel(row.trainingLevel))}">${escapeHtml(getTrainingLevelConfig(row.trainingLevel).label)}</span></td>
              <td><span class="ticket-review-pill is-${escapeHtml(String(row.reviewStatus || "pending"))}">${escapeHtml(ticketReviewLabels[row.reviewStatus] || "採点待ち")}${Number.isInteger(row.totalScore) ? ` ${row.totalScore}点` : ""}</span></td>
              <td>${escapeHtml(ticketPriorityLabels[row.priority] || getTicketListEmptyFieldLabel(row))}</td>
              <td><a class="ticket-subject-link" href="#/tickets/${encodeURIComponent(row.ticketId || row.attemptId)}">${escapeHtml(row.subject || "（題名なし）")}</a></td>
              <td>${escapeHtml(row.assigneeId
                ? getProjectMemberName(row.projectId, row.assigneeId)
                : getTicketListEmptyFieldLabel(row))}</td>
              <td>${escapeHtml(formatTicketListDate(row.completedAt))}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="8" class="ticket-list-empty">${state.ticketListItems.length === 0
      ? "まだ作成したチケットはありません。バグ起票またはQA起票から始めましょう。"
      : "条件に一致するチケットはありません。"}</td></tr>`;
}

function renderTicketListState() {
  const signedIn = hasAccountIdentity();
  const authLoading = ["loading", "linking"].includes(state.authStatus);
  const isLoading = authLoading || (signedIn && state.ticketListStatus === "loading");
  elements.ticketListAuthGate?.classList.toggle("hidden", signedIn || authLoading);
  elements.ticketListContent?.classList.toggle("hidden", !signedIn || state.ticketListStatus !== "ready");
  elements.ticketListStatus?.classList.toggle(
    "hidden",
    (!signedIn && !authLoading) || (signedIn && state.ticketListStatus === "ready")
  );
  if (elements.ticketListStatus) {
    elements.ticketListStatus.textContent = authLoading
      ? "ログイン状態を確認しています…"
      : state.ticketListStatus === "error"
      ? "保存済みチケットを読み込めませんでした。再度お試しください。"
      : "保存済みチケットを読み込んでいます…";
    elements.ticketListStatus.classList.toggle("is-error", state.ticketListStatus === "error");
    setLoadingIndicator(elements.ticketListStatus, isLoading);
  }
  elements.ticketListMoreButton?.classList.toggle("hidden", !state.ticketListNextCursor);
  elements.ticketListRetry?.classList.toggle(
    "hidden",
    !signedIn || state.ticketListStatus !== "error"
  );
}

function waitForTicketListRetry(delayMs) {
  return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

function isRetryableTicketListError(error) {
  return !error?.code || new Set([
    "TIMEOUT",
    "HTTP_502",
    "HTTP_503",
    "HTTP_504",
    "STORAGE_UNAVAILABLE",
  ]).has(error.code);
}

async function requestTicketList(options) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await window.TYPING_WORKBENCH_PROFILE_API.getTickets(options);
    } catch (error) {
      lastError = error;
      if (attempt === 1 || !isRetryableTicketListError(error)) {
        throw error;
      }
      await waitForTicketListRetry(900);
    }
  }
  throw lastError;
}

async function loadTicketList(options = {}) {
  if (!hasAccountIdentity() || !window.TYPING_WORKBENCH_PROFILE_API) {
    state.ticketListItems = [];
    state.ticketListStatus = "idle";
    renderTicketListState();
    return;
  }
  const append = Boolean(options.append);
  const loadingKey = [
    state.projectId,
    state.ticketTypeFilter,
    append ? state.ticketListNextCursor || "more" : "first",
  ].join(":");
  if (state.ticketListStatus === "loading" && state.ticketListLoadingKey === loadingKey) {
    return;
  }
  const requestId = state.ticketListRequestId + 1;
  state.ticketListRequestId = requestId;
  state.ticketListLoadingKey = loadingKey;
  state.ticketListStatus = "loading";
  renderTicketListState();
  try {
    const response = await requestTicketList({
      projectId: state.projectId,
      tracker: state.ticketTypeFilter === "all" ? "" : state.ticketTypeFilter,
      limit: 20,
      cursor: append ? state.ticketListNextCursor : null,
    });
    if (state.ticketListRequestId !== requestId) {
      return;
    }
    state.ticketListItems = append
      ? [...state.ticketListItems, ...(response.items || [])]
      : response.items || [];
    state.ticketListNextCursor = response.nextCursor || null;
    state.ticketListStatus = "ready";
    renderTicketList();
  } catch {
    if (state.ticketListRequestId !== requestId) {
      return;
    }
    state.ticketListStatus = "error";
  } finally {
    if (state.ticketListRequestId === requestId) {
      state.ticketListLoadingKey = "";
    }
  }
  renderTicketListState();
}

function renderProject() {
  const project = getCurrentProject();

  if (elements.rmProjectTitle) {
    elements.rmProjectTitle.textContent = project.name;
  }

  if (elements.rmProjectSwitcher) {
    elements.rmProjectSwitcher.value = project.id;
  }
  if (elements.ticketStatusFilter) {
    elements.ticketStatusFilter.value = state.ticketStatusFilter;
  }
  if (elements.ticketExtraFilter) {
    elements.ticketExtraFilter.value = state.ticketExtraFilter;
  }
  elements.ticketTypeFilterButtons.forEach((button) => {
    const active = button.dataset.ticketTypeFilter === state.ticketTypeFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (elements.assigneeSelect) {
    elements.assigneeSelect.innerHTML = [
      '<option value="">--- 選択してください ---</option>',
      ...project.members.map(
        (member) => `<option value="${escapeHtml(member.id)}">${escapeHtml(member.name)}（${escapeHtml(member.role)}）</option>`
      ),
    ].join("");
  }

  if (elements.ticketWatchersList) {
    elements.ticketWatchersList.innerHTML = project.members
      .map(
        (member) => `
          <label>
            <input type="checkbox" name="watchers" value="${escapeHtml(member.id)}" />
            <span>${escapeHtml(member.name)}（${escapeHtml(member.role)}）</span>
          </label>
        `
      )
      .join("");
  }

  if (state.view === "list") {
    loadTicketList();
  }
}

function handleProjectChange(event) {
  const nextProjectId = event.target.value;
  if (!projectCatalog.some((project) => project.id === nextProjectId)) {
    return;
  }

  state.projectId = nextProjectId;
  state.scenarioIndex = -1;
  state.scenarioQueue = [];
  state.ticketStatusFilter = "all";
  state.ticketExtraFilter = "all";
  if (elements.ticketStatusFilter) {
    elements.ticketStatusFilter.value = state.ticketStatusFilter;
  }
  if (elements.ticketExtraFilter) {
    elements.ticketExtraFilter.value = state.ticketExtraFilter;
  }
  saveListPreferences();
  state.ticketListItems = [];
  state.ticketListNextCursor = null;
  renderProject();
  syncControls();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getReportSectionDisplayLabel(value) {
  const label = String(value || "");
  if (label === "■備考") {
    return "■周辺確認・補足";
  }
  if (label === "備考") {
    return "周辺確認・補足";
  }
  return label;
}

function normalizeLineText(value) {
  return value.normalize("NFKC").replace(/\r/g, "");
}

function normalizeTypingText(value) {
  return normalizeLineText(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/['’]/g, "")
    .replace(/[,，、]/g, "");
}

function getNRun(text, index) {
  let end = index;
  while (text[end] === "n") {
    end += 1;
  }
  return {
    length: end - index,
    end,
    nextCharacter: text[end] || "",
  };
}

function getAllowedTypedNRun(candidateRun) {
  if (/[aeiouy]/.test(candidateRun.nextCharacter)) {
    return candidateRun.length >= 2
      ? { min: 2, max: 3 }
      : { min: 1, max: 1 };
  }
  return { min: 1, max: 2 };
}

function matchesTypingCandidate(draft, candidate, requireComplete = false) {
  const typedText = normalizeTypingText(draft);
  const candidateText = normalizeTypingText(candidate);
  let typedIndex = 0;
  let candidateIndex = 0;

  while (candidateIndex < candidateText.length) {
    if (typedIndex >= typedText.length) {
      return !requireComplete;
    }

    if (candidateText[candidateIndex] === "n") {
      if (typedText[typedIndex] !== "n") {
        return false;
      }
      const candidateRun = getNRun(candidateText, candidateIndex);
      const typedRun = getNRun(typedText, typedIndex);
      const allowedRun = getAllowedTypedNRun(candidateRun);

      if (typedRun.end === typedText.length && !requireComplete) {
        return typedRun.length <= allowedRun.max;
      }
      if (typedRun.length < allowedRun.min || typedRun.length > allowedRun.max) {
        return false;
      }

      candidateIndex = candidateRun.end;
      typedIndex = typedRun.end;
      continue;
    }

    if (typedText[typedIndex] !== candidateText[candidateIndex]) {
      return false;
    }
    typedIndex += 1;
    candidateIndex += 1;
  }

  return typedIndex === typedText.length;
}

function formatElapsedTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getTypingTargetChars() {
  return Math.max(1, state.scenario.totalTargetTypingChars);
}

function getTypingPace(windowMs = 5000, now = Date.now()) {
  const recentTimestamps = state.inputTimestamps.filter((timestamp) => now - timestamp <= windowMs);
  const recentCps = recentTimestamps.length / (windowMs / 1000);
  const targetCps = getTypingTargetChars() / sessionLength;

  if (targetCps <= 0) {
    return 0;
  }

  return (recentCps / targetCps) * 100;
}

function getSessionElapsedMs(now = Date.now()) {
  if (state.sessionStartAt == null) {
    return 0;
  }

  return now - state.sessionStartAt;
}

function stopSessionTimers() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  if (state.sampleTimerId) {
    clearInterval(state.sampleTimerId);
    state.sampleTimerId = null;
  }
}

function startSessionTimers() {
  stopSessionTimers();
  state.sampleTimerId = window.setInterval(sampleChart, chartSampleIntervalMs);
}

function getKeyFromEvent(event) {
  if (!event || typeof event.code !== "string") {
    return "";
  }

  if (event.code.startsWith("Key")) {
    return event.code.slice(3).toLowerCase();
  }

  if (event.code.startsWith("Digit")) {
    if (event.shiftKey) {
      const shiftedDigits = {
        Digit1: "!",
        Digit2: "\"",
        Digit3: "#",
        Digit4: "$",
        Digit5: "%",
        Digit6: "&",
        Digit7: "'",
        Digit8: "(",
        Digit9: ")",
      };
      return shiftedDigits[event.code] ?? "";
    }
    return event.code.slice(5);
  }

  const mapping = {
    Space: " ",
    Period: ".",
    Comma: ",",
    Slash: "/",
    Minus: "-",
    Equal: "=",
    Semicolon: ";",
    Quote: "'",
    Backquote: "`",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
  };

  return mapping[event.code] ?? "";
}

function getCurrentEditableEntry() {
  return state.scenario.typingEntries[state.currentEditableOrder];
}

function getExpectedTypingText() {
  return getCurrentEditableEntry()?.answers ?? [];
}

function getAccuracyRate() {
  const attempts = state.correctChars + state.wrongChars;
  return attempts === 0 ? 0 : (state.correctChars / attempts) * 100;
}

function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function setTextContent(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setLoadingIndicator(element, loading) {
  if (!element) {
    return;
  }
  element.classList.toggle("has-loading-spinner", Boolean(loading));
  element.setAttribute("aria-busy", String(Boolean(loading)));
}

function setControlValue(element, value) {
  if (element) {
    element.value = value;
  }
}

function renderEnvironmentOptions() {
  const expected = state.scenario?.evaluation || {};
  const choices = projectEnvironmentChoices[state.scenario?.projectId] || {
    versions: [],
    configurations: [],
  };
  const renderOptions = (values) => [
    '<option value="">--- 選択してください ---</option>',
    ...[...new Set(values.filter(Boolean))]
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
  ].join("");

  if (elements.versionSelect) {
    elements.versionSelect.innerHTML = renderOptions([...choices.versions, expected.version]);
  }
  if (elements.environmentSelect) {
    elements.environmentSelect.innerHTML = renderOptions([
      ...choices.configurations,
      expected.environment,
    ]);
  }
}

function setView(view) {
  state.view = view;

  if (elements.ticketListView) {
    elements.ticketListView.classList.toggle("hidden", view !== "list");
  }

  if (elements.trainingLevelView) {
    elements.trainingLevelView.classList.toggle("hidden", view !== "level");
  }

  if (elements.ticketDetailView) {
    elements.ticketDetailView.classList.toggle("hidden", view !== "detail");
  }

  if (elements.ticketCreateView) {
    elements.ticketCreateView.classList.toggle("hidden", view !== "create");
  }

  if (elements.scenarioIntroView) {
    elements.scenarioIntroView.classList.toggle("hidden", view !== "scenario");
  }

  if (elements.myPageView) {
    elements.myPageView.classList.toggle("hidden", view !== "mypage");
  }

  const showMyPageNavigation = view === "mypage";
  elements.rmProjectHeader?.classList.toggle("hidden", showMyPageNavigation);
  elements.rmMyPageHeader?.classList.toggle("hidden", !showMyPageNavigation);
  elements.rmMyPageNavigation?.classList.toggle("hidden", !showMyPageNavigation);
  elements.homeNavButton?.classList.remove("is-active");
  elements.ticketNavButton?.classList.toggle("is-active", view !== "mypage");
  elements.myPageNavButton?.classList.toggle("is-active", view === "mypage");
  if (elements.homeNavButton) {
    elements.homeNavButton.removeAttribute("aria-current");
  }
  if (elements.ticketNavButton) {
    elements.ticketNavButton.toggleAttribute("aria-current", view !== "mypage");
  }
  if (elements.myPageNavButton) {
    elements.myPageNavButton.toggleAttribute("aria-current", view === "mypage");
  }
}

function applyTicketDefaults() {
  renderEnvironmentOptions();
  const qaScenario = isQaScenario();
  setControlValue(elements.trackerSelect, qaScenario ? "qa" : ticketDefaults.tracker);
  setControlValue(elements.statusSelect, ticketDefaults.status);
  setControlValue(elements.prioritySelect, ticketDefaults.priority);
  setControlValue(elements.severitySelect, ticketDefaults.severity);
  setControlValue(elements.versionSelect, "");
  setControlValue(elements.environmentSelect, "");
  setControlValue(elements.assigneeSelect, "");
  setControlValue(elements.categorySelect, ticketDefaults.category);
  elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]').forEach((checkbox, index) => {
    checkbox.checked = false;
  });
  setControlValue(elements.startDateInput, ticketDefaults.startDate);
  setControlValue(elements.dueDateInput, ticketDefaults.dueDate);
  setControlValue(elements.progressSelect, ticketDefaults.progress);
  elements.severityField?.classList.toggle("hidden", qaScenario);
}

function applyTicketFieldValues(fields = {}) {
  renderEnvironmentOptions();
  setControlValue(elements.trackerSelect, fields.tracker || ticketDefaults.tracker);
  setControlValue(elements.statusSelect, fields.status || ticketDefaults.status);
  setControlValue(elements.prioritySelect, fields.priority || "");
  setControlValue(elements.severitySelect, fields.severity || "");
  setControlValue(elements.versionSelect, fields.version || "");
  setControlValue(elements.environmentSelect, fields.environment || "");
  setControlValue(elements.assigneeSelect, fields.assigneeId || "");
  setControlValue(elements.categorySelect, fields.category || "");
  setControlValue(elements.startDateInput, fields.startDate || "");
  setControlValue(elements.dueDateInput, fields.dueDate || "");
  setControlValue(elements.progressSelect, String(fields.progress ?? 0));
  const watcherIds = new Set(fields.watcherIds || []);
  elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]').forEach((checkbox) => {
    checkbox.checked = watcherIds.has(checkbox.value);
  });
  elements.severityField?.classList.toggle("hidden", isQaScenario());
}

function getCurrentEvidenceProfile() {
  return state.scenario?.evidenceProfile || null;
}

function getEvidenceFile(fileId) {
  return getCurrentEvidenceProfile()?.files.find((file) => file.id === fileId) || null;
}

function shuffleEvidenceFiles(files, requiredIds, random = Math.random) {
  const shuffled = [...files];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const requiredSet = new Set(requiredIds || []);
  const upperSize = Math.min(requiredSet.size, Math.max(0, shuffled.length - 1));
  const upperIsAllRequired = upperSize > 0
    && shuffled.slice(0, upperSize).every((file) => requiredSet.has(file.id));
  const lowerDecoyIndex = shuffled.findIndex(
    (file, index) => index >= upperSize && !requiredSet.has(file.id)
  );
  if (upperIsAllRequired && lowerDecoyIndex >= 0) {
    const upperRequiredIndex = Math.floor(random() * upperSize);
    [shuffled[upperRequiredIndex], shuffled[lowerDecoyIndex]] = [
      shuffled[lowerDecoyIndex],
      shuffled[upperRequiredIndex],
    ];
  }
  return shuffled;
}

function getOrderedEvidenceFiles(profile = getCurrentEvidenceProfile()) {
  if (!profile) {
    return [];
  }
  const profileIds = new Set(profile.files.map((file) => file.id));
  const hasCurrentOrder = state.evidencePickerFileOrder.length === profile.files.length
    && state.evidencePickerFileOrder.every((fileId) => profileIds.has(fileId));
  if (!hasCurrentOrder) {
    state.evidencePickerFileOrder = shuffleEvidenceFiles(
      profile.files,
      profile.requiredIds
    ).map((file) => file.id);
  }
  return state.evidencePickerFileOrder
    .map((fileId) => profile.files.find((file) => file.id === fileId))
    .filter(Boolean);
}

function closeEvidencePicker() {
  state.evidencePickerOpen = false;
  elements.evidencePickerOverlay?.classList.add("hidden");
  elements.openEvidencePickerButton?.focus();
}

function renderEvidenceAttachment() {
  const profile = getCurrentEvidenceProfile();
  elements.evidenceAttachmentSection?.classList.toggle("hidden", !profile);
  if (!profile || !elements.attachedEvidenceList) {
    return;
  }

  const selectedFiles = state.selectedEvidenceIds
    .map((fileId) => profile.files.find((file) => file.id === fileId))
    .filter(Boolean);
  elements.attachedEvidenceList.innerHTML = selectedFiles.length === 0
    ? '<span class="attached-evidence-empty">ファイルは添付されていません</span>'
    : selectedFiles
        .map(
          (file) => `
            <div class="attached-evidence-row">
              <span class="attached-evidence-name"><span aria-hidden="true">📎</span>${escapeHtml(file.name)}</span>
              <input
                class="attached-evidence-description"
                type="text"
                maxlength="200"
                placeholder="説明（任意）"
                aria-label="${escapeHtml(file.name)}の説明（任意）"
                data-evidence-description="${escapeHtml(file.id)}"
                value="${escapeHtml(state.evidenceDescriptions[file.id] || "")}"
              />
              <span class="attached-evidence-size">${escapeHtml(file.size)}</span>
              <button type="button" class="attached-evidence-remove" data-remove-evidence="${escapeHtml(file.id)}">削除</button>
            </div>
          `
        )
        .join("");
  if (elements.openEvidencePickerButton) {
    elements.openEvidencePickerButton.textContent =
      selectedFiles.length > 0 ? "添付ファイルを編集" : "添付ファイルを選択";
  }
}

function renderEvidencePreview(file) {
  elements.evidencePreviewEmpty?.classList.toggle("hidden", Boolean(file));
  elements.evidencePreview?.classList.toggle("hidden", !file);
  if (!file) {
    return;
  }

  setTextContent(elements.evidencePreviewIcon, file.icon);
  setTextContent(elements.evidencePreviewName, file.name);
  setTextContent(elements.evidencePreviewSummary, file.summary);
  if (elements.evidencePreviewMetadata) {
    elements.evidencePreviewMetadata.innerHTML = [
      ["種類", file.type],
      ["作成日時", file.createdAt],
      ["更新日時", file.modifiedAt],
      ["取得元", file.source],
      ["環境", file.environment],
    ]
      .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join("");
  }

  if (!elements.evidencePreviewContent) {
    return;
  }
  if (file.previewKind === "table") {
    const tablePreview = Array.isArray(file.preview)
      ? {
          title: "顧客一覧",
          headers: ["顧客ID", "氏名", "電話番号", "登録時刻"],
          rows: file.preview,
        }
      : file.preview;
    elements.evidencePreviewContent.innerHTML = `
      <div class="evidence-capture-window">
        <div class="evidence-capture-bar">${escapeHtml(tablePreview.title)}</div>
        <table>
          <thead><tr>${tablePreview.headers
            .map((header) => `<th>${escapeHtml(header)}</th>`)
            .join("")}</tr></thead>
          <tbody>
            ${tablePreview.rows
              .map(
                (row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    return;
  }
  if (file.previewKind === "capture" || file.previewKind === "search") {
    elements.evidencePreviewContent.innerHTML = `
      <div class="evidence-capture-window">
        <div class="evidence-capture-bar">${escapeHtml(
          file.previewKind === "search" ? "顧客検索" : file.type
        )}</div>
        <div class="evidence-search-capture">
          ${file.preview.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
        </div>
      </div>`;
    return;
  }
  const codeClass = file.previewKind === "har" ? "is-network" : "";
  elements.evidencePreviewContent.innerHTML =
    `<pre class="evidence-preview-code ${codeClass}">${escapeHtml(file.preview.join("\n"))}</pre>`;
}

function renderEvidencePicker() {
  const profile = getCurrentEvidenceProfile();
  if (!profile) {
    closeEvidencePicker();
    return;
  }
  setTextContent(elements.evidenceFolderPath, profile.folder);
  setTextContent(elements.evidenceSelectionCount, `${state.evidencePickerDraftIds.length}個選択`);
  if (elements.attachEvidenceButton) {
    elements.attachEvidenceButton.disabled = state.evidencePickerDraftIds.length === 0;
  }
  if (elements.evidenceFileList) {
    const selectedIds = new Set(state.evidencePickerDraftIds);
    elements.evidenceFileList.innerHTML = getOrderedEvidenceFiles(profile)
      .map(
        (file) => `
          <div class="windows-file-row ${selectedIds.has(file.id) ? "is-selected" : ""} ${
            state.evidencePreviewId === file.id ? "is-previewing" : ""
          }">
            <div class="windows-file-name-cell">
              <input
                type="checkbox"
                data-evidence-select="${escapeHtml(file.id)}"
                aria-label="${escapeHtml(file.name)}を選択"
                ${selectedIds.has(file.id) ? "checked" : ""}
              />
              <button type="button" class="windows-file-name-button" data-evidence-preview="${escapeHtml(file.id)}">
                <span aria-hidden="true">${escapeHtml(file.icon)}</span>
                <span>${escapeHtml(file.name)}</span>
              </button>
            </div>
            <span>${escapeHtml(file.modifiedAt)}</span>
            <span>${escapeHtml(file.type)}</span>
            <span>${escapeHtml(file.size)}</span>
          </div>
        `
      )
      .join("");
  }
  renderEvidencePreview(getEvidenceFile(state.evidencePreviewId));
}

function openEvidencePicker() {
  const profile = getCurrentEvidenceProfile();
  if (!profile || !state.awaitingCreate) {
    return;
  }
  state.evidencePickerDraftIds = [...state.selectedEvidenceIds];
  state.evidencePreviewId = state.selectedEvidenceIds[0] || getOrderedEvidenceFiles(profile)[0]?.id || "";
  state.evidencePickerOpen = true;
  renderEvidencePicker();
  elements.evidencePickerOverlay?.classList.remove("hidden");
  elements.closeEvidencePickerButton?.focus();
}

function handleEvidenceFileListChange(event) {
  const checkbox = event.target.closest("[data-evidence-select]");
  if (!checkbox) {
    return;
  }
  const fileId = checkbox.dataset.evidenceSelect;
  const selectedIds = new Set(state.evidencePickerDraftIds);
  if (checkbox.checked) {
    selectedIds.add(fileId);
  } else {
    selectedIds.delete(fileId);
  }
  state.evidencePickerDraftIds = [...selectedIds];
  state.evidencePreviewId = fileId;
  renderEvidencePicker();
}

function handleEvidenceFileListClick(event) {
  const previewButton = event.target.closest("[data-evidence-preview]");
  if (!previewButton) {
    return;
  }
  state.evidencePreviewId = previewButton.dataset.evidencePreview;
  renderEvidencePicker();
}

function applyEvidenceSelection() {
  if (state.evidencePickerDraftIds.length === 0) {
    return;
  }
  const shouldAdvanceToWatchers = state.evidenceSetupActive;
  state.selectedEvidenceIds = [...state.evidencePickerDraftIds];
  closeEvidencePicker();
  renderEvidenceAttachment();
  if (shouldAdvanceToWatchers) {
    beginWatcherSetup();
  }
}

function handleAttachedEvidenceClick(event) {
  const removeButton = event.target.closest("[data-remove-evidence]");
  if (!removeButton || !state.awaitingCreate) {
    return;
  }
  state.selectedEvidenceIds = state.selectedEvidenceIds.filter(
    (fileId) => fileId !== removeButton.dataset.removeEvidence
  );
  renderEvidenceAttachment();
}

function handleAttachedEvidenceInput(event) {
  const descriptionInput = event.target.closest("[data-evidence-description]");
  if (!descriptionInput || !state.awaitingCreate) {
    return;
  }
  const fileId = descriptionInput.dataset.evidenceDescription;
  if (!state.selectedEvidenceIds.includes(fileId)) {
    return;
  }
  state.evidenceDescriptions[fileId] = descriptionInput.value.slice(0, 200);
}

function getSelectedEvidenceDescriptions() {
  return Object.fromEntries(
    state.selectedEvidenceIds.map((fileId) => [
      fileId,
      String(state.evidenceDescriptions[fileId] || "").slice(0, 200),
    ])
  );
}

function getReportSectionLines(sectionName) {
  const entries = state.scenario.reportEntries;
  const sectionIndex = entries.findIndex((entry) => entry.kind === "section" && entry.text === sectionName);
  if (sectionIndex < 0) {
    return [];
  }
  const lines = [];
  for (let index = sectionIndex + 1; index < entries.length && entries[index].kind !== "section"; index += 1) {
    lines.push(entries[index].text);
  }
  return lines;
}

function getReportSectionText(sectionName) {
  return getReportSectionLines(sectionName).join(" ");
}

function formatJapaneseScenarioDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return `${year}年${month}月${day}日 10:30`;
}

function formatEnvironmentFacts(lines) {
  return lines.map((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex > 0) {
      const rawLabel = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      const label = environmentLabelRules.find(([pattern]) => pattern.test(rawLabel))?.[1] || rawLabel;
      return [label, value];
    }
    if (/Chrome|Edge|Firefox|Safari/.test(line)) {
      return ["ブラウザ", line];
    }
    if (/Windows|macOS|iOS|Android/.test(line)) {
      return ["OS", line];
    }
    if (/iPhone|iPad|Pixel|Galaxy/.test(line)) {
      return ["端末", line];
    }
    if (/^(App|Web|Client|Storefront|Release|Build)\b/i.test(line)) {
      return ["ソフトウェア", line];
    }
    return ["確認環境", line];
  });
}

const scenarioGlossaryEntries = [
  {
    term: "CAN",
    match: /\bCAN\b|CANバス|CAN信号/,
    description: "車載ECU同士が、少ない配線でリアルタイムに情報をやり取りするための通信規格。",
  },
  {
    term: "CANoe",
    match: /CANoe/,
    description: "CAN通信の送信・監視・シミュレーションなどに使うVector社の車載ネットワーク開発ツール。",
  },
  {
    term: "ECU",
    match: /ECU/,
    description: "車両の機能を制御する電子制御ユニット。用途ごとに複数搭載される。",
  },
  {
    term: "ADAS",
    match: /ADAS/,
    description: "先進運転支援システム。衝突被害軽減ブレーキや車線維持支援などを含む。",
  },
  {
    term: "Bus-Off",
    match: /Bus-Off/,
    description: "送信エラーが規定回数を超えたCANノードが、バスへ悪影響を与えないよう通信から離脱する状態。",
  },
  {
    term: "バス負荷率",
    match: /バス負荷率|高バス負荷|高負荷試験/,
    description: "一定時間のうちCANバスが通信に使用されている割合。高いほど送信待ちや処理負荷が増える。",
  },
  {
    term: "DBC",
    match: /DBC/,
    description: "CANメッセージ内の信号位置、長さ、単位、変換式などを定義するデータベースファイル。",
  },
  {
    term: "リトルエンディアン",
    match: /リトルエンディアン/,
    description: "複数バイトの値を、下位バイトから並べるデータ表現方式。",
  },
  {
    term: "バイト順",
    match: /バイト順/,
    description: "複数バイトのデータをどの順番で解釈するかという規則。誤ると受信値が大きく変わる。",
  },
  {
    term: "冪等キー",
    match: /冪等キー/,
    description: "同じ要求が再送されても処理を一度だけ成立させるため、要求を識別するキー。",
  },
  {
    term: "与信",
    match: /与信/,
    description: "カードなどで支払い可能か確認し、利用枠を一時的に確保する処理。",
  },
  {
    term: "決済通知",
    match: /決済通知/,
    description: "決済サービスから加盟店システムへ、取引結果を非同期に知らせる通知。",
  },
  {
    term: "Sandbox",
    match: /Sandbox/,
    description: "本番の請求やデータへ影響させず、連携や決済を試せるテスト用環境。",
  },
  {
    term: "API",
    match: /\bAPI\b|APIへ|APIを/,
    description: "システム同士が決められた形式で機能やデータをやり取りするための窓口。",
  },
  {
    term: "ロット",
    match: /ロット/,
    description: "同じ条件で製造・入荷された商品をまとめて管理する単位。",
  },
  {
    term: "先入れ先出し",
    match: /先入れ先出し|FIFO/,
    description: "先に入庫した在庫から先に出庫する在庫管理方式。",
  },
  {
    term: "引当",
    match: /引当|引き当て/,
    description: "注文や出庫に使用する在庫をあらかじめ確保し、ほかの処理で使われないようにすること。",
  },
  {
    term: "発注点",
    match: /発注点/,
    description: "在庫がこの数量以下になったら、補充や発注が必要と判断する基準値。",
  },
  {
    term: "帳簿在庫・利用可能在庫",
    match: /帳簿在庫|利用可能在庫/,
    description: "帳簿在庫は記録上の総数、利用可能在庫は引当済みなどを除いて実際に使える数量。",
  },
  {
    term: "排他制御",
    match: /排他制御/,
    description: "同じデータを同時に更新して不整合が起きないよう、処理順を制御する仕組み。",
  },
  {
    term: "バックグラウンド",
    match: /バックグラウンド/,
    description: "アプリが画面の前面には表示されていないが、終了はしていない実行状態。",
  },
  {
    term: "プッシュ通知",
    match: /プッシュ通知/,
    description: "アプリを開いていないときでも、サーバーから端末へお知らせを届ける仕組み。",
  },
  {
    term: "端末トークン",
    match: /端末トークン|トークン値/,
    description: "プッシュ通知の送信先となる端末やアプリを識別するための値。",
  },
  {
    term: "生体認証",
    match: /生体認証/,
    description: "指紋や顔など、本人の身体的な特徴を使って利用者を確認する認証方法。",
  },
  {
    term: "フォールバック",
    match: /フォールバック/,
    description: "通常の方法を利用できない場合に、別の方法へ切り替えて処理を継続する仕組み。",
  },
  {
    term: "不揮発メモリ",
    match: /不揮発メモリ/,
    description: "電源を切っても保存内容が消えない記憶領域。車両設定などの保持に使われる。",
  },
  {
    term: "メモリ解放",
    match: /メモリ解放/,
    description: "OSやアプリが不要な作業領域を回収すること。保持方法が不適切だと未保存データが失われる。",
  },
  {
    term: "同期",
    match: /同期/,
    description: "端末側とサーバー側など、複数の場所にあるデータの状態をそろえる処理。",
  },
  {
    term: "Webhook",
    match: /Webhook/,
    description: "ある処理の発生をきっかけに、別システムの指定先へインターネット経由で自動通知する仕組み。",
  },
  {
    term: "Retry-After",
    match: /Retry-After/,
    description: "通信の応答に付けられ、次の要求や再送まで何秒待つかを送信元へ伝える追加情報。",
  },
  {
    term: "HTTP 409・429",
    match: /(?:HTTP)?\s*(?:409|429)(?:応答|エラー|になる|を返)/,
    description: "通信結果を表す番号。409は処理状態の競合、429は短時間に要求が集中した状態を示す。",
  },
  {
    term: "DBスキーマ",
    match: /Database schema|DBスキーマ/,
    description: "データベースのテーブル、項目、型、関係などを定めた構造。",
  },
  {
    term: "投薬量",
    match: /投薬量/,
    description: "患者へ投与する薬剤の量。体重や単位の誤りが重大な安全リスクにつながる。",
  },
  {
    term: "検査結果ID",
    match: /検査結果ID/,
    description: "検査結果を一意に識別する番号。再送時の重複登録防止にも使用できる。",
  },
  {
    term: "売上確定",
    match: /売上確定|一部確定/,
    description: "与信で確保した金額について、実際の請求を成立させる決済処理。",
  },
  {
    term: "打刻",
    match: /打刻/,
    description: "出勤・退勤などの時刻を勤怠システムへ記録する操作。",
  },
  {
    term: "所定時間",
    match: /所定時間|所定労働時間/,
    description: "勤務表や雇用条件などで、あらかじめ働くことが決められている時間。",
  },
  {
    term: "控除",
    match: /控除/,
    description: "集計対象の時間や金額から、条件に該当する分を差し引くこと。",
  },
  {
    term: "コンテキストメニュー",
    match: /コンテキストメニュー|右クリック/,
    description: "選択中の対象に応じた操作を表示するメニュー。一般的には右クリックで開く。",
  },
  {
    term: "ページング",
    match: /ページング/,
    description: "件数の多い一覧を複数ページに分け、前後のページへ切り替えて表示する仕組み。",
  },
  {
    term: "重複登録",
    match: /重複登録|複数件登録|二件登録/,
    description: "同じ意味を持つデータが、意図せず複数作成されてしまう状態。",
  },
  {
    term: "予約枠",
    match: /予約枠|予約可能|予約済み/,
    description: "担当者や設備について、利用者が予約できる時間帯の管理単位。",
  },
  {
    term: "同時予約",
    match: /同時予約|同時操作/,
    description: "複数の利用者が、同じ予約枠をほぼ同時に確定しようとする操作。",
  },
  {
    term: "税込価格",
    match: /税込価格|税率/,
    description: "商品価格に消費税を加えた金額。計算単位によって端数の結果が変わる場合がある。",
  },
  {
    term: "端数処理",
    match: /端数処理|端数/,
    description: "計算結果の小数部分を切り捨て・切り上げ・四捨五入などで整数へそろえる処理。",
  },
  {
    term: "境界値テスト",
    match: /境界値テスト/,
    description: "条件が切り替わる値と、その直前・直後の値を使って動作を確認するテスト。",
  },
  {
    term: "イグニッション",
    match: /イグニッション/,
    description: "車両の電源状態を操作する仕組み。ONで車載機器が起動し、OFFで停止処理へ進む。",
  },
  {
    term: "IVI",
    match: /\bIVI\b/,
    description: "ナビ、オーディオ、電話連携などを提供する車載インフォテインメントシステム。",
  },
  {
    term: "ドライバープロファイル",
    match: /ドライバープロファイル|プロファイル[AB]|プロファイル切替/,
    description: "運転者ごとにシート位置や表示、オーディオなどの個人設定をまとめて保存する単位。",
  },
  {
    term: "オートホールド",
    match: /オートホールド/,
    description: "停車後にブレーキペダルから足を離しても、車両の停止状態を保つ機能。",
  },
  {
    term: "設定復元テスト",
    match: /設定復元テスト|設定.{0,20}復元|保存した設定を復元/,
    description: "保存済みの設定が、再起動や利用者の切り替え後に正しく読み戻されるか確認するテスト。",
  },
  {
    term: "オーディオソース",
    match: /オーディオソース|再生ソース/,
    description: "ラジオやBluetoothオーディオなど、現在選択している音声の再生元。",
  },
  {
    term: "ハンズフリー通話",
    match: /ハンズフリー通話|ハンズフリー/,
    description: "車載マイクとスピーカーを使い、電話機を手に持たずに行う通話。",
  },
];

function getScenarioGlossaryItems(context) {
  const scenarioText = [
    state.scenario.subject?.text,
    ...state.scenario.reportEntries.map((entry) => entry.text),
    ...Object.values(context),
  ].filter(Boolean).join(" ");
  return scenarioGlossaryEntries
    .filter((entry) => entry.match.test(scenarioText))
    .map((entry) => [entry.term, entry.description]);
}

function renderScenarioBrief() {
  renderTrainingLevel();
  const context = state.scenario.evaluation.context || {};
  const qaScenario = isQaScenario();
  setTextContent(elements.scenarioIntroTitle, qaScenario ? "QAシナリオ" : "バグシナリオ");
  setTextContent(elements.scenarioPanelTitle, qaScenario ? "QAシナリオ" : "バグシナリオ");
  setTextContent(elements.ticketCreateTitle, qaScenario ? "新しいQA" : "新しいチケット");
  elements.scenarioPanel?.setAttribute("aria-label", qaScenario ? "QAシナリオ" : "バグシナリオ");
  document.querySelectorAll(".scenario-category-rules").forEach((rules) => {
    rules.classList.toggle("hidden", state.trainingLevel === "beginner");
  });
  document.querySelectorAll(".scenario-priority-rules").forEach((rules) => {
    rules.classList.toggle("hidden", state.trainingLevel !== "advanced");
  });
  elements.scenarioIntroSeverityRules?.classList.toggle(
    "hidden",
    qaScenario || state.trainingLevel !== "advanced"
  );
  elements.scenarioPanelSeverityRules?.classList.toggle(
    "hidden",
    qaScenario || state.trainingLevel !== "advanced"
  );
  if (elements.trackerSelect) {
    elements.trackerSelect.setAttribute(
      "aria-label",
      qaScenario ? "トラッカー（QA固定）" : "トラッカー（バグ固定）"
    );
  }
  elements.severityField?.classList.toggle("hidden", qaScenario);
  const project = getCurrentProject();
  const targetImageAlt = `${project.name}のテスト対象イメージ`;
  [
    {
      card: elements.scenarioIntroTargetCard,
      image: elements.scenarioIntroTargetImage,
      name: elements.scenarioIntroTargetName,
    },
    {
      card: elements.scenarioPanelTargetCard,
      image: elements.scenarioPanelTargetImage,
      name: elements.scenarioPanelTargetName,
    },
  ].forEach(({ card, image, name }) => {
    const hasImage = Boolean(project.testTargetImage);
    card?.classList.toggle("hidden", !hasImage);
    setTextContent(name, project.name);
    if (!image) return;
    if (!hasImage) {
      if (typeof image.removeAttribute === "function") {
        image.removeAttribute("src");
      } else {
        image.src = "";
      }
      image.alt = "";
      return;
    }
    const currentSource = typeof image.getAttribute === "function"
      ? image.getAttribute("src")
      : image.src;
    if (currentSource !== project.testTargetImage) {
      image.src = project.testTargetImage;
    }
    image.alt = targetImageAlt;
  });
  const assignee = project.members.find((member) => member.id === state.scenario.evaluation.assignee);
  const relatedWatcherId = state.scenario.evaluation.watchers
    ?.find((memberId) => memberId !== state.scenario.evaluation.assignee);
  const relatedMember = project.members.find(
    (member) => member.id === relatedWatcherId
  );
  const environmentMemo = [
    `確認日時：${formatJapaneseScenarioDate(getLocalDateInputValue())}`,
    ...(context.environmentFacts || []).map(([label, value]) => `${label}：${value}`),
  ].join("\n");
  const peopleInfo = [
    assignee ? `${assignee.name}（${assignee.role}）` : "",
    relatedMember ? `${relatedMember.name}（${relatedMember.role}）` : "",
  ].filter(Boolean).join("\n");
  const sectionLines = new Map();
  let currentSection = "";
  const briefingReportEntries = (qaScenario
    ? window.TYPING_WORKBENCH_QA_SCENARIO_AUTHORING?.[state.scenario.scenarioId]
    : window.TYPING_WORKBENCH_SCENARIO_AUTHORING?.[state.scenario.scenarioId])
      ?.scenario?.report || state.scenario.reportEntries;
  briefingReportEntries.forEach((entry) => {
    if (entry.kind === "section") {
      currentSection = entry.text;
      sectionLines.set(currentSection, []);
    } else if (entry.kind === "line" && currentSection) {
      sectionLines.get(currentSection)?.push(entry.text);
    }
  });
  const sectionText = (sectionName, separator = " ") =>
    (sectionLines.get(sectionName) || []).join(separator);
  let scopedFactItems = [];
  if (state.trainingLevel === "beginner" && qaScenario) {
    scopedFactItems = [
      ["", context.testTarget, "testTarget"],
      ["確認した状況", sectionText("■確認した状況・事実"), "observation"],
      ["仕様書で不明な点", sectionText("■参照情報"), "sourceGap"],
      ["確認したいこと", sectionText("■質問"), "question"],
    ];
  } else if (state.trainingLevel === "beginner") {
    const preconditions = sectionText("■前提条件");
    const steps = sectionText("■操作手順", "\n");
    const beginnerSummary = [
      context.testTarget,
      preconditions ? `前提状態：${preconditions}` : "",
      steps ? `実行した操作：\n${steps}` : "",
      `仕様上の動作：${sectionText("■期待結果")}`,
      `確認した事実：${sectionText("■実際の動作")}`,
    ].filter(Boolean).join("\n\n");
    scopedFactItems = [["", beginnerSummary, "testTarget observation"]];
  } else if (state.trainingLevel === "intermediate" && qaScenario) {
    scopedFactItems = [
      [
        "起票前の確認メモ",
        buildIntermediateQaWorkMemo(context, sectionText),
        "testTarget observation sourceGap interpretation impact",
      ],
    ];
  } else if (state.trainingLevel === "intermediate") {
    scopedFactItems = [
      [
        "テスト担当者のメモ",
        buildIntermediateBugTestMemo(context, sectionText),
        "testTarget observation",
      ],
      [
        "追加メモ",
        getIntermediateComparison(state.scenario.scenarioId) || sectionText("■備考"),
        "observation",
      ],
    ];
  }
  const factItems = scopedFactItems
    .filter(([, value]) => value);
  if (factItems.length === 0 && context.workMemo) {
    factItems.push([
      "",
      context.workMemo,
      "testTarget observation scope risk recovery workaround",
    ]);
  }
  const specificationInfo = [
    context.specification,
    ...getScenarioSpecificationDetails(state.scenario),
  ].filter(Boolean).join("\n");
  const decisionItems = [
    ...(qaScenario ? [["質問種別", getQaTypeLabel(state.scenario.qaType), "qaType"]] : []),
    ["確認日時・環境", environmentMemo, "occurredAt environment"],
    ["関連資料", specificationInfo, "specification"],
    ...(state.trainingLevel === "advanced" ? [
      ["対応日程", formatPeripheralSchedule(context.schedule), "schedule risk"],
      ["関係者", peopleInfo, "assignee related"],
    ] : []),
  ].filter(([, value]) => value);
  const renderBriefValue = (value, key) => {
    if (key.split(/\s+/u).includes("schedule")) {
      const scheduleMarkup = String(value)
        .split("\n")
        .filter(Boolean)
        .map((line) => `<span class="scenario-schedule-line">${escapeHtml(line)}</span>`)
        .join("");
      return `<dd class="scenario-schedule-copy">${scheduleMarkup}</dd>`;
    }
    if (key !== "specification") {
      return `<dd>${escapeHtml(value)}</dd>`;
    }
    const [reference, ...details] = String(value).split("\n").filter(Boolean);
    const detailMarkup = details
      .map((detail) => `<span class="scenario-specification-statement">${escapeHtml(detail)}</span>`)
      .join("");
    return `<dd class="scenario-specification-copy"><span class="scenario-specification-reference">${escapeHtml(reference || "")}</span>${detailMarkup}</dd>`;
  };
  const renderBriefItems = (items) => items
    .map(([label, value, key = ""]) => {
      const labelMarkup = label ? `<dt>${escapeHtml(label)}</dt>` : "";
      const unlabeledClass = label ? "" : ' class="is-unlabeled"';
      return `<div${unlabeledClass} data-brief-key="${escapeHtml(key)}">${labelMarkup}${renderBriefValue(value, key)}</div>`;
    })
    .join("");
  const glossaryItems = getScenarioGlossaryItems(context);
  const glossaryMarkup = renderBriefItems(glossaryItems);
  const markup = renderBriefItems([...factItems, ...decisionItems]);
  if (elements.scenarioBrief) {
    elements.scenarioBrief.innerHTML = markup;
  }
  if (elements.scenarioIntroFacts) {
    elements.scenarioIntroFacts.innerHTML = renderBriefItems(factItems);
  }
  if (elements.scenarioIntroDecision) {
    elements.scenarioIntroDecision.innerHTML = renderBriefItems(decisionItems);
  }
  if (elements.scenarioIntroGlossary) {
    elements.scenarioIntroGlossary.innerHTML = glossaryMarkup;
    elements.scenarioIntroGlossary.closest(".scenario-glossary")?.classList.toggle("hidden", glossaryItems.length === 0);
  }
  if (elements.scenarioGlossary) {
    elements.scenarioGlossary.innerHTML = glossaryMarkup;
    elements.scenarioGlossary.closest(".scenario-glossary-compact")?.classList.toggle("hidden", glossaryItems.length === 0);
  }
  if (elements.scenarioPanelBody) {
    elements.scenarioPanelBody.scrollTop = 0;
  }
}

function on(element, eventName, handler) {
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function getScenarioReferenceConfig(field) {
  if (field === elements.severitySelect) {
    return { label: "障害レベル", keys: ["risk", "scope", "recovery", "workaround"] };
  }
  if (field === elements.prioritySelect) {
    return { label: "優先度", keys: ["schedule", "risk"] };
  }
  if (field === elements.assigneeSelect) {
    return { label: "担当者", keys: ["assignee", "related"] };
  }
  if (field === elements.categorySelect) {
    return { label: "カテゴリ", keys: ["category", "observation"] };
  }
  if (field === elements.versionSelect) {
    return { label: "確認バージョン", keys: ["environment"] };
  }
  if (field === elements.environmentSelect) {
    return { label: "確認環境・構成", keys: ["environment"] };
  }
  if (field === elements.dueDateInput) {
    return { label: "期日", keys: ["schedule"] };
  }
  return null;
}

function clearScenarioReferenceHighlight() {
  elements.scenarioBrief?.querySelectorAll(".is-reference").forEach((item) => {
    item.classList.remove("is-reference");
  });
  if (elements.scenarioReferenceHint) {
    elements.scenarioReferenceHint.textContent = "";
    elements.scenarioReferenceHint.classList.add("hidden");
  }
}

function showScenarioReferences(config) {
  clearScenarioReferenceHighlight();
  if (!config || !elements.scenarioBrief) {
    return;
  }

  const referenceItems = [...elements.scenarioBrief.querySelectorAll("[data-brief-key]")]
    .filter((item) =>
      (item.dataset.briefKey || "")
        .split(/\s+/)
        .some((key) => config.keys.includes(key))
    );
  referenceItems.forEach((item) => item.classList.add("is-reference"));

  if (elements.scenarioReferenceHint) {
    elements.scenarioReferenceHint.textContent = `比較中：${config.label}`;
    elements.scenarioReferenceHint.classList.remove("hidden");
  }

  const primaryItem = referenceItems[0];
  if (primaryItem && elements.scenarioPanelBody && typeof elements.scenarioPanelBody.scrollTo === "function") {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      const bodyRect = elements.scenarioPanelBody.getBoundingClientRect();
      const itemRect = primaryItem.getBoundingClientRect();
      const targetScrollTop =
        elements.scenarioPanelBody.scrollTop +
        itemRect.top -
        bodyRect.top -
        (bodyRect.height - itemRect.height) / 2;
      elements.scenarioPanelBody.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }
}

function getSetupFields() {
  const level = normalizeTrainingLevel(state.trainingLevel);
  if (level === "beginner") {
    return [];
  }
  if (level === "intermediate") {
    return [
      elements.categorySelect,
      elements.versionSelect,
      elements.environmentSelect,
    ].filter(Boolean);
  }
  return [
    ...(isQaScenario() ? [] : [elements.severitySelect]),
    elements.prioritySelect,
    elements.assigneeSelect,
    elements.categorySelect,
    elements.versionSelect,
    elements.environmentSelect,
    elements.dueDateInput,
  ].filter(Boolean);
}

function clearSetupHighlight() {
  getSetupFields().forEach((field) => {
    field.disabled = false;
    field.closest(".ticket-field")?.classList.remove("is-guided-focus");
  });
  if (elements.dueDateUnsetButton) {
    elements.dueDateUnsetButton.disabled = false;
  }
  elements.ticketWatchersList?.closest(".ticket-watchers")?.classList.remove("is-guided-focus");
  elements.evidenceAttachmentSection?.classList.remove("is-guided-focus");
  elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]').forEach((checkbox) => {
    checkbox.disabled = false;
  });
  clearScenarioReferenceHighlight();
}

function focusCurrentSetupField() {
  const fields = getSetupFields();
  fields.forEach((field, index) => {
    const isCurrent = index === state.setupStepIndex;
    field.disabled = index > state.setupStepIndex;
    field.closest(".ticket-field")?.classList.toggle("is-guided-focus", isCurrent);
  });
  if (elements.dueDateUnsetButton) {
    elements.dueDateUnsetButton.disabled = fields[state.setupStepIndex] !== elements.dueDateInput;
  }
  const currentField = fields[state.setupStepIndex];
  currentField?.focus();
  showScenarioReferences(getScenarioReferenceConfig(currentField));
}

function beginSetupFlow() {
  if (getSetupFields().length === 0) {
    finishSetupFlow();
    return;
  }
  state.setupComplete = false;
  state.setupStepIndex = 0;
  focusCurrentSetupField();
}

function finishSetupFlow() {
  state.setupComplete = true;
  state.evidenceSetupActive = false;
  clearSetupHighlight();
  state.running = false;
  state.awaitingCreate = true;
  state.finalElapsedMs = getSessionElapsedMs();
  stopSessionTimers();
  if (elements.typingInput) {
    elements.typingInput.disabled = true;
  }
  renderReport();
  pushMetrics();
  syncControls();
}

function beginEvidenceSetup() {
  if (!getCurrentEvidenceProfile()) {
    beginWatcherSetup();
    return;
  }
  clearSetupHighlight();
  state.awaitingCreate = true;
  state.evidenceSetupActive = true;
  elements.evidenceAttachmentSection?.classList.add("is-guided-focus");
  elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]').forEach((checkbox) => {
    checkbox.disabled = true;
  });
  if (typeof elements.evidenceAttachmentSection?.scrollIntoView === "function") {
    elements.evidenceAttachmentSection.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  elements.openEvidencePickerButton?.focus();
  showScenarioReferences({
    label: "添付エビデンス",
    keys: ["observation", "environment", "note"],
  });
  syncControls();
}

function beginWatcherSetup() {
  clearSetupHighlight();
  state.awaitingCreate = true;
  state.evidenceSetupActive = false;
  const watcherFieldset = elements.ticketWatchersList?.closest(".ticket-watchers");
  watcherFieldset?.classList.add("is-guided-focus");
  const checkboxes = [...(elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]') || [])];
  checkboxes.forEach((checkbox) => {
    checkbox.disabled = false;
  });
  checkboxes[0]?.focus();
  showScenarioReferences({ label: "ウォッチャー", keys: ["assignee", "related"] });
  syncControls();
}

function handleWatcherSelection() {
  if (
    !state.running ||
    state.evidenceSetupActive ||
    state.setupStepIndex < getSetupFields().length
  ) {
    return;
  }
  showScenarioReferences({ label: "ウォッチャー", keys: ["assignee", "related"] });
}

function advanceSetupField(targetField, allowEmpty = false) {
  const fields = getSetupFields();
  const currentField = fields[state.setupStepIndex];
  if (targetField !== currentField || (!allowEmpty && !currentField.value)) {
    return;
  }

  currentField.closest(".ticket-field")?.classList.remove("is-guided-focus");
  state.setupStepIndex += 1;
  if (state.setupStepIndex < fields.length) {
    focusCurrentSetupField();
    return;
  }

  if (state.trainingLevel === "advanced") {
    beginEvidenceSetup();
    return;
  }
  finishSetupFlow();
}

function advanceSetupFlow(event) {
  advanceSetupField(event.currentTarget);
}

function handleDueDateUnset() {
  const currentField = getSetupFields()[state.setupStepIndex];
  if (!state.running || currentField !== elements.dueDateInput) {
    return;
  }
  setControlValue(elements.dueDateInput, "");
  advanceSetupField(elements.dueDateInput, true);
}

function getPracticeSectionTitlesForLevel() {
  const level = normalizeTrainingLevel(state.trainingLevel);
  if (level === "advanced") {
    return null;
  }
  if (isQaScenario()) {
    return new Set(level === "beginner"
      ? ["■質問", "■確認した状況・事実"]
      : ["■質問", "■確認した状況・事実", "■参照情報", "■現在の解釈", "■確認理由・影響"]
    );
  }
  return new Set(level === "beginner"
    ? ["■詳細", "■期待結果", "■実際の動作"]
    : ["■詳細", "■前提条件", "■操作手順", "■期待結果", "■実際の動作"]
  );
}

function getPracticeSectionGroups() {
  const groups = [];
  let currentGroup = null;

  state.scenario.reportEntries.forEach((entry) => {
    if (entry.kind === "section") {
      currentGroup = {
        key: `section-${groups.length}`,
        title: entry.text,
        referenceLines: [],
        fixedReferences: [],
      };
      groups.push(currentGroup);
      return;
    }
    if (!currentGroup) {
      return;
    }
    if (entry.kind === "line") {
      currentGroup.referenceLines.push(entry.text);
    }
    if (entry.kind === "reference") {
      currentGroup.fixedReferences.push(entry.text);
    }
  });

  const visibleTitles = getPracticeSectionTitlesForLevel();
  return visibleTitles ? groups.filter((group) => visibleTitles.has(group.title)) : groups;
}

function renderPracticeReport() {
  if (!elements.reportDocument) {
    return;
  }
  elements.reportDocument.classList.add("is-practice");
  elements.reportDocument.innerHTML = getPracticeSectionGroups()
    .map((group) => {
      const heading = escapeHtml(getReportSectionDisplayLabel(group.title));
      const fixedReference = group.fixedReferences.length > 0
        ? `<p class="practice-section-reference">${escapeHtml(group.fixedReferences.join("\n"))}</p>`
        : "";
      if (group.referenceLines.length === 0) {
        return `
          <section class="practice-report-section">
            <h3>${heading}</h3>
            ${fixedReference}
          </section>`;
      }
      const value = state.practiceSections[group.key] || "";
      const isSteps = group.title === "■操作手順";
      return `
        <section class="practice-report-section">
          <h3>${heading}</h3>
          <textarea
            class="practice-section-input ${isSteps ? "is-steps" : ""}"
            data-practice-section="${escapeHtml(group.key)}"
            aria-label="${heading}の本文"
            placeholder="${isSteps ? "第三者が再現できるように、番号を付けて操作を書いてください" : "この項目の文章を入力してください"}"
          >${escapeHtml(value)}</textarea>
          ${fixedReference}
        </section>`;
    })
    .join("");
}

function renderPracticeSubject() {
  if (!elements.subjectDocument) {
    return;
  }
  elements.subjectEditor?.classList.remove("is-complete");
  elements.subjectDocument.innerHTML = `
    <input
      id="practiceSubjectInput"
      class="practice-subject-input"
      type="text"
      maxlength="160"
      autocomplete="off"
      aria-label="チケットの題名"
      placeholder="対象・条件・発生した現象が分かる題名を入力してください"
      value="${escapeHtml(state.practiceSubject)}"
    />`;
}

function renderReport() {
  if (isPracticeMode()) {
    renderPracticeSubject();
    renderPracticeReport();
    positionTypingInput();
    return;
  }

  renderSubjectDocument();

  if (elements.reportDocument) {
    elements.reportDocument.classList.remove("is-practice");
    const rows = state.scenario.reportEntries.map((entry) => {
      if (entry.kind === "section") {
        return `<div class="report-line section">${escapeHtml(getReportSectionDisplayLabel(entry.text))}</div>`;
      }
      if (entry.kind === "reference") {
        return `<div class="report-line reference">${escapeHtml(entry.text)}</div>`;
      }

      const isActive = state.running && entry.order === state.currentEditableOrder;
      const isDone = state.currentEditableOrder > entry.order;
      return renderTypingRow(entry, entry.order, isActive, isDone);
    }).join("");

    elements.reportDocument.innerHTML = rows;

    const activeRow = elements.reportDocument.querySelector(".report-line.active");
    if (activeRow && typeof activeRow.scrollIntoView === "function") {
      activeRow.scrollIntoView({ block: "center", inline: "nearest" });
    }
  }

  positionTypingInput();
}

function clearPracticeWritingStatus() {
  if (!elements.practiceWritingStatus) {
    return;
  }
  elements.practiceWritingStatus.textContent = "";
  elements.practiceWritingStatus.classList.add("hidden");
}

function showPracticeWritingStatus(message) {
  if (!elements.practiceWritingStatus) {
    return;
  }
  elements.practiceWritingStatus.textContent = message;
  elements.practiceWritingStatus.classList.remove("hidden");
}

function getPracticeWritingMissingItems() {
  const missingItems = [];
  const subjectInput = elements.subjectDocument?.querySelector("#practiceSubjectInput");
  if (!state.practiceSubject.trim()) {
    missingItems.push({ label: "題名", element: subjectInput });
    subjectInput?.classList.add("is-invalid");
  }

  getPracticeSectionGroups()
    .filter((group) => group.referenceLines.length > 0)
    .forEach((group) => {
      if ((state.practiceSections[group.key] || "").trim()) {
        return;
      }
      const input = elements.reportDocument?.querySelector(
        `[data-practice-section="${group.key}"]`
      );
      input?.classList.add("is-invalid");
      missingItems.push({
        label: group.title.replace(/^■/, ""),
        element: input,
      });
    });

  return missingItems;
}

function validatePracticeWriting({ focusFirst = true } = {}) {
  if (!isPracticeMode()) {
    return true;
  }
  const missingItems = getPracticeWritingMissingItems();
  if (missingItems.length === 0) {
    return true;
  }
  showPracticeWritingStatus(
    `未入力の項目があります：${missingItems.map((item) => item.label).join("、")}`
  );
  if (focusFirst) {
    missingItems[0].element?.focus();
  }
  return false;
}

function handlePracticeSubjectInput(event) {
  const input = event.target.closest("#practiceSubjectInput");
  if (!input || !isPracticeMode()) {
    return;
  }
  state.practiceSubject = input.value;
  input.classList.remove("is-invalid");
  clearPracticeWritingStatus();
}

function handlePracticeReportInput(event) {
  const input = event.target.closest("[data-practice-section]");
  if (!input || !isPracticeMode()) {
    return;
  }
  state.practiceSections[input.dataset.practiceSection] = input.value;
  input.classList.remove("is-invalid");
  clearPracticeWritingStatus();
}

function completePracticeWriting() {
  if (!isPracticeMode() || !state.running || state.practiceWritingComplete) {
    return;
  }

  if (!validatePracticeWriting()) {
    return;
  }

  state.practiceWritingComplete = true;
  state.completedLines = state.scenario.totalEditableLines;
  state.currentEditableOrder = state.scenario.totalEditableLines;
  clearPracticeWritingStatus();
  beginSetupFlow();
  syncControls();
}

function isDraftLocked(draft, expected) {
  return !expected.some((candidate) => matchesTypingCandidate(draft, candidate));
}

function isDraftComplete(draft, expected) {
  return expected.some((candidate) => matchesTypingCandidate(draft, candidate, true));
}

function adaptGuideNSpelling(guideText, typedText) {
  let guideIndex = 0;
  let typedIndex = 0;
  let adaptedGuide = "";

  while (guideIndex < guideText.length) {
    if (typedIndex >= typedText.length) {
      return `${adaptedGuide}${guideText.slice(guideIndex)}`;
    }

    if (guideText[guideIndex] === "n" && typedText[typedIndex] === "n") {
      const guideRun = getNRun(guideText, guideIndex);
      const typedRun = getNRun(typedText, typedIndex);
      const allowedRun = getAllowedTypedNRun(guideRun);
      const displayedRunLength = typedRun.end === typedText.length
        ? Math.max(typedRun.length, allowedRun.min)
        : typedRun.length;
      adaptedGuide += "n".repeat(displayedRunLength);
      guideIndex = guideRun.end;
      typedIndex = typedRun.end;
      continue;
    }

    if (typedText[typedIndex] !== guideText[guideIndex]) {
      return guideText;
    }
    adaptedGuide += guideText[guideIndex];
    typedIndex += 1;
    guideIndex += 1;
  }

  return typedIndex === typedText.length ? adaptedGuide : guideText;
}

function getGuideCandidate(expected, draft) {
  for (const candidate of expected) {
    if (matchesTypingCandidate(draft, candidate)) {
      const normalized = normalizeTypingText(candidate);
      return {
        raw: candidate,
        normalized: adaptGuideNSpelling(normalized, normalizeTypingText(draft)),
      };
    }
  }

  const fallback = expected[0] ?? "";
  return { raw: fallback, normalized: normalizeTypingText(fallback) };
}

function getGuideWordBoundaries(rawGuide) {
  const boundaries = new Set();

  for (let index = 0; index < rawGuide.length; index += 1) {
    if (/\s/.test(rawGuide[index])) {
      boundaries.add(normalizeTypingText(rawGuide.slice(0, index)).length);
    }
  }

  return boundaries;
}

function renderGuideSegment(guideText, startIndex, endIndex, boundaries) {
  let markup = "";
  const safeStartIndex = Math.max(0, Math.min(startIndex, guideText.length));
  const safeEndIndex = Math.max(safeStartIndex, Math.min(endIndex, guideText.length));

  for (let index = safeStartIndex; index < safeEndIndex; index += 1) {
    if (boundaries.has(index)) {
      markup += '<span class="guide-word-gap">&nbsp;</span>';
    }
    markup += escapeHtml(guideText[index]);
  }

  return markup;
}

function getPendingDoubleNIndex(guideText, draft) {
  const typed = normalizeTypingText(draft);
  if (!typed.endsWith("n")) {
    return -1;
  }

  const pendingIndex = typed.length - 1;
  if (pendingIndex < 0) {
    return -1;
  }

  return guideText.slice(pendingIndex, pendingIndex + 2) === "nn" ? pendingIndex : -1;
}

function positionTypingInput() {
  if (!elements.typingInput) {
    return;
  }

  elements.typingInput.style.top = "0px";
  elements.typingInput.style.left = "0px";
  elements.typingInput.style.width = "1px";
  elements.typingInput.style.height = "1px";
}

function renderTypingRow(entry, order, isActive, isDone, className = "") {
  const guideCandidate = isActive
    ? getGuideCandidate(getExpectedTypingText(), state.currentDraft)
    : { raw: "", normalized: "" };
  const guideText = guideCandidate.normalized;
  const guideWordBoundaries = getGuideWordBoundaries(guideCandidate.raw);
  const typedLength = normalizeTypingText(state.currentDraft).length;
  const pendingDoubleNIndex = isActive ? getPendingDoubleNIndex(guideText, state.currentDraft) : -1;
  const guideFocusIndex = pendingDoubleNIndex >= 0 ? pendingDoubleNIndex : typedLength;
  const guideTyped = renderGuideSegment(guideText, 0, guideFocusIndex, guideWordBoundaries);
  const guidePending = !state.currentError && pendingDoubleNIndex >= 0
    ? renderGuideSegment(guideText, guideFocusIndex, guideFocusIndex + 1, guideWordBoundaries)
    : "";
  const guideWrong = isActive && state.currentError
    ? renderGuideSegment(guideText, guideFocusIndex, guideFocusIndex + 1, guideWordBoundaries)
    : "";
  const guideRemainStart = isActive && state.currentError
    ? guideFocusIndex + 1
    : pendingDoubleNIndex >= 0
      ? pendingDoubleNIndex + 1
      : typedLength;
  const guideRemain = renderGuideSegment(guideText, guideRemainStart, guideText.length, guideWordBoundaries);
  const lineClass = [
    "report-line",
    className,
    isActive ? "active" : "",
    pendingDoubleNIndex >= 0 ? "pending-double-n" : "",
    isActive && state.currentError ? "error" : "",
    isDone ? "done" : "pending",
  ].filter(Boolean).join(" ");

  const content = isActive
    ? `
      <div class="report-line-main">${escapeHtml(entry.text)}</div>
      <div class="report-line-guide" aria-hidden="true">
        <span class="guide-typed">${guideTyped}</span><span class="guide-pending-n">${guidePending}</span><span class="guide-wrong">${guideWrong}</span><span class="guide-caret"></span><span class="guide-rest">${guideRemain}</span>
      </div>
    `
    : `<div class="report-line-main">${escapeHtml(entry.text)}</div>`;

  return `<div class="${lineClass}" data-order="${order}">${content}</div>`;
}

function renderSubjectDocument() {
  if (!elements.subjectDocument) {
    return;
  }
  if (isPracticeMode()) {
    renderPracticeSubject();
    return;
  }

  const isActive = state.running && state.currentEditableOrder === 0;
  const isDone = state.currentEditableOrder > 0;
  if (elements.subjectEditor) {
    elements.subjectEditor.classList.toggle("is-complete", isDone);
  }
  elements.subjectDocument.innerHTML = renderTypingRow(state.scenario.subjectEntry, 0, isActive, isDone, "subject-line");

  if (isActive) {
    const activeRow = elements.subjectDocument.querySelector(".report-line.active");
    if (activeRow && typeof activeRow.scrollIntoView === "function") {
      activeRow.scrollIntoView({ block: "center", inline: "nearest" });
    }
  }
}

function renderChart() {
  const svg = elements.resultChart;
  if (!svg) {
    return;
  }

  const width = 1000;
  const height = 240;
  const pad = { left: 24, right: 18, top: 14, bottom: 28 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const points = state.chartSamples;
  const hasSamples = points.length > 0;
  const lastPoint = points[points.length - 1];
  const chartSpan = Math.max(60, Math.ceil((lastPoint?.t ?? 0) / 10) * 10 || 60);
  const chartMax = 300;

  const x = (t) => pad.left + (Math.max(0, Math.min(chartSpan, t)) / chartSpan) * innerWidth;
  const y = (value) => pad.top + (1 - Math.max(0, Math.min(chartMax, value)) / chartMax) * innerHeight;
  const svgBox = svg.getBoundingClientRect();
  const yScale = svgBox.height > 0 ? svgBox.height / height : 1;

  const gridLines = [0, 100, 200, 300]
    .map((value) => {
      const yy = y(value);
      return `<line x1="${pad.left}" y1="${yy}" x2="${width - pad.right}" y2="${yy}" class="grid-line" />`;
    })
    .join("");

  const yLabels = [
    [elements.resultChartY300, 300],
    [elements.resultChartY200, 200],
    [elements.resultChartY100, 100],
    [elements.resultChartY0, 0],
  ];

  yLabels.forEach(([node, value]) => {
    if (node) {
      node.style.top = `${y(value) * yScale}px`;
    }
  });

  setTextContent(elements.resultChartTimeStart, "0s");
  setTextContent(elements.resultChartTimeMid, `${Math.round(chartSpan / 2)}s`);
  setTextContent(elements.resultChartTimeEnd, `${chartSpan}s`);

  if (!hasSamples) {
    svg.innerHTML = `
      <rect x="0" y="0" width="${width}" height="${height}" fill="none"></rect>
      ${gridLines}
    `;
    return;
  }

  const displayPoints = points.slice();
  const linePoints = displayPoints.length === 1
    ? `${x(0).toFixed(1)},${y(displayPoints[0].value).toFixed(1)} ${x(0.35).toFixed(1)},${y(displayPoints[0].value).toFixed(1)}`
    : displayPoints.map((point) => `${x(point.t).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
  const latest = displayPoints[displayPoints.length - 1];
  const areaMarkup = displayPoints.length > 1
    ? `<path d="M ${x(displayPoints[0].t).toFixed(1)} ${height - pad.bottom} ${displayPoints
        .map((point) => `L ${x(point.t).toFixed(1)} ${y(point.value).toFixed(1)}`)
        .join(" ")} L ${x(latest.t).toFixed(1)} ${height - pad.bottom} Z" class="chart-area"></path>`
    : "";

  svg.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="none"></rect>
    ${gridLines}
    ${areaMarkup}
    <polyline points="${linePoints}" class="chart-line"></polyline>
  `;
}

function sampleChart() {
  if (!state.running) {
    return;
  }

  const currentRate = getTypingPace();
  const t = Math.max(0, getSessionElapsedMs() / 1000);
  if (state.chartSamples.length === 0) {
    state.chartSamples.push({ t: 0, value: currentRate });
  }
  state.chartSamples.push({ t, value: currentRate });
}

function pushMetrics() {
}

function clearLineClearCue() {
  state.lineClearCueToken += 1;
  if (state.lineClearCueTimerId) {
    clearTimeout(state.lineClearCueTimerId);
    state.lineClearCueTimerId = null;
  }

  if (elements.lineClearCue) {
    elements.lineClearCue.classList.remove("visible");
    elements.lineClearCue.classList.add("hidden");
  }

  if (elements.subjectLineClearCue) {
    elements.subjectLineClearCue.classList.remove("visible");
    elements.subjectLineClearCue.classList.add("hidden");
  }
}

function showLineClearCue(order) {
  clearLineClearCue();

  const targetConfig = order === 0
    ? {
        cue: elements.subjectLineClearCue,
        editor: elements.subjectEditor,
        document: elements.subjectDocument,
      }
    : {
        cue: elements.lineClearCue,
        editor: elements.reportEditor,
        document: elements.reportDocument,
      };

  if (!targetConfig.cue || !targetConfig.editor || !targetConfig.document) {
    return;
  }

  const targetRow = targetConfig.document.querySelector(`.report-line[data-order="${order}"]`);
  if (!targetRow) {
    return;
  }

  const rowRect = targetRow.getBoundingClientRect();
  const editorRect = targetConfig.editor.getBoundingClientRect();
  const cueLeft = Math.max(8, Math.min(editorRect.width - 96, rowRect.right - editorRect.left + 10));
  const cueTop = rowRect.top - editorRect.top + rowRect.height / 2;
  const cueToken = state.lineClearCueToken;

  targetConfig.cue.style.left = `${cueLeft}px`;
  targetConfig.cue.style.top = `${cueTop}px`;
  targetConfig.cue.classList.remove("hidden");

  window.requestAnimationFrame(() => {
    if (targetConfig.cue && state.lineClearCueToken === cueToken) {
      targetConfig.cue.classList.add("visible");
    }
  });

  state.lineClearCueTimerId = window.setTimeout(() => {
    if (state.lineClearCueToken === cueToken) {
      clearLineClearCue();
    }
  }, 900);
}

function resetSession() {
  state.running = false;
  state.awaitingCreate = false;
  state.practiceSubject = "";
  state.practiceSections = {};
  state.practiceWritingComplete = false;
  state.practiceScoringStatus = "idle";
  state.practiceScoringResult = null;
  state.practiceScoringError = null;
  state.practiceScoringRequestId += 1;
  state.currentAttemptId = "";
  state.currentAttemptSaved = false;
  state.currentSavedAttempt = null;
  state.revisionPreviousScore = null;
  state.revisionTicketId = "";
  setTextContent(elements.ticketCreateTitle, "新しいチケット");
  setTextContent(elements.createButton, "作成");
  elements.practiceSaveRetryButton?.classList.add("hidden");
  state.selectedEvidenceIds = [];
  state.evidenceDescriptions = {};
  state.evidencePickerDraftIds = [];
  state.evidencePreviewId = "";
  state.evidencePickerFileOrder = [];
  state.evidencePickerOpen = false;
  state.evidenceSetupActive = false;
  state.currentEditableOrder = 0;
  state.currentDraft = "";
  state.totalInputChars = 0;
  state.correctChars = 0;
  state.wrongChars = 0;
  state.completedLines = 0;
  state.currentError = false;
  state.sessionStartAt = null;
  state.chartSamples = [];
  state.inputTimestamps = [];
  state.finalElapsedMs = 0;
  state.setupComplete = false;
  state.setupStepIndex = 0;
  state.resultRadarAnimationToken += 1;
  if (state.resultRadarDelayTimerId) {
    window.clearTimeout(state.resultRadarDelayTimerId);
    state.resultRadarDelayTimerId = null;
  }
  clearLineClearCue();
  clearSetupHighlight();
  applyTicketDefaults();

  stopSessionTimers();

  if (elements.typingInput) {
    elements.typingInput.value = "";
    elements.typingInput.disabled = true;
  }

  if (elements.resultOverlay) {
    elements.resultOverlay.classList.add("hidden");
  }
  elements.evidencePickerOverlay?.classList.add("hidden");
  clearPracticeWritingStatus();
  clearDraftSaveStatus();
  renderEvidenceAttachment();
  setView("list");

  renderReport();
  pushMetrics();
  renderChart();
  syncControls();
}

async function refreshProgressForScenarioSelection() {
  if (!hasAccountIdentity() || !window.TYPING_WORKBENCH_PROFILE_API) {
    return;
  }
  try {
    const response = await window.TYPING_WORKBENCH_PROFILE_API.getProgress();
    state.myPageProgress = Array.isArray(response?.scenarios) ? response.scenarios : [];
  } catch {
    // A progress outage must not block training; current-session history is the fallback.
  }
}

async function startSession(options = {}) {
  if (state.scenarioSelectionPending) {
    return;
  }
  state.scenarioSelectionPending = true;
  const requestedTicketType = options.ticketType === "qa" ? "qa" : "bug";
  if (state.trainingTicketType !== requestedTicketType) {
    state.trainingTicketType = requestedTicketType;
    state.scenarioQueue = [];
    state.scenarioIndex = -1;
  }
  syncControls();
  try {
    if (options.refreshProgress !== false) {
      await refreshProgressForScenarioSelection();
      state.scenarioQueue = [];
    }
    if (!drawNextScenario()) {
      return;
    }
    showScenarioIntro();
  } finally {
    state.scenarioSelectionPending = false;
    syncControls();
  }
}

function showScenarioIntro() {
  resetSession();
  setView("scenario");
  renderScenarioBrief();
  syncControls();
  if (elements.scenarioIntroView) {
    elements.scenarioIntroView.scrollTop = 0;
    window.requestAnimationFrame(() => {
      elements.scenarioIntroView.scrollTop = 0;
    });
  }
}

function completeCurrentLine() {
  const finishedOrder = state.currentEditableOrder;
  state.completedLines += 1;
  state.currentEditableOrder += 1;
  state.currentDraft = "";
  state.currentError = false;

  if (elements.typingInput) {
    elements.typingInput.value = "";
  }

  sampleChart();
  pushMetrics();

  renderReport();
  showLineClearCue(finishedOrder);

  if (state.currentEditableOrder >= state.scenario.totalEditableLines) {
    if (elements.typingInput) {
      elements.typingInput.disabled = true;
    }
    pushMetrics();
    syncControls();
    beginSetupFlow();
    return;
  }

  if (elements.typingInput) {
    elements.typingInput.focus();
  }
}

const fieldLabels = {
  priority: "優先度",
  assignee: "担当者",
  category: "カテゴリ",
  version: "確認バージョン",
  environment: "確認環境・構成",
  severity: "障害レベル",
  dueDate: "期日",
  watchers: "ウォッチャー",
};

const fieldValueLabels = {
  severity: { s1: "S1：重大", s2: "S2：高", s3: "S3：中", s4: "S4：軽微" },
  priority: { low: "低め", normal: "通常", high: "高め", urgent: "緊急" },
  status: { new: "新規", "in-progress": "進行中", resolved: "解決", closed: "完了", "on-hold": "保留" },
  category: {
    ui: "画面・UI",
    workflow: "業務ロジック",
    input: "入力チェック",
    api: "外部連携・API",
  },
};

function getSelectedTicketFields() {
  return {
    tracker: elements.trackerSelect?.value,
    private: false,
    severity: elements.severitySelect?.value,
    priority: elements.prioritySelect?.value,
    status: elements.statusSelect?.value,
    category: elements.categorySelect?.value,
    version: elements.versionSelect?.value,
    environment: elements.environmentSelect?.value,
    assignee: elements.assigneeSelect?.value,
    startDate: elements.startDateInput?.value,
    dueDate: elements.dueDateInput?.value,
    progress: Number(elements.progressSelect?.value || 0),
    watchers: [...(elements.ticketWatchersList?.querySelectorAll('input[name="watchers"]:checked') || [])]
      .map((checkbox) => checkbox.value),
  };
}

function getPracticeTicketFieldPayload(selected = getSelectedTicketFields()) {
  return {
    tracker: selected.tracker || (isQaScenario() ? "qa" : "bug"),
    private: false,
    status: selected.status || "new",
    severity: selected.severity || null,
    priority: selected.priority || null,
    assigneeId: selected.assignee || null,
    category: selected.category || null,
    version: selected.version || null,
    environment: selected.environment || null,
    startDate: selected.startDate || null,
    dueDate: selected.dueDate || null,
    progress: selected.progress,
    watcherIds: selected.watchers,
  };
}

function getLatestPracticeDraft(projectId = state.projectId) {
  return Object.values(state.practiceDrafts)
    .filter((draft) => draft.projectId === projectId)
    .sort((left, right) => String(right.savedAt).localeCompare(String(left.savedAt)))[0] || null;
}

function clearDraftSaveStatus() {
  if (state.draftSaveStatusTimerId) {
    window.clearTimeout(state.draftSaveStatusTimerId);
    state.draftSaveStatusTimerId = null;
  }
  setTextContent(elements.draftSaveStatus, "");
  elements.draftSaveStatus?.classList.add("hidden");
}

function showDraftSaveStatus(message, isError = false) {
  clearDraftSaveStatus();
  setTextContent(elements.draftSaveStatus, message);
  elements.draftSaveStatus?.classList.remove("hidden");
  elements.draftSaveStatus?.classList.toggle("is-error", isError);
  state.draftSaveStatusTimerId = window.setTimeout(() => {
    clearDraftSaveStatus();
  }, 5000);
}

function buildCurrentPracticeDraft() {
  return {
    schemaVersion: "practice-draft.v1",
    scenarioId: state.scenario.scenarioId,
    projectId: state.projectId,
    trainingLevel: state.trainingLevel,
    savedAt: new Date().toISOString(),
    startedAt: state.sessionStartAt
      ? new Date(state.sessionStartAt).toISOString()
      : "",
    practiceWritingComplete: state.practiceWritingComplete,
    answer: {
      subject: state.practiceSubject,
      sections: { ...state.practiceSections },
      ticketFields: getPracticeTicketFieldPayload(),
    },
    selectedEvidenceIds: [...state.selectedEvidenceIds],
    evidenceDescriptions: getSelectedEvidenceDescriptions(),
  };
}

function saveCurrentPracticeDraft() {
  if (
    !isPracticeMode() ||
    state.view !== "create" ||
    (!state.running && !state.awaitingCreate) ||
    state.revisionTicketId
  ) {
    return false;
  }
  const draft = buildCurrentPracticeDraft();
  const nextDrafts = {
    ...state.practiceDrafts,
    [draft.scenarioId]: draft,
  };
  if (!persistPracticeDrafts(nextDrafts)) {
    showDraftSaveStatus("保存できませんでした", true);
    return false;
  }
  state.practiceDrafts = nextDrafts;
  showDraftSaveStatus("このブラウザに保存しました");
  syncControls();
  return true;
}

function deletePracticeDraft(scenarioId) {
  if (!state.practiceDrafts[scenarioId]) {
    return;
  }
  const nextDrafts = { ...state.practiceDrafts };
  delete nextDrafts[scenarioId];
  state.practiceDrafts = nextDrafts;
  persistPracticeDrafts(nextDrafts);
  syncControls();
}

function resumePracticeDraft(draft) {
  if (
    !hasAccountIdentity() ||
    !draft ||
    !selectAuthoringMode("practice") ||
    !selectScenarioById(draft.scenarioId, draft.trainingLevel)
  ) {
    return false;
  }
  resetSession();
  state.practiceSubject = draft.answer.subject;
  state.practiceSections = { ...draft.answer.sections };
  state.selectedEvidenceIds = draft.selectedEvidenceIds.filter((fileId) => getEvidenceFile(fileId));
  state.evidenceDescriptions = { ...(draft.evidenceDescriptions || {}) };
  applyTicketFieldValues(draft.answer.ticketFields);
  renderEvidenceAttachment();
  activateCreateSession();
  if (draft.practiceWritingComplete) {
    state.practiceWritingComplete = true;
    state.completedLines = state.scenario.totalEditableLines;
    state.currentEditableOrder = state.scenario.totalEditableLines;
    finishSetupFlow();
  }
  showDraftSaveStatus("下書きを復元しました");
  syncControls();
  return true;
}

function addCalendarDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateInputValue(date);
}

function getMemberNames(memberIds) {
  const project = getCurrentProject();
  return memberIds
    .map((memberId) => project.members.find((member) => member.id === memberId)?.name || memberId)
    .join("、");
}

function formatDuration(milliseconds) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function getTypingScore(accuracyRate) {
  const normalizedAccuracy = Math.max(0, Math.min(100, accuracyRate));
  return Math.round((normalizedAccuracy / 100) * 20);
}

function getAverageReviewPercent(reviews, keys) {
  const selectedReviews = keys
    .map((key) => reviews.find((review) => review.key === key))
    .filter(Boolean);
  if (selectedReviews.length === 0) {
    return 0;
  }
  return Math.round(
    (selectedReviews.reduce((sum, review) => sum + review.scoreRatio, 0) / selectedReviews.length) * 100
  );
}

function calculateEvidenceResult() {
  const profile = getCurrentEvidenceProfile();
  if (!profile) {
    return {
      applicable: false,
      score: 10,
      selectedFiles: [],
      correctFiles: [],
      wrongFiles: [],
      missingFiles: [],
    };
  }

  const selectedIds = new Set(state.selectedEvidenceIds);
  const requiredIds = new Set(profile.requiredIds);
  const union = new Set([...selectedIds, ...requiredIds]);
  const correctIds = [...selectedIds].filter((fileId) => requiredIds.has(fileId));
  const wrongIds = [...selectedIds].filter((fileId) => !requiredIds.has(fileId));
  const missingIds = [...requiredIds].filter((fileId) => !selectedIds.has(fileId));
  const score = union.size === 0 ? 0 : Math.round((correctIds.length / union.size) * 10);
  const resolveFiles = (fileIds) => fileIds.map((fileId) => getEvidenceFile(fileId)).filter(Boolean);

  return {
    applicable: true,
    score,
    selectedFiles: resolveFiles([...selectedIds]),
    correctFiles: resolveFiles(correctIds),
    wrongFiles: resolveFiles(wrongIds),
    missingFiles: resolveFiles(missingIds),
  };
}

function calculateResult() {
  const expected = state.scenario.evaluation;
  const selected = getSelectedTicketFields();
  const activeReviewKeys = getResultReviewKeys(state.trainingLevel);
  const scoreMaximums = getLocalResultScoreMaximums(state.trainingLevel);
  const keys = Object.keys(fieldLabels).filter((key) => (
    (!isQaScenario() || key !== "severity")
    && (activeReviewKeys === null || activeReviewKeys.has(key))
  ));
  const reviews = keys.map((key) => {
    if (key === "category") {
      const acceptedValues = expected.acceptedCategories || [expected.category];
      const accepted = acceptedValues.includes(selected.category);
      const recommended = selected.category === expected.category;
      return {
        key,
        correct: accepted,
        recommended,
        status: recommended ? "correct" : accepted ? "acceptable" : "wrong",
        scoreRatio: accepted ? 1 : 0,
        selected: fieldValueLabels.category?.[selected.category] || selected.category || "未選択",
        expected: fieldValueLabels.category?.[expected.category] || expected.category || "未設定",
        rationale: expected.categoryRationale || "",
      };
    }
    if (key === "watchers") {
      const selectedSet = new Set(selected.watchers);
      const expectedSet = new Set(expected.watchers);
      const union = new Set([...selectedSet, ...expectedSet]);
      const intersectionCount = [...selectedSet].filter((value) => expectedSet.has(value)).length;
      const scoreRatio = union.size === 0 ? 1 : intersectionCount / union.size;
      return {
        key,
        correct: scoreRatio === 1,
        status: scoreRatio === 1 ? "correct" : "wrong",
        scoreRatio,
        selected: getMemberNames(selected.watchers) || "未選択",
        expected: getMemberNames(expected.watchers),
      };
    }
    if (key === "assignee") {
      return {
        key,
        correct: selected.assignee === expected.assignee,
        status: selected.assignee === expected.assignee ? "correct" : "wrong",
        scoreRatio: selected.assignee === expected.assignee ? 1 : 0,
        selected: getMemberNames([selected.assignee]) || "未選択",
        expected: getMemberNames([expected.assignee]),
      };
    }
    const correct = selected[key] === expected[key];
    return {
      key,
      correct,
      status: correct ? "correct" : "wrong",
      scoreRatio: correct ? 1 : 0,
      selected: fieldValueLabels[key]?.[selected[key]] || selected[key] || "未選択",
      expected: fieldValueLabels[key]?.[expected[key]] || expected[key] || "未設定",
    };
  });
  const decisionScore = scoreMaximums.decision === 0 || reviews.length === 0
    ? 0
    : Math.round(
      (reviews.reduce((sum, review) => sum + review.scoreRatio, 0) / reviews.length)
      * scoreMaximums.decision
    );
  const reportScore = state.completedLines === state.scenario.totalEditableLines
    ? scoreMaximums.report
    : 0;
  const evidenceResult = calculateEvidenceResult();
  const evidenceScore = scoreMaximums.evidence === 0
    ? 0
    : Math.round((evidenceResult.score / 10) * scoreMaximums.evidence);
  const typingScore = getTypingScore(getAccuracyRate());
  const targetTimeMs = state.scenario.difficulty === "beginner"
    ? 180000
    : state.scenario.difficulty === "intermediate"
      ? 240000
      : 300000;
  const timeScore = Math.max(0, Math.round(
    scoreMaximums.time * Math.min(1, targetTimeMs / Math.max(1, state.finalElapsedMs))
  ));
  let total = Math.min(100, decisionScore + reportScore + evidenceScore + typingScore + timeScore);
  const severityReview = reviews.find((review) => review.key === "severity");
  if (severityReview && !severityReview.correct) {
    const selectedLevel = Number.parseInt(selected.severity?.slice(1), 10);
    const expectedLevel = Number.parseInt(expected.severity?.slice(1), 10);
    if (Math.abs(selectedLevel - expectedLevel) >= 2) {
      total = Math.min(total, 84);
    }
  }
  const rank = total >= 95 ? "S" : total >= 85 ? "A" : total >= 70 ? "B" : total >= 50 ? "C" : "D";
  const qaScenario = isQaScenario();
  setTextContent(elements.resultRadarPrimaryLabel, qaScenario ? "設定整合" : "障害判断");
  const radarParameters = [
    {
      label: qaScenario ? "設定整合" : "障害判断",
      value: qaScenario
        ? getAverageReviewPercent(reviews, keys)
        : getAverageReviewPercent(reviews, ["severity"]),
      element: elements.resultRadarSeverity,
    },
    {
      label: "優先度",
      value: getAverageReviewPercent(reviews, ["priority"]),
      element: elements.resultRadarPriority,
    },
    {
      label: "項目設定",
      value: getAverageReviewPercent(reviews, ["category", "version", "environment", "dueDate"]),
      element: elements.resultRadarFields,
    },
    {
      label: "担当・共有",
      value: getAverageReviewPercent(reviews, ["assignee", "watchers"]),
      element: elements.resultRadarPeople,
    },
    {
      label: "報告・証跡",
      value: Math.round(
        ((reportScore + evidenceScore) / (scoreMaximums.report + scoreMaximums.evidence)) * 100
      ),
      element: elements.resultRadarReport,
    },
    {
      label: "入力品質",
      value: Math.round(
        ((typingScore + timeScore) / (scoreMaximums.typing + scoreMaximums.time)) * 100
      ),
      element: elements.resultRadarTyping,
    },
  ];
  return {
    reviews,
    decisionScore,
    reportScore,
    evidenceScore,
    evidenceResult,
    typingScore,
    timeScore,
    scoreMaximums,
    total,
    rank,
    radarParameters,
  };
}

function getResultRadarPoints(values, progress = 1) {
  const centerX = 180;
  const centerY = 160;
  const radius = 105;
  return values
    .map((value, index) => {
      const angle = (-90 + index * 60) * (Math.PI / 180);
      const distance = radius * (Math.max(0, Math.min(100, value)) / 100) * progress;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function animateResultRadar(result) {
  if (!elements.resultRadarValue) {
    return;
  }

  state.resultRadarAnimationToken += 1;
  const animationToken = state.resultRadarAnimationToken;
  if (state.resultRadarDelayTimerId) {
    window.clearTimeout(state.resultRadarDelayTimerId);
  }

  const parameters = result.radarParameters;
  const values = parameters.map((parameter) => parameter.value);
  elements.resultRadarValue.setAttribute("points", getResultRadarPoints(values, 0));
  elements.resultRadarShell?.classList.remove("is-complete");
  parameters.forEach((parameter) => setTextContent(parameter.element, "0"));
  elements.resultRadar?.setAttribute(
    "aria-label",
    parameters.map((parameter) => `${parameter.label} ${parameter.value}点`).join("、")
  );

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const delayMs = prefersReducedMotion ? 0 : 280;
  const durationMs = prefersReducedMotion ? 1 : 820;

  state.resultRadarDelayTimerId = window.setTimeout(() => {
    state.resultRadarDelayTimerId = null;
    let startedAt = null;

    const drawFrame = (timestamp) => {
      if (animationToken !== state.resultRadarAnimationToken) {
        return;
      }
      if (startedAt === null) {
        startedAt = timestamp;
      }
      const elapsed = Math.max(0, timestamp - startedAt);
      const progress = Math.min(1, elapsed / durationMs);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      elements.resultRadarValue.setAttribute("points", getResultRadarPoints(values, easedProgress));
      parameters.forEach((parameter) => {
        setTextContent(parameter.element, String(Math.round(parameter.value * easedProgress)));
      });

      if (progress < 1) {
        window.requestAnimationFrame(drawFrame);
        return;
      }
      elements.resultRadarShell?.classList.add("is-complete");
    };

    window.requestAnimationFrame(drawFrame);
  }, delayMs);
}

function renderEvidenceResult(evidenceResult) {
  elements.resultEvidenceReviewSection?.classList.toggle("hidden", !evidenceResult.applicable);
  if (!evidenceResult.applicable || !elements.resultEvidenceReview) {
    return;
  }

  const summaryClass = evidenceResult.score === 10 ? "is-complete" : "needs-review";
  const summaryText = evidenceResult.score === 10
    ? "発生事象・通信・永続化を裏付ける証跡がそろっています。"
    : `正しい証跡 ${evidenceResult.correctFiles.length}件 / 不要な証跡 ${evidenceResult.wrongFiles.length}件 / 不足 ${evidenceResult.missingFiles.length}件`;
  const renderFile = (file, status, icon, label) => `
    <div class="result-evidence-file ${status}">
      <span class="result-evidence-icon">${icon}</span>
      <div>
        <strong>${escapeHtml(file.name)}</strong>
        <small>${escapeHtml(file.resultReason)}</small>
      </div>
      <span class="result-evidence-status">${label}</span>
    </div>`;

  elements.resultEvidenceReview.innerHTML = `
    <div class="result-evidence-summary ${summaryClass}">${escapeHtml(summaryText)}</div>
    ${evidenceResult.correctFiles
      .map((file) => renderFile(file, "is-correct", "✓", "適切"))
      .join("")}
    ${evidenceResult.wrongFiles
      .map((file) => renderFile(file, "is-wrong", "×", "対象外"))
      .join("")}
    ${evidenceResult.missingFiles
      .map((file) => renderFile(file, "is-missing", "!", "未添付"))
      .join("")}
  `;
}

function renderPracticeComparison() {
  const renderDocument = (subject, resolveSectionText) => {
    const sections = getPracticeSectionGroups()
      .map((group) => {
        const text = resolveSectionText(group);
        if (!text) {
          return "";
        }
        return `<section><strong>${escapeHtml(getReportSectionDisplayLabel(group.title))}</strong><p>${escapeHtml(text)}</p></section>`;
      })
      .join("");
    return `<section><strong>題名</strong><p>${escapeHtml(subject)}</p></section>${sections}`;
  };

  if (elements.practiceResultAnswer) {
    elements.practiceResultAnswer.innerHTML = renderDocument(
      state.practiceSubject,
      (group) => state.practiceSections[group.key] || group.fixedReferences.join("\n")
    );
  }
  if (elements.practiceReferenceAnswer) {
    elements.practiceReferenceAnswer.innerHTML = renderDocument(
      state.scenario.subjectEntry.text,
      (group) => [...group.fixedReferences, ...group.referenceLines].join("\n")
    );
  }
}

function renderPracticeScoringPreviewList(element, items, emptyLabel = "該当なし") {
  if (!element) {
    return;
  }
  element.innerHTML = items.length > 0
    ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : `<li class="is-empty">${escapeHtml(emptyLabel)}</li>`;
}

function getPracticeDimensionDefinitions(qaTicket = isQaScenario()) {
  return qaTicket
    ? [
        ["論点焦点", "questionFocus", 20],
        ["回答容易", "answerability", 20],
        ["根拠明瞭", "sourceGrounding", 15],
        ["事実・解釈", "factInterpretationSeparation", 15],
        ["影響明瞭", "impactClarity", 15],
        ["往復削減", "responseEfficiency", 15],
      ]
    : [
        ["事実性", "factualGrounding", 20],
        ["情報充足", "informationCoverage", 20],
        ["再現性", "reproducibility", 20],
        ["期待・実績", "expectedActualSeparation", 15],
        ["解釈明瞭", "interpretiveClarity", 10],
        ["切り分け", "investigationReadiness", 15],
      ];
}

function getActivePracticeDimensionIds(
  trainingLevel = state.trainingLevel,
  qaTicket = isQaScenario()
) {
  if (normalizeTrainingLevel(trainingLevel) !== "beginner") {
    return null;
  }
  return new Set(qaTicket
    ? ["questionFocus", "answerability", "factInterpretationSeparation"]
    : [
        "factualGrounding",
        "informationCoverage",
        "expectedActualSeparation",
        "interpretiveClarity",
      ]
  );
}

function renderPracticeScoringRadar(preview) {
  const slots = [
    [elements.practiceRadarLabelFactual, elements.practiceRadarFactual],
    [elements.practiceRadarLabelCoverage, elements.practiceRadarCoverage],
    [elements.practiceRadarLabelReproducibility, elements.practiceRadarReproducibility],
    [elements.practiceRadarLabelSeparation, elements.practiceRadarSeparation],
    [elements.practiceRadarLabelClarity, elements.practiceRadarClarity],
    [elements.practiceRadarLabelInvestigation, elements.practiceRadarInvestigation],
  ];
  const definitions = getPracticeDimensionDefinitions();
  const parameters = definitions.map(([label, key], index) => {
    const [labelElement, valueElement] = slots[index];
    setTextContent(labelElement, label);
    return [label, preview.dimensions[key], valueElement];
  });
  elements.practiceScoringRadarValue?.setAttribute(
    "points",
    getResultRadarPoints(parameters.map(([, value]) => value))
  );
  parameters.forEach(([, value, element]) => setTextContent(element, String(value)));
  elements.practiceScoringRadar?.setAttribute(
    "aria-label",
    parameters.map(([label, value]) => `${label} ${value}点`).join("、")
  );
}

function getDimensionFeedbackItems(result, qaTicket = isQaScenario()) {
  const activeDimensionIds = getActivePracticeDimensionIds(state.trainingLevel, qaTicket);
  const definitions = getPracticeDimensionDefinitions(qaTicket)
    .filter(([, key]) => activeDimensionIds === null || activeDimensionIds.has(key));
  const totalWeight = definitions.reduce((sum, [, , weight]) => sum + weight, 0) || 100;
  return definitions
    .map(([label, key, weight]) => {
      const score = result?.dimensions?.[key];
      const feedback = result?.dimensionFeedback?.[key];
      if (!Number.isInteger(score)) {
        return null;
      }
      const relatedImprovement = (result?.improvementItems || []).find((item) =>
        item?.relatedDimensionIds?.includes(key)
      );
      return {
        label,
        score,
        weightedGap: (100 - score) * weight / totalWeight,
        reason: feedback?.reason
          || relatedImprovement?.detail
          || "この観点の個別理由を取得できませんでした。総合評価と改善提案を確認してください。",
      };
    })
    .filter(Boolean);
}

function formatWeightedGap(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDimensionScoreImpact(item) {
  return item.weightedGap > 0
    ? `総合点 −${formatWeightedGap(item.weightedGap)}点`
    : "減点なし";
}

function renderPracticeDimensionFeedback(preview) {
  const items = getDimensionFeedbackItems(preview);
  elements.practiceScoringDimensionFeedbackSection?.classList.toggle("hidden", items.length === 0);
  setTextContent(
    elements.practiceScoringDimensionFeedbackTitle,
    normalizeTrainingLevel(state.trainingLevel) === "beginner"
      ? "初級で評価した観点"
      : "観点別の採点理由"
  );
  if (!elements.practiceScoringDimensionFeedback) {
    return items;
  }
  elements.practiceScoringDimensionFeedback.innerHTML = items.map((item) => `
    <div class="practice-ai-dimension-item${item.weightedGap === 0 ? " is-perfect" : ""}">
      <div><strong>${escapeHtml(item.label)}</strong><span>${item.score}点 / ${escapeHtml(formatDimensionScoreImpact(item))}</span></div>
      <p>${escapeHtml(item.reason)}</p>
    </div>
  `).join("");
  return items;
}

function getImprovementItems(result, qaTicket = isQaScenario(), scenarioId = state.scenario?.scenarioId) {
  if (Array.isArray(result?.improvementItems)) {
    let ecReproducibilityCorrectionSeen = false;
    return result.improvementItems.filter((item) => {
      if (scenarioId !== "ec-payment-notification-double-order") {
        return true;
      }
      const text = `${item.title || ""} ${item.detail || ""} ${item.whyItMatters || ""}`;
      if (/(?:通知ID|決済ID|注文番号).{0,45}(?:記載|明記|追記|補足|具体化|追加)/u.test(text)) {
        return false;
      }
      if (/(?:任意の注文|対象の注文データ|商品種別|決済金額).{0,55}(?:前提条件|具体|明確|補足|意識すべき|書き換え|改め)/u.test(text)) {
        return false;
      }
      if (
        /(?:注文API側.{0,45}周辺処理側|周辺処理側.{0,45}注文API側)/u.test(text)
        && /(?:原因|切り分け)/u.test(text)
        && /(?:未分明|未確認|できていない|補足|追記)/u.test(text)
      ) {
        return false;
      }
      const isReproducibilityCorrection = /(?:2\s*\/\s*15|15回中1回|再現(?:性|回数).{0,30}(?:訂正|修正|発生回数)|発生回数.{0,30}(?:訂正|修正))/u.test(text);
      if (!isReproducibilityCorrection) {
        return true;
      }
      if (ecReproducibilityCorrectionSeen) {
        return false;
      }
      ecReproducibilityCorrectionSeen = true;
      return true;
    });
  }
  return getPracticeDimensionDefinitions(qaTicket)
    .map(([, key]) => {
      const feedback = result?.dimensionFeedback?.[key];
      return feedback?.improvement
        ? {
            priority: "任意改善",
            title: feedback.improvement,
            detail: feedback.reason || feedback.improvement,
            whyItMatters: "起票内容をさらに明確にするため。",
            relatedDimensionIds: [key],
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 4);
}

function getVisibleRewriteSuggestions(
  items,
  qaTicket = isQaScenario(),
  scenarioId = state.scenario?.scenarioId
) {
  if (qaTicket) {
    return [];
  }
  return items.filter((item) => {
    if (scenarioId !== "ec-payment-notification-double-order") {
      return true;
    }
    const text = `${item.section || ""} ${item.original || ""} ${item.suggested || ""} ${item.reason || ""}`;
    if (/(?:2\s*\/\s*15|15回中1回|再現(?:性|回数).{0,30}(?:訂正|修正|発生回数)|発生回数.{0,30}(?:訂正|修正))/u.test(text)) {
      return false;
    }
    return !/^(?:■)?詳細$/u.test(item.section || "")
      || !/(?:同一の決済通知|決済通知ID)/u.test(item.original || "")
      || !/異なる注文番号/u.test(item.original || "");
  });
}

function renderPracticeImprovementItems(preview) {
  const items = getImprovementItems(preview);
  const requiredItems = items.filter(({ priority }) => priority === "修正推奨");
  const optionalItems = items.filter(({ priority }) => priority === "任意改善");
  const renderItems = (target, entries) => {
    if (!target) return;
    target.innerHTML = entries.map((item) => `
      <div class="practice-ai-priority-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <small>${escapeHtml(item.whyItMatters)}</small>
      </div>
    `).join("");
  };
  elements.practiceScoringImprovementSection?.classList.toggle("hidden", items.length === 0);
  elements.practiceScoringRequiredImprovementsGroup?.classList.toggle("hidden", requiredItems.length === 0);
  elements.practiceScoringOptionalImprovementsGroup?.classList.toggle("hidden", optionalItems.length === 0);
  renderItems(elements.practiceScoringRequiredImprovements, requiredItems);
  renderItems(elements.practiceScoringOptionalImprovements, optionalItems);
  return items;
}

function getVisibleReaderQuestions(
  items,
  qaTicket = isQaScenario(),
  scenarioId = state.scenario?.scenarioId
) {
  const readerVisibleItems = items.filter((item) =>
    !/(?:観測記録|提示材料|入力材料|出題シナリオ|研修シナリオ|記載例|見本回答|比較検証で行った|事実との違い)/u.test(
      `${item.question || ""} ${item.whyItMatters || ""}`
    )
  ).filter((item) =>
    scenarioId !== "ec-payment-notification-double-order"
    || !/(?:任意の注文|対象の注文データ|商品種別|決済金額).{0,55}(?:前提条件|具体|明確|補足|意識すべき|書き換え|改め)/u.test(
      `${item.question || ""} ${item.whyItMatters || ""}`
    )
  );
  if (!qaTicket) {
    return readerVisibleItems;
  }
  return readerVisibleItems.filter((item) => {
    if (item.classification !== "不足情報") {
      return false;
    }
    return !/(?:不具合|正常|仕様|修正).{0,35}(?:扱って|変更|維持|問題ありませんか|よいでしょうか|しますか)/u.test(
      String(item.question || "")
    );
  });
}

function renderPracticeReaderQuestions(items) {
  elements.practiceScoringReaderQuestionsSection?.classList.toggle("hidden", items.length === 0);
  setTextContent(
    elements.practiceScoringReaderQuestionsTitle,
    isQaScenario() ? "回答者から聞き返されそうなこと" : "読み手が疑問に思うこと"
  );
  if (!elements.practiceScoringReaderQuestions) {
    return;
  }
  const classificationClass = (classification) => {
    if (classification === "不足情報") {
      return "is-missing";
    }
    if (classification === "記述確認") {
      return "is-confirmation";
    }
    return "is-suggestion";
  };
  elements.practiceScoringReaderQuestions.innerHTML = items
    .map((item) => `
      <div class="practice-ai-review-item">
        <div class="practice-ai-review-meta">
          <span>${escapeHtml(item.reader)}</span>
          <small class="${classificationClass(item.classification)}">${escapeHtml(item.classification)}</small>
        </div>
        <strong>${escapeHtml(item.question)}</strong>
        <p>${escapeHtml(item.whyItMatters)}</p>
      </div>`)
    .join("");
}

function renderPracticeAmbiguityRisks(items) {
  elements.practiceScoringAmbiguitySection?.classList.toggle("hidden", items.length === 0);
  if (!elements.practiceScoringAmbiguityRisks) {
    return;
  }
  elements.practiceScoringAmbiguityRisks.innerHTML = items
    .map((item) => `
      <div class="practice-ai-review-item practice-ai-ambiguity-item">
        <blockquote>「${escapeHtml(item.quote)}」</blockquote>
        <p>${escapeHtml(item.risk)}</p>
        <small><strong>改善：</strong>${escapeHtml(item.advice)}</small>
      </div>`)
    .join("");
}

function renderPracticeInvestigationAdvice(items) {
  const hasItems = items.length > 0;
  elements.practiceScoringInvestigationSection?.classList.toggle("hidden", !hasItems);
  setTextContent(
    elements.practiceScoringInvestigationTitle,
    isQaScenario() ? "回答依頼前に確認すること" : "追加で確認できること"
  );
  if (!elements.practiceScoringInvestigationAdvice) {
    return;
  }
  elements.practiceScoringInvestigationAdvice.innerHTML = items
    .map((item) => `
      <li>
        <strong>${escapeHtml(item.action)}</strong>
        <span>${escapeHtml(item.purpose)}</span>
      </li>`)
    .join("");
}

function renderPracticeRewriteSuggestions(items) {
  elements.practiceScoringRewriteSection?.classList.toggle("hidden", items.length === 0);
  if (!elements.practiceScoringRewriteSuggestions) {
    return;
  }
  elements.practiceScoringRewriteSuggestions.innerHTML = items
    .map((item) => `
      <div class="practice-ai-review-item practice-ai-rewrite-item">
        <span>${escapeHtml(getReportSectionDisplayLabel(item.section))}</span>
        <p class="is-original"><strong>元の表現：</strong>${escapeHtml(item.original)}</p>
        <p class="is-suggested"><strong>改善例：</strong>${escapeHtml(item.suggested)}</p>
        <small>${escapeHtml(item.reason)}</small>
      </div>`)
    .join("");
}

const scoringVerdictPresentation = {
  "開発着手可能": {
    label: "調査・修正に着手可能",
    description: "開発担当者が原因調査と修正検討に着手できる情報が揃っています。",
  },
  "開発着手可能（軽微な改善あり）": {
    label: "着手可能・軽微な改善あり",
    description: "調査には着手できます。より伝わりやすくするための軽微な改善があります。",
  },
  "追加確認を推奨": {
    label: "追加確認を推奨",
    description: "調査は開始できますが、判断精度を上げるために追加確認を推奨します。",
  },
  "再整理を推奨": {
    label: "起票内容の再整理を推奨",
    description: "調査を始める前に、発生条件や実際の結果を整理する必要があります。",
  },
  "回答依頼可能": {
    label: "回答を依頼できる状態",
    description: "回答者が論点を理解し、判断または訂正できる情報が揃っています。",
  },
  "回答依頼可能（軽微な改善あり）": {
    label: "良好・軽微な改善あり",
    description: "回答を依頼できる情報は揃っています。さらに伝わりやすくするための軽微な改善があります。",
  },
  "追加整理を推奨": {
    label: "追加整理を推奨",
    description: "質問は伝わりますが、回答の往復を減らすために補足するとよい情報があります。",
  },
  "質問の再整理を推奨": {
    label: "質問内容の再整理を推奨",
    description: "回答を依頼する前に、判断してほしい論点と確認済み事実を整理する必要があります。",
  },
};

function getScoringVerdictPresentation(
  verdict,
  trainingLevel = state.trainingLevel,
  totalScore = state.practiceScoringResult?.totalScore,
  qaTicket = isQaScenario()
) {
  const level = normalizeTrainingLevel(trainingLevel);
  if (level !== "advanced" && Number.isInteger(totalScore)) {
    const levelLabel = getTrainingLevelConfig(level).label;
    if (totalScore >= 90) {
      return {
        label: `${levelLabel}課題クリア`,
        description: qaTicket
          ? "このレベルで学ぶ質問整理の目標を達成しています。"
          : "このレベルで学ぶ不具合報告の目標を達成しています。",
      };
    }
    if (totalScore >= 80) {
      return {
        label: `${levelLabel}課題クリア・改善あり`,
        description: "学習目標は概ね達成しています。表示された改善点を確認しましょう。",
      };
    }
    if (totalScore >= 70) {
      return {
        label: `${levelLabel}課題をもう一度確認`,
        description: "このレベルの評価対象に絞って、入力内容を見直しましょう。",
      };
    }
    return {
      label: `${levelLabel}の基本項目を再整理`,
      description: "表示された基本項目を一つずつ整理すると改善できます。",
    };
  }
  return scoringVerdictPresentation[verdict] || {
    label: verdict || "判定なし",
    description: "",
  };
}

function scoreBreakdownMarkup(result) {
  const breakdown = result?.rubricFindings?.scoreBreakdown;
  if (!breakdown) {
    return "";
  }
  const writing = breakdown.writingQuality;
  const ticket = breakdown.ticketSettings;
  const evidence = breakdown.evidenceSelection;
  const evidenceDetail = evidence.requiredCount === 0
    ? evidence.unrelatedCount === 0
      ? "添付不要を正しく選択"
      : `不要なファイルを${evidence.unrelatedCount}件選択`
    : `${evidence.correctCount} / ${evidence.requiredCount}件が正解${evidence.unrelatedCount > 0 ? `・不要${evidence.unrelatedCount}件` : ""}`;
  const capNotice = Number.isInteger(breakdown.appliedMaximum)
    && breakdown.totalScore < breakdown.uncappedTotalScore
      ? `<p class="practice-score-cap">重大な不足または事実誤認により、総合点は${escapeHtml(String(breakdown.appliedMaximum))}点が上限です。</p>`
      : "";
  const ticketMarkup = ticket.maximumPoints > 0 ? `
    <div>
      <span>チケット設定</span>
      <strong>${escapeHtml(String(ticket.awardedPoints))} / ${escapeHtml(String(ticket.maximumPoints))}</strong>
      <small>${escapeHtml(String(ticket.matchedCount))} / ${escapeHtml(String(ticket.totalCount))}項目が正解</small>
    </div>` : "";
  const evidenceMarkup = evidence.maximumPoints > 0 ? `
    <div>
      <span>添付証跡</span>
      <strong>${escapeHtml(String(evidence.awardedPoints))} / ${escapeHtml(String(evidence.maximumPoints))}</strong>
      <small>${escapeHtml(evidenceDetail)}</small>
    </div>` : "";
  return `
    <div>
      <span>文章品質</span>
      <strong>${escapeHtml(String(writing.awardedPoints))} / ${escapeHtml(String(writing.maximumPoints))}</strong>
      <small>AI評価 ${escapeHtml(String(writing.rawScore))}点</small>
    </div>
    ${ticketMarkup}
    ${evidenceMarkup}
    ${capNotice}`;
}

function renderPracticeScoreBreakdown(result) {
  if (!elements.practiceScoringBreakdown) {
    return;
  }
  const markup = scoreBreakdownMarkup(result);
  elements.practiceScoringBreakdown.classList.toggle("hidden", !markup);
  elements.practiceScoringBreakdown.innerHTML = markup;
}

function renderPracticeScoringPreview() {
  const preview = state.practiceScoringResult;
  const showPreview = isPracticeMode();
  elements.practiceScoringPreviewSection?.classList.toggle("hidden", !showPreview);
  if (!showPreview) {
    return;
  }
  const isLoading = state.practiceScoringStatus === "loading";
  const isSucceeded = state.practiceScoringStatus === "succeeded" && preview?.status === "succeeded";
  const isError = state.practiceScoringStatus === "failed";
  elements.practiceScoringResult?.classList.toggle("hidden", !isSucceeded);
  elements.practiceScoringRetryButton?.classList.toggle("hidden", !isError);
  elements.practiceScoringMessage?.classList.toggle("hidden", isSucceeded);
  elements.practiceScoringMessage?.classList.toggle("is-error", isError);
  setLoadingIndicator(elements.practiceScoringBadge, isLoading);
  if (elements.practiceScoringPreviewSection) {
    elements.practiceScoringPreviewSection.setAttribute("aria-busy", String(isLoading));
  }
  setTextContent(
    elements.practiceScoringBadge,
    isLoading ? "レビュー中" : isSucceeded ? "レビュー済み" : isError ? "未完了" : "レビュー待ち"
  );
  setTextContent(
    elements.practiceScoringMessage,
    isLoading
      ? isQaScenario()
        ? "AIが回答者の視点でQA起票をレビューしています。"
        : "AIが開発・QAの読み手として文章をレビューしています。"
      : isSucceeded
        ? "AIレビューが完了しました。"
        : isError
          ? state.practiceScoringError || "AIレビューを完了できませんでした。"
          : "AIレビューを開始します。"
  );
  const previousScore = state.revisionPreviousScore;
  const currentScore = preview?.totalScore;
  const showComparison =
    isSucceeded && Number.isInteger(previousScore) && Number.isInteger(currentScore);
  elements.practiceScoringComparison?.classList.toggle("hidden", !showComparison);
  if (showComparison) {
    const scoreDelta = currentScore - previousScore;
    setTextContent(
      elements.practiceScoringComparison,
      `前回 ${previousScore}点 → 今回 ${currentScore}点（${scoreDelta >= 0 ? "+" : ""}${scoreDelta}点）`
    );
    elements.practiceScoringComparison?.classList.toggle("is-up", scoreDelta > 0);
    elements.practiceScoringComparison?.classList.toggle("is-down", scoreDelta < 0);
    elements.practiceScoringComparison?.classList.toggle("is-same", scoreDelta === 0);
  } else {
    setTextContent(elements.practiceScoringComparison, "");
  }
  if (!isSucceeded) {
    return;
  }

  const trainingLevel = normalizeTrainingLevel(state.trainingLevel);
  const simplifiedReview = trainingLevel === "beginner";
  const verdictPresentation = getScoringVerdictPresentation(
    preview.verdict,
    trainingLevel,
    preview.totalScore
  );
  elements.practiceAiRadarPanel?.classList.toggle("hidden", simplifiedReview);
  elements.practiceAiReviewHero?.classList.toggle("is-single", simplifiedReview);
  setTextContent(elements.practiceAiRadarTitle, "文章品質の6つの観点");
  setTextContent(elements.practiceScoringPreviewTotal, String(preview.totalScore));
  renderPracticeScoreBreakdown(preview);
  setTextContent(elements.practiceScoringVerdict, verdictPresentation.label);
  setTextContent(elements.practiceScoringOverallAssessment, preview.overallAssessment);
  const scopedVerdictReady = trainingLevel !== "advanced" && preview.totalScore >= 90;
  const scopedVerdictWarning = trainingLevel !== "advanced"
    && preview.totalScore >= 70
    && preview.totalScore < 90;
  const scopedVerdictDanger = trainingLevel !== "advanced" && preview.totalScore < 70;
  elements.practiceScoringVerdict?.classList.toggle(
    "is-ready",
    scopedVerdictReady
      || (trainingLevel === "advanced" && ["開発着手可能", "回答依頼可能"].includes(preview.verdict))
  );
  elements.practiceScoringVerdict?.classList.toggle(
    "is-warning",
    scopedVerdictWarning
      || (trainingLevel === "advanced" && ["開発着手可能（軽微な改善あり）", "回答依頼可能（軽微な改善あり）", "追加確認を推奨", "追加整理を推奨"].includes(preview.verdict))
  );
  elements.practiceScoringVerdict?.classList.toggle(
    "is-danger",
    scopedVerdictDanger
      || (trainingLevel === "advanced" && ["再整理を推奨", "質問の再整理を推奨"].includes(preview.verdict))
  );
  if (elements.practiceScoringDetails) {
    elements.practiceScoringDetails.open = false;
  }
  if (!simplifiedReview) {
    renderPracticeScoringRadar(preview);
  }
  renderPracticeDimensionFeedback(preview);
  const improvementItems = renderPracticeImprovementItems(preview);
  renderPracticeScoringPreviewList(
    elements.practiceScoringPreviewStrengths,
    preview.strengths,
    simplifiedReview
      ? "今回の入力では、評価できる記述をまだ特定できませんでした"
      : "明確に評価できる記述はありません"
  );
  const qaTicket = isQaScenario();
  const readerQuestions = getVisibleReaderQuestions(preview.readerQuestions || [], qaTicket);
  const ambiguityRisks = qaTicket ? [] : preview.ambiguityRisks || [];
  const investigationAdvice = qaTicket ? [] : preview.investigationAdvice || [];
  const rewriteSuggestions = getVisibleRewriteSuggestions(
    preview.rewriteSuggestions || [],
    qaTicket
  );
  elements.practiceScoringNoImprovements?.classList.toggle(
    "hidden",
    improvementItems.length + readerQuestions.length + ambiguityRisks.length + rewriteSuggestions.length > 0
  );
  renderPracticeReaderQuestions(readerQuestions);
  renderPracticeAmbiguityRisks(ambiguityRisks);
  renderPracticeInvestigationAdvice(investigationAdvice);
  renderPracticeRewriteSuggestions(rewriteSuggestions);
}

function getPracticeAttemptPayload() {
  return {
    attemptId: state.currentAttemptId || createClientAttemptId(),
    scenarioId: state.scenario.scenarioId,
    projectId: state.projectId,
    authoringMode: "practice",
    answer: {
      trainingLevel: state.trainingLevel,
      subject: state.practiceSubject,
      sections: Object.fromEntries(
        getPracticeSectionGroups()
          .filter((group) => group.referenceLines.length > 0)
          .map((group) => [
            group.title.replace(/^■/, ""),
            state.practiceSections[group.key] || "",
          ])
      ),
      ticketFields: getPracticeTicketFieldPayload(),
    },
    selectedEvidenceIds: [...state.selectedEvidenceIds],
    evidenceDescriptions: getSelectedEvidenceDescriptions(),
    startedAt: state.sessionStartAt
      ? new Date(state.sessionStartAt).toISOString()
      : null,
    completedAt: new Date().toISOString(),
  };
}

function createClientAttemptId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

async function requestPracticeScoring() {
  if (!isPracticeMode()) {
    return;
  }
  const requestId = state.practiceScoringRequestId + 1;
  state.practiceScoringRequestId = requestId;
  state.practiceScoringStatus = "loading";
  state.practiceScoringResult = null;
  state.practiceScoringError = null;
  elements.practiceSaveRetryButton?.classList.add("hidden");
  if (elements.resultExitButton) elements.resultExitButton.disabled = true;
  if (elements.retryButton) elements.retryButton.disabled = true;
  if (elements.nextScenarioButton) elements.nextScenarioButton.disabled = true;
  renderPracticeScoringPreview();
  try {
    if (!state.currentAttemptSaved) {
      const payload = getPracticeAttemptPayload();
      state.currentAttemptId = payload.attemptId;
      const saved = state.revisionTicketId
        ? await window.TYPING_WORKBENCH_PROFILE_API.createTicketRevision(
            state.revisionTicketId,
            payload
          )
        : await window.TYPING_WORKBENCH_PROFILE_API.createAttempt(payload);
      if (state.practiceScoringRequestId !== requestId) {
        return;
      }
      state.currentAttemptId = saved.attempt?.attemptId || payload.attemptId;
      state.currentAttemptSaved = true;
      state.currentSavedAttempt = saved.attempt || {
        ...payload,
        attemptId: state.currentAttemptId,
        ticketId: state.revisionTicketId || state.currentAttemptId,
      };
      if (!state.revisionTicketId) {
        deletePracticeDraft(state.scenario.scenarioId);
      }
      setTextContent(
        elements.resultTitle,
        state.revisionTicketId ? "修正版を保存しました" : "実践起票を保存しました"
      );
      setLoadingIndicator(elements.resultTitle, false);
      if (elements.resultExitButton) elements.resultExitButton.disabled = false;
      if (elements.nextScenarioButton) elements.nextScenarioButton.disabled = false;
    }
    if (state.currentAttemptSaved) {
      if (elements.resultExitButton) elements.resultExitButton.disabled = false;
      if (elements.nextScenarioButton) elements.nextScenarioButton.disabled = false;
    }
    const response = await window.TYPING_WORKBENCH_PROFILE_API.reviewAttempt(
      state.currentAttemptId
    );
    if (state.practiceScoringRequestId !== requestId) {
      return;
    }
    state.practiceScoringStatus = "succeeded";
    state.practiceScoringResult = response.scoringResult;
    state.currentSavedAttempt = {
      ...(state.currentSavedAttempt || {}),
      attemptId: state.currentAttemptId,
      scoringResults: [response.scoringResult],
    };
    if (elements.retryButton) elements.retryButton.disabled = false;
    updateSessionPracticeScore(response.scoringResult?.totalScore);
  } catch (error) {
    if (state.practiceScoringRequestId !== requestId) {
      return;
    }
    state.practiceScoringStatus = "failed";
    state.practiceScoringError =
      error?.message || "保存またはAIレビューを完了できませんでした。入力内容は保持されています。";
    if (!state.currentAttemptSaved) {
      setTextContent(elements.resultTitle, "実践起票を保存できませんでした");
      setLoadingIndicator(elements.resultTitle, false);
      elements.practiceSaveRetryButton?.classList.remove("hidden");
    }
    if (elements.resultExitButton) elements.resultExitButton.disabled = false;
    if (elements.retryButton) elements.retryButton.disabled = false;
    if (elements.nextScenarioButton) elements.nextScenarioButton.disabled = false;
    setTextContent(
      elements.retryButton,
      state.currentAttemptSaved ? "内容を修正" : "入力内容を修正"
    );
  }
  renderPracticeScoringPreview();
}

function renderAuthState(authState) {
  const previousStatus = state.authStatus;
  state.authStatus = authState.status;
  const signedIn = authState.status === "signed_in";
  const identityReady = isAccountIdentityStatus(authState.status);
  setTextContent(
    elements.authStatusLabel,
    signedIn
      ? "Google連携済み"
      : authState.status === "anonymous"
        ? "ゲスト利用中"
        : authState.status === "linking"
          ? "Google連携中"
          : "準備中"
  );
  setTextContent(elements.authUserName, signedIn ? authState.profile?.name || "Googleユーザー" : "");
  elements.authUserName?.classList.toggle("hidden", !signedIn);
  elements.googleSignInButton?.classList.toggle(
    "hidden",
    signedIn || !identityReady
  );
  elements.googleSignOutButton?.classList.toggle(
    "hidden",
    !signedIn
  );
  if (elements.scenarioIntroPracticeButton) {
    elements.scenarioIntroPracticeButton.disabled = !identityReady;
    setTextContent(
      elements.scenarioIntroPracticeButton,
      identityReady ? "実践起票を開始" : "実践起票を準備中…"
    );
  }
  renderMyPageAuthState();
  renderTicketListState();
  renderTicketDetailState();
  if (!identityReady) {
    state.ticketListItems = [];
    state.ticketListNextCursor = null;
    state.ticketDetail = null;
    state.ticketDetailRevisions = [];
  }
  if (
    state.view === "mypage" &&
    identityReady &&
    !isAccountIdentityStatus(previousStatus)
  ) {
    loadMyPageTab(state.myPageTab, { reset: true });
  }
  if (state.view === "list" && identityReady && !isAccountIdentityStatus(previousStatus)) {
    loadTicketList();
  }
  if (state.view === "detail" && identityReady && !isAccountIdentityStatus(previousStatus)) {
    loadTicketDetail(state.ticketDetailId);
  }
  syncControls();
}

const myPageTabs = new Set(["progress", "history", "ranking"]);

function getScenarioLabel(scenarioId) {
  return scenarioBank.find((scenario) => scenario.scenarioId === scenarioId)?.subject?.text
    || scenarioId
    || "不明なシナリオ";
}

function getProjectLabel(projectId) {
  return projectCatalog.find((project) => project.id === projectId)?.name
    || projectId
    || "不明なプロジェクト";
}

function formatMyPageDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function setMyPageStatus(statusElement, bodyElement, message, options = {}) {
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.classList.toggle("hidden", Boolean(options.showBody));
    statusElement.classList.toggle("is-error", Boolean(options.error));
    setLoadingIndicator(statusElement, Boolean(options.loading));
  }
  bodyElement?.classList.toggle("hidden", !options.showBody);
}

function renderMyPageAuthState() {
  const signedIn = hasAccountIdentity();
  elements.myPageAuthGate?.classList.toggle("hidden", signedIn);
  elements.myPageContent?.classList.toggle("hidden", !signedIn);
  elements.myPageTabs.forEach((button) => {
    button.disabled = !signedIn;
  });
}

function setMyPageTab(tab) {
  state.myPageTab = myPageTabs.has(tab) ? tab : "progress";
  const panelByTab = {
    progress: elements.myPageProgressPanel,
    history: elements.myPageHistoryPanel,
    ranking: elements.myPageRankingPanel,
  };
  Object.entries(panelByTab).forEach(([panelTab, panel]) => {
    panel?.classList.toggle("hidden", panelTab !== state.myPageTab);
  });
  elements.myPageTabs.forEach((button) => {
    const active = button.dataset.myPageTab === state.myPageTab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function renderMyPageProgress(scenarios) {
  state.myPageProgress = Array.isArray(scenarios) ? scenarios : [];
  const progressByScenario = new Map(
    state.myPageProgress.map((progress) => [progress.scenarioId, progress])
  );
  const practiced = state.myPageProgress.length;
  const achieved = state.myPageProgress.filter((progress) => progress.status === "achieved").length;
  const scored = state.myPageProgress.filter((progress) => Number.isInteger(progress.bestScore));
  const bestScore = scored.length
    ? Math.max(...scored.map((progress) => progress.bestScore))
    : null;
  const attemptCount = state.myPageProgress.reduce(
    (total, progress) => total + Number(progress.attemptCount || 0),
    0
  );

  setTextContent(elements.myPagePracticedCount, String(practiced));
  setTextContent(elements.myPageScenarioTotal, `全${scenarioBank.length}シナリオ`);
  setTextContent(elements.myPageAchievedCount, String(achieved));
  setTextContent(elements.myPageBestScore, bestScore === null ? "—" : `${bestScore}点`);
  setTextContent(elements.myPageAttemptCount, String(attemptCount));

  if (elements.myPageProgressProjects) {
    const openProjectIds = new Set(
      [...elements.myPageProgressProjects.querySelectorAll("details[open]")]
        .map((details) => details.dataset.projectId)
        .filter(Boolean)
    );
    elements.myPageProgressProjects.innerHTML = projectCatalog
      .map((project) => {
        const projectScenarios = scenarioBank.filter((scenario) => scenario.projectId === project.id);
        if (!projectScenarios.length) {
          return "";
        }
        const projectProgress = projectScenarios
          .map((scenario) => progressByScenario.get(scenario.scenarioId))
          .filter(Boolean);
        const achievedCount = projectProgress.filter((progress) => progress.status === "achieved").length;
        const activeCount = projectProgress.filter((progress) =>
          ["in_progress", "scoring_pending"].includes(progress.status)
        ).length;
        const unstartedCount = projectScenarios.length - projectProgress.length;
        const rows = projectScenarios.map((scenario, scenarioIndex) => {
          const progress = progressByScenario.get(scenario.scenarioId);
          const status = progress?.status || "unstarted";
          const visibleTitle = progress
            ? scenario.subject.text
            : `未挑戦シナリオ ${scenarioIndex + 1}`;
          const statusMetaByValue = {
            achieved: { label: "達成済み", className: "is-achieved" },
            in_progress: { label: "挑戦中", className: "is-in-progress" },
            scoring_pending: { label: "採点待ち", className: "is-pending" },
            unstarted: { label: "未着手", className: "" },
          };
          const statusMeta = statusMetaByValue[status] || statusMetaByValue.unstarted;
          return `
            <li class="my-page-scenario-row">
              <span class="my-page-scenario-title">${escapeHtml(String(visibleTitle))}</span>
              <span class="my-page-progress-state ${statusMeta.className}">${statusMeta.label}</span>
              <span class="my-page-score-pill">${Number.isInteger(progress?.bestScore) ? `${progress.bestScore}点` : "—"}</span>
              <span class="my-page-latest-score">${Number.isInteger(progress?.latestScore) ? `${progress.latestScore}点` : "—"}</span>
              <span>${progress ? `${progress.attemptCount}回` : "—"}</span>
              <span class="my-page-scenario-action">
                ${progress ? `<button class="my-page-retry-button" type="button" data-retry-scenario-id="${escapeHtml(String(scenario.scenarioId))}">再挑戦</button>` : "—"}
              </span>
            </li>
          `;
        }).join("");
        return `
          <details class="my-page-project-card" data-project-id="${escapeHtml(String(project.id))}" ${openProjectIds.has(project.id) ? "open" : ""}>
            <summary class="my-page-project-summary">
              <span class="my-page-project-name">${escapeHtml(String(project.name))}</span>
              <span class="my-page-project-counts">
                <span>全${projectScenarios.length}件</span>
                <span>達成 ${achievedCount}</span>
                <span>挑戦中 ${activeCount}</span>
                <span>未着手 ${unstartedCount}</span>
              </span>
            </summary>
            <div class="my-page-project-practice-actions">
              <span>${unstartedCount > 0 ? `未挑戦 ${unstartedCount}件` : "全シナリオ挑戦済み"}</span>
              <button class="secondary-button" type="button" data-start-project-id="${escapeHtml(String(project.id))}">
                ${unstartedCount > 0 ? "新しいシナリオに挑戦" : "復習を始める"}
              </button>
            </div>
            <div class="my-page-scenario-scroll">
              <div class="my-page-scenario-list-head" aria-hidden="true">
                <span>チケット</span>
                <span>ステータス</span>
                <span>最高点</span>
                <span>直近</span>
                <span>回数</span>
                <span></span>
              </div>
              <ul class="my-page-scenario-list">${rows}</ul>
            </div>
          </details>
        `;
      })
      .join("");
  }
  setMyPageStatus(elements.myPageProgressStatus, elements.myPageProgressBody, "", {
    showBody: true,
  });
}

function getLatestScoringResult(attempt) {
  return Array.isArray(attempt?.scoringResults) ? attempt.scoringResults[0] || null : null;
}

function getHistoryScoreLabel(attempt) {
  const result = getLatestScoringResult(attempt);
  if (result?.status === "succeeded" && Number.isInteger(result.totalScore)) {
    return `${result.totalScore}点`;
  }
  if (result?.status === "unavailable") {
    return "採点保留";
  }
  if (result?.status === "failed") {
    return "採点失敗";
  }
  return "採点待ち";
}

function renderMyPageHistory() {
  if (!state.myPageHistoryItems.length) {
    setMyPageStatus(
      elements.myPageHistoryStatus,
      elements.myPageHistoryBody,
      "まだ保存された実践起票はありません。"
    );
    return;
  }

  if (elements.myPageHistoryRows) {
    elements.myPageHistoryRows.innerHTML = state.myPageHistoryItems
      .map((attempt) => `
        <tr>
          <td>${escapeHtml(formatMyPageDate(attempt.completedAt))}</td>
          <td>${escapeHtml(getProjectLabel(attempt.projectId))}</td>
          <td>${escapeHtml(getScenarioLabel(attempt.scenarioId))}</td>
          <td>${attempt.authoringMode === "practice" ? "実践起票" : "見本入力"}</td>
          <td><span class="my-page-score-pill">${escapeHtml(getHistoryScoreLabel(attempt))}</span></td>
          <td><a class="my-page-detail-button" href="#/tickets/${encodeURIComponent(attempt.attemptId)}">起票を見る</a></td>
        </tr>
      `)
      .join("");
  }
  elements.myPageHistoryMoreButton?.classList.toggle(
    "hidden",
    !state.myPageHistoryNextCursor
  );
  setMyPageStatus(elements.myPageHistoryStatus, elements.myPageHistoryBody, "", {
    showBody: true,
  });
}

function renderRankingProfile(profile) {
  state.myPageProfile = profile || null;
  if (elements.rankingNameInput) {
    elements.rankingNameInput.value = profile?.rankingName || "";
  }
  if (elements.rankingOptInInput) {
    elements.rankingOptInInput.checked = Boolean(profile?.rankingOptIn);
  }
  setTextContent(
    elements.rankingIdentityNote,
    profile?.authProvider === "anonymous"
      ? "ゲストとして参加します。Google連携すると確認済み表示になり、別の端末でも履歴を確認できます。"
      : "Google連携済みの確認済みユーザーとして参加します。"
  );
}

function renderMyPageRanking() {
  if (!state.myPageLeaderboardItems.length) {
    setMyPageStatus(
      elements.myPageRankingStatus,
      elements.myPageRankingBody,
      "ランキング参加者はまだいません。公開名を設定して最初の参加者になれます。"
    );
    return;
  }

  if (elements.myPageRankingRows) {
    elements.myPageRankingRows.innerHTML = state.myPageLeaderboardItems
      .map((entry) => `
        <tr class="${entry.isCurrentUser ? "is-current-user" : ""}">
          <td>${entry.rank}位</td>
          <td>${escapeHtml(String(entry.rankingName))}${entry.isVerified ? '<span class="ranking-verified-badge">確認済み</span>' : '<span class="ranking-guest-badge">ゲスト</span>'}${entry.isCurrentUser ? "（あなた）" : ""}</td>
          <td>${entry.achievementPoints}点</td>
          <td>${entry.achievedScenarioCount}</td>
          <td>${entry.scoredScenarioCount}</td>
        </tr>
      `)
      .join("");
  }
  elements.myPageRankingMoreButton?.classList.toggle(
    "hidden",
    !state.myPageLeaderboardNextCursor
  );
  setMyPageStatus(elements.myPageRankingStatus, elements.myPageRankingBody, "", {
    showBody: true,
  });
}

async function loadMyPageTab(tab, options = {}) {
  if (!hasAccountIdentity()) {
    renderMyPageAuthState();
    return;
  }
  const api = window.TYPING_WORKBENCH_PROFILE_API;
  if (!api) {
    return;
  }
  const requestId = state.myPageRequestId + 1;
  state.myPageRequestId = requestId;
  const append = Boolean(options.append);

  if (tab === "progress") {
    setMyPageStatus(elements.myPageProgressStatus, elements.myPageProgressBody, "学習状況を読み込んでいます…", { loading: true });
  } else if (tab === "history" && !append) {
    setMyPageStatus(elements.myPageHistoryStatus, elements.myPageHistoryBody, "履歴を読み込んでいます…", { loading: true });
  } else if (tab === "ranking" && !append) {
    setMyPageStatus(elements.myPageRankingStatus, elements.myPageRankingBody, "ランキングを読み込んでいます…", { loading: true });
  }

  try {
    if (tab === "progress") {
      const response = await api.getProgress();
      if (state.myPageRequestId !== requestId) return;
      renderMyPageProgress(response.scenarios);
    } else if (tab === "history") {
      const response = await api.getHistory({
        limit: 20,
        cursor: append ? state.myPageHistoryNextCursor : null,
      });
      if (state.myPageRequestId !== requestId) return;
      state.myPageHistoryItems = append
        ? [...state.myPageHistoryItems, ...(response.items || [])]
        : response.items || [];
      state.myPageHistoryNextCursor = response.nextCursor || null;
      renderMyPageHistory();
    } else if (tab === "ranking") {
      const [profileResponse, rankingResponse] = await Promise.all([
        api.getMe(),
        api.getLeaderboard({
          limit: 50,
          cursor: append ? state.myPageLeaderboardNextCursor : null,
        }),
      ]);
      if (state.myPageRequestId !== requestId) return;
      renderRankingProfile(profileResponse.user);
      state.myPageLeaderboardItems = append
        ? [...state.myPageLeaderboardItems, ...(rankingResponse.items || [])]
        : rankingResponse.items || [];
      state.myPageLeaderboardNextCursor = rankingResponse.nextCursor || null;
      renderMyPageRanking();
    }
  } catch (error) {
    if (state.myPageRequestId !== requestId) return;
    const message = error?.message || "成績データを取得できませんでした。";
    if (tab === "progress") {
      setMyPageStatus(elements.myPageProgressStatus, elements.myPageProgressBody, message, { error: true });
    } else if (tab === "history") {
      setMyPageStatus(elements.myPageHistoryStatus, elements.myPageHistoryBody, message, { error: true });
    } else {
      setMyPageStatus(elements.myPageRankingStatus, elements.myPageRankingBody, message, { error: true });
    }
  }
}

function ticketFieldLabel(map, value) {
  return value ? map?.[value] || value : "—";
}

function successfulTicketScore(ticket) {
  const result = getLatestScoringResult(ticket);
  return result?.status === "succeeded" && Number.isInteger(result.totalScore)
    ? result.totalScore
    : null;
}

function ticketRevisionLabel(revisionNumber) {
  return revisionNumber <= 1 ? "初版" : `修正${revisionNumber - 1}`;
}

function renderTicketDetail() {
  const ticket = state.ticketDetail;
  if (!ticket || !elements.ticketDetailContent) {
    return;
  }
  const project = projectCatalog.find((item) => item.id === ticket.projectId);
  if (project && state.projectId !== project.id) {
    state.projectId = project.id;
    saveListPreferences();
    renderProject();
  }
  const fields = ticket.answer?.ticketFields || {};
  const ticketAuthoringProfile = getScenarioAuthoringProfile(ticket.scenarioId);
  const qaTicket = fields.tracker === "qa";
  const qaTypeLabel = getQaTypeLabel(ticketAuthoringProfile?.scenario?.qaType);
  const result = getLatestScoringResult(ticket);
  const memberName = (memberId) => getProjectMemberName(ticket.projectId, memberId);
  const sections = Object.entries(ticket.answer?.sections || {})
    .map(([title, value]) => `
      <section class="ticket-detail-description-section">
        <h3>${escapeHtml(getReportSectionDisplayLabel(title))}</h3>
        <p>${escapeHtml(String(value || "（未入力）"))}</p>
      </section>
    `)
    .join("");
  const evidence = (ticket.selectedEvidenceIds || [])
    .map((evidenceId) => ({
      name: getEvidenceFile(evidenceId)?.name || evidenceId,
      description: ticket.evidenceDescriptions?.[evidenceId] || "",
    }))
    .map(({ name, description }) => `
      <li>
        <strong>${escapeHtml(String(name))}</strong>
        ${description
          ? `<span>${escapeHtml(String(description))}</span>`
          : '<span class="ticket-detail-evidence-empty">説明なし</span>'}
      </li>`)
    .join("");
  const watcherNames = (fields.watcherIds || []).map(memberName).join("、") || "—";
  const questions = getVisibleReaderQuestions(
    result?.readerQuestions || [],
    qaTicket,
    ticket.scenarioId
  )
    .map((item) => `<li>${escapeHtml(String(item.question || ""))}</li>`)
    .join("");
  const advice = (qaTicket ? [] : result?.investigationAdvice || [])
    .map((item) => `<li><strong>${escapeHtml(String(item.action || ""))}</strong>${item.purpose ? `<span>${escapeHtml(String(item.purpose))}</span>` : ""}</li>`)
    .join("");
  const strengths = (result?.strengths || [])
    .map((item) => `<li>${escapeHtml(String(item))}</li>`)
    .join("");
  const ambiguityRisks = (qaTicket ? [] : result?.ambiguityRisks || [])
    .map((item) => `<li><strong>「${escapeHtml(String(item.quote || ""))}」</strong><span>${escapeHtml(String(item.risk || ""))}${item.advice ? ` — ${escapeHtml(String(item.advice))}` : ""}</span></li>`)
    .join("");
  const visibleRewrites = getVisibleRewriteSuggestions(
    result?.rewriteSuggestions || [],
    qaTicket,
    ticket.scenarioId
  );
  const rewrites = visibleRewrites
    .map((item) => `<li><strong>${escapeHtml(getReportSectionDisplayLabel(item.section))}</strong><span>${escapeHtml(String(item.suggested || ""))}${item.reason ? ` — ${escapeHtml(String(item.reason))}` : ""}</span></li>`)
    .join("");
  const dimensionFeedbackItems = getDimensionFeedbackItems(result, qaTicket);
  const dimensionFeedback = dimensionFeedbackItems.map((item) => `
    <li>
      <strong>${escapeHtml(item.label)} ${item.score}点（${escapeHtml(formatDimensionScoreImpact(item))}）</strong>
      <span>${escapeHtml(item.reason)}</span>
    </li>
  `).join("");
  const improvementItems = getImprovementItems(result, qaTicket, ticket.scenarioId);
  const renderDetailImprovements = (priority) => improvementItems
    .filter((item) => item.priority === priority)
    .map((item) => `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)} — ${escapeHtml(item.whyItMatters)}</span></li>`)
    .join("");
  const requiredImprovements = renderDetailImprovements("修正推奨");
  const optionalImprovements = renderDetailImprovements("任意改善");
  const hasImprovementSuggestions = Boolean(improvementItems.length || questions || ambiguityRisks || rewrites);
  const verdictPresentation = getScoringVerdictPresentation(result?.verdict);
  const reviewStatus = result?.status || (ticket.scoringSupported ? "pending" : "not_supported");
  const trackerLabel = ticketFieldLabel({ bug: "バグ", qa: "QA", feature: "機能", support: "サポート" }, fields.tracker);
  const authorName = elements.authUserName?.textContent?.trim() || "ログインユーザー";
  const progress = Number.isInteger(fields.progress) ? Math.min(100, Math.max(0, fields.progress)) : null;
  const revisions = state.ticketDetailRevisions.length
    ? state.ticketDetailRevisions
    : [ticket];
  const latestRevision = [...revisions].sort(
    (left, right) => (right.revisionNumber || 1) - (left.revisionNumber || 1)
  )[0];
  const initialRevision = revisions.find((item) => (item.revisionNumber || 1) === 1) || revisions[0];
  const revisionNumber = ticket.revisionNumber || 1;
  const initialScore = successfulTicketScore(initialRevision);
  const currentScore = successfulTicketScore(ticket);
  const scoreDelta = initialScore !== null && currentScore !== null && revisionNumber > 1
    ? currentScore - initialScore
    : null;
  const revisionNavigation = revisions.length > 1
    ? `<nav class="ticket-revision-nav" aria-label="チケットの版">
        <span>変更履歴</span>
        ${revisions.map((revision) => `
          <button
            class="ticket-revision-button${revision.attemptId === ticket.attemptId ? " is-current" : ""}"
            type="button"
            data-ticket-revision-attempt-id="${escapeHtml(String(revision.attemptId))}"
          >${escapeHtml(ticketRevisionLabel(revision.revisionNumber || 1))}</button>
        `).join("")}
      </nav>`
    : "";
  const scoreComparison = scoreDelta === null
    ? ""
    : `<p class="ticket-score-comparison">初回 ${initialScore}点 → ${escapeHtml(ticketRevisionLabel(revisionNumber))} ${currentScore}点 <strong class="${scoreDelta >= 0 ? "is-up" : "is-down"}">${scoreDelta >= 0 ? "+" : ""}${scoreDelta}点</strong></p>`;
  setTextContent(elements.ticketDetailNumber, `${trackerLabel} #${ticket.displayId || ""}`);
  elements.ticketDetailContent.innerHTML = `
    ${revisionNavigation}
    <article class="ticket-detail-card">
      <div class="scenario-title-line">
        <h2 id="ticketDetailTitle" class="ticket-detail-title">${escapeHtml(ticket.answer?.subject || "（題名なし）")}</h2>
        <span class="training-level-pill is-${escapeHtml(normalizeTrainingLevel(ticket.answer?.trainingLevel))}">${escapeHtml(getTrainingLevelConfig(ticket.answer?.trainingLevel).label)}</span>
      </div>
      <p class="ticket-detail-created"><strong>${escapeHtml(authorName)}</strong> が <time>${escapeHtml(formatTicketListDate(ticket.completedAt))}</time> に${revisionNumber > 1 ? "更新" : "追加"}。<span class="ticket-revision-label">${escapeHtml(ticketRevisionLabel(revisionNumber))}</span></p>
      <div class="ticket-detail-meta-grid">
        <div class="ticket-detail-meta-column">
          <dl><dt>ステータス:</dt><dd>${escapeHtml(ticketFieldLabel(fieldValueLabels.status, fields.status))}</dd></dl>
          ${qaTicket ? `<dl><dt>質問種別:</dt><dd>${escapeHtml(qaTypeLabel)}</dd></dl>` : ""}
          <dl><dt>優先度:</dt><dd>${escapeHtml(ticketFieldLabel(fieldValueLabels.priority, fields.priority))}</dd></dl>
          <dl><dt>担当者:</dt><dd>${escapeHtml(memberName(fields.assigneeId))}</dd></dl>
          <dl><dt>カテゴリ:</dt><dd>${escapeHtml(ticketFieldLabel(fieldValueLabels.category, fields.category))}</dd></dl>
          <dl><dt>確認バージョン:</dt><dd>${escapeHtml(fields.version || "—")}</dd></dl>
          ${qaTicket ? "" : `<dl><dt>障害レベル:</dt><dd>${escapeHtml(ticketFieldLabel(fieldValueLabels.severity, fields.severity))}</dd></dl>`}
        </div>
        <div class="ticket-detail-meta-column">
          <dl><dt>開始日:</dt><dd>${escapeHtml(fields.startDate || "—")}</dd></dl>
          <dl><dt>期日:</dt><dd>${escapeHtml(fields.dueDate || "—")}</dd></dl>
          <dl><dt>進捗率:</dt><dd class="ticket-detail-progress-value">${progress === null ? "—" : `<span class="ticket-detail-progress"><span style="width:${progress}%"></span></span><span>${progress}%</span>`}</dd></dl>
          <dl><dt>公開範囲:</dt><dd>${fields.private === true ? "プライベート" : fields.private === false ? "通常" : "—"}</dd></dl>
          <dl><dt>ウォッチャー:</dt><dd>${escapeHtml(watcherNames)}</dd></dl>
          <dl><dt>確認環境・構成:</dt><dd>${escapeHtml(fields.environment || "—")}</dd></dl>
        </div>
      </div>
      <section class="ticket-detail-description">
        <h2>説明</h2>
        ${sections || '<p class="ticket-detail-empty">説明は保存されていません。</p>'}
      </section>
      <section class="ticket-detail-description">
        <h2>添付エビデンス</h2>
        ${evidence ? `<ul class="ticket-detail-evidence">${evidence}</ul>` : '<p class="ticket-detail-empty">添付エビデンスはありません。</p>'}
      </section>
    </article>
    <article class="ticket-detail-review-card">
      <div class="ticket-detail-review-head">
        <div><h2>AIレビュー</h2></div>
        <span class="ticket-review-pill is-${escapeHtml(reviewStatus)}">${escapeHtml(ticketReviewLabels[reviewStatus] || "採点待ち")}${Number.isInteger(result?.totalScore) ? ` ${result.totalScore}点` : ""}</span>
      </div>
      ${result?.status === "succeeded" ? `
        ${scoreComparison}
        ${scoreBreakdownMarkup(result) ? `<div class="practice-score-breakdown ticket-score-breakdown">${scoreBreakdownMarkup(result)}</div>` : ""}
        <p class="ticket-detail-verdict">${escapeHtml(verdictPresentation.label)}</p>
        <p>${escapeHtml(String(result.overallAssessment || ""))}</p>
        ${strengths ? `<h3>問題なし・評価できる点</h3><ul>${strengths}</ul>` : ""}
        ${dimensionFeedback ? `<details class="ticket-detail-score-details"><summary>採点の詳細を見る</summary><ul class="ticket-detail-advice">${dimensionFeedback}</ul></details>` : ""}
        ${requiredImprovements ? `<h3>修正を推奨</h3><ul class="ticket-detail-advice">${requiredImprovements}</ul>` : ""}
        ${optionalImprovements ? `<h3>さらに良くするなら</h3><ul class="ticket-detail-advice">${optionalImprovements}</ul>` : ""}
        ${hasImprovementSuggestions ? "" : '<p class="ticket-detail-no-improvements">優先して修正が必要な表現や不足情報はありません。</p>'}
        ${questions ? `<h3>${qaTicket ? "回答者から聞き返されそうなこと" : "読み手が疑問に思うこと"}</h3><ul>${questions}</ul>` : ""}
        ${ambiguityRisks ? `<h3>曖昧さ・誤解のリスク</h3><ul class="ticket-detail-advice">${ambiguityRisks}</ul>` : ""}
        ${advice ? `<h3>追加で確認できること</h3><ol class="ticket-detail-advice">${advice}</ol>` : ""}
        ${rewrites ? `<h3>書き換え提案</h3><ul class="ticket-detail-advice">${rewrites}</ul>` : ""}
      ` : `<p>${reviewStatus === "not_supported" ? "このシナリオのAIレビューは準備中です。起票内容は保存されています。" : "AIレビュー結果はまだありません。起票内容は保存されています。"}</p>`}
    </article>
    <div class="ticket-detail-actions">
      <button class="primary-button" type="button" data-detail-edit-ticket-id="${escapeHtml(String(latestRevision.ticketId || state.ticketDetailId || latestRevision.attemptId))}">${result?.status === "succeeded" ? "指摘を元に修正" : "内容を修正"}</button>
      <button class="secondary-button" type="button" data-detail-retry-scenario-id="${escapeHtml(String(ticket.scenarioId || ""))}" data-detail-retry-training-level="${escapeHtml(normalizeTrainingLevel(ticket.answer?.trainingLevel))}">同じシナリオに再挑戦</button>
    </div>
  `;
  elements.ticketDetailStatus?.classList.add("hidden");
  elements.ticketDetailContent.classList.remove("hidden");
}

function renderTicketDetailState() {
  const signedIn = hasAccountIdentity();
  elements.ticketDetailAuthGate?.classList.toggle(
    "hidden",
    signedIn || ["loading", "linking"].includes(state.authStatus)
  );
  if (!signedIn) {
    elements.ticketDetailStatus?.classList.add("hidden");
    elements.ticketDetailContent?.classList.add("hidden");
  }
}

async function loadTicketDetail(ticketId) {
  if (!hasAccountIdentity() || !ticketId) {
    renderTicketDetailState();
    return;
  }
  const requestId = state.ticketDetailRequestId + 1;
  state.ticketDetailRequestId = requestId;
  state.ticketDetail = null;
  state.ticketDetailRevisions = [];
  elements.ticketDetailContent?.classList.add("hidden");
  if (elements.ticketDetailStatus) {
    elements.ticketDetailStatus.textContent = "起票内容を読み込んでいます…";
    elements.ticketDetailStatus.classList.remove("hidden", "is-error");
    setLoadingIndicator(elements.ticketDetailStatus, true);
  }
  try {
    const response = await window.TYPING_WORKBENCH_PROFILE_API.getTicket(ticketId);
    if (state.ticketDetailRequestId !== requestId) {
      return;
    }
    state.ticketDetail = response.ticket || null;
    state.ticketDetailRevisions = response.revisions || (response.ticket ? [response.ticket] : []);
    renderTicketDetail();
  } catch (error) {
    if (state.ticketDetailRequestId !== requestId) {
      return;
    }
    if (elements.ticketDetailStatus) {
      elements.ticketDetailStatus.textContent = error?.message || "起票内容を読み込めませんでした。";
      elements.ticketDetailStatus.classList.add("is-error");
      setLoadingIndicator(elements.ticketDetailStatus, false);
    }
  }
}

function showTicketDetail(ticketId) {
  if (state.running || state.awaitingCreate) {
    return;
  }
  state.ticketDetailId = ticketId;
  setView("detail");
  renderTicketDetailState();
  syncControls();
  if (hasAccountIdentity()) {
    loadTicketDetail(ticketId);
  }
}

function showMyPage(tab = "progress") {
  if (state.running || state.awaitingCreate) {
    return;
  }
  setView("mypage");
  setMyPageTab(tab);
  renderMyPageAuthState();
  syncControls();
  if (hasAccountIdentity()) {
    loadMyPageTab(state.myPageTab, { reset: true });
  }
}

function handleAppRoute() {
  const currentHash = window.location?.hash || "";
  const ticketMatch = currentHash.match(/^#\/tickets\/([0-9a-f-]+)$/i);
  if (ticketMatch) {
    showTicketDetail(ticketMatch[1]);
    return;
  }
  const match = currentHash.match(/^#\/mypage\/(progress|history|ranking)$/);
  if (match) {
    showMyPage(match[1]);
    return;
  }
  if (currentHash === "#/tickets") {
    const previousView = state.view;
    setView("list");
    syncControls();
    if (
      hasAccountIdentity() &&
      (previousView !== "list" || state.ticketListStatus === "idle" || state.ticketListStatus === "error")
    ) {
      loadTicketList();
    }
    return;
  }
  if (state.view === "mypage" || state.view === "detail") {
    setView("list");
    loadTicketList();
    syncControls();
  }
}

function navigateToHash(hash) {
  if (!window.location) {
    return;
  }
  if (window.location.hash === hash) {
    handleAppRoute();
  } else {
    window.location.hash = hash;
  }
}

function handleTicketDetailAction(event) {
  const revisionButton = event.target.closest("[data-ticket-revision-attempt-id]");
  if (revisionButton) {
    const selected = state.ticketDetailRevisions.find(
      (revision) => revision.attemptId === revisionButton.dataset.ticketRevisionAttemptId
    );
    if (selected) {
      state.ticketDetail = selected;
      renderTicketDetail();
    }
    return;
  }
  const editButton = event.target.closest("[data-detail-edit-ticket-id]");
  if (editButton) {
    const latestRevision = [...state.ticketDetailRevisions].sort(
      (left, right) => (right.revisionNumber || 1) - (left.revisionNumber || 1)
    )[0] || state.ticketDetail;
    beginTicketRevision(latestRevision);
    return;
  }
  const retryButton = event.target.closest("[data-detail-retry-scenario-id]");
  if (!retryButton) {
    return;
  }
  selectAuthoringMode("practice");
  if (selectScenarioById(
    retryButton.dataset.detailRetryScenarioId,
    retryButton.dataset.detailRetryTrainingLevel
  )) {
    showScenarioIntro();
  }
}

function leaveMyPageRouteForTraining() {
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", "#/tickets");
  } else if (window.location) {
    window.location.hash = "#/tickets";
  }
}

function prepareProjectChallenge(projectId) {
  if (!projectCatalog.some((project) => project.id === projectId)) {
    return false;
  }
  state.projectId = projectId;
  state.scenarioIndex = -1;
  state.scenarioQueue = [];
  selectAuthoringMode("practice");
  saveListPreferences();
  renderProject();
  leaveMyPageRouteForTraining();
  return true;
}

function handleMyPageProgressClick(event) {
  const retryButton = event.target.closest("[data-retry-scenario-id]");
  if (retryButton) {
    selectAuthoringMode("practice");
    if (selectScenarioById(retryButton.dataset.retryScenarioId)) {
      leaveMyPageRouteForTraining();
      showScenarioIntro();
    }
    return;
  }

  const projectButton = event.target.closest("[data-start-project-id]");
  if (projectButton && prepareProjectChallenge(projectButton.dataset.startProjectId)) {
    startSession();
  }
}

async function handleRankingProfileSubmit(event) {
  event.preventDefault();
  if (!hasAccountIdentity()) {
    return;
  }
  const rankingName = elements.rankingNameInput?.value.trim() || "";
  const rankingOptIn = Boolean(elements.rankingOptInInput?.checked);
  if (rankingOptIn && !rankingName) {
    setTextContent(elements.rankingProfileStatus, "参加する場合は公開名を入力してください。");
    elements.rankingProfileStatus?.classList.add("is-error");
    return;
  }
  elements.rankingProfileSaveButton.disabled = true;
  elements.rankingProfileStatus?.classList.remove("is-error");
  setTextContent(elements.rankingProfileStatus, "保存しています…");
  setLoadingIndicator(elements.rankingProfileStatus, true);
  try {
    const response = await window.TYPING_WORKBENCH_PROFILE_API.updateRankingProfile({
      rankingName,
      rankingOptIn,
    });
    renderRankingProfile(response.user);
    setTextContent(elements.rankingProfileStatus, "保存しました。");
    await loadMyPageTab("ranking", { reset: true });
  } catch (error) {
    setTextContent(elements.rankingProfileStatus, error?.message || "設定を保存できませんでした。");
    elements.rankingProfileStatus?.classList.add("is-error");
  } finally {
    setLoadingIndicator(elements.rankingProfileStatus, false);
    elements.rankingProfileSaveButton.disabled = false;
  }
}

function getResultReviewKeys(trainingLevel = state.trainingLevel) {
  const level = normalizeTrainingLevel(trainingLevel);
  if (level === "beginner") {
    return new Set();
  }
  if (level === "intermediate") {
    return new Set(["category", "version", "environment"]);
  }
  return null;
}

function getLocalResultScoreMaximums(trainingLevel = state.trainingLevel) {
  const level = normalizeTrainingLevel(trainingLevel);
  if (level === "beginner") {
    return { decision: 0, report: 70, evidence: 0, typing: 20, time: 10 };
  }
  if (level === "intermediate") {
    return { decision: 30, report: 40, evidence: 0, typing: 20, time: 10 };
  }
  return { decision: 30, report: 30, evidence: 10, typing: 20, time: 10 };
}

function finishSession() {
  const practiceMode = isPracticeMode();
  state.running = false;
  state.awaitingCreate = false;
  state.completedSessionsByProject[state.projectId] =
    (state.completedSessionsByProject[state.projectId] || 0) + 1;
  clearLineClearCue();

  stopSessionTimers();

  if (elements.typingInput) {
    elements.typingInput.disabled = true;
  }

  renderChart();
  if (!state.finalElapsedMs) {
    state.finalElapsedMs = getSessionElapsedMs();
  }
  const result = calculateResult();
  recordSessionPracticeAttempt();
  setTextContent(elements.resultCompletedLines, String(state.completedLines));
  setTextContent(elements.resultTotalTyping, String(state.totalInputChars));
  setTextContent(elements.resultSuccessCount, String(state.correctChars));
  setTextContent(elements.resultFailureCount, String(state.wrongChars));
  setTextContent(elements.resultAccuracy, formatPercent(getAccuracyRate()));
  setTextContent(elements.resultElapsedTime, formatDuration(state.finalElapsedMs));
  setTextContent(
    elements.resultTicketSubject,
    practiceMode ? state.practiceSubject : state.scenario.subjectEntry.text
  );
  setTextContent(elements.resultKicker, practiceMode ? "PRACTICE CREATED" : "TICKET CREATED");
  setTextContent(
    elements.resultTitle,
    practiceMode ? "実践起票を保存しています…" : "チケットを作成しました"
  );
  setLoadingIndicator(elements.resultTitle, practiceMode);
  setTextContent(
    elements.retryButton,
    practiceMode ? "指摘を元に修正" : "もう一度見本入力"
  );
  elements.retryButton?.classList.toggle("primary-button", practiceMode);
  elements.retryButton?.classList.toggle("secondary-button", !practiceMode);
  elements.nextScenarioButton?.classList.toggle("primary-button", !practiceMode);
  elements.nextScenarioButton?.classList.toggle("secondary-button", practiceMode);
  if (practiceMode) {
    const hasUnattemptedScenario = getUnattemptedScenarioEntries(state.projectId).length > 0;
    setTextContent(
      elements.nextScenarioButton,
      hasUnattemptedScenario ? "次の未挑戦シナリオへ" : "別のシナリオを復習"
    );
  }
  setTextContent(elements.resultRank, result.rank);
  setTextContent(elements.resultScore, `${result.total} / 100`);
  const { scoreMaximums } = result;
  setTextContent(elements.resultDecisionScore, `${result.decisionScore} / ${scoreMaximums.decision}`);
  setTextContent(elements.resultReportScore, `${result.reportScore} / ${scoreMaximums.report}`);
  setTextContent(elements.resultEvidenceScore, `${result.evidenceScore} / ${scoreMaximums.evidence}`);
  setTextContent(elements.resultTypingScore, `${result.typingScore} / ${scoreMaximums.typing}`);
  setTextContent(elements.resultTimeScore, `${result.timeScore} / ${scoreMaximums.time}`);
  elements.resultDecisionScoreRow?.classList.toggle("hidden", scoreMaximums.decision === 0);
  elements.resultReportScoreRow?.classList.toggle("hidden", scoreMaximums.report === 0);
  elements.resultEvidenceScoreRow?.classList.toggle("hidden", scoreMaximums.evidence === 0);
  elements.resultTypingScoreRow?.classList.toggle("hidden", scoreMaximums.typing === 0);
  elements.resultTimeScoreRow?.classList.toggle("hidden", scoreMaximums.time === 0);
  const activeReviewKeys = getResultReviewKeys(state.trainingLevel);
  const visibleReviews = result.reviews.filter(
    ({ key }) => activeReviewKeys === null || activeReviewKeys.has(key)
  );
  const showFieldReview = visibleReviews.length > 0;
  elements.resultFieldReviewCard?.classList.toggle("hidden", !showFieldReview);
  if (elements.resultFieldReview) {
    elements.resultFieldReview.innerHTML = visibleReviews
      .map((review) => {
        const acceptable = review.status === "acceptable";
        const correction = review.status === "correct"
          ? ""
          : `<small>${acceptable ? "推奨" : "正解"}：${escapeHtml(review.expected)}</small>`;
        const rationale = review.rationale
          ? `<small class="result-review-rationale">${escapeHtml(review.rationale)}</small>`
          : "";
        return `<div class="result-review-row is-${escapeHtml(review.status || (review.correct ? "correct" : "wrong"))}">
          <span class="result-review-icon">${review.status === "correct" ? "✓" : acceptable ? "△" : "×"}</span>
          <strong>${escapeHtml(fieldLabels[review.key])}</strong>
          <span>${escapeHtml(review.selected)}</span>
          ${correction}
          ${rationale}
        </div>`;
      })
      .join("");
  }
  const level = normalizeTrainingLevel(state.trainingLevel);
  const showEvidenceReview = level === "advanced";
  renderEvidenceResult(showEvidenceReview ? result.evidenceResult : { applicable: false });
  elements.resultRadarShell?.classList.toggle("hidden", level !== "advanced");
  elements.resultRankBlock?.classList.toggle("hidden", practiceMode);
  elements.resultSummaryCard?.classList.toggle("hidden", practiceMode);
  elements.resultReviewLayout?.classList.toggle(
    "hidden",
    practiceMode && !showFieldReview && !showEvidenceReview
  );
  elements.resultReviewLayout?.classList.toggle("is-practice", practiceMode);
  elements.practiceResultSection?.classList.toggle("hidden", !practiceMode);
  elements.sameScenarioPracticeButton?.classList.toggle("hidden", practiceMode);
  elements.nextScenarioButton?.classList.toggle("hidden", !practiceMode);
  renderPracticeScoringPreview();
  if (practiceMode) {
    renderPracticeComparison();
  }
  if (elements.resultOverlay) {
    elements.resultOverlay.classList.remove("hidden");
  }
  if (!practiceMode && level === "advanced") {
    animateResultRadar(result);
  }
  pushMetrics();
  syncControls();
  if (practiceMode) {
    requestPracticeScoring();
  }
}

function endSession() {
  if (!state.running && state.currentEditableOrder === 0) {
    resetSession();
    return;
  }

  finishSession();
}

function handleTypingKeydown(event) {
  if (
    isPracticeMode() ||
    !state.running ||
    state.currentEditableOrder >= state.scenario.totalEditableLines
  ) {
    return;
  }

  const expected = getExpectedTypingText();
  if (!expected) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    return;
  }

  if (event.key === "Tab" || event.key === " ") {
    event.preventDefault();
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    if (state.currentError) {
      state.currentError = false;
      renderReport();
      sampleChart();
      pushMetrics();
      if (elements.typingInput) {
        elements.typingInput.value = "";
      }
      return;
    }

    if (state.currentDraft.length > 0) {
      state.currentDraft = state.currentDraft.slice(0, -1);
      state.currentError = false;
      renderReport();
      sampleChart();
      pushMetrics();
      if (elements.typingInput) {
        elements.typingInput.value = "";
      }
    }
    return;
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const key = getKeyFromEvent(event);
  if (!key || key.length !== 1) {
    return;
  }

  if (/\s/.test(key)) {
    event.preventDefault();
    return;
  }

  if (state.currentError) {
    state.currentError = false;
  }

  event.preventDefault();
  const nextDraft = `${state.currentDraft}${key}`;
  const normalizedNextDraft = normalizeTypingText(nextDraft);
  if (normalizedNextDraft === normalizeTypingText(state.currentDraft)) {
    return;
  }
  const validPrefix = expected.some((candidate) => matchesTypingCandidate(nextDraft, candidate));

  state.totalInputChars += 1;
  state.inputTimestamps.push(Date.now());
  if (validPrefix) {
    state.currentDraft = nextDraft;
    state.correctChars += 1;
    state.currentError = false;
  } else {
    state.wrongChars += 1;
    state.currentError = true;
  }

  renderReport();
  sampleChart();
  pushMetrics();

  if (isDraftComplete(state.currentDraft, expected)) {
    completeCurrentLine();
  }
}

function syncControls() {
  const canStart =
    state.view === "list" &&
    !state.running &&
    !state.awaitingCreate &&
    !state.scenarioSelectionPending;
  renderAuthoringMode();
  if (elements.startButton) {
    elements.startButton.disabled = !canStart;
  }
  if (elements.qaStartButton) {
    elements.qaStartButton.disabled = !canStart;
  }
  if (elements.scenarioIntroChangeButton) {
    elements.scenarioIntroChangeButton.disabled =
      state.view !== "scenario" ||
      state.scenarioSelectionPending ||
      getProjectScenarioEntries(state.projectId, state.trainingTicketType).length < 2;
  }

  if (elements.resumeDraftButton) {
    const hasProjectDraft = Boolean(getLatestPracticeDraft(state.projectId));
    elements.resumeDraftButton.classList.toggle(
      "hidden",
      state.view !== "list" || !hasProjectDraft || !hasAccountIdentity()
    );
    elements.resumeDraftButton.disabled = !canStart || !hasAccountIdentity();
  }

  if (elements.draftSaveButton) {
    const showDraftSave =
      isPracticeMode() &&
      state.view === "create" &&
      !state.revisionTicketId;
    elements.draftSaveButton.classList.toggle("hidden", !showDraftSave);
    elements.draftSaveButton.disabled =
      !showDraftSave || (!state.running && !state.awaitingCreate);
  }

  if (elements.stopButton) {
    elements.stopButton.disabled = !state.running && !(
      state.view === "create" && state.awaitingCreate
    );
  }

  if (elements.practiceWritingCompleteButton) {
    const showPracticeWritingAction =
      isPracticeMode() &&
      state.view === "create" &&
      state.running &&
      !state.practiceWritingComplete;
    elements.practiceWritingCompleteButton.classList.toggle("hidden", !showPracticeWritingAction);
    elements.practiceWritingCompleteButton.disabled = !showPracticeWritingAction;
  }
  if (elements.practiceWritingTransition) {
    const showPracticeWritingTransition =
      isPracticeMode() &&
      state.view === "create" &&
      state.running &&
      !state.practiceWritingComplete;
    elements.practiceWritingTransition.classList.toggle(
      "hidden",
      !showPracticeWritingTransition
    );
  }
  if (elements.createButton) {
    elements.createButton.disabled = !state.awaitingCreate || state.evidenceSetupActive;
  }

  if (elements.openEvidencePickerButton) {
    elements.openEvidencePickerButton.disabled =
      !state.awaitingCreate || !getCurrentEvidenceProfile();
  }

  if (elements.rmProjectSwitcher) {
    elements.rmProjectSwitcher.disabled =
      state.view !== "list" ||
      state.running ||
      state.awaitingCreate ||
      state.scenarioSelectionPending;
  }

  const canUseGlobalNavigation =
    !state.running &&
    !state.awaitingCreate &&
    !state.scenarioSelectionPending &&
    (state.view === "list" || state.view === "detail" || state.view === "mypage");
  if (elements.homeNavButton) {
    elements.homeNavButton.disabled = !canUseGlobalNavigation;
  }
  if (elements.ticketNavButton) {
    elements.ticketNavButton.disabled = !canUseGlobalNavigation;
  }
  if (elements.myPageNavButton) {
    elements.myPageNavButton.disabled = !canUseGlobalNavigation;
  }
}

function selectAuthoringMode(nextMode) {
  if (!authoringModeConfig[nextMode]) {
    return false;
  }
  state.authoringMode = nextMode;
  saveListPreferences();
  renderAuthoringMode();
  return true;
}

function showTrainingLevelSelection(ticketType) {
  state.trainingTicketType = ticketType === "qa" ? "qa" : "bug";
  state.scenarioQueue = [];
  state.scenarioIndex = -1;
  setTextContent(
    elements.trainingLevelTitle,
    `${state.trainingTicketType === "qa" ? "QA" : "バグ"}起票のレベルを選択`
  );
  setView("level");
  syncControls();
  elements.trainingLevelButtons?.[0]?.focus();
}

function handleTrainingLevelSelect(event) {
  const level = normalizeTrainingLevel(event.currentTarget.dataset.trainingLevel);
  state.trainingLevel = level;
  state.scenarioQueue = [];
  state.scenarioIndex = -1;
  startSession({ ticketType: state.trainingTicketType });
}

function handleTrainingLevelBack() {
  resetSession();
  loadTicketList();
}

function handleStartButton() {
  if (!state.running && !state.awaitingCreate) {
    showTrainingLevelSelection("bug");
  }
}

function handleQaStartButton() {
  if (!state.running && !state.awaitingCreate) {
    showTrainingLevelSelection("qa");
  }
}

function handleResumeDraftButton() {
  const draft = getLatestPracticeDraft(state.projectId);
  if (!draft) {
    syncControls();
    return;
  }
  resumePracticeDraft(draft);
}

function handleTicketSort(event) {
  const sortKey = event.currentTarget.dataset.sortKey;
  if (!sortKey) {
    return;
  }

  if (state.ticketSortKey === sortKey) {
    state.ticketSortDirection = state.ticketSortDirection === "asc" ? "desc" : "asc";
  } else {
    state.ticketSortKey = sortKey;
    state.ticketSortDirection = sortKey === "id" || sortKey === "updatedAt" ? "desc" : "asc";
  }

  saveListPreferences();
  renderTicketList();
}

function handleApplyTicketFilters() {
  state.ticketStatusFilter = elements.ticketStatusFilter?.value || "all";
  state.ticketExtraFilter = elements.ticketExtraFilter?.value || "all";
  saveListPreferences();
  renderTicketList();
}

function handleTicketTypeFilter(event) {
  const nextType = event.currentTarget.dataset.ticketTypeFilter;
  if (!new Set(["all", "bug", "qa"]).has(nextType)) {
    return;
  }
  state.ticketTypeFilter = nextType;
  state.ticketListItems = [];
  state.ticketListNextCursor = null;
  saveListPreferences();
  renderProject();
}

function handleClearTicketFilters() {
  state.ticketStatusFilter = "all";
  state.ticketExtraFilter = "all";
  state.ticketTypeFilter = "all";
  state.ticketSortKey = "completedAt";
  state.ticketSortDirection = "desc";

  if (elements.ticketStatusFilter) {
    elements.ticketStatusFilter.value = state.ticketStatusFilter;
  }
  if (elements.ticketExtraFilter) {
    elements.ticketExtraFilter.value = state.ticketExtraFilter;
  }

  saveListPreferences();
  renderTicketList();
}

function handleStopButton() {
  if (state.running || (state.view === "create" && state.awaitingCreate)) {
    resetSession();
    loadTicketList();
  }
}

function handleScenarioIntroStart() {
  selectAuthoringMode("reference");
  beginSessionForCurrentScenario();
}

function handleScenarioIntroChange() {
  startSession({
    refreshProgress: false,
    ticketType: state.trainingTicketType,
  });
}

function handleScenarioIntroPractice() {
  if (!hasAccountIdentity()) {
    window.alert?.("ゲストデータを準備しています。少し待ってからもう一度お試しください。");
    return;
  }
  selectAuthoringMode("practice");
  beginSessionForCurrentScenario();
}

function handleScenarioIntroBack() {
  resetSession();
  showTrainingLevelSelection(state.trainingTicketType);
}

function handleCreateButton() {
  if (state.awaitingCreate && validatePracticeWriting()) {
    finishSetupFlow();
    finishSession();
  }
}

function handleRetryButton() {
  if (isPracticeMode()) {
    if (state.currentSavedAttempt) {
      beginTicketRevision(state.currentSavedAttempt);
      return;
    }
    elements.resultOverlay?.classList.add("hidden");
    setView("create");
    state.running = false;
    state.awaitingCreate = true;
    state.practiceWritingComplete = true;
    clearSetupHighlight();
    renderReport();
    renderEvidenceAttachment();
    setTextContent(elements.createButton, "保存");
    syncControls();
    elements.subjectDocument?.querySelector("#practiceSubjectInput")?.focus();
    return;
  }
  beginSessionForCurrentScenario();
}

function handleNextScenarioButton() {
  selectAuthoringMode("practice");
  startSession({ refreshProgress: false, ticketType: state.trainingTicketType });
}

function handleSameScenarioPractice() {
  state.authoringMode = "practice";
  saveListPreferences();
  beginSessionForCurrentScenario();
}

function handleExitButton() {
  resetSession();
  loadTicketList();
}

on(elements.startButton, "click", handleStartButton);
on(elements.qaStartButton, "click", handleQaStartButton);
elements.trainingLevelButtons.forEach((button) => on(button, "click", handleTrainingLevelSelect));
on(elements.trainingLevelBackButton, "click", handleTrainingLevelBack);
on(elements.resumeDraftButton, "click", handleResumeDraftButton);
on(elements.draftSaveButton, "click", saveCurrentPracticeDraft);
on(elements.homeNavButton, "click", () => {
  const currentPath = window.location?.pathname || "";
  const welcomeUrl = currentPath.endsWith("/app.html") ? "./" : "./welcome.html";
  window.location.assign(welcomeUrl);
});
on(elements.ticketNavButton, "click", () => navigateToHash("#/tickets"));
on(elements.myPageNavButton, "click", () => navigateToHash(`#/mypage/${state.myPageTab}`));
on(elements.rmProjectSwitcher, "change", handleProjectChange);
elements.ticketSortButtons.forEach((button) => on(button, "click", handleTicketSort));
on(elements.applyTicketFiltersButton, "click", handleApplyTicketFilters);
on(elements.clearTicketFiltersButton, "click", handleClearTicketFilters);
on(elements.ticketListMoreButton, "click", () => loadTicketList({ append: true }));
on(elements.ticketListRetryButton, "click", () => loadTicketList());
elements.ticketTypeFilterButtons.forEach((button) => on(button, "click", handleTicketTypeFilter));
on(elements.ticketDetailBackButton, "click", () => navigateToHash("#/tickets"));
on(elements.ticketDetailContent, "click", handleTicketDetailAction);
on(elements.stopButton, "click", handleStopButton);
on(elements.scenarioIntroChangeButton, "click", handleScenarioIntroChange);
on(elements.scenarioIntroStartButton, "click", handleScenarioIntroStart);
on(elements.scenarioIntroPracticeButton, "click", handleScenarioIntroPractice);
on(elements.scenarioIntroBackButton, "click", handleScenarioIntroBack);
on(elements.createButton, "click", handleCreateButton);
on(elements.practiceWritingCompleteButton, "click", completePracticeWriting);
on(elements.practiceScoringRetryButton, "click", requestPracticeScoring);
on(elements.practiceSaveRetryButton, "click", requestPracticeScoring);
on(elements.googleSignOutButton, "click", () => window.TYPING_WORKBENCH_AUTH?.signOut());
on(elements.openEvidencePickerButton, "click", openEvidencePicker);
on(elements.closeEvidencePickerButton, "click", closeEvidencePicker);
on(elements.cancelEvidencePickerButton, "click", closeEvidencePicker);
on(elements.attachEvidenceButton, "click", applyEvidenceSelection);
on(elements.evidenceFileList, "change", handleEvidenceFileListChange);
on(elements.evidenceFileList, "click", handleEvidenceFileListClick);
on(elements.attachedEvidenceList, "click", handleAttachedEvidenceClick);
on(elements.attachedEvidenceList, "input", handleAttachedEvidenceInput);
on(elements.retryButton, "click", handleRetryButton);
on(elements.nextScenarioButton, "click", handleNextScenarioButton);
on(elements.sameScenarioPracticeButton, "click", handleSameScenarioPractice);
on(elements.resultExitButton, "click", handleExitButton);
elements.myPageTabs.forEach((button) => {
  on(button, "click", () => navigateToHash(`#/mypage/${button.dataset.myPageTab}`));
});
elements.myPageRefreshButtons.forEach((button) => {
  on(button, "click", () => loadMyPageTab(button.dataset.myPageRefresh, { reset: true }));
});
on(elements.myPageProgressProjects, "click", handleMyPageProgressClick);
on(elements.myPageHistoryMoreButton, "click", () => loadMyPageTab("history", { append: true }));
on(elements.myPageRankingMoreButton, "click", () => loadMyPageTab("ranking", { append: true }));
on(elements.rankingProfileForm, "submit", handleRankingProfileSubmit);
getSetupFields().forEach((field) => on(field, "change", advanceSetupFlow));
on(elements.dueDateUnsetButton, "click", handleDueDateUnset);
elements.ticketWatchersList?.addEventListener("change", handleWatcherSelection);
window.addEventListener("keydown", handleTypingKeydown, true);
on(elements.subjectDocument, "input", handlePracticeSubjectInput);
on(elements.reportDocument, "input", handlePracticeReportInput);
on(elements.subjectEditor, "click", () => {
  if (!isPracticeMode()) {
    elements.typingInput?.focus();
  }
});
on(elements.reportEditor, "click", () => {
  if (!isPracticeMode()) {
    elements.typingInput?.focus();
  }
});
window.addEventListener("resize", positionTypingInput);
window.addEventListener("hashchange", handleAppRoute);

window.TYPING_WORKBENCH_AUTH?.subscribe(renderAuthState);
window.TYPING_WORKBENCH_AUTH?.initialize(elements.googleSignInButton);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.evidencePickerOpen) {
    event.preventDefault();
    closeEvidencePicker();
    return;
  }
  if (event.key === "Escape" && (state.running || state.awaitingCreate)) {
    resetSession();
  }
});

renderProject();
applyTicketDefaults();
if (window.location && !window.location.hash) {
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", "#/tickets");
  } else {
    window.location.hash = "#/tickets";
  }
}
handleAppRoute();
renderAuthoringMode();
renderReport();
renderEvidenceAttachment();
pushMetrics();
renderChart();
syncControls();
