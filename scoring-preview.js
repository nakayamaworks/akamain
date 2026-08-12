window.TYPING_WORKBENCH_SCORING_PREVIEWS = {
  "customer-save-multiple-clicks-duplicate": {
    schemaVersion: "scoring-result.v3",
    scoringResultId: "00000000-0000-4000-8000-000000000002",
    attemptId: "00000000-0000-4000-8000-000000000001",
    status: "succeeded",
    totalScore: 77,
    dimensions: {
      factualGrounding: 78,
      informationCoverage: 72,
      reproducibility: 82,
      expectedActualSeparation: 90,
      interpretiveClarity: 70,
      investigationReadiness: 65,
    },
    verdict: "追加確認を推奨",
    overallAssessment:
      "現象と再現手順は把握できます。ただし、原因をDBの排他制御不足と断定しているため、開発担当者の調査範囲を誤って狭める可能性があります。確認済みの事実と原因の仮説を分けてください。",
    readerQuestions: [
      {
        reader: "担当開発者",
        question: "保存APIは実際に3回送信されていますか？",
        whyItMatters: "画面側の多重送信と、サーバー側の登録処理を切り分けるためです。",
        classification: "調査提案",
        factId: "not-applicable",
      },
      {
        reader: "QA担当者",
        question: "重複した3件には、それぞれ異なる顧客IDが採番されていますか？",
        whyItMatters: "独立した登録処理が3回実行されたかを判断する材料になるためです。",
        classification: "不足情報",
        factId: "detail-distinct-customer-ids",
      },
    ],
    ambiguityRisks: [
      {
        quote: "DBの排他制御不足により顧客データが重複登録される",
        risk: "原因を検証前に断定しており、フロントエンドの多重送信など別の原因を見落とす可能性があります。",
        advice: "件名は確認できた現象だけにし、原因は調査メモまたは仮説として分けてください。",
      },
    ],
    investigationAdvice: [
      {
        action: "HARで保存APIの送信回数とレスポンスを確認する。",
        purpose: "ブラウザから3回送信されたのか、サーバー処理で3件作成されたのかを切り分けるためです。",
      },
      {
        action: "作成された3件の顧客IDと登録時刻を比較する。",
        purpose: "独立したトランザクションとして処理されたかを確認するためです。",
      },
    ],
    rewriteSuggestions: [
      {
        section: "題名",
        original: "DBの排他制御不足により顧客データが重複登録される",
        suggested: "顧客登録画面で保存ボタンを連続クリックすると顧客データが重複登録される",
        reason: "原因を断定せず、確認済みの発生条件と現象を伝えるためです。",
      },
    ],
    strengths: [
      "「保存処理の応答が遅い間に保存ボタンを3回押下した」と記載しており、単なる重複登録ではなく多重操作が発生する条件を開発担当者が再現できます。",
      "作成された顧客IDをC-3012、C-3013、C-3014まで確認しており、同一行の重複表示ではなく別レコードが3件生成された事象だと判断できます。",
    ],
    rubricFindings: null,
    rubricVersion: "customer-save-multiple-clicks-duplicate.v4",
    promptVersion: "practice-review.v7",
    modelId: "mock-structured-result",
    scoredAt: "2026-08-01T00:00:00.000Z",
    errorCode: null,
  },
};
