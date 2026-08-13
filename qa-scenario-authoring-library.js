(() => {
  // QA起票教材の単一ソース。バグ教材とはテンプレートと採点方針を分離する。
  const section = (text) => ({ kind: "section", text });
  const line = (text, answers, trainingRole = "") => ({
    kind: "line",
    ...(trainingRole ? { trainingRole } : {}),
    text,
    answers,
  });

  const commonReviewGuide = {
    sourceBoundary: "受講者に提示した状況、確認済み事実、参照情報だけを確定済み情報として扱い、記載例は事実源にも正解にも使用しない",
    nonScoringInvestigationIdeas: [],
    disallowedGenericPraise: [
      "質問欄が埋められている",
      "テンプレートに沿って記載されている",
      "参照情報と現在の解釈が分かれている",
      "必要項目が埋められている",
    ],
  };

  const scenarios = {
    "ec-qa-free-shipping-after-coupon": {
      schemaVersion: "qa-scenario-authoring.v1",
      scenario: {
        scenarioId: "ec-qa-free-shipping-after-coupon",
        projectId: "ec",
        ticketType: "qa",
        qaType: "specification",
        difficulty: "beginner",
        environment: [
          { text: "Storefront v8.4.2" },
          { text: "Google Chrome 126.0.6478.127" },
          { text: "Windows 11 23H2" },
        ],
        subject: {
          text: "クーポン適用後の送料無料判定について",
          answers: ["ku-ponntekiyougonosouryoumuryouhannteinitsuite"],
        },
        report: [
          section("■質問"),
          line(
            "送料無料はクーポン適用後の商品合計で判定する理解で合っていますか",
            ["souryoumuryouhaku-ponntekiyougonoshouhinngoukeidehannteisururikaideatteimasuka"]
          ),
          section("■確認した状況・事実"),
          line(
            "商品合計5200円に500円のクーポンを適用すると値引き後は4700円になる",
            ["shouhinngoukei5200ennni500ennnoku-ponnwotekiyousurutonebikigoha4700ennninaru"]
          ),
          section("■参照情報"),
          line(
            "送料仕様書Rev.3.1とクーポン仕様書Rev.2.4を確認したが判定順序の記載がない",
            ["souryoushiyoushorev3.1toku-ponnshiyoushorev2.4wokakuninnshitaga hannteijunnjonokisaiganai".replaceAll(" ", "")]
          ),
          section("■現在の解釈"),
          line(
            "値引き後の商品合計4700円を基準として送料600円が発生すると解釈している",
            ["nebikigonoshouhinngoukei4700ennwokijunnnishitesouryou600enngahasseisuruto kaishakushiteiru".replaceAll(" ", "")]
          ),
          section("■確認理由・影響"),
          line(
            "回答によってクーポン利用時の送料表示と請求金額の期待値が変わる",
            ["kaitouniyotteku-ponnriyoushinosouryouhyoujitoseikyuukinngakunokitaichigakawaru"]
          ),
          section("■周辺確認・補足"),
          line(
            "クーポンを使用しない5200円の注文は送料無料になる想定で準備している",
            ["ku-ponnwoshiyoushinai5200ennnochuumonnhasouryoumuryouninarusouteidejunnbishiteiru"],
            "remark"
          ),
        ],
        evaluation: {
          tracker: "qa",
          severity: null,
          priority: "normal",
          status: "new",
          category: "workflow",
          version: "Storefront v8.4.2",
          environment: "Google Chrome 126.0.6478.127 / Windows 11 23H2",
          progress: "0",
          dueDate: "",
          assignee: "warita",
          watchers: ["warita", "kagotani"],
          context: {
            workMemo: "送料計算のテストケースを準備していますが、クーポン適用時の期待値を確定できていません。\n\n送料仕様書には『商品合計金額が5,000円以上の場合、送料を無料とする』、クーポン仕様書には『定額クーポンは商品合計金額から値引きする』と記載されています。\n\n商品合計5,200円へ500円のクーポンを適用すると値引き後は4,700円になりますが、送料無料判定を値引き前後のどちらで行うかは記載されていません。",
            specification: "送料仕様書 Rev.3.1『2.2 送料無料条件』\nクーポン仕様書 Rev.2.4『4.1 定額クーポン』",
            schedule: "送料計算の受入テストを進めるため、期待値の確認が必要です",
            environmentFacts: [["確認環境", "Storefront v8.4.2 / Chrome 126 / Windows 11"]],
          },
        },
      },
      briefing: {
        testTarget: "送料計算のテストケースを準備していますが、クーポン適用時の期待値を確定できていません。",
        notes: [
          "商品合計5,200円に500円の定額クーポンを適用すると、値引き後の商品合計は4,700円になります。",
          "送料仕様書には5,000円以上で送料無料とありますが、クーポン適用前後のどちらで判定するかは記載されていません。",
          "クーポンを使用しない商品合計5,200円の注文は、送料無料になる想定でテストケースを準備しています。",
        ],
      },
      specificationReference: "送料仕様書 Rev.3.1『2.2 送料無料条件』／クーポン仕様書 Rev.2.4『4.1 定額クーポン』",
      reviewSource: {
        schemaVersion: "scenario-review-source.v1",
        sourceType: "qa-materials",
        testTarget: "送料計算のテストケースを準備していますが、クーポン適用時の期待値を確定できていません。",
        environment: ["Storefront v8.4.2", "Google Chrome 126.0.6478.127", "Windows 11 23H2"],
        observations: [
          { id: "situation-1", text: "商品合計5,200円に500円の定額クーポンを適用すると、値引き後の商品合計は4,700円になります。" },
          { id: "source-1", text: "送料仕様書には5,000円以上で送料無料とありますが、クーポン適用前後のどちらで判定するかは記載されていません。" },
          { id: "impact-1", text: "期待値によってクーポン利用時の送料表示と請求金額のテスト内容が変わります。" },
        ],
        specificationReference: "送料仕様書 Rev.3.1『2.2 送料無料条件』／クーポン仕様書 Rev.2.4『4.1 定額クーポン』",
        alternativeExcellentAnswer: {
          subject: "定額クーポン利用時の送料無料判定額を確認したい",
          sections: {
            question: "送料無料条件の5,000円は、定額クーポン値引き後の商品合計へ適用する認識でよいでしょうか。",
            situation: "商品合計5,200円から500円を値引きすると4,700円になります。",
            references: "送料仕様書 Rev.3.1『2.2』とクーポン仕様書 Rev.2.4『4.1』には判定順序の記載がありません。",
            interpretation: "値引き後の4,700円を判定額とし、送料600円が発生すると考えています。",
            impact: "回答により送料表示と請求額の期待値が変わります。",
            remarks: "クーポン未使用の5,200円注文は送料無料として準備済みです。",
          },
        },
      },
      reviewGuide: {
        ...commonReviewGuide,
        strengthCriteria: [
          "金額条件と値引き前後の差を示し、回答者が判定対象をすぐ理解できるか評価する",
          "仕様に記載されていることと記載されていない判定順序を分けているか評価する",
          "回答によって変わる送料表示と請求金額の期待値を具体化しているか評価する",
        ],
      },
    },

    "customer-qa-search-state-after-back": {
      schemaVersion: "qa-scenario-authoring.v1",
      scenario: {
        scenarioId: "customer-qa-search-state-after-back",
        projectId: "customer",
        ticketType: "qa",
        qaType: "behavior",
        difficulty: "intermediate",
        environment: [
          { text: "App version: 2.3.1" },
          { text: "Google Chrome 126.0.6478.127" },
          { text: "Windows 11 23H2" },
        ],
        subject: {
          text: "顧客詳細から戻った際の検索条件初期化について",
          answers: ["kokyakushousaikaramodottasainokensakujoukennshokika nitsuite".replaceAll(" ", "")],
        },
        report: [
          section("■質問"),
          line("顧客一覧へ戻った際に検索条件を初期化する動作を正常としてよいでしょうか", ["kokyakuitirannhemodottasainikennsakujoukennwoshokikasurudousawoseijoutoshiteyoideshouka"]),
          section("■確認した状況・事実"),
          line("東京都かつ契約中で検索後に詳細を開いて戻ると条件が解除され全件表示になる", ["toukyoutokatsukeiyakuchuudekennsakugonishousaiwohiraitemodorutojoukenngakaijosarezenkennhyoujininaru"]),
          section("■参照情報"),
          line("顧客一覧画面仕様書には検索条件の保持または初期化に関する記載がない", ["kokyakuitiranngamennshiyoushonihakennsakujoukennnohojimatahasshokikanikannsurukisaiganai"]),
          section("■現在の解釈"),
          line("連続して顧客を確認する操作では検索条件を保持する動作が自然と考えている", ["rennzokushitekokyakuokakuninnsurusousadehakennsakujoukennwohojisurudousagashizenntokanngaeteiru"]),
          section("■確認理由・影響"),
          line("回答によって正常終了とするか不具合として起票するかが変わる", ["kaitouniyotteseijoushuuryoutosurukafuguitoshitekiryousurukagakawaru"]),
          section("■周辺確認・補足"),
          line("画面内の一覧へ戻るリンクでも検索条件が解除される", ["gamennnainoitirannhemodorurinnkudemokennsakujoukenngakaijosareru"], "remark"),
        ],
        evaluation: {
          tracker: "qa",
          severity: null,
          priority: "normal",
          status: "new",
          category: "ui",
          acceptedCategories: ["ui", "workflow"],
          categoryRationale: "検索条件の保持は画面状態に関するため「画面・UI」を推奨しますが、画面遷移の業務フローとして扱うチームでは「業務ロジック」も許容します。",
          version: "App version: 2.3.1",
          environment: "Google Chrome 126.0.6478.127 / Windows 11 23H2",
          progress: "0",
          dueDate: "",
          assignee: "tsunagi",
          watchers: ["tsunagi", "kikuta"],
          context: {
            workMemo: "顧客一覧の画面遷移テスト中に、期待値を確定できない動作を確認しました。\n\n都道府県『東京都』、ステータス『契約中』で検索し、顧客詳細を開いて一覧へ戻ると検索条件が解除され、全件表示になります。\n\n画面仕様書には検索条件の保持について記載がありません。類似する契約一覧画面では、詳細から戻っても検索条件が保持されます。現在の動作を正常として受け入れるか判断できていません。",
            specification: "顧客一覧画面仕様書 Rev.2.3『3.5 顧客詳細への遷移』",
            schedule: "一覧画面の受入テストを完了するため、動作の扱いを確認する必要があります",
            environmentFacts: [["確認環境", "App 2.3.1 / Chrome 126 / Windows 11"]],
          },
        },
      },
      briefing: {
        testTarget: "顧客一覧の画面遷移テスト中に、期待値を確定できない動作を確認しました。",
        notes: [
          "東京都かつ契約中で検索後、顧客詳細を開いて一覧へ戻ると、検索条件が解除されて全件表示になります。",
          "顧客一覧画面仕様書には、詳細から戻った際の検索条件保持または初期化について記載がありません。",
          "類似する契約一覧画面では検索条件が保持されますが、顧客一覧の動作を不具合とは断定していません。",
        ],
      },
      specificationReference: "顧客一覧画面仕様書 Rev.2.3『3.5 顧客詳細への遷移』",
      reviewSource: {
        schemaVersion: "scenario-review-source.v1",
        sourceType: "qa-materials",
        testTarget: "顧客一覧の画面遷移テスト中に、期待値を確定できない動作を確認しました。",
        environment: ["App version: 2.3.1", "Google Chrome 126.0.6478.127", "Windows 11 23H2"],
        observations: [
          { id: "situation-1", text: "東京都かつ契約中で検索後、顧客詳細を開いて一覧へ戻ると、検索条件が解除されて全件表示になります。" },
          { id: "source-1", text: "顧客一覧画面仕様書には、詳細から戻った際の検索条件保持または初期化について記載がありません。" },
          { id: "comparison-1", text: "類似する契約一覧画面では、詳細から戻った際も検索条件が保持されます。" },
          { id: "impact-1", text: "回答によって現在の動作を正常として扱うか、不具合として起票するかが変わります。" },
        ],
        specificationReference: "顧客一覧画面仕様書 Rev.2.3『3.5 顧客詳細への遷移』",
        alternativeExcellentAnswer: {
          subject: "顧客詳細から一覧へ戻る場合の検索条件保持を確認したい",
          sections: {
            question: "顧客詳細から一覧へ戻る場合、検索条件が解除される現在の動作を正常として扱ってよいでしょうか。",
            situation: "東京都・契約中で検索して詳細を開き、戻ると全件表示になります。",
            references: "画面仕様書 Rev.2.3には検索条件の保持に関する記載がありません。",
            interpretation: "連続確認を考えると、条件を保持する動作が自然だと考えています。",
            impact: "回答により正常終了とするか、バグとして起票するかが変わります。",
            remarks: "画面内の一覧へ戻るリンクでも同じ動作です。",
          },
        },
      },
      reviewGuide: {
        ...commonReviewGuide,
        strengthCriteria: [
          "検索条件、遷移操作、戻った後の表示を観測事実として具体化しているか評価する",
          "現在の動作を不具合と断定せず、仕様上未確定の期待値として扱っているか評価する",
          "類似画面との比較を根拠として示しつつ、同一仕様だと断定していないか評価する",
        ],
      },
    },

    "automotive-qa-warning-display-conflict": {
      schemaVersion: "qa-scenario-authoring.v1",
      scenario: {
        scenarioId: "automotive-qa-warning-display-conflict",
        projectId: "automotive",
        ticketType: "qa",
        qaType: "conflict",
        difficulty: "advanced",
        environment: [
          { text: "ECU Software: v5.12.3" },
          { text: "Hardware Rev: C" },
          { text: "Vehicle profile: TEST-02" },
        ],
        subject: {
          text: "WARN-07の信号OFF後における警告表示の継続時間について",
          answers: ["warn-07noshinngouoffgonniokerukeikokuhyoujinokeizokujikannnitsuite"],
        },
        report: [
          section("■質問"),
          line("WARN-07は信号OFF後も警告表示を5秒間継続する仕様で合っていますか", ["warn-07hashinngouoffgomokeikokuhyoujiwo5byoukannkeizokusurushiyoudeatteimasuka"]),
          section("■確認した状況・事実"),
          line("現在の実装では警告信号がOFFになると表示も即時終了する", ["gennzainojissoudehakeikokushinngougaoffninarutohyoujimosokujishuuryousuru"]),
          section("■参照情報"),
          line("車両連携仕様は即時終了としHMI仕様はOFF後5秒間継続するとしている", ["sharyourennkeishiyouhasokujishuuryoutoshi hmishiyouhaoffgo5byoukannkeizokusurutostiteiru".replaceAll(" ", "")]),
          section("■現在の解釈"),
          line("後に更新されたHMI仕様の5秒間継続を有効と考えるが優先関係は断定できない", ["atonikoushinnsaretahmishiyouno5byoukannkeizokuwoyuukoutokanngaerugayuusennkannkeihadannnendekinai"]),
          section("■確認理由・影響"),
          line("回答によって現在の即時終了を不具合として扱うかが変わる", ["kaitouniyottegennzainosokujishuuryouwofuguitoshiteatsukaukagakawaru"]),
          section("■周辺確認・補足"),
          line("両仕様書が同じ警告コードWARN-07を対象としていることを確認した", ["ryoushiyoushogaonajikeikokuko-dowarn-07wotaishoutoshiteirukotowokakuninshita"], "remark"),
        ],
        evaluation: {
          tracker: "qa",
          severity: null,
          priority: "high",
          status: "new",
          category: "api",
          version: "ECU Software: v5.12.3",
          environment: "Hardware Rev: C / Vehicle profile: TEST-02",
          progress: "0",
          dueDate: "",
          assignee: "wajima",
          watchers: ["wajima", "michigami"],
          context: {
            workMemo: "WARN-07の警告表示テスト中に、同じ終了条件について仕様書間の矛盾を確認しました。\n\n車両連携仕様書には『警告信号がOFFになった場合、警告表示を直ちに終了する』、HMI仕様書には『警告信号がOFFになった後も5秒間継続する』と記載されています。\n\n現在の実装は即時終了です。どちらを期待値として採用するか確定するまで、現在の動作を不具合と判断できません。",
            specification: "車両連携仕様書 Rev.6.2『7.4 警告信号の終了』\nHMI仕様書 Rev.4.8『5.6 WARN-07表示制御』",
            schedule: "警告表示の受入判定前に、有効な期待値を確定する必要があります",
            environmentFacts: [["確認構成", "ECU v5.12.3 / Hardware Rev C / TEST-02"]],
          },
        },
      },
      briefing: {
        testTarget: "WARN-07の警告表示テスト中に、仕様書間で異なる終了条件を確認しました。",
        notes: [
          "現在の実装では、WARN-07の警告信号がOFFになると、メーターの警告表示も即時終了します。",
          "車両連携仕様書は即時終了、HMI仕様書は信号OFF後も5秒間表示継続と記載しています。",
          "両仕様書は同じ警告コードを対象とし、HMI仕様書の方が後に更新されていますが、文書の優先関係は確認できていません。",
        ],
      },
      specificationReference: "車両連携仕様書 Rev.6.2『7.4 警告信号の終了』／HMI仕様書 Rev.4.8『5.6 WARN-07表示制御』",
      reviewSource: {
        schemaVersion: "scenario-review-source.v1",
        sourceType: "qa-materials",
        testTarget: "WARN-07の警告表示テスト中に、仕様書間で異なる終了条件を確認しました。",
        environment: ["ECU Software: v5.12.3", "Hardware Rev: C", "Vehicle profile: TEST-02"],
        observations: [
          { id: "situation-1", text: "現在の実装では、WARN-07の警告信号がOFFになると、メーターの警告表示も即時終了します。" },
          { id: "source-1", text: "車両連携仕様書 Rev.6.2は警告信号OFF時の即時終了を定めています。" },
          { id: "source-2", text: "HMI仕様書 Rev.4.8は警告信号OFF後も5秒間表示を継続すると定めています。" },
          { id: "impact-1", text: "採用する仕様によって現在の即時終了を正常とするか、不具合とするかが変わります。" },
        ],
        specificationReference: "車両連携仕様書 Rev.6.2『7.4 警告信号の終了』／HMI仕様書 Rev.4.8『5.6 WARN-07表示制御』",
        alternativeExcellentAnswer: {
          subject: "WARN-07の信号OFF後に採用する表示終了条件を確認したい",
          sections: {
            question: "WARN-07はHMI仕様書 Rev.4.8を優先し、信号OFF後も5秒間表示する認識でよいでしょうか。",
            situation: "実装は信号OFFと同時に警告表示を終了します。",
            references: "車両連携仕様は即時終了、HMI仕様は5秒継続と記載しています。",
            interpretation: "更新日の新しいHMI仕様を有効と考えますが、優先関係は断定できません。",
            impact: "回答により現在の実装をバグとして扱うかが変わります。",
            remarks: "両仕様が同じWARN-07を対象としていることは確認済みです。",
          },
        },
      },
      reviewGuide: {
        ...commonReviewGuide,
        strengthCriteria: [
          "二つの仕様書の矛盾箇所と現在の実装を混同せず整理しているか評価する",
          "更新日の新しさだけで有効仕様を断定せず、回答者が判断すべき点を明示しているか評価する",
          "仕様回答によってバグ判定が変わることを具体的に説明しているか評価する",
        ],
      },
    },
  };

  window.TYPING_WORKBENCH_QA_SCENARIO_AUTHORING = Object.freeze(scenarios);
  window.TYPING_WORKBENCH_QA_SCENARIOS = Object.freeze(
    Object.values(scenarios).map(({ scenario }) => scenario)
  );
  window.TYPING_WORKBENCH_QA_SCENARIO_BRIEFINGS = Object.freeze(
    Object.fromEntries(Object.entries(scenarios).map(([scenarioId, profile]) => [scenarioId, profile.briefing]))
  );
})();
