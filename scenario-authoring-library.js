(() => {
  // 問題文・記載例・観測事実・AIレビュー方針の単一ソース。生成済みrubricは直接編集しない。
  const scenarios = {
  "customer-context-menu-not-shown": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "customer-context-menu-not-shown",
      "projectId": "customer",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "App version: 2.3.1"
        },
        {
          "text": "Google Chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2"
        }
      ],
      "subject": {
        "text": "顧客一覧画面で右クリックしてもコンテキストメニューが表示されない",
        "answers": [
          "kokyakuitiranngamenndemigikurikkushitemokontekisutomenyu-gahyoujisarenai",
          "migikurikkushitemomenyu-gahyoujisarenai",
          "migikurikkushitemomenyuugahyoujisarenai",
          "migikurikkushitemomenyu-gahyouzisarenai",
          "migikurikkushitemomenyuugahyouzisarenai"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "顧客一覧画面で右クリックしても",
          "answers": [
            "kokyakuitiranngamenndemigikurikkushitemo"
          ]
        },
        {
          "kind": "line",
          "text": "コンテキストメニューが表示されず仕様と異なる",
          "answers": [
            "kontekisutomenyu-gahyoujisarezushiyoutokotonaru",
            "kontekisutomenyu-gahyoujisarenaijoutaininatteshimau",
            "kontekisutomenyu-gahyouzisarenaijoutaininatteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "管理者ユーザーでログインしていること",
          "answers": [
            "kannrishayu-za-deroguinnshiteirukoto",
            "kannrishayu-za-deroguinnsiteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 顧客一覧画面を開く",
          "answers": [
            "1kokyakuitiranngamennwohiraku"
          ]
        },
        {
          "kind": "line",
          "text": "2. 任意の顧客を選択する",
          "answers": [
            "2ninninokokyakuwosentakusuru"
          ]
        },
        {
          "kind": "line",
          "text": "3. 右クリックを実行する",
          "answers": [
            "3migikurikkuwojikkousuru",
            "3migikurikkuwozikkousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "コンテキストメニューが表示されること",
          "answers": [
            "kontekisutomenyu-gahyoujisarerukoto",
            "kontekisutomenyuugahyoujisarerukoto",
            "kontekisutomenyu-gahyouzisarerukoto",
            "kontekisutomenyuugahyouzisarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "コンテキストメニューが表示されない",
          "answers": [
            "kontekisutomenyu-gahyoujisarenai"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "左クリックで顧客詳細を開く操作は正常に行えることを確認",
          "answers": [
            "hidarikurikkudekokyakushousaiwohirakusousahaseijouniokonaerukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "顧客管理システムの顧客一覧で、選択行の操作メニューをテストしています。",
      "notes": [
        "顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました。行の選択状態は変わりましたが、操作メニューは表示されませんでした。",
        "管理者アカウントで再ログインし、一覧表示から同一手順を3回実施しました。いずれも同じ状態でした。左クリックによる顧客詳細画面への遷移は正常です。",
        "画面仕様書の3.4.2には、一覧の選択行から編集や履歴確認を呼び出すメニューを表示する旨が記載されています。なお、同じマウスを使用した別画面の右クリック操作は正常です。"
      ]
    },
    "specificationReference": "顧客管理システム画面仕様書 Rev.2.3「3.4.2 顧客一覧のコンテキストメニュー」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、Chromeで顧客一覧を利用する管理者です。顧客詳細の表示や登録データには影響しません。",
      "workaround": "修正までは、顧客を左クリックして詳細画面を開き、画面内の操作ボタンを使用します。",
      "recovery": "ページを再読み込みしてもメニューは戻りません。恒久的な復旧には画面の修正が必要です。",
      "risk": "編集や履歴確認を右クリック操作で開始できないため、操作に余分な手間がかかります。誤更新やデータ消失は確認されていません。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "顧客管理システムの顧客一覧で、選択行の操作メニューをテストしています。",
      "environment": [
        "App version: 2.3.1",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました。行の選択状態は変わりましたが、操作メニューは表示されませんでした。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "管理者アカウントで再ログインし、一覧表示から同一手順を3回実施しました。いずれも同じ状態でした。左クリックによる顧客詳細画面への遷移は正常です。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "画面仕様書の3.4.2には、一覧の選択行から編集や履歴確認を呼び出すメニューを表示する旨が記載されています。なお、同じマウスを使用した別画面の右クリック操作は正常です。"
        }
      ],
      "specificationReference": "顧客管理システム画面仕様書 Rev.2.3「3.4.2 顧客一覧のコンテキストメニュー」",
      "alternativeExcellentAnswer": {
        "subject": "顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました、行の選択状態は変わりましたが、操作メニューは表示されませんでした",
        "sections": {
          "detail": "顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました。行の選択状態は変わりましたが、操作メニューは表示されませんでした。",
          "preconditions": "確認環境：App version: 2.3.1、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました",
          "expected": "顧客管理システム画面仕様書 Rev.2.3「3.4.2 顧客一覧のコンテキストメニュー」\n画面仕様書の3.4.2には、一覧の選択行から編集や履歴確認を呼び出すメニューを表示する旨が記載されています。なお、同じマウスを使用した別画面の右クリック操作は正常です。",
          "actual": "行の選択状態は変わりましたが、操作メニューは表示されませんでした",
          "remarks": "左クリックによる顧客詳細画面への遷移は正常です。",
          "reproducibility": "管理者アカウントで再ログインし、一覧表示から同一手順を3回実施しました。いずれも同じ状態でした。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『顧客一覧でC-2048を選択後、対象行上で右クリックを実行しました。行の選択状態は変わりましたが、操作メニューは表示されませんでした。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『管理者アカウントで再ログインし、一覧表示から同一手順を3回実施しました。いずれも同じ状態でした。左クリックによる顧客詳細画面への遷移は正常です。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『画面仕様書の3.4.2には、一覧の選択行から編集や履歴確認を呼び出すメニューを表示する旨が記載されています。なお、同じマウスを使用した別画面の右クリック操作は正常です。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "customer-search-nonexistent-name-all-results": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "customer-search-nonexistent-name-all-results",
      "projectId": "customer",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Web release: 2026.07.24"
        },
        {
          "text": "Microsoft Edge 126.0.2592.102"
        },
        {
          "text": "Windows 11 23H2"
        }
      ],
      "subject": {
        "text": "顧客一覧画面で存在しない氏名を検索すると顧客が全件表示されてしまう",
        "answers": [
          "kokyakuitiranngamenndesonzaishinaishimeiwokensakusurutokokyakugazennkennhyoujisareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "顧客一覧画面の氏名欄に「ZZZZZZ」を入力して検索すると",
          "answers": [
            "kokyakuitiranngamennnoshimeirannnizzzzzzwo nyuuryokushitekensakusuruto"
          ]
        },
        {
          "kind": "line",
          "text": "該当する顧客が存在しないにもかかわらず、登録済みの顧客248件が表示されてしまう",
          "answers": [
            "gaitousurukokyakugasonzaishinainimokakawarazu tourokuzuminokokyaku248kenngahyoujisareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "一般ユーザーでログインしていること",
          "answers": [
            "ippanyu-za- de roguin shiteiru koto",
            "ippanyu-za- de roguin siteiru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 顧客一覧画面を開く",
          "answers": [
            "1kokyakuitiranngamennwohiraku"
          ]
        },
        {
          "kind": "line",
          "text": "2. 検索欄に「ZZZZZZ」と入力する",
          "answers": [
            "2 kensakurann ni zzzzzz to nyuuryoku suru"
          ]
        },
        {
          "kind": "line",
          "text": "3. 検索ボタンをクリックする",
          "answers": [
            "3kensakubotanwokurikkusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "検索結果が0件と表示されること",
          "answers": [
            "kensakukekka ga 0 ken to hyouji sareru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "検索前と同じ248件が表示される",
          "answers": [
            "kensakumaetoonaji248kenngahyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "顧客番号を指定した検索では対象の1件だけが表示されることを確認",
          "answers": [
            "kokyakubangouwoshiteishitakensakudehataishouno1kenndakegahyoujisarerukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "顧客管理システムの顧客一覧で、氏名検索による絞り込みをテストしています。",
      "notes": [
        "一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました。該当する顧客は存在しませんが、検索前と同じ248件が表示されました。",
        "検索条件をクリアしたうえで同一手順を3回試しましたが、表示件数は変わりませんでした。一方、顧客番号「C-1001」を指定して検索した場合は、対象の1件のみが正しく表示されます。",
        "氏名検索の仕様では、一致する顧客が存在しない場合、検索結果は0件となる規定です。なお、前日に248件のCSV取込を実施していますが、取込処理自体は正常終了しています。"
      ]
    },
    "specificationReference": "顧客検索機能仕様書 Rev.1.8「2.3.1 氏名検索」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、顧客一覧で氏名検索を利用する一般ユーザーです。",
      "workaround": "修正までは、顧客番号など正常に動作する別の検索条件を使用します。",
      "recovery": "検索条件をクリアすると通常の一覧へ戻せますが、氏名検索の不具合自体は解消しません。",
      "risk": "検索条件に一致しない場合でも検索対象の顧客が全件表示されるため、検索結果を正しいと誤認して別の顧客を選択してしまう可能性があります。なお、権限外データの表示は確認されていません。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "顧客管理システムの顧客一覧で、氏名検索による絞り込みをテストしています。",
      "environment": [
        "Web release: 2026.07.24",
        "Microsoft Edge 126.0.2592.102",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました。該当する顧客は存在しませんが、検索前と同じ248件が表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "検索条件をクリアしたうえで同一手順を3回試しましたが、表示件数は変わりませんでした。一方、顧客番号「C-1001」を指定して検索した場合は、対象の1件のみが正しく表示されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "氏名検索の仕様では、一致する顧客が存在しない場合、検索結果は0件となる規定です。なお、前日に248件のCSV取込を実施していますが、取込処理自体は正常終了しています。"
        }
      ],
      "specificationReference": "顧客検索機能仕様書 Rev.1.8「2.3.1 氏名検索」",
      "alternativeExcellentAnswer": {
        "subject": "一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました、該当する顧客は存在しませんが、検索前と同じ248件が表示されました",
        "sections": {
          "detail": "一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました。該当する顧客は存在しませんが、検索前と同じ248件が表示されました。",
          "preconditions": "確認環境：Web release: 2026.07.24、Microsoft Edge 126.0.2592.102、Windows 11 23H2",
          "steps": "一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました",
          "expected": "顧客検索機能仕様書 Rev.1.8「2.3.1 氏名検索」\n氏名検索の仕様では、一致する顧客が存在しない場合、検索結果は0件となる規定です。なお、前日に248件のCSV取込を実施していますが、取込処理自体は正常終了しています。",
          "actual": "該当する顧客は存在しませんが、検索前と同じ248件が表示されました",
          "remarks": "一方、顧客番号「C-1001」を指定して検索した場合は、対象の1件のみが正しく表示されます。",
          "reproducibility": "検索条件をクリアしたうえで同一手順を3回試しましたが、表示件数は変わりませんでした。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『一般ユーザーアカウントで顧客一覧を開き、氏名欄に「ZZZZZZ」を入力して検索しました。該当する顧客は存在しませんが、検索前と同じ248件が表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『検索条件をクリアしたうえで同一手順を3回試しましたが、表示件数は変わりませんでした。一方、顧客番号「C-1001」を指定して検索した場合は、対象の1件のみが正しく表示されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『氏名検索の仕様では、一致する顧客が存在しない場合、検索結果は0件となる規定です。なお、前日に248件のCSV取込を実施していますが、取込処理自体は正常終了しています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "customer-save-multiple-clicks-duplicate": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "customer-save-multiple-clicks-duplicate",
      "projectId": "customer",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Build 2.3.1-20260724.1"
        },
        {
          "text": "Firefox 128.0"
        },
        {
          "text": "macOS 15.5"
        }
      ],
      "subject": {
        "text": "顧客登録画面で保存ボタンを連続クリックすると同じ顧客データが重複登録されてしまう",
        "answers": [
          "kokyakutourokugamendehozonbotanworenzokukurikkusurutoonajikokyakude-tagatyouhukutourokusareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "顧客登録画面で保存ボタンを素早く3回クリックすると",
          "answers": [
            "kokyakutourokugamendehozonbotanwosubayaku3kaikurikkusuruto"
          ]
        },
        {
          "kind": "line",
          "text": "同じ氏名・電話番号の顧客データが異なる顧客IDで3件登録されてしまう",
          "answers": [
            "onajishimeidenwabangounokokyakude-tagakotonarukokyaku id de3kenntourokusareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "管理者ユーザーでログインしていること",
          "answers": [
            "kannrishayu-za- de roguin shiteiru koto",
            "kannrishayu-za- de roguin siteiru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 顧客登録画面を開く",
          "answers": [
            "1kokyakutourokugamenwohiraku"
          ]
        },
        {
          "kind": "line",
          "text": "2. 必須項目を入力する",
          "answers": [
            "2hissukoumokuwonyuuryokusuru"
          ]
        },
        {
          "kind": "line",
          "text": "3. 保存ボタンを素早く3回クリックする",
          "answers": [
            "3hozonbotanwosubayaku3kaikurikkusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "保存ボタンを連続クリックしても顧客データが1件だけ登録されること",
          "answers": [
            "hozonbotanworenzokukurikkushitemokokyakude-taga1kenndaketourokusarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ顧客データが異なる顧客IDで3件登録される",
          "answers": [
            "onajikokyakude-tagakotonarukokyaku id de3kenntourokusareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "重複した3件にはそれぞれ異なる顧客IDが採番されていることを確認",
          "answers": [
            "tyouhukushita3kennnihasorezorekotonarukokyaku id gasaibannsareteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "顧客管理システムの顧客登録で、保存処理をテストしています。",
      "notes": [
        "管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました。保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました。",
        "登録後の一覧には、同じ氏名と電話番号のデータが3件表示され、IDはC-3012、C-3013、C-3014でした。入力データを初期化して同一手順を3回実施したところ、毎回3件作成されました。",
        "保存ボタンを1回だけ押下した場合は、1件のみ作成されます。顧客データ管理要件には、1回の登録操作につき1レコードを作成する旨が記載されています。原因箇所は現時点で特定できていません。"
      ]
    },
    "specificationReference": "顧客データ管理要件書 Rev.1.5「2.2 レコード一意性」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、顧客登録画面で保存ボタンを連続して押下した場合に作成される顧客データです。同じ内容の顧客レコードが複数作成されます。",
      "workaround": "修正までは、保存ボタンを一度だけ押し、完了表示が出るまで再操作しません。",
      "recovery": "作成されたレコードを照合し、重複分だけを管理画面から削除します。",
      "risk": "同じ顧客への連絡や集計が重複する可能性があります。入力した元データの消失は確認されていません。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "顧客管理システムの顧客登録で、保存処理をテストしています。",
      "environment": [
        "Build 2.3.1-20260724.1",
        "Firefox 128.0",
        "macOS 15.5"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました。保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "登録後の一覧には、同じ氏名と電話番号のデータが3件表示され、IDはC-3012、C-3013、C-3014でした。入力データを初期化して同一手順を3回実施したところ、毎回3件作成されました。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "保存ボタンを1回だけ押下した場合は、1件のみ作成されます。顧客データ管理要件には、1回の登録操作につき1レコードを作成する旨が記載されています。原因箇所は現時点で特定できていません。"
        }
      ],
      "specificationReference": "顧客データ管理要件書 Rev.1.5「2.2 レコード一意性」",
      "alternativeExcellentAnswer": {
        "subject": "管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました、保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました",
        "sections": {
          "detail": "管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました。保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました。",
          "preconditions": "確認環境：Build 2.3.1-20260724.1、Firefox 128.0、macOS 15.5",
          "steps": "管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました",
          "expected": "顧客データ管理要件書 Rev.1.5「2.2 レコード一意性」\n保存ボタンを1回だけ押下した場合は、1件のみ作成されます。顧客データ管理要件には、1回の登録操作につき1レコードを作成する旨が記載されています。原因箇所は現時点で特定できていません。",
          "actual": "保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました",
          "remarks": "登録後の一覧には、同じ氏名と電話番号のデータが3件表示され、IDはC-3012、C-3013、C-3014でした。",
          "reproducibility": "入力データを初期化して同一手順を3回実施したところ、毎回3件作成されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『管理者アカウントで顧客登録画面を開き、氏名「山田テスト」、電話番号「090-0000-0000」を入力しました。保存処理の応答が遅かったため、保存ボタンを短時間に3回押下しました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『登録後の一覧には、同じ氏名と電話番号のデータが3件表示され、IDはC-3012、C-3013、C-3014でした。入力データを初期化して同一手順を3回実施したところ、毎回3件作成されました。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『保存ボタンを1回だけ押下した場合は、1件のみ作成されます。顧客データ管理要件には、1回の登録操作につき1レコードを作成する旨が記載されています。原因箇所は現時点で特定できていません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "attendance-clock-out-next-day": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "attendance-clock-out-next-day",
      "projectId": "attendance",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Web version: 4.12.0",
          "answer": "web version 4.12.0"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "勤怠実績登録で退勤時刻が翌日の18:00として保存されてしまう",
        "answers": [
          "kinntaijissekitourokudetaikinnjikokugayokujitsuno18:00toshitehozonsareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "同日の09:00から18:00までの勤務実績を登録すると、退勤時刻が翌日の18:00として保存されてしまう",
          "answers": [
            "doujitsuno09:00kara18:00madenokinnmujissekiwotourokusuruto taikinnjikokugayokujitsuno18:00toshitehozonsareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト対象の従業員と勤務予定が登録されていること",
          "answers": [
            "tesutotaishounojuugyouinntokinnmuyoteigatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 勤務開始と退勤時刻を同じ日付で登録する",
          "answers": [
            "1.kinnmukaisitotaikinnjikokuwoonajihizukedetourokusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "勤務開始日と同じ日付で退勤時刻が登録されること",
          "answers": [
            "kinnmukaisibitoonajihizukedetaikinnjikokugatourokusarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "退勤時刻が翌日の18:00として保存される",
          "answers": [
            "taikinnjikokugayokujitsuno18:00toshitehozonsareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "勤務日を手動で戻すと給与集計は正しい値になることを確認",
          "answers": [
            "kinnmubiwoshudoudemodosutokyuuyoshuukeihatadashiichininarukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "勤怠管理システムで、日勤の退勤登録と勤務日判定をテストしています。",
      "notes": [
        "日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました。保存後、退勤側の日付のみ翌日に変更されていました。",
        "勤務予定と対象従業員のデータを再作成し、同一手順を3回実施しました。いずれも同じ表示および保存結果でした。勤務日を当日に手動修正した場合、給与集計は正しい値になります。",
        "勤怠計算仕様書では、日をまたがない勤務の開始と終了は同一勤務日として扱います。対象者は先月まで夜勤チームに所属していましたが、今回使用した勤務予定は09:00〜18:00の日勤です。"
      ]
    },
    "specificationReference": "勤怠計算仕様書 Rev.4.12「3.1.2 勤務日の確定」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、同じ日に出勤と退勤を行う従業員の勤務実績です。対象日の勤怠集計と承認画面にも誤った日付が反映されます。",
      "workaround": "修正までは、承認前に退勤側の勤務日を当日へ手動で戻します。",
      "recovery": "誤って保存された勤務日を修正し、対象日の勤怠集計を再実行します。",
      "risk": "誤った勤務時間や給与額で確定される可能性があります。承認前であれば勤務実績を修正できます。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "勤怠管理システムで、日勤の退勤登録と勤務日判定をテストしています。",
      "environment": [
        "Web version: 4.12.0",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました。保存後、退勤側の日付のみ翌日に変更されていました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "勤務予定と対象従業員のデータを再作成し、同一手順を3回実施しました。いずれも同じ表示および保存結果でした。勤務日を当日に手動修正した場合、給与集計は正しい値になります。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "勤怠計算仕様書では、日をまたがない勤務の開始と終了は同一勤務日として扱います。対象者は先月まで夜勤チームに所属していましたが、今回使用した勤務予定は09:00〜18:00の日勤です。"
        }
      ],
      "specificationReference": "勤怠計算仕様書 Rev.4.12「3.1.2 勤務日の確定」",
      "alternativeExcellentAnswer": {
        "subject": "日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました、保存後、退勤側の日付のみ翌日に変更されていました",
        "sections": {
          "detail": "日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました。保存後、退勤側の日付のみ翌日に変更されていました。",
          "preconditions": "確認環境：Web version: 4.12.0、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました",
          "expected": "勤怠計算仕様書 Rev.4.12「3.1.2 勤務日の確定」\n勤怠計算仕様書では、日をまたがない勤務の開始と終了は同一勤務日として扱います。対象者は先月まで夜勤チームに所属していましたが、今回使用した勤務予定は09:00〜18:00の日勤です。",
          "actual": "保存後、退勤側の日付のみ翌日に変更されていました",
          "remarks": "勤務日を当日に手動修正した場合、給与集計は正しい値になります。",
          "reproducibility": "勤務予定と対象従業員のデータを再作成し、同一手順を3回実施しました。いずれも同じ表示および保存結果でした。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『日勤予定の従業員E-042について、勤務開始09:00、退勤18:00を同日の勤務実績として登録しました。保存後、退勤側の日付のみ翌日に変更されていました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『勤務予定と対象従業員のデータを再作成し、同一手順を3回実施しました。いずれも同じ表示および保存結果でした。勤務日を当日に手動修正した場合、給与集計は正しい値になります。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『勤怠計算仕様書では、日をまたがない勤務の開始と終了は同一勤務日として扱います。対象者は先月まで夜勤チームに所属していましたが、今回使用した勤務予定は09:00〜18:00の日勤です。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "salon-duplicate-reservation": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "salon-duplicate-reservation",
      "projectId": "salon",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Release 2026.07.2",
          "answer": "release 2026.07.2"
        },
        {
          "text": "Safari 18.5",
          "answer": "safari 18.5"
        },
        {
          "text": "macOS 15.5",
          "answer": "macos 15.5"
        }
      ],
      "subject": {
        "text": "予約登録画面で予約済みの時間帯を重複予約できてしまう",
        "answers": [
          "yoyakutourokugamenndeyoyakuzuminojikanntaiwotyouhukuyoyakudekiteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "同じ担当者の14:00枠に予約が登録済みの状態でも、2件目の予約を確定できてしまう",
          "answers": [
            "onajitanntoushano14:00wakuniyoyakugatourokuzuminojoutaidemo 2kennmenoyoyakuwokakuteidekiteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象店舗の担当者と予約枠が登録されていること",
          "answers": [
            "taishoutenponotanntoushatoyoyakuwakugatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 予約済みの担当者と時間帯を選択して予約を確定する",
          "answers": [
            "1.yoyakuzuminotanntoushatojikanntaiwosenntakushiteyoyakuwokakuteisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "予約済みの時間帯は選択できないこと",
          "answers": [
            "yoyakuzuminojikanntaihasenntakudekinaikoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "予約済みの14:00枠に2件目の予約が登録される",
          "answers": [
            "yoyakuzumino14:00wakuni2kennmenoyoyakugatourokusareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "別の担当者または別の時間帯では重複しないことを確認",
          "answers": [
            "betunotanntoushamatawabetunojikanntaidehatyouhukushinaikotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "サロン予約システムで、予約済みの担当者と時間帯の重複防止をテストしています。",
      "notes": [
        "那覇店の担当者S-12には、14:00開始の予約が登録済みです。別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました。",
        "登録後、異なる予約番号のデータが2件表示されました。担当者と開始時刻は同一です。予約データを初期状態に戻して3回検証したところ、いずれも2件目の予約が作成されました。別担当者または15:00枠では競合しません。",
        "予約枠管理仕様では、予約確定済みの担当者および時間帯を、新規予約の選択対象から除外します。なお、2人目の顧客は初回来店クーポンを選択していましたが、料金計算は正常です。"
      ]
    },
    "specificationReference": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、同じ店舗・担当者・時間帯を指定した予約です。ほかの店舗や時間帯への影響は確認されていません。",
      "workaround": "修正までは、予約を確定する直前に管理画面で最新の空き状況を確認します。",
      "recovery": "後から登録された予約を取り消し、該当する顧客へ別の時間帯を案内します。",
      "risk": "同じ担当者に2件の予約が入り、来店時の対応遅延や予約変更が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "サロン予約システムで、予約済みの担当者と時間帯の重複防止をテストしています。",
      "environment": [
        "Release 2026.07.2",
        "Safari 18.5",
        "macOS 15.5"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "那覇店の担当者S-12には、14:00開始の予約が登録済みです。別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "登録後、異なる予約番号のデータが2件表示されました。担当者と開始時刻は同一です。予約データを初期状態に戻して3回検証したところ、いずれも2件目の予約が作成されました。別担当者または15:00枠では競合しません。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "予約枠管理仕様では、予約確定済みの担当者および時間帯を、新規予約の選択対象から除外します。なお、2人目の顧客は初回来店クーポンを選択していましたが、料金計算は正常です。"
        }
      ],
      "specificationReference": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」",
      "alternativeExcellentAnswer": {
        "subject": "那覇店の担当者S-12には、14:00開始の予約が登録済みです、別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました",
        "sections": {
          "detail": "那覇店の担当者S-12には、14:00開始の予約が登録済みです。別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました。",
          "preconditions": "確認環境：Release 2026.07.2、Safari 18.5、macOS 15.5",
          "steps": "那覇店の担当者S-12には、14:00開始の予約が登録済みです",
          "expected": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」\n予約枠管理仕様では、予約確定済みの担当者および時間帯を、新規予約の選択対象から除外します。なお、2人目の顧客は初回来店クーポンを選択していましたが、料金計算は正常です。",
          "actual": "別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました",
          "remarks": "登録後、異なる予約番号のデータが2件表示されました。担当者と開始時刻は同一です。別担当者または15:00枠では競合しません。",
          "reproducibility": "予約データを初期状態に戻して3回検証したところ、いずれも2件目の予約が作成されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『那覇店の担当者S-12には、14:00開始の予約が登録済みです。別顧客の予約で同じ担当者と14:00を選択したところ、確認画面から予約確定まで完了しました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『登録後、異なる予約番号のデータが2件表示されました。担当者と開始時刻は同一です。予約データを初期状態に戻して3回検証したところ、いずれも2件目の予約が作成されました。別担当者または15:00枠では競合しません。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『予約枠管理仕様では、予約確定済みの担当者および時間帯を、新規予約の選択対象から除外します。なお、2人目の顧客は初回来店クーポンを選択していましたが、料金計算は正常です。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "ec-out-of-stock-cart": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "ec-out-of-stock-cart",
      "projectId": "ec",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Storefront v8.4.2",
          "answer": "storefront v8.4.2"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "商品詳細画面で在庫切れの商品をカートに追加できてしまう",
        "answers": [
          "shouhinnshousaigamenndezaikogirenoshouhinnwoka-tonituikadekiteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "在庫数が0の商品で「カートに追加」を押すと追加に成功し、注文確認画面まで進めてしまう",
          "answers": [
            "zaikosuga0noshouhinndeka-tonituikawoosutotuikaniseikoushi chuumonnkakuninngamennmadesusumeteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト商品と購入者アカウントが登録されていること",
          "answers": [
            "tesutoshouhinntokounyuushakaunntogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 在庫数を0にした商品をカートへ追加する",
          "answers": [
            "1.zaikosuwo0nishitashouhinnwoka-tonituikasuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "在庫切れの商品はカートに追加できないこと",
          "answers": [
            "zaikogirenoshouhinnhaka-tonituikadekinaikoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "在庫切れの商品がカートに追加され、注文確認画面まで進める",
          "answers": [
            "zaikogirenoshouhinngaka-tonituikasare chuumonnkakuninngamennmadesusumeru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "商品APIが返す在庫数は0でカート追加後も変化していないことを確認",
          "answers": [
            "shouhinn api gakaesuzaikosuha0deka-totuikagomohennkashiteinaikotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "ECサイトで、在庫切れ商品のカート追加制御をテストしています。",
      "notes": [
        "商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました。カートへの追加が成功し、注文内容確認画面まで遷移できました。",
        "在庫数を0に戻し、同一条件で3回検証したところ、いずれも同じ結果でした。商品APIが返す在庫数は操作前後とも0です。別の在庫あり商品は正常に購入できます。",
        "商品在庫連携仕様では、利用可能在庫がない商品はカートへの追加を受け付けません。なお、前日に商品画像を差し替えていますが、変更前の画像へ戻しても挙動は変わりませんでした。"
      ]
    },
    "specificationReference": "商品在庫連携仕様書 Rev.8.4「4.1.3 カート追加可否」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、在庫数が0の商品と、その商品をカートへ追加した購入者です。ほかの商品への影響は確認されていません。",
      "workaround": "修正までは、対象商品を販売停止にするか、注文確定前に在庫の有無を確認します。",
      "recovery": "対象商品をカートから削除します。すでに注文が確定している場合は、注文をキャンセルして購入者へ連絡します。",
      "risk": "在庫のない商品を受注し、注文のキャンセル、返金または配送遅延が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "ECサイトで、在庫切れ商品のカート追加制御をテストしています。",
      "environment": [
        "Storefront v8.4.2",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました。カートへの追加が成功し、注文内容確認画面まで遷移できました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "在庫数を0に戻し、同一条件で3回検証したところ、いずれも同じ結果でした。商品APIが返す在庫数は操作前後とも0です。別の在庫あり商品は正常に購入できます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "商品在庫連携仕様では、利用可能在庫がない商品はカートへの追加を受け付けません。なお、前日に商品画像を差し替えていますが、変更前の画像へ戻しても挙動は変わりませんでした。"
        }
      ],
      "specificationReference": "商品在庫連携仕様書 Rev.8.4「4.1.3 カート追加可否」",
      "alternativeExcellentAnswer": {
        "subject": "商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました、カートへの追加が成功し、注文内容確認画面まで遷移できました",
        "sections": {
          "detail": "商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました。カートへの追加が成功し、注文内容確認画面まで遷移できました。",
          "preconditions": "確認環境：Storefront v8.4.2、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました",
          "expected": "商品在庫連携仕様書 Rev.8.4「4.1.3 カート追加可否」\n商品在庫連携仕様では、利用可能在庫がない商品はカートへの追加を受け付けません。なお、前日に商品画像を差し替えていますが、変更前の画像へ戻しても挙動は変わりませんでした。",
          "actual": "カートへの追加が成功し、注文内容確認画面まで遷移できました",
          "remarks": "商品APIが返す在庫数は操作前後とも0です。別の在庫あり商品は正常に購入できます。",
          "reproducibility": "在庫数を0に戻し、同一条件で3回検証したところ、いずれも同じ結果でした。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『商品SKU-884の在庫数を管理画面で0に設定後、購入者アカウントで商品詳細画面を開きました。カートへの追加が成功し、注文内容確認画面まで遷移できました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『在庫数を0に戻し、同一条件で3回検証したところ、いずれも同じ結果でした。商品APIが返す在庫数は操作前後とも0です。別の在庫あり商品は正常に購入できます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『商品在庫連携仕様では、利用可能在庫がない商品はカートへの追加を受け付けません。なお、前日に商品画像を差し替えていますが、変更前の画像へ戻しても挙動は変わりませんでした。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "inventory-over-shipment": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "inventory-over-shipment",
      "projectId": "inventory",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Client 5.7.0 (Build 1842)",
          "answer": "client 5.7.0 build 1842"
        },
        {
          "text": "Microsoft Edge 126.0.2592.102",
          "answer": "microsoft edge 126.0.2592.102"
        },
        {
          "text": "Windows 10 22H2",
          "answer": "windows 10 22h2"
        }
      ],
      "subject": {
        "text": "出庫登録画面で在庫数を超える出庫数を登録できてしまう",
        "answers": [
          "shukkotourokugamenndezaikosuwokoerushukkosuuwotourokudekiteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "現在庫が5個の商品に出庫数8個を入力しても在庫不足エラーが表示されず、出庫を登録できてしまう",
          "answers": [
            "gennzaikoga5konoshouhinnnishukkosuu8kowonyuuryokushitemozaikobusokuera-gahyoujisarezu shukkowotourokudekiteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象商品の在庫とロットが登録されていること",
          "answers": [
            "taishoushouhinnnozaikotorottogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 現在庫を超える出庫数を入力して登録する",
          "answers": [
            "1.gennzaikowokoerushukkosuuwonyuuryokushitetourokusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "在庫数を超える出庫はエラーになること",
          "answers": [
            "zaikosuwokoerushukkohaera-ninarukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "在庫数5個に対して出庫数8個の登録が成功する",
          "answers": [
            "zaikosuu5konitaishiteshukkosuu8konotourokugaseikousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "登録後の在庫数はマイナス3と表示されることを確認",
          "answers": [
            "tourokugonozaikosuhamainasu3tohyoujisarerukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "在庫管理システムで、現在庫を超える出庫数の登録制御をテストしています。",
      "notes": [
        "倉庫W-01の商品P-204は、画面上の現在庫が5個です。出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました。",
        "現在庫を5個に戻し、同一条件で3回検証したところ、いずれも登録できました。処理後の在庫数はマイナス3と表示されます。なお、同日の棚卸は予定されていますが、検証時点では開始していません。",
        "出庫業務仕様では、指定した出庫数が利用可能在庫を上回る場合、登録を中止して入力者へ通知します。別商品で現在庫以下の数量を指定した場合は、正常に登録できます。"
      ]
    },
    "specificationReference": "出庫業務仕様書 Rev.5.7「3.1.4 出庫可能数の検証」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、現在庫を超える数量で出庫登録した商品です。対象商品の在庫台帳と出庫実績に誤った数量が記録されます。",
      "workaround": "修正までは、登録前に実在庫を確認し、出庫数を現在庫以下へ変更します。",
      "recovery": "誤って登録された出庫を取り消し、棚卸結果を基に対象商品の在庫数を補正します。",
      "risk": "在庫台帳と実在庫が一致しなくなり、欠品商品の引当てや誤出荷が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "在庫管理システムで、現在庫を超える出庫数の登録制御をテストしています。",
      "environment": [
        "Client 5.7.0 (Build 1842)",
        "Microsoft Edge 126.0.2592.102",
        "Windows 10 22H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "倉庫W-01の商品P-204は、画面上の現在庫が5個です。出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "現在庫を5個に戻し、同一条件で3回検証したところ、いずれも登録できました。処理後の在庫数はマイナス3と表示されます。なお、同日の棚卸は予定されていますが、検証時点では開始していません。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "出庫業務仕様では、指定した出庫数が利用可能在庫を上回る場合、登録を中止して入力者へ通知します。別商品で現在庫以下の数量を指定した場合は、正常に登録できます。"
        }
      ],
      "specificationReference": "出庫業務仕様書 Rev.5.7「3.1.4 出庫可能数の検証」",
      "alternativeExcellentAnswer": {
        "subject": "倉庫W-01の商品P-204は、画面上の現在庫が5個です、出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました",
        "sections": {
          "detail": "倉庫W-01の商品P-204は、画面上の現在庫が5個です。出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました。",
          "preconditions": "確認環境：Client 5.7.0 (Build 1842)、Microsoft Edge 126.0.2592.102、Windows 10 22H2",
          "steps": "倉庫W-01の商品P-204は、画面上の現在庫が5個です",
          "expected": "出庫業務仕様書 Rev.5.7「3.1.4 出庫可能数の検証」\n出庫業務仕様では、指定した出庫数が利用可能在庫を上回る場合、登録を中止して入力者へ通知します。別商品で現在庫以下の数量を指定した場合は、正常に登録できます。",
          "actual": "出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました",
          "remarks": "処理後の在庫数はマイナス3と表示されます。なお、同日の棚卸は予定されていますが、検証時点では開始していません。",
          "reproducibility": "現在庫を5個に戻し、同一条件で3回検証したところ、いずれも登録できました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『倉庫W-01の商品P-204は、画面上の現在庫が5個です。出庫数に8個を指定して登録したところ、エラーは表示されず、処理完了メッセージが表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『現在庫を5個に戻し、同一条件で3回検証したところ、いずれも登録できました。処理後の在庫数はマイナス3と表示されます。なお、同日の棚卸は予定されていますが、検証時点では開始していません。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『出庫業務仕様では、指定した出庫数が利用可能在庫を上回る場合、登録を中止して入力者へ通知します。別商品で現在庫以下の数量を指定した場合は、正常に登録できます。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "mobile-rotation-clears-input": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "mobile-rotation-clears-input",
      "projectId": "mobile",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "App 3.4.0 (34018)",
          "answer": "app 3.4.0 34018"
        },
        {
          "text": "iOS 18.5",
          "answer": "ios 18.5"
        },
        {
          "text": "iPhone 15",
          "answer": "iphone 15"
        }
      ],
      "subject": {
        "text": "問い合わせフォームで画面回転後に入力内容が消えてしまう",
        "answers": [
          "toiawasefo-mudegamennkaitenngoninyuuryokunaiyougakieteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "問い合わせフォームに120文字入力した状態で端末を縦向きから横向きへ回転すると、入力内容がすべて消えてしまう",
          "answers": [
            "toiawasefo-muni120mojinyuuryokushitajoutaidetannmatuwotatemukikarayokomukihekaitennsuruto nyuuryokunaiyougasubetekieteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "NEWS-101を受信・開封済みのテスト端末に対象ビルドがインストールされていること",
          "answers": [
            "news-101wojushinn kaihuuzuminotesutotannmatunitaishoubirudogainn-suto-rusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 入力フォームへ内容を入力したまま端末を回転する",
          "answers": [
            "1.nyuuryokufo-muhenaiyouwonyuuryokushitamamatanmatuwokaitennsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "画面回転後も入力内容が保持されること",
          "answers": [
            "gamennkaitenngomonyuuryokunaiyougahojisare rukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "画面回転後、入力済みの120文字がすべて消える",
          "answers": [
            "gamennkaitenngo nyuuryokuzumino120mojigasubetekieru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "回転前の入力内容はサーバーへ送信されていないことを確認",
          "answers": [
            "kaitennmaenonyuuryokunaiyouhasa-ba-hesoushinsareteinaikotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "モバイルアプリで、画面回転時の未送信入力内容の保持をテストしています。",
      "environment": [
        "App 3.4.0 (34018)",
        "Android 15",
        "Pixel 9"
      ],
      "notes": [
        "問い合わせフォームに送信前の文章を約120文字入力しました。端末を縦向きから横向きへ回転させた直後、入力内容が消失し、入力欄が空になりました。",
        "同一端末で入力内容を再作成し、3回検証しました。いずれも画面回転直後に入力内容が消失しました。縦向きのまま送信する操作、および保存済みの問い合わせ内容の表示は正常です。",
        "画面状態保持の資料には、画面回転によって画面が再構成される場合も、未送信の入力値を引き継ぐ旨が記載されています。なお、文字サイズを標準に変更しても再現しました。"
      ]
    },
    "specificationReference": "モバイル画面状態保持仕様書 Rev.3.4「2.5 端末回転時の入力保持」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、Androidの対象画面で端末回転前に保存していない入力内容です。保存済みデータへの影響は確認されていません。",
      "workaround": "修正までは、入力内容を送信または保存するまで端末を回転しません。",
      "recovery": "消えた入力内容は復元できないため、利用者が同じ内容を再入力します。",
      "risk": "未保存の入力内容が失われ、入力作業のやり直しが発生します。サーバー上の保存済みデータは失われません。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "モバイルアプリで、画面回転時の未送信入力内容の保持をテストしています。",
      "environment": [
        "App 3.4.0 (34018)",
        "Android 15",
        "Pixel 9"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "問い合わせフォームに送信前の文章を約120文字入力しました。端末を縦向きから横向きへ回転させた直後、入力内容が消失し、入力欄が空になりました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一端末で入力内容を再作成し、3回検証しました。いずれも画面回転直後に入力内容が消失しました。縦向きのまま送信する操作、および保存済みの問い合わせ内容の表示は正常です。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "画面状態保持の資料には、画面回転によって画面が再構成される場合も、未送信の入力値を引き継ぐ旨が記載されています。なお、文字サイズを標準に変更しても再現しました。"
        }
      ],
      "specificationReference": "モバイル画面状態保持仕様書 Rev.3.4「2.5 端末回転時の入力保持」",
      "alternativeExcellentAnswer": {
        "subject": "問い合わせフォームの未送信文が端末の横向き切替で消失する",
        "sections": {
          "detail": "App 3.4.0 (34018)／Android 15／Pixel 9で、問い合わせフォームへ約120文字を入力して端末を横向きにすると、入力欄が空になりました。",
          "preconditions": "Pixel 9へApp 3.4.0 (34018)をインストールし、問い合わせフォームを開いていること",
          "steps": "1. 問い合わせフォームへ送信前の文章を約120文字入力する\n2. 端末を縦向きから横向きへ回転する",
          "expected": "画面が再構成されても、未送信の入力内容が保持されること",
          "actual": "回転直後に約120文字の入力内容が消失し、入力欄が空になる",
          "remarks": "縦向きのまま送信する操作と保存済み内容の表示は正常です。文字サイズを標準に変更しても再現しました。",
          "reproducibility": "3/3"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『問い合わせフォームに送信前の文章を約120文字入力しました。端末を縦向きから横向きへ回転させた直後、入力内容が消失し、入力欄が空になりました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一端末で入力内容を再作成し、3回検証しました。いずれも画面回転直後に入力内容が消失しました。縦向きのまま送信する操作、および保存済みの問い合わせ内容の表示は正常です。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『画面状態保持の資料には、画面回転によって画面が再構成される場合も、未送信の入力値を引き継ぐ旨が記載されています。なお、文字サイズを標準に変更しても再現しました。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "automotive-speed-display-delay": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "automotive-speed-display-delay",
      "projectId": "automotive",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "ECU Software: v5.12.3",
          "answer": "ecu software v5.12.3"
        },
        {
          "text": "Hardware Rev: C",
          "answer": "hardware rev c"
        },
        {
          "text": "Vehicle profile: TEST-02",
          "answer": "vehicle profile test-02"
        }
      ],
      "subject": {
        "text": "車載メーターで車速変更後の速度表示が最大1.2秒遅れてしまう",
        "answers": [
          "shasaime-ta-deshasokuhennkougonosokudohyoujigasaidai1.2byouokureteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "車速信号を60km/hから80km/hへ変更しても、メーターは最大1.2秒間60km/hを表示し続けてしまう",
          "answers": [
            "shasokushinngouwo60km/hkara80km/hhehennkoushitemo me-ta-hasaidai1.2byoukann60km/hwohyoujishituzuketeshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "CANoeをテスト車両へ接続していること",
          "answers": [
            "canoe wotesutosharyouhesetsuzokushiteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. CANoeから車速信号を変更してメーター表示を確認する",
          "answers": [
            "1.canoe karashasokushinngouwohennkoushiteme-ta-hyoujiwokakuninsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "車速信号の変更から200ms以内にメーター速度表示が更新されること",
          "answers": [
            "shasokushinngounohennkoukara200msinainime-ta-sokudohyoujigakoushinnsarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "車速信号の変更から表示更新まで最大1.2秒かかる",
          "answers": [
            "shasokushinngounohennkoukarahyoujikoushinnmadesaidai1.2byoukakaru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "CANログ上では車速信号が即時に80km/hへ更新されていることを確認",
          "answers": [
            "can rogujoudehashasokushinngougasokujini80km/hhekoushinsareteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "車載メーターで、車速信号に対する速度表示の追従性をテストしています。",
      "notes": [
        "試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました。CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました。",
        "車速信号の変更を3回実施し、いずれも表示の追従遅延を確認しました。走行制御ECUが受信する車速値に遅延はありません。イグニッションを再投入した後も再現します。",
        "メーター表示機能仕様では、車速信号の受信から表示反映まで200ms以内と定められています。なお、ナビ案内およびオーディオを停止しても、測定結果は変わりませんでした。"
      ]
    },
    "specificationReference": "メーター表示機能仕様書 Rev.5.12「4.2.3 車速表示更新周期」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、メーターECU v5.12.3を搭載した試験車両の速度表示です。走行制御ECUが受信する車速値に遅延は確認されていません。",
      "workaround": "走行中に利用できる回避策はありません。修正版を適用するまで、対象車両の試験走行を停止します。",
      "recovery": "イグニッションをOFFにして再度ONにすると表示遅延は一時的に解消しますが、その後も再発します。",
      "risk": "運転者が実際の速度を誤認するほか、速度計表示に関する法規要件へ抵触する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "車載メーターで、車速信号に対する速度表示の追従性をテストしています。",
      "environment": [
        "ECU Software: v5.12.3",
        "Hardware Rev: C",
        "Vehicle profile: TEST-02"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました。CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "車速信号の変更を3回実施し、いずれも表示の追従遅延を確認しました。走行制御ECUが受信する車速値に遅延はありません。イグニッションを再投入した後も再現します。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "メーター表示機能仕様では、車速信号の受信から表示反映まで200ms以内と定められています。なお、ナビ案内およびオーディオを停止しても、測定結果は変わりませんでした。"
        }
      ],
      "specificationReference": "メーター表示機能仕様書 Rev.5.12「4.2.3 車速表示更新周期」",
      "alternativeExcellentAnswer": {
        "subject": "試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました、CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました",
        "sections": {
          "detail": "試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました。CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました。",
          "preconditions": "確認環境：ECU Software: v5.12.3、Hardware Rev: C、Vehicle profile: TEST-02",
          "steps": "試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました",
          "expected": "メーター表示機能仕様書 Rev.5.12「4.2.3 車速表示更新周期」\nメーター表示機能仕様では、車速信号の受信から表示反映まで200ms以内と定められています。なお、ナビ案内およびオーディオを停止しても、測定結果は変わりませんでした。",
          "actual": "CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました",
          "remarks": "走行制御ECUが受信する車速値に遅延はありません。",
          "reproducibility": "車速信号の変更を3回実施し、いずれも表示の追従遅延を確認しました。イグニッションを再投入した後も再現します。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『試験車両TEST-02で、CANoeから送信する車速値を60km/hから80km/hへ変更しました。CANログは直ちに80km/hへ変化しましたが、メーターは最大約1.2秒間、60km/hの表示を継続しました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『車速信号の変更を3回実施し、いずれも表示の追従遅延を確認しました。走行制御ECUが受信する車速値に遅延はありません。イグニッションを再投入した後も再現します。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『メーター表示機能仕様では、車速信号の受信から表示反映まで200ms以内と定められています。なお、ナビ案内およびオーディオを停止しても、測定結果は変わりませんでした。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "payment-failed-payment-sales-record": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "payment-failed-payment-sales-record",
      "projectId": "payment",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "API version: 2024-06-20",
          "answer": "api version 2024-06-20"
        },
        {
          "text": "Environment: Sandbox",
          "answer": "environment sandbox"
        },
        {
          "text": "Gateway build: 7.18.4",
          "answer": "gateway build 7.18.4"
        }
      ],
      "subject": {
        "text": "決済失敗時にも加盟店の日次売上へ売上データが計上されてしまう",
        "answers": [
          "kessaishippaijinimokameitennnonitijiuriageheuriagede-tagakeijousareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "12,800円のテスト決済が失敗応答となったにもかかわらず、加盟店の日次売上へ同額の売上データが計上されてしまう",
          "answers": [
            "12,800ennnotesutokessaigashippaioutoutonattaninimokakawarazu kameitennnonitijiuriagehedougakunouriagede-tagakeijousareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "Sandbox環境でテスト加盟店を利用できること",
          "answers": [
            "sandbox kannkyoude tesuto kameitennwo riyou dekiru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 失敗応答となるテスト決済を実行して売上データを確認する",
          "answers": [
            "1.shippaioutoutonarutesutokessaiwojikkoushiteuriagede-tawokakuninsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "決済失敗時は売上が計上されないこと",
          "answers": [
            "kessaishippaijihauriagegakeijousarenaikoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "決済失敗後も12,800円の売上データが作成される",
          "answers": [
            "kessaishippaigomo12,800ennnouriagede-tagasakuseisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "決済ゲートウェイは失敗を返しており顧客への請求は発生していないことを確認",
          "answers": [
            "kessaige-towei hashippaiwokaeshiteorikokyakuhe noseikyuuhahasseishiteinaikotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "決済システムで、決済失敗時の売上データ登録をテストしています。",
      "notes": [
        "Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました。決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました。",
        "作成された売上データを取り消し、同一条件で3回検証したところ、いずれも売上データが1件作成されました。決済ゲートウェイ側の請求はなく、顧客への決済完了メールも送信されていません。",
        "売上連携API仕様では、決済成功が確定した取引のみを売上計上の対象とします。現時点で顧客への請求は発生しておらず、加盟店側の集計値のみ過大となっています。"
      ]
    },
    "specificationReference": "売上連携API仕様書 Rev.2024-06「3.3 決済失敗時の売上制御」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、決済に失敗した取引の売上データと加盟店の日次集計です。顧客への請求は発生していません。",
      "workaround": "修正までは、日次締めの前に決済結果と売上データを照合し、失敗した取引を集計から除外します。",
      "recovery": "誤って作成された売上データを取り消し、そのデータを除外して加盟店の日次集計を再作成します。",
      "risk": "加盟店の売上額と会計データが実際より多く計上され、照合や精算に差異が生じる可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "決済システムで、決済失敗時の売上データ登録をテストしています。",
      "environment": [
        "API version: 2024-06-20",
        "Environment: Sandbox",
        "Gateway build: 7.18.4"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました。決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "作成された売上データを取り消し、同一条件で3回検証したところ、いずれも売上データが1件作成されました。決済ゲートウェイ側の請求はなく、顧客への決済完了メールも送信されていません。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "売上連携API仕様では、決済成功が確定した取引のみを売上計上の対象とします。現時点で顧客への請求は発生しておらず、加盟店側の集計値のみ過大となっています。"
        }
      ],
      "specificationReference": "売上連携API仕様書 Rev.2024-06「3.3 決済失敗時の売上制御」",
      "alternativeExcellentAnswer": {
        "subject": "Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました、決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました",
        "sections": {
          "detail": "Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました。決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました。",
          "preconditions": "確認環境：API version: 2024-06-20、Environment: Sandbox、Gateway build: 7.18.4",
          "steps": "Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました",
          "expected": "売上連携API仕様書 Rev.2024-06「3.3 決済失敗時の売上制御」\n売上連携API仕様では、決済成功が確定した取引のみを売上計上の対象とします。現時点で顧客への請求は発生しておらず、加盟店側の集計値のみ過大となっています。",
          "actual": "決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました",
          "remarks": "決済ゲートウェイ側の請求はなく、顧客への決済完了メールも送信されていません。",
          "reproducibility": "作成された売上データを取り消し、同一条件で3回検証したところ、いずれも売上データが1件作成されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『Sandbox環境で、失敗応答となる12,800円のカード決済を実行しました。決済画面には失敗と表示されましたが、加盟店の日次売上一覧には同額の売上データが追加されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『作成された売上データを取り消し、同一条件で3回検証したところ、いずれも売上データが1件作成されました。決済ゲートウェイ側の請求はなく、顧客への決済完了メールも送信されていません。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『売上連携API仕様では、決済成功が確定した取引のみを売上計上の対象とします。現時点で顧客への請求は発生しておらず、加盟店側の集計値のみ過大となっています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "medical-cross-patient-results": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "medical-cross-patient-results",
      "projectId": "medical",
      "difficulty": "beginner",
      "environment": [
        {
          "text": "Client version: 4.8.2",
          "answer": "client version 4.8.2"
        },
        {
          "text": "Database schema: 2026.07",
          "answer": "database schema 2026.07"
        },
        {
          "text": "Windows 11 Enterprise 23H2",
          "answer": "windows 11 enterprise 23h2"
        }
      ],
      "subject": {
        "text": "患者切替後も別の患者の検査結果が表示されてしまう",
        "answers": [
          "kannjakirikaegomobetunokannjanokensakekkagahyoujisareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "患者Aの検査結果を表示した後に患者Bへ切り替えても、画面に患者Aの検査結果3件が表示されてしまう",
          "answers": [
            "kannja a nokensakekkawohyoujishitaatonikannja b hekirikaetemo gamennnikannja a nokensakekka3kenngahyoujisareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト患者と検査・処方データが登録されていること",
          "answers": [
            "tesutokannjatokensashohoude-tagatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 患者Aの検査結果を表示した後に患者Bへ切り替える",
          "answers": [
            "1.kannja a no kensakekka wo hyouji shita ato ni kannja b he kirikaeru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "選択した患者の検査結果だけが表示されること",
          "answers": [
            "senntakushitakannjanokensakekkadakegahyoujisarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "患者Bへ切替後も患者Aの検査結果3件が表示される",
          "answers": [
            "kannja b hekirikaegomokannja a nokensakekka3kenngahyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "APIは患者Bの結果を返しているが画面には患者Aの検査結果が残っていることを確認",
          "answers": [
            "api hakannja b nokekkawokaeshiteirugagamennnihakannja a nokensakekkaganokotteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "診療情報システムで、患者切替時の検査結果表示をテストしています。",
      "notes": [
        "患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました。ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました。",
        "患者情報および検査データを初期状態に戻し、同一条件で3回検証しました。いずれも同じ表示となりました。API応答には患者Bの結果が含まれており、画面を再読み込みすると患者Bの結果一覧が表示されます。",
        "診療情報表示仕様では、患者切替時に切替前の表示内容を破棄し、選択した患者のデータへ更新します。なお、患者Aと患者Bは同じ診療科ですが、担当医および氏名は異なります。"
      ]
    },
    "specificationReference": "診療情報表示仕様書 Rev.4.8「3.1.5 患者切替時の表示更新」",
    "judgement": {
      "severity": "s1",
      "scope": "影響を受けるのは、同じ端末で患者を続けて切り替えた医療従事者です。切替前の患者の検査結果が画面に残ります。",
      "workaround": "修正までは、患者を切り替えるたびに画面を再読み込みし、患者IDと氏名を照合してから検査結果を参照します。",
      "recovery": "誤表示を確認した場合は画面を閉じ、再ログインして正しい患者情報を表示します。あわせて表示履歴を監査します。",
      "risk": "別の患者の検査結果に基づく誤診や誤処置のほか、要配慮個人情報の漏えいにつながります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "診療情報システムで、患者切替時の検査結果表示をテストしています。",
      "environment": [
        "Client version: 4.8.2",
        "Database schema: 2026.07",
        "Windows 11 Enterprise 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました。ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "患者情報および検査データを初期状態に戻し、同一条件で3回検証しました。いずれも同じ表示となりました。API応答には患者Bの結果が含まれており、画面を再読み込みすると患者Bの結果一覧が表示されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "診療情報表示仕様では、患者切替時に切替前の表示内容を破棄し、選択した患者のデータへ更新します。なお、患者Aと患者Bは同じ診療科ですが、担当医および氏名は異なります。"
        }
      ],
      "specificationReference": "診療情報表示仕様書 Rev.4.8「3.1.5 患者切替時の表示更新」",
      "alternativeExcellentAnswer": {
        "subject": "患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました、ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました",
        "sections": {
          "detail": "患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました。ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました。",
          "preconditions": "確認環境：Client version: 4.8.2、Database schema: 2026.07、Windows 11 Enterprise 23H2",
          "steps": "患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました",
          "expected": "診療情報表示仕様書 Rev.4.8「3.1.5 患者切替時の表示更新」\n診療情報表示仕様では、患者切替時に切替前の表示内容を破棄し、選択した患者のデータへ更新します。なお、患者Aと患者Bは同じ診療科ですが、担当医および氏名は異なります。",
          "actual": "ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました",
          "remarks": "API応答には患者Bの結果が含まれており、画面を再読み込みすると患者Bの結果一覧が表示されます。",
          "reproducibility": "患者情報および検査データを初期状態に戻し、同一条件で3回検証しました。いずれも同じ表示となりました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『患者Aの検査結果を3件表示した後、同一画面で患者Bへ切り替えました。ヘッダーの患者名はBへ更新されましたが、結果一覧には患者Aの3件が残存していました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『患者情報および検査データを初期状態に戻し、同一条件で3回検証しました。いずれも同じ表示となりました。API応答には患者Bの結果が含まれており、画面を再読み込みすると患者Bの結果一覧が表示されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『診療情報表示仕様では、患者切替時に切替前の表示内容を破棄し、選択した患者のデータへ更新します。なお、患者Aと患者Bは同じ診療科ですが、担当医および氏名は異なります。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "attendance-overnight-break-not-deducted": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "attendance-overnight-break-not-deducted",
      "projectId": "attendance",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Web version: 4.12.0",
          "answer": "web version 4.12.0"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "勤怠実績登録で日をまたぐ休憩時間が勤務時間から控除されないことがある",
        "answers": [
          "kinntaijissekitourokudehiwomatagukyuukeijikanngakinnmujikannkarakoujosarenaikotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "22:00から翌日07:00までの勤務に翌日01:00から02:00の休憩を登録すると、実労働時間が8時間ではなく9時間として集計されてしまうことがある",
          "answers": [
            "22:00karayokujitsu07:00madenokinnmuniyokujitsu01:00kara02:00nokyuukeiwotourokusuruto jitsuroudoujikanga8jikandewanaku9jikanntoshiteshuukeisareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト対象の従業員と勤務予定が登録されていること",
          "answers": [
            "tesutotaishounojuugyouinntokinnmuyoteigatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 日付をまたぐ勤務に翌日分の休憩を登録する",
          "answers": [
            "1.hizukewomatagukinnmuniyokujitubunnnokyuukeiwotourokusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "翌日分を含む1時間の休憩を控除し、実労働時間を8時間とすること",
          "answers": [
            "yokujitsubunwohukumu1jikannokyuukeiwokoujoshi jitsuroudoujikannwo8jikanntosurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "1時間の休憩が控除されず、実労働時間が9時間として集計される",
          "answers": [
            "1jikannnokyuukeigakoujosarezu jitsuroudoujikannga9jikanntoshiteshuukeisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "同日内で完結する休憩は正しく控除されることを確認",
          "answers": [
            "doujitsunaidekannketsusurukyuukeihatadashikukoujosarerukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "2/5",
          "answers": [
            "2/5"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "勤怠管理システムで、日をまたぐ勤務の休憩控除をテストしています。",
      "notes": [
        "E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました。実績画面では、実労働時間が9時間と表示されました。",
        "勤務時間9時間から休憩1時間を控除した8時間を期待していましたが、同一条件で5回検証したうち2回で9時間と集計されました。同日内に設定した休憩は正しく控除されます。",
        "日跨ぎ勤務の休憩控除については、翌日側の休憩も勤務区間内であれば控除対象とする記載があります。なお、確認途中でブラウザを終了しましたが、再ログイン後も入力値は保持されていました。"
      ]
    },
    "specificationReference": "勤怠計算仕様書 Rev.4.12「3.2.4 日跨ぎ勤務の休憩控除」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、夜勤など日付をまたぎ、翌日側に休憩を登録した勤務実績です。勤怠集計と給与計算にも影響します。",
      "workaround": "修正までは、給与確定前に休憩時間と実労働時間を確認し、誤りがあれば手動で補正します。",
      "recovery": "対象勤務の実労働時間を修正し、勤怠集計と給与計算を再実行します。",
      "risk": "実労働時間が過大に記録され、賃金の過払いまたは労働時間管理の誤りにつながる可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "勤怠管理システムで、日をまたぐ勤務の休憩控除をテストしています。",
      "environment": [
        "Web version: 4.12.0",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました。実績画面では、実労働時間が9時間と表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "勤務時間9時間から休憩1時間を控除した8時間を期待していましたが、同一条件で5回検証したうち2回で9時間と集計されました。同日内に設定した休憩は正しく控除されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "日跨ぎ勤務の休憩控除については、翌日側の休憩も勤務区間内であれば控除対象とする記載があります。なお、確認途中でブラウザを終了しましたが、再ログイン後も入力値は保持されていました。"
        }
      ],
      "specificationReference": "勤怠計算仕様書 Rev.4.12「3.2.4 日跨ぎ勤務の休憩控除」",
      "alternativeExcellentAnswer": {
        "subject": "E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました、実績画面では、実労働時間が9時間と表示されました",
        "sections": {
          "detail": "E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました。実績画面では、実労働時間が9時間と表示されました。",
          "preconditions": "確認環境：Web version: 4.12.0、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました",
          "expected": "勤怠計算仕様書 Rev.4.12「3.2.4 日跨ぎ勤務の休憩控除」\n日跨ぎ勤務の休憩控除については、翌日側の休憩も勤務区間内であれば控除対象とする記載があります。なお、確認途中でブラウザを終了しましたが、再ログイン後も入力値は保持されていました。",
          "actual": "実績画面では、実労働時間が9時間と表示されました",
          "remarks": "同日内に設定した休憩は正しく控除されます。",
          "reproducibility": "勤務時間9時間から休憩1時間を控除した8時間を期待していましたが、同一条件で5回検証したうち2回で9時間と集計されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『E-042の勤務を22:00開始、翌07:00終了で登録し、翌日の01:00〜02:00を休憩時間として設定しました。実績画面では、実労働時間が9時間と表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『勤務時間9時間から休憩1時間を控除した8時間を期待していましたが、同一条件で5回検証したうち2回で9時間と集計されました。同日内に設定した休憩は正しく控除されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『日跨ぎ勤務の休憩控除については、翌日側の休憩も勤務区間内であれば控除対象とする記載があります。なお、確認途中でブラウザを終了しましたが、再ログイン後も入力値は保持されていました。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "attendance-simultaneous-clock-out-double-overtime": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "attendance-simultaneous-clock-out-double-overtime",
      "projectId": "attendance",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "Web version: 4.12.0",
          "answer": "web version 4.12.0"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "月末処理中の同時打刻で残業時間が二重計上されてしまうことがある",
        "answers": [
          "getumatushorichuunodoujidakokudezanngyoujikannganijuukeijousareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "月末処理中に2台の端末から同じ従業員の退勤打刻を同時に送信すると、30分の残業が60分として集計されてしまうことがある",
          "answers": [
            "getumatushorichuuni2dainotanmatukaraonajijuugyouinnnotaikindakokuwodoujinisoushinnsuruto 30punnnozanngyouga60punntoshiteshuukeisareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト対象の従業員と勤務予定が登録されていること",
          "answers": [
            "tesutotaishounojuugyouinntokinnmuyoteigatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 月末処理中に複数端末から同時に打刻する",
          "answers": [
            "1.getumatushorichuunifukusuutanmatukaradoujinidakokusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "同じ退勤打刻を一度だけ処理し、残業時間を30分として集計すること",
          "answers": [
            "onajitaikindakokuwoichidodakeshorishi zangyoujikanwo30punntoshiteshuukeisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ退勤打刻が2回処理され、残業時間が60分として集計される",
          "answers": [
            "onajitaikindakokuga2kaishorisare zanngyoujikannga60punntoshiteshuukeisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "1台の端末から打刻した場合は二重計上されないことを確認",
          "answers": [
            "1dainotanmatukaradakokushitabaaihanijuukeijousarenaikotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/20",
          "answers": [
            "1/20"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "勤怠管理システムで、月末集計中の同時退勤打刻をテストしています。",
      "notes": [
        "月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました。集計前は30分だった残業時間が、集計後は60分となりました。",
        "2台の端末を使用して同一条件で20回検証したところ、1回のみ再現しました。単一端末から退勤を記録した場合、残業時間は増加しません。両端末の時刻は同期済みです。",
        "打刻処理設計書では、同一人物・同一勤務日の重複した退勤情報は1件として扱います。なお、食堂端末の利用記録など、同日に記録された別種別の打刻に異常はありません。"
      ]
    },
    "specificationReference": "打刻処理設計書 Rev.4.6「5.3.2 重複打刻の排除」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、月末集計中に複数端末から同時に退勤を記録した従業員です。残業時間が二重計上され、対象月の給与計算にも影響します。",
      "workaround": "修正までは、月末集計中の退勤記録を1台の端末に限定します。",
      "recovery": "重複した退勤記録を除外し、対象月の残業集計と給与計算を再実行します。",
      "risk": "残業代の過払いと、労働時間記録の不整合が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "勤怠管理システムで、月末集計中の同時退勤打刻をテストしています。",
      "environment": [
        "Web version: 4.12.0",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました。集計前は30分だった残業時間が、集計後は60分となりました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "2台の端末を使用して同一条件で20回検証したところ、1回のみ再現しました。単一端末から退勤を記録した場合、残業時間は増加しません。両端末の時刻は同期済みです。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "打刻処理設計書では、同一人物・同一勤務日の重複した退勤情報は1件として扱います。なお、食堂端末の利用記録など、同日に記録された別種別の打刻に異常はありません。"
        }
      ],
      "specificationReference": "打刻処理設計書 Rev.4.6「5.3.2 重複打刻の排除」",
      "alternativeExcellentAnswer": {
        "subject": "月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました、集計前は30分だった残業時間が、集計後は60分となりました",
        "sections": {
          "detail": "月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました。集計前は30分だった残業時間が、集計後は60分となりました。",
          "preconditions": "確認環境：Web version: 4.12.0、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました",
          "expected": "打刻処理設計書 Rev.4.6「5.3.2 重複打刻の排除」\n打刻処理設計書では、同一人物・同一勤務日の重複した退勤情報は1件として扱います。なお、食堂端末の利用記録など、同日に記録された別種別の打刻に異常はありません。",
          "actual": "集計前は30分だった残業時間が、集計後は60分となりました",
          "remarks": "単一端末から退勤を記録した場合、残業時間は増加しません。両端末の時刻は同期済みです。",
          "reproducibility": "2台の端末を使用して同一条件で20回検証したところ、1回のみ再現しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『月末集計の実行中、同一従業員の退勤情報を端末Aと端末Bからほぼ同時に送信しました。集計前は30分だった残業時間が、集計後は60分となりました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『2台の端末を使用して同一条件で20回検証したところ、1回のみ再現しました。単一端末から退勤を記録した場合、残業時間は増加しません。両端末の時刻は同期済みです。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『打刻処理設計書では、同一人物・同一勤務日の重複した退勤情報は1件として扱います。なお、食堂端末の利用記録など、同日に記録された別種別の打刻に異常はありません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "salon-cancelled-slot-remains-booked": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "salon-cancelled-slot-remains-booked",
      "projectId": "salon",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Release 2026.07.2",
          "answer": "release 2026.07.2"
        },
        {
          "text": "Safari 18.5",
          "answer": "safari 18.5"
        },
        {
          "text": "macOS 15.5",
          "answer": "macos 15.5"
        }
      ],
      "subject": {
        "text": "予約をキャンセルした後も対象時間帯が予約済みのままになってしまう",
        "answers": [
          "yoyakuwokyannserushitaatomotaishoujikanntaigayoyakuzuminomamaninatteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "14:00の予約をキャンセルしても対象時間帯が予約済みのまま表示され、新しい予約を登録できなくなってしまう",
          "answers": [
            "14:00noyoyakuwokyannserushitemotaishoujikanntaigayoyakuzuminomamahyoujisare atarashiiyoyakuwotourokudekinakunatteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象店舗の担当者と予約枠が登録されていること",
          "answers": [
            "taishoutenponotanntoushatoyoyakuwakugatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 確定済みの予約をキャンセルして対象時間帯を再表示する",
          "answers": [
            "1.kakuteizuminoyoyakuwokyannserushitetaishounojikanntaiwosaihyoujisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "キャンセルした時間帯を再度予約できること",
          "answers": [
            "kyannserushitajikanntaiwosaidoyoyakudekirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "キャンセルした14:00枠が予約済みのままで、新しい予約を登録できない",
          "answers": [
            "kyannserushita14:00wakugayoyakuzuminomamade atarashiiyoyakuwotourokudekinai"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "予約一覧からは削除されているが空き枠APIでは予約済みのままであることを確認",
          "answers": [
            "yoyakuitirannkarahasakujosareteirugaakiwaku api dehayoyakuzuminomamadearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "サロン予約システムで、予約キャンセル後の空き枠反映をテストしています。",
      "notes": [
        "那覇店の14:00予約を管理画面からキャンセルしました。予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした。",
        "同一条件で5回検証したところ、3回再現しました。事象発生時は空き枠APIもbookedを返しており、ページの再読み込みでは解消しません。管理画面から枠状態を手動更新すると、再度選択できる状態になります。",
        "予約状態遷移仕様には、キャンセル完了後、対応する枠を予約可能な状態へ戻す処理が記載されています。なお、顧客へのキャンセル通知メールは毎回1通のみ送信されています。"
      ]
    },
    "specificationReference": "予約状態遷移仕様書 Rev.2026.07「3.2 キャンセル後の空き枠反映」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、キャンセルした予約と同じ店舗・担当者・時間帯の枠です。ほかの予約枠への影響は確認されていません。",
      "workaround": "修正までは、店舗管理者が対象枠を管理画面から手動で空き状態へ変更します。",
      "recovery": "対象枠の状態を再計算し、新規予約画面へ予約可能な枠として反映します。",
      "risk": "実際には空いている時間帯を販売できず、新しい予約を受け付けられない可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "サロン予約システムで、予約キャンセル後の空き枠反映をテストしています。",
      "environment": [
        "Release 2026.07.2",
        "Safari 18.5",
        "macOS 15.5"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "那覇店の14:00予約を管理画面からキャンセルしました。予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一条件で5回検証したところ、3回再現しました。事象発生時は空き枠APIもbookedを返しており、ページの再読み込みでは解消しません。管理画面から枠状態を手動更新すると、再度選択できる状態になります。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "予約状態遷移仕様には、キャンセル完了後、対応する枠を予約可能な状態へ戻す処理が記載されています。なお、顧客へのキャンセル通知メールは毎回1通のみ送信されています。"
        }
      ],
      "specificationReference": "予約状態遷移仕様書 Rev.2026.07「3.2 キャンセル後の空き枠反映」",
      "alternativeExcellentAnswer": {
        "subject": "那覇店の14:00予約を管理画面からキャンセルしました、予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした",
        "sections": {
          "detail": "那覇店の14:00予約を管理画面からキャンセルしました。予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした。",
          "preconditions": "確認環境：Release 2026.07.2、Safari 18.5、macOS 15.5",
          "steps": "那覇店の14:00予約を管理画面からキャンセルしました",
          "expected": "予約状態遷移仕様書 Rev.2026.07「3.2 キャンセル後の空き枠反映」\n予約状態遷移仕様には、キャンセル完了後、対応する枠を予約可能な状態へ戻す処理が記載されています。なお、顧客へのキャンセル通知メールは毎回1通のみ送信されています。",
          "actual": "予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした",
          "remarks": "事象発生時は空き枠APIもbookedを返しており、ページの再読み込みでは解消しません。管理画面から枠状態を手動更新すると、再度選択できる状態になります。",
          "reproducibility": "同一条件で5回検証したところ、3回再現しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『那覇店の14:00予約を管理画面からキャンセルしました。予約一覧から対象行は消失していましたが、新規予約画面では同じ担当者の14:00枠が予約済みのままでした。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一条件で5回検証したところ、3回再現しました。事象発生時は空き枠APIもbookedを返しており、ページの再読み込みでは解消しません。管理画面から枠状態を手動更新すると、再度選択できる状態になります。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『予約状態遷移仕様には、キャンセル完了後、対応する枠を予約可能な状態へ戻す処理が記載されています。なお、顧客へのキャンセル通知メールは毎回1通のみ送信されています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "salon-simultaneous-double-booking": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "salon-simultaneous-double-booking",
      "projectId": "salon",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "Release 2026.07.2",
          "answer": "release 2026.07.2"
        },
        {
          "text": "Safari 18.5",
          "answer": "safari 18.5"
        },
        {
          "text": "macOS 15.5",
          "answer": "macos 15.5"
        }
      ],
      "subject": {
        "text": "複数端末からの同時予約で同じ担当者の予約が二重登録されてしまうことがある",
        "answers": [
          "fukusuutanmatukaranodoujiyoyakudeonajitanntoushanoyoyakuganijuutourokusareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "2台の端末から300ms以内に同じ担当者の14:00枠を確定すると、それぞれ異なる予約番号で2件登録されてしまうことがある",
          "answers": [
            "2dainotanmatukara300msinainionajitanntoushano14:00wakuwokakuteisuruto sorezorekotonaruyoyakubangoude2kenntourokusareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象店舗の担当者と予約枠が登録されていること",
          "answers": [
            "taishoutenponotanntoushatoyoyakuwakugatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 別端末から同じ担当者と時間帯の予約を同時に確定する",
          "answers": [
            "1.betutannmatukaraonajitanntoushatojikanntainoyoyakuwodoujinikakuteisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "先に確定した予約だけが登録されること",
          "answers": [
            "sakinikakuteishitayoyakudakegatourokusarerukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ担当者の14:00枠が異なる予約番号で2件登録される",
          "answers": [
            "onajitanntoushano14:00wakugakotonaruyoyakubangoude2kenntourokusareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "2件は異なる予約番号だが担当者と開始時刻は同じであることを確認",
          "answers": [
            "2kennhakotonaruyoyakubangoudagatanntoushatokaisijikokuhaonajidearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/10",
          "answers": [
            "1/10"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "サロン予約システムで、複数端末からの同時予約をテストしています。",
      "notes": [
        "空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました。両画面に成功と表示され、それぞれ異なる予約番号が発行されました。",
        "確定操作の開始時刻差を300ms以内として10回検証したところ、1回のみ予約が2件作成されました。各端末から順番に操作した場合は、後から操作した端末に予約不可と表示されます。",
        "予約枠管理仕様では、同じ担当者および開始時刻に対する確定処理は、同時に1件のみ受け付けます。なお、片方の端末のみダークモードでしたが、画面テーマを統一しても発生条件は変わりませんでした。"
      ]
    },
    "specificationReference": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、同じ担当者と時間帯に対してほぼ同時に確定された2件の予約です。",
      "workaround": "修正までは、確定直前に予約枠を再読み込みし、ほかの予約が入っていないことを確認します。",
      "recovery": "後から確定した予約を取り消し、該当する顧客へ別の担当者または時間帯を案内します。",
      "risk": "担当者が対応できない二重予約となり、顧客への予約変更や謝罪が必要になる可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "サロン予約システムで、複数端末からの同時予約をテストしています。",
      "environment": [
        "Release 2026.07.2",
        "Safari 18.5",
        "macOS 15.5"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました。両画面に成功と表示され、それぞれ異なる予約番号が発行されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "確定操作の開始時刻差を300ms以内として10回検証したところ、1回のみ予約が2件作成されました。各端末から順番に操作した場合は、後から操作した端末に予約不可と表示されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "予約枠管理仕様では、同じ担当者および開始時刻に対する確定処理は、同時に1件のみ受け付けます。なお、片方の端末のみダークモードでしたが、画面テーマを統一しても発生条件は変わりませんでした。"
        }
      ],
      "specificationReference": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」",
      "alternativeExcellentAnswer": {
        "subject": "空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました、両画面に成功と表示され、それぞれ異なる予約番号が発行されました",
        "sections": {
          "detail": "空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました。両画面に成功と表示され、それぞれ異なる予約番号が発行されました。",
          "preconditions": "確認環境：Release 2026.07.2、Safari 18.5、macOS 15.5",
          "steps": "空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました",
          "expected": "予約枠管理仕様書 Rev.2026.07「2.4 予約枠の排他制御」\n予約枠管理仕様では、同じ担当者および開始時刻に対する確定処理は、同時に1件のみ受け付けます。なお、片方の端末のみダークモードでしたが、画面テーマを統一しても発生条件は変わりませんでした。",
          "actual": "両画面に成功と表示され、それぞれ異なる予約番号が発行されました",
          "remarks": "各端末から順番に操作した場合は、後から操作した端末に予約不可と表示されます。",
          "reproducibility": "確定操作の開始時刻差を300ms以内として10回検証したところ、1回のみ予約が2件作成されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『空き状態の担当者S-12の14:00枠について、受付端末とバックヤード端末から同時に予約を確定しました。両画面に成功と表示され、それぞれ異なる予約番号が発行されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『確定操作の開始時刻差を300ms以内として10回検証したところ、1回のみ予約が2件作成されました。各端末から順番に操作した場合は、後から操作した端末に予約不可と表示されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『予約枠管理仕様では、同じ担当者および開始時刻に対する確定処理は、同時に1件のみ受け付けます。なお、片方の端末のみダークモードでしたが、画面テーマを統一しても発生条件は変わりませんでした。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "ec-tax-rounding-inconsistent": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "ec-tax-rounding-inconsistent",
      "projectId": "ec",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Storefront v8.4.2",
          "answer": "storefront v8.4.2"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "商品一覧画面で税込価格の端数処理が商品ごとに異なってしまう",
        "answers": [
          "shouhinnitiranngamenndezeikomikakakunohasuushorigashouhinngotonikotonatteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "税抜105円・税率10%の同一条件でも、商品Aは115円、商品Bは116円と異なる税込価格が表示されてしまう",
          "answers": [
            "zeinuki105enn zeiritu10%nodouitsujoukenndemo shouhinn a ha115enn shouhinn b ha116enntokotonaruzeikomikakakugahyoujisareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト商品と購入者アカウントが登録されていること",
          "answers": [
            "tesutoshouhinntokounyuushakaunntogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 同じ税率を設定した複数商品の税込価格を表示する",
          "answers": [
            "1.onajizeirituwosetteishitafukusuushouhinnnozeikomikakakuwohyoujisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "設定された切り捨て処理を適用し、どちらも税込115円と表示すること",
          "answers": [
            "setteisarerukirisuteshoriwotekiyoushi dotiramazeikomi115enntohyoujisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ税条件でも商品Aは115円、商品Bは116円と表示される",
          "answers": [
            "onajizeijoukenndemoshouhinn a ha115enn shouhinn b ha116enntohyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "カート合計は115円で商品一覧の表示だけが116円であることを確認",
          "answers": [
            "ka-togoukeiha115enndeshouhinnitiran no hyoujidakega116enndearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "ECサイトで、商品価格の消費税計算と端数処理をテストしています。",
      "notes": [
        "税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました。税込価格は、商品Aが115円、商品Bが116円と表示されました。",
        "商品データを再作成し、同一条件で3回検証したところ、いずれも1円の差が発生しました。カート追加後の合計金額では、商品Bも115円として計算されます。",
        "価格計算仕様では、商品ごとに小数点以下を切り捨てる設定です。なお、商品Bの説明文には全角記号が含まれていますが、説明文を削除しても表示金額は変わりませんでした。"
      ]
    },
    "specificationReference": "価格計算仕様書 Rev.8.4「2.2.1 消費税の端数処理」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、消費税計算で1円未満の端数が発生する商品です。商品一覧の表示、注文金額、会計連携の間で1円の差が生じます。",
      "workaround": "修正までは、注文確定前に正しい税込価格を確認し、必要に応じて商品価格を手動で調整します。",
      "recovery": "端数処理の設定をそろえ、対象商品の税込価格を再計算して表示と注文金額を更新します。",
      "risk": "画面の表示価格と請求額が一致せず、購入者への案内や会計照合に差異が生じる可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "ECサイトで、商品価格の消費税計算と端数処理をテストしています。",
      "environment": [
        "Storefront v8.4.2",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました。税込価格は、商品Aが115円、商品Bが116円と表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "商品データを再作成し、同一条件で3回検証したところ、いずれも1円の差が発生しました。カート追加後の合計金額では、商品Bも115円として計算されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "価格計算仕様では、商品ごとに小数点以下を切り捨てる設定です。なお、商品Bの説明文には全角記号が含まれていますが、説明文を削除しても表示金額は変わりませんでした。"
        }
      ],
      "specificationReference": "価格計算仕様書 Rev.8.4「2.2.1 消費税の端数処理」",
      "alternativeExcellentAnswer": {
        "subject": "税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました、税込価格は、商品Aが115円、商品Bが116円と表示されました",
        "sections": {
          "detail": "税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました。税込価格は、商品Aが115円、商品Bが116円と表示されました。",
          "preconditions": "確認環境：Storefront v8.4.2、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました",
          "expected": "価格計算仕様書 Rev.8.4「2.2.1 消費税の端数処理」\n価格計算仕様では、商品ごとに小数点以下を切り捨てる設定です。なお、商品Bの説明文には全角記号が含まれていますが、説明文を削除しても表示金額は変わりませんでした。",
          "actual": "税込価格は、商品Aが115円、商品Bが116円と表示されました",
          "remarks": "カート追加後の合計金額では、商品Bも115円として計算されます。",
          "reproducibility": "商品データを再作成し、同一条件で3回検証したところ、いずれも1円の差が発生しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『税抜価格105円、税率10%の同一条件で商品Aと商品Bを登録し、商品一覧に表示しました。税込価格は、商品Aが115円、商品Bが116円と表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『商品データを再作成し、同一条件で3回検証したところ、いずれも1円の差が発生しました。カート追加後の合計金額では、商品Bも115円として計算されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『価格計算仕様では、商品ごとに小数点以下を切り捨てる設定です。なお、商品Bの説明文には全角記号が含まれていますが、説明文を削除しても表示金額は変わりませんでした。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "ec-payment-notification-double-order": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "ec-payment-notification-double-order",
      "projectId": "ec",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "Storefront v8.4.2",
          "answer": "storefront v8.4.2"
        },
        {
          "text": "Google Chrome 126.0.6478.127",
          "answer": "google chrome 126.0.6478.127"
        },
        {
          "text": "Windows 11 23H2",
          "answer": "windows 11 23h2"
        }
      ],
      "subject": {
        "text": "注文連携で決済通知を再送すると注文が二重確定されてしまうことがある",
        "answers": [
          "chuumonnrenkeidekessaitsuuchiwosaisousurutichuumonnganijuukakuteisareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "決済通知ID「PAY-4821」を再送すると、1件の決済に対して異なる注文番号が2件発行されてしまうことがある",
          "answers": [
            "kessaitsuuchiid pay-4821wosaisousuruto 1kennokessainitaishitekotonaruchuumonnbangouga2kennhakkousareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト商品と購入者アカウントが登録されていること",
          "answers": [
            "tesutoshouhinntokounyuushakaunntogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 同じ決済通知を注文APIへ再送する",
          "answers": [
            "1.onajikessaitsuuchiwochuumonn api hesaisousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "同じ通知を受信しても注文を一度だけ確定すること",
          "answers": [
            "onajitsuuchiwojushinnshitemochuumonnwoichidodakekakuteisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "1件の決済に対して異なる注文番号が2件発行される",
          "answers": [
            "1kennokessainitaishitekotonaruchuumonnbangouga2kennhakkousareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "再送前後の通知IDと決済IDは同一であることを確認",
          "answers": [
            "saisouzenngonotsuuchi id tokessai id hadouitsudearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/15",
          "answers": [
            "1/15"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "ECサイトで、決済通知再送時の注文確定をテストしています。",
      "notes": [
        "決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました。管理画面には、異なる注文番号の注文が2件作成されました。",
        "同一の決済IDおよび通知IDを使用して15回検証したところ、1回のみ注文が2件作成されました。顧客への通知メールは1通のみで、決済側の売上も1件です。",
        "注文連携API仕様では、処理済みの通知IDを再受信した場合、初回の注文結果を返します。原因が注文API側にあるのか、周辺処理側にあるのかは、現時点で切り分けできていません。"
      ]
    },
    "specificationReference": "注文連携API仕様書 Rev.8.4「6.3 決済通知の再送制御」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、決済事業者から同じ決済通知が再送された注文です。同じ通知に対して複数の注文番号が発行されます。",
      "workaround": "修正までは、再送された通知の通知IDと決済IDを確認し、同じ決済に対する注文処理を手動で停止します。",
      "recovery": "重複して作成された注文をキャンセルし、関連する出荷処理と売上連携を取り消します。",
      "risk": "同じ決済に対して、商品の二重出荷や売上の重複計上が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "ECサイトで、決済通知再送時の注文確定をテストしています。",
      "environment": [
        "Storefront v8.4.2",
        "Google Chrome 126.0.6478.127",
        "Windows 11 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました。管理画面には、異なる注文番号の注文が2件作成されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一の決済IDおよび通知IDを使用して15回検証したところ、1回のみ注文が2件作成されました。顧客への通知メールは1通のみで、決済側の売上も1件です。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "注文連携API仕様では、処理済みの通知IDを再受信した場合、初回の注文結果を返します。原因が注文API側にあるのか、周辺処理側にあるのかは、現時点で切り分けできていません。"
        }
      ],
      "specificationReference": "注文連携API仕様書 Rev.8.4「6.3 決済通知の再送制御」",
      "alternativeExcellentAnswer": {
        "subject": "決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました、管理画面には、異なる注文番号の注文が2件作成されました",
        "sections": {
          "detail": "決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました。管理画面には、異なる注文番号の注文が2件作成されました。",
          "preconditions": "確認環境：Storefront v8.4.2、Google Chrome 126.0.6478.127、Windows 11 23H2",
          "steps": "決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました",
          "expected": "注文連携API仕様書 Rev.8.4「6.3 決済通知の再送制御」\n注文連携API仕様では、処理済みの通知IDを再受信した場合、初回の注文結果を返します。原因が注文API側にあるのか、周辺処理側にあるのかは、現時点で切り分けできていません。",
          "actual": "管理画面には、異なる注文番号の注文が2件作成されました",
          "remarks": "顧客への通知メールは1通のみで、決済側の売上も1件です。",
          "reproducibility": "同一の決済IDおよび通知IDを使用して15回検証したところ、1回のみ注文が2件作成されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『決済事業者の検証画面から通知ID PAY-4821を1回送信後、同じ内容を再送しました。管理画面には、異なる注文番号の注文が2件作成されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一の決済IDおよび通知IDを使用して15回検証したところ、1回のみ注文が2件作成されました。顧客への通知メールは1通のみで、決済側の売上も1件です。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『注文連携API仕様では、処理済みの通知IDを再受信した場合、初回の注文結果を返します。原因が注文API側にあるのか、周辺処理側にあるのかは、現時点で切り分けできていません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "inventory-expired-lot-fifo": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "inventory-expired-lot-fifo",
      "projectId": "inventory",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Client 5.7.0 (Build 1842)",
          "answer": "client 5.7.0 build 1842"
        },
        {
          "text": "Microsoft Edge 126.0.2592.102",
          "answer": "microsoft edge 126.0.2592.102"
        },
        {
          "text": "Windows 10 22H2",
          "answer": "windows 10 22h2"
        }
      ],
      "subject": {
        "text": "出庫登録画面で期限切れのロットが出庫候補に表示されてしまう",
        "answers": [
          "shukkotourokugamenndekigengirenorottogashukkokouhonihyoujisareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "出庫候補を表示すると、有効期限が2026年7月26日のロットが期限内の8月31日ロットより先に表示されてしまう",
          "answers": [
            "shukkokouhowohyoujisuruto yuukoukigenga2026nenn7gatu26nichinorottogakigennnaino8gatu31nichirottoyorisakinihyoujisareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象商品の在庫とロットが登録されていること",
          "answers": [
            "taishoushouhinnnozaikotorottogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 期限切れロットを含む商品の出庫候補を表示する",
          "answers": [
            "1.kigengirerottowohukumushouhinnnoshukkokouhowohyoujisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "有効期限内のロットだけが出庫候補になること",
          "answers": [
            "yuukoukigennnainorottodakegashukkokouhoninarukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "期限切れの7月26日ロットが出庫候補の先頭に表示される",
          "answers": [
            "kigengireno7gatu26nichirottogashukkokouhonosenntounihyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "期限判定に使用するサーバー日時は2026年7月27日であることを確認",
          "answers": [
            "kigennhanntenishiyousurusa-ba-nichijiha2026nen7gatu27nichidearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "在庫管理システムで、有効期限を考慮した出庫ロットの選定をテストしています。",
      "notes": [
        "商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました。確認日は7月27日です。",
        "候補一覧を更新し、同一条件で3回検証しましたが、いずれもL-01が先頭に表示されました。画面表示言語を日本語から英語へ変更しても、並び順は同じです。",
        "ロット管理仕様では、期限切れロットを候補から除外したうえで、使用可能なロットを入庫日の古い順に表示します。サーバー日時は7月27日であり、時刻のずれは確認されていません。"
      ]
    },
    "specificationReference": "ロット管理仕様書 Rev.5.7「4.2.2 有効期限と出庫優先順位」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、期限切れロットと期限内ロットが混在する商品の出庫候補です。対象倉庫でのロット選定に影響します。",
      "workaround": "修正までは、出庫担当者が有効期限を確認し、期限内のロットを手動で選択します。",
      "recovery": "期限切れロットを出庫対象から外し、対象商品の出庫候補を再生成します。",
      "risk": "期限切れの商品を誤って出荷し、品質事故や規制違反につながる可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "在庫管理システムで、有効期限を考慮した出庫ロットの選定をテストしています。",
      "environment": [
        "Client 5.7.0 (Build 1842)",
        "Microsoft Edge 126.0.2592.102",
        "Windows 10 22H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました。確認日は7月27日です。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "候補一覧を更新し、同一条件で3回検証しましたが、いずれもL-01が先頭に表示されました。画面表示言語を日本語から英語へ変更しても、並び順は同じです。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "ロット管理仕様では、期限切れロットを候補から除外したうえで、使用可能なロットを入庫日の古い順に表示します。サーバー日時は7月27日であり、時刻のずれは確認されていません。"
        }
      ],
      "specificationReference": "ロット管理仕様書 Rev.5.7「4.2.2 有効期限と出庫優先順位」",
      "alternativeExcellentAnswer": {
        "subject": "商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました、確認日は7月27日です",
        "sections": {
          "detail": "商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました。確認日は7月27日です。",
          "preconditions": "確認環境：Client 5.7.0 (Build 1842)、Microsoft Edge 126.0.2592.102、Windows 10 22H2",
          "steps": "商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました",
          "expected": "ロット管理仕様書 Rev.5.7「4.2.2 有効期限と出庫優先順位」\nロット管理仕様では、期限切れロットを候補から除外したうえで、使用可能なロットを入庫日の古い順に表示します。サーバー日時は7月27日であり、時刻のずれは確認されていません。",
          "actual": "確認日は7月27日です",
          "remarks": "画面表示言語を日本語から英語へ変更しても、並び順は同じです。",
          "reproducibility": "候補一覧を更新し、同一条件で3回検証しましたが、いずれもL-01が先頭に表示されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『商品P-310の出庫候補を表示したところ、有効期限が7月26日のロットL-01が、8月31日のロットL-02より上位に表示されました。確認日は7月27日です。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『候補一覧を更新し、同一条件で3回検証しましたが、いずれもL-01が先頭に表示されました。画面表示言語を日本語から英語へ変更しても、並び順は同じです。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『ロット管理仕様では、期限切れロットを候補から除外したうえで、使用可能なロットを入庫日の古い順に表示します。サーバー日時は7月27日であり、時刻のずれは確認されていません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "inventory-simultaneous-shipment-negative-stock": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "inventory-simultaneous-shipment-negative-stock",
      "projectId": "inventory",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "Client 5.7.0 (Build 1842)",
          "answer": "client 5.7.0 build 1842"
        },
        {
          "text": "Microsoft Edge 126.0.2592.102",
          "answer": "microsoft edge 126.0.2592.102"
        },
        {
          "text": "Windows 10 22H2",
          "answer": "windows 10 22h2"
        }
      ],
      "subject": {
        "text": "複数端末からの同時出庫で在庫数がマイナスになってしまうことがある",
        "answers": [
          "fukusuutanmatukaranodoujishukkodezaikosugamainasuninatteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "在庫1個の商品を2台の端末から同時に1個ずつ出庫すると、2件とも登録に成功し、在庫数がマイナス1になってしまうことがある",
          "answers": [
            "zaiko1konoshouhinnwo2dainotanmatukaradoujini1kozutushukkosuruto 2kenntomotourokuniseikoushi zaikosugamainasu1ninatteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "対象商品の在庫とロットが登録されていること",
          "answers": [
            "taishoushouhinnnozaikotorottogatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 複数端末から同じ商品の出庫を同時に確定する",
          "answers": [
            "1.fukusuutanmatukaraonajishouhinnnoshukkowodoujinikakuteisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "先に確定した出庫だけを登録し、2件目は在庫不足として処理すること",
          "answers": [
            "sakinikakuteishitashukkodakewotourokushi 2kenmewazaikobusokutoshiteshorisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "2件の出庫がともに成功し、在庫数がマイナス1になる",
          "answers": [
            "2kenn-noshukkogatomoniseikoushi zaikosugamainasu1ninaru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "2件の出庫履歴はいずれも処理前在庫1個として記録されていることを確認",
          "answers": [
            "2kennoshukkorirekihaizuremoshorimaezaiko1kotoshitekirokusareteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "2/30",
          "answers": [
            "2/30"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "在庫管理システムで、複数端末からの同時出庫をテストしています。",
      "notes": [
        "在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました。両方の処理が成功し、処理後の在庫数はマイナス1となりました。",
        "同時確定を30回実施したところ、2回再現しました。出庫履歴では、2件とも処理前在庫が1個として記録されています。各端末から順番に処理した場合、2件目は在庫不足となります。",
        "在庫更新設計では、同一商品の在庫更新を並行処理せず、先に確定した結果を後続処理が参照します。なお、端末Aは有線、端末BはWi-Fi接続ですが、両方の要求がサーバーへ到達しています。"
      ]
    },
    "specificationReference": "在庫更新設計書 Rev.5.7「5.1.3 同時出庫の排他制御」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、複数端末から同時に出庫された同一商品です。対象商品の在庫台帳と、その後の出庫処理に影響します。",
      "workaround": "修正までは、同じ商品の出庫を1台の端末で順番に処理します。",
      "recovery": "対象商品の出庫履歴を照合し、成立しない出庫を取り消して在庫数を実在庫に合わせます。",
      "risk": "実際には存在しない在庫を後続処理で引き当て、欠品や誤出荷が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "在庫管理システムで、複数端末からの同時出庫をテストしています。",
      "environment": [
        "Client 5.7.0 (Build 1842)",
        "Microsoft Edge 126.0.2592.102",
        "Windows 10 22H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました。両方の処理が成功し、処理後の在庫数はマイナス1となりました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同時確定を30回実施したところ、2回再現しました。出庫履歴では、2件とも処理前在庫が1個として記録されています。各端末から順番に処理した場合、2件目は在庫不足となります。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "在庫更新設計では、同一商品の在庫更新を並行処理せず、先に確定した結果を後続処理が参照します。なお、端末Aは有線、端末BはWi-Fi接続ですが、両方の要求がサーバーへ到達しています。"
        }
      ],
      "specificationReference": "在庫更新設計書 Rev.5.7「5.1.3 同時出庫の排他制御」",
      "alternativeExcellentAnswer": {
        "subject": "在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました、両方の処理が成功し、処理後の在庫数はマイナス1となりました",
        "sections": {
          "detail": "在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました。両方の処理が成功し、処理後の在庫数はマイナス1となりました。",
          "preconditions": "確認環境：Client 5.7.0 (Build 1842)、Microsoft Edge 126.0.2592.102、Windows 10 22H2",
          "steps": "在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました",
          "expected": "在庫更新設計書 Rev.5.7「5.1.3 同時出庫の排他制御」\n在庫更新設計では、同一商品の在庫更新を並行処理せず、先に確定した結果を後続処理が参照します。なお、端末Aは有線、端末BはWi-Fi接続ですが、両方の要求がサーバーへ到達しています。",
          "actual": "両方の処理が成功し、処理後の在庫数はマイナス1となりました",
          "remarks": "出庫履歴では、2件とも処理前在庫が1個として記録されています。各端末から順番に処理した場合、2件目は在庫不足となります。",
          "reproducibility": "同時確定を30回実施したところ、2回再現しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『在庫数が1個の商品P-550について、端末Aと端末Bから1個ずつの出庫を同時に確定しました。両方の処理が成功し、処理後の在庫数はマイナス1となりました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同時確定を30回実施したところ、2回再現しました。出庫履歴では、2件とも処理前在庫が1個として記録されています。各端末から順番に処理した場合、2件目は在庫不足となります。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『在庫更新設計では、同一商品の在庫更新を並行処理せず、先に確定した結果を後続処理が参照します。なお、端末Aは有線、端末BはWi-Fi接続ですが、両方の要求がサーバーへ到達しています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "mobile-notification-opens-wrong-news": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "mobile-notification-opens-wrong-news",
      "projectId": "mobile",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "App 3.4.0 (34018)",
          "answer": "app 3.4.0 34018"
        },
        {
          "text": "iOS 18.5",
          "answer": "ios 18.5"
        },
        {
          "text": "iPhone 15",
          "answer": "iphone 15"
        }
      ],
      "subject": {
        "text": "プッシュ通知から開くと別のお知らせが表示されてしまうことがある",
        "answers": [
          "pusshutsuuchikarahirakutobetunooshirasegahyoujisareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "お知らせID「NEWS-102」のプッシュ通知をタップすると、対象ではなく一つ前の「NEWS-101」が表示されてしまうことがある",
          "answers": [
            "oshiraseid news-102nopusshutsuuchiwotappusuruto taishoudewanakuhitotumaenonews-101gahyoujisareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト端末に対象ビルドがインストールされていること",
          "answers": [
            "tesutotannmatunitaishoubirudogainn-suto-rusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 既定の検証用通知配信ツールからNEWS-102を送信する",
          "answers": [
            "1.kiteinokenshouyoutsuuchihaishinntsu-rukaranews-102wosoushinnsuru"
          ]
        },
        {
          "kind": "line",
          "text": "2. 端末で受信したNEWS-102の通知をタップする",
          "answers": [
            "2.tannmatudejushinnshitanews-102notsuuchiwotappusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "タップした通知に対応するお知らせを表示すること",
          "answers": [
            "tappushitatsuuchinitaiousuruoshirasewohyoujisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "通知対象のNEWS-102ではなく、一つ前のNEWS-101が表示される",
          "answers": [
            "tsuuchitaishounonews-102dewanaku hitotumaenonews-101gahyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "アプリ内のお知らせ一覧からNEWS-102を開く操作は正常に行えることを確認",
          "answers": [
            "apurinainooshiraseitiran karanews-102wohirakusousahaseijouniokonaerukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "2/5",
          "answers": [
            "2/5"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "モバイルアプリで、通知から対応するお知らせを開く動作をテストしています。",
      "notes": [
        "既定の検証用通知配信ツールからNEWS-101を送信して開封した端末へ、同じツールからNEWS-102を送信しました。受信したNEWS-102の通知をタップすると、アプリ起動後にNEWS-101が表示されました。",
        "同じ通知順序と条件で5回検証したところ、2回は一つ前のNEWS-101へ遷移しました。アプリ内のお知らせ一覧からNEWS-102を選択した場合は、正しい内容が表示されます。",
        "通知ディープリンク仕様では、通知に含まれるお知らせIDを遷移先画面へ引き渡します。通知音、バッジ件数および通知本文は、いずれもNEWS-102の内容と一致しています。"
      ]
    },
    "specificationReference": "通知ディープリンク仕様書 Rev.3.4「3.2 お知らせIDの引き渡し」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、対象バージョンのiOSアプリで通知をタップした利用者です。通知本文は正しいものの、一つ前のお知らせが開きます。",
      "workaround": "修正までは通知をタップせず、アプリ内のお知らせ一覧から通知に対応するお知らせを選択します。",
      "recovery": "誤ったお知らせが開いた場合は一覧へ戻り、通知に対応するお知らせを開き直します。アプリの再起動は不要です。",
      "risk": "表示された古いお知らせを最新情報だと誤認し、誤った案内に従う可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "モバイルアプリで、通知から対応するお知らせを開く動作をテストしています。",
      "environment": [
        "App 3.4.0 (34018)",
        "iOS 18.5",
        "iPhone 15"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "既定の検証用通知配信ツールからNEWS-101を送信して開封した端末へ、同じツールからNEWS-102を送信しました。受信したNEWS-102の通知をタップすると、アプリ起動後にNEWS-101が表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同じ通知順序と条件で5回検証したところ、2回は一つ前のNEWS-101へ遷移しました。アプリ内のお知らせ一覧からNEWS-102を選択した場合は、正しい内容が表示されます。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "通知ディープリンク仕様では、通知に含まれるお知らせIDを遷移先画面へ引き渡します。通知音、バッジ件数および通知本文は、いずれもNEWS-102の内容と一致しています。"
        }
      ],
      "specificationReference": "通知ディープリンク仕様書 Rev.3.4「3.2 お知らせIDの引き渡し」",
      "alternativeExcellentAnswer": {
        "subject": "NEWS-101開封後にNEWS-102の通知をタップするとNEWS-101が表示されることがある",
        "sections": {
          "detail": "NEWS-101を開封済みの端末でNEWS-102のプッシュ通知をタップすると、NEWS-102ではなくNEWS-101が表示されることがあります。",
          "preconditions": "App 3.4.0 (34018)をインストールしたiPhone 15（iOS 18.5）で、NEWS-101の通知を受信して開封済みであること",
          "steps": "1. 既定の検証用通知配信ツールからNEWS-102を送信する\n2. 端末で受信したNEWS-102の通知をタップする",
          "expected": "通知ディープリンク仕様書 Rev.3.4「3.2 お知らせIDの引き渡し」\n通知ディープリンク仕様では、通知に含まれるお知らせIDを遷移先画面へ引き渡します。通知音、バッジ件数および通知本文は、いずれもNEWS-102の内容と一致しています。",
          "actual": "NEWS-102の通知をタップしたにもかかわらず、直前に開封したNEWS-101が表示されました。",
          "remarks": "アプリ内のお知らせ一覧からNEWS-102を選択した場合は、正しい内容が表示されます。",
          "reproducibility": "同じ通知順序と条件で5回確認し、2回再現しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『既定の検証用通知配信ツールからNEWS-101を送信して開封した端末へ、同じツールからNEWS-102を送信しました。受信したNEWS-102の通知をタップすると、アプリ起動後にNEWS-101が表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同じ通知順序と条件で5回検証したところ、2回は一つ前のNEWS-101へ遷移しました。アプリ内のお知らせ一覧からNEWS-102を選択した場合は、正しい内容が表示されます。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『通知ディープリンク仕様では、通知に含まれるお知らせIDを遷移先画面へ引き渡します。通知音、バッジ件数および通知本文は、いずれもNEWS-102の内容と一致しています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "operationalDetailPolicy": "既定の検証用通知配信ツールの具体的な画面操作やAPI呼び出し方法は、通知経路自体が発生条件でない限り不足扱いしない",
      "unsupportedAdditionPolicy": "観測記録にないが矛盾もしない手順が追加された場合は、詳細を要求せず、実施済みの事実か再現手順として補った推測かを確認する",
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "mobile-background-sync-data-lost": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "mobile-background-sync-data-lost",
      "projectId": "mobile",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "App 3.4.0 (34018)",
          "answer": "app 3.4.0 34018"
        },
        {
          "text": "iOS 18.5",
          "answer": "ios 18.5"
        },
        {
          "text": "iPhone 15",
          "answer": "iphone 15"
        }
      ],
      "subject": {
        "text": "バックグラウンド復帰後に未送信データが消えてしまうことがある",
        "answers": [
          "bakkuguraundofukkigonimisoushinnde-tagakieteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "未送信データ3件が残っている状態でOSによるメモリ解放が発生すると、アプリ復帰後に3件すべてが一覧から消えてしまうことがある",
          "answers": [
            "misoushinnde-ta3kennganokotteirujoutaideosniyorumemorikaihougahasseisuruto apurifukkigoni3kensubetegaitirannkarakieteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "App 3.4.0のiPhone 15をオフラインにしていること",
          "answers": [
            "app 3.4.0noiphone 15woofurainnishiteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 現場記録を3件作成し未送信表示を確認する",
          "answers": [
            "1.gennbakirokuwo3kensakuseishimisoushinhyoujiwokakuninsuru"
          ]
        },
        {
          "kind": "line",
          "text": "2. アプリをバックグラウンドへ移す",
          "answers": [
            "2.apuriwobakkuguraundoheutsusu"
          ]
        },
        {
          "kind": "line",
          "text": "3. OSのメモリ解放後にアプリへ戻る",
          "answers": [
            "3.osnomemorikaihougoniapurihemodoru"
          ]
        },
        {
          "kind": "line",
          "text": "4. 未送信一覧と端末内キューを確認する",
          "answers": [
            "4.misoushinitiranntotannmatunaikyu-wokakuninsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "未送信データを保持して復帰後に同期すること",
          "answers": [
            "misoushinnde-tawohojishitefukkigonidoukisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "アプリ復帰後、未送信データ3件がすべて一覧から消失する",
          "answers": [
            "apurifukkigomisoushinnde-ta3kenngasubeteitirannkarashoushitsusuru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "サーバーに同期要求がなく復帰後の端末内キューが0件であることを確認",
          "answers": [
            "sa-ba-nidoukiyoukyuuganakufukkigonotannmatunaikyu-ga0kenndearukotowokakunin"
          ]
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "メモリ解放なしとApp 3.3.2とAndroid 15では各0/25であることを確認",
          "answers": [
            "memorikaihounashitoapp 3.3.2toandroid 15dehakaku0/25dearukotowokakunin"
          ]
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "低頻度のためiOS固有またはApp 3.4.0のデグレとは現時点で断定していない",
          "answers": [
            "teihindonotameioskoyuumatahaapp 3.4.0nodeguretohagenjitenndedannteishiteinai"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/25",
          "answers": [
            "1/25"
          ]
        }
      ]
    },
    "briefing": {
      "environment": [
        "App 3.4.0 (34018)",
        "iOS 18.5",
        "iPhone 15"
      ],
      "testTarget": "モバイルアプリで、バックグラウンド復帰時の未送信データ同期をテストしています。",
      "notes": [
        "App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました。OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました。",
        "同じ発生条件では1/25、メモリ解放なしでは0/25でした。同じiPhone 15とiOS 18.5のApp 3.3.2では0/25、App 3.4.0のAndroid 15／Pixel 9では0/25です。低頻度のため、iOS固有または3.4.0でのデグレとはまだ断定していません。",
        "サーバーログに3件の同期要求はなく、送信済みデータは残っています。復帰後の端末内キューは0件でした。設計上、未送信データは永続領域へ保存し、メモリ解放後も同期対象として復元します。端末の空き容量は42GBで容量警告はありません。"
      ]
    },
    "specificationReference": "オフライン同期設計書 Rev.3.4「4.3 未送信データの永続化」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、OSによるメモリ解放が発生したiOS端末上の未送信データです。送信済みデータには影響しません。",
      "workaround": "修正までは、送信完了を確認するまでアプリをバックグラウンドへ移しません。",
      "recovery": "消失した未送信データは復元できないため、元の記録を確認して再入力します。",
      "risk": "未送信の業務記録が失われ、記録の欠落や再入力が発生する可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "モバイルアプリで、バックグラウンド復帰時の未送信データ同期をテストしています。",
      "environment": [
        "App 3.4.0 (34018)",
        "iOS 18.5",
        "iPhone 15"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました。OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同じ発生条件では1/25、メモリ解放なしでは0/25でした。同じiPhone 15とiOS 18.5のApp 3.3.2では0/25、App 3.4.0のAndroid 15／Pixel 9では0/25です。低頻度のため、iOS固有または3.4.0でのデグレとはまだ断定していません。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "サーバーログに3件の同期要求はなく、送信済みデータは残っています。復帰後の端末内キューは0件でした。設計上、未送信データは永続領域へ保存し、メモリ解放後も同期対象として復元します。端末の空き容量は42GBで容量警告はありません。"
        }
      ],
      "specificationReference": "オフライン同期設計書 Rev.3.4「4.3 未送信データの永続化」",
      "alternativeExcellentAnswer": {
        "subject": "App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました、OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました",
        "sections": {
          "detail": "App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました。OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました。",
          "preconditions": "確認環境：App 3.4.0 (34018)、iOS 18.5、iPhone 15",
          "steps": "App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました",
          "expected": "オフライン同期設計書 Rev.3.4「4.3 未送信データの永続化」\nサーバーログに3件の同期要求はなく、送信済みデータは残っています。復帰後の端末内キューは0件でした。設計上、未送信データは永続領域へ保存し、メモリ解放後も同期対象として復元します。端末の空き容量は42GBで容量警告はありません。",
          "actual": "OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました",
          "remarks": "低頻度のため、iOS固有または3.4.0でのデグレとはまだ断定していません。",
          "reproducibility": "同じ発生条件では1/25、メモリ解放なしでは0/25でした。同じiPhone 15とiOS 18.5のApp 3.3.2では0/25、App 3.4.0のAndroid 15／Pixel 9では0/25です。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『App 3.4.0、iOS 18.5、iPhone 15をオフラインにし、現場記録3件を未送信のままバックグラウンドへ移しました。OSによるメモリ解放後に戻ると、3件すべてが一覧から消失しました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同じ発生条件では1/25、メモリ解放なしでは0/25でした。同じiPhone 15とiOS 18.5のApp 3.3.2では0/25、App 3.4.0のAndroid 15／Pixel 9では0/25です。低頻度のため、iOS固有または3.4.0でのデグレとはまだ断定していません。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『サーバーログに3件の同期要求はなく、送信済みデータは残っています。復帰後の端末内キューは0件でした。設計上、未送信データは永続領域へ保存し、メモリ解放後も同期対象として復元します。端末の空き容量は42GBで容量警告はありません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [
        "発生回のライフサイクルログとローカルDB更新ログを時系列で突合する",
        "App 3.4.0で追加された未送信キューの永続化処理とApp 3.3.2との差分を確認する"
      ],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "automotive-can-byte-order-reversed": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "automotive-can-byte-order-reversed",
      "projectId": "automotive",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "ECU Software: v5.12.3",
          "answer": "ecu software v5.12.3"
        },
        {
          "text": "Hardware Rev: C",
          "answer": "hardware rev c"
        },
        {
          "text": "Vehicle profile: TEST-02",
          "answer": "vehicle profile test-02"
        }
      ],
      "subject": {
        "text": "車載メーターでCAN信号がDBC定義と異なる値で表示されてしまう",
        "answers": [
          "shasaime-ta-decan shinngougadbc teigitokotonaruchidehyoujisareteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "DBCでリトルエンディアンと定義された信号に0x0BB8を送信すると、期待値30.00Vに対してメーターに471.15Vと表示されてしまう",
          "answers": [
            "dbcderitoruendiantoteigisaretashingouni0x0bb8wosoushinnsuruto kitaichi30.00vnitaishiteme-ta-ni471.15vtohyoujisareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "CANoeをテスト車両へ接続していること",
          "answers": [
            "canoe wotesutosharyouhesetsuzokushiteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. CANoeから既知のCAN信号を送信して復号値を確認する",
          "answers": [
            "1.canoe karakichino can shinngouwosoushinnshitefukugouchiwokakuninsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "DBC定義のバイト順でCAN信号を復号すること",
          "answers": [
            "dbc teiginobaitojunde can shingouwofukugousurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "受信値0x0BB8に対し、期待値30.00Vではなく471.15Vと表示される",
          "answers": [
            "jushinchi0x0bb8nitaishi kitaichi30.00vdewanaku471.15vtohyoujisareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "CANoeの送信フレームはDBC定義と一致していることを確認",
          "answers": [
            "canoe nosoushinfure-muhadbcteigitoittishiteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "車載システムで、DBC定義に基づくCAN信号の復号をテストしています。",
      "notes": [
        "CANoeからBatteryVoltageの生値0x0BB8を送信しました。期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました。",
        "同一フレームを3回送信し、いずれも同じ表示値となりました。同一フレーム内の1バイト長信号は正常であり、複数バイトで構成されるBatteryVoltageに限って事象を確認しています。",
        "ADAS通信仕様では、対象信号はIntel形式で定義されています。CANoeの送信フレームはDBC定義と一致しており、診断ツールでは30.00Vとして復号されています。"
      ]
    },
    "specificationReference": "ADAS通信仕様書 Rev.5.12「6.3.2 BatteryVoltage（Intel / Little Endian）」",
    "judgement": {
      "severity": "s3",
      "scope": "影響を受けるのは、メーターECUが表示に使用するバッテリー電圧信号です。車両制御は別経路の信号を使用しています。",
      "workaround": "修正までは、診断ツールで実際の電圧を確認し、メーター上の電圧表示を判断に使用しません。",
      "recovery": "正しいDBC定義を適用してECUを再起動すると、バッテリー電圧が正しい値で表示されます。",
      "risk": "運転者や整備担当者がバッテリー状態を誤認する可能性があります。走行制御への直接的な影響は確認されていません。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "車載システムで、DBC定義に基づくCAN信号の復号をテストしています。",
      "environment": [
        "ECU Software: v5.12.3",
        "Hardware Rev: C",
        "Vehicle profile: TEST-02"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "CANoeからBatteryVoltageの生値0x0BB8を送信しました。期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一フレームを3回送信し、いずれも同じ表示値となりました。同一フレーム内の1バイト長信号は正常であり、複数バイトで構成されるBatteryVoltageに限って事象を確認しています。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "ADAS通信仕様では、対象信号はIntel形式で定義されています。CANoeの送信フレームはDBC定義と一致しており、診断ツールでは30.00Vとして復号されています。"
        }
      ],
      "specificationReference": "ADAS通信仕様書 Rev.5.12「6.3.2 BatteryVoltage（Intel / Little Endian）」",
      "alternativeExcellentAnswer": {
        "subject": "CANoeからBatteryVoltageの生値0x0BB8を送信しました、期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました",
        "sections": {
          "detail": "CANoeからBatteryVoltageの生値0x0BB8を送信しました。期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました。",
          "preconditions": "確認環境：ECU Software: v5.12.3、Hardware Rev: C、Vehicle profile: TEST-02",
          "steps": "CANoeからBatteryVoltageの生値0x0BB8を送信しました",
          "expected": "ADAS通信仕様書 Rev.5.12「6.3.2 BatteryVoltage（Intel / Little Endian）」\nADAS通信仕様では、対象信号はIntel形式で定義されています。CANoeの送信フレームはDBC定義と一致しており、診断ツールでは30.00Vとして復号されています。",
          "actual": "期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました",
          "remarks": "同一フレーム内の1バイト長信号は正常であり、複数バイトで構成されるBatteryVoltageに限って事象を確認しています。",
          "reproducibility": "同一フレームを3回送信し、いずれも同じ表示値となりました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『CANoeからBatteryVoltageの生値0x0BB8を送信しました。期待値は30.00Vですが、メーター診断画面には471.15Vと表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一フレームを3回送信し、いずれも同じ表示値となりました。同一フレーム内の1バイト長信号は正常であり、複数バイトで構成されるBatteryVoltageに限って事象を確認しています。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『ADAS通信仕様では、対象信号はIntel形式で定義されています。CANoeの送信フレームはDBC定義と一致しており、診断ツールでは30.00Vとして復号されています。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "automotive-bus-off-recovery-receive-stopped": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "automotive-bus-off-recovery-receive-stopped",
      "projectId": "automotive",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "ECU Software: v5.12.3",
          "answer": "ecu software v5.12.3"
        },
        {
          "text": "Hardware Rev: C",
          "answer": "hardware rev c"
        },
        {
          "text": "Vehicle profile: TEST-02",
          "answer": "vehicle profile test-02"
        }
      ],
      "subject": {
        "text": "ADAS ECUでBus-Off復帰後もCAN受信が再開されないことがある",
        "answers": [
          "adas ecu debus-offfukkigomocan jushingasaikaisarenaikotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "CANバス負荷率90%以上の状態でBus-Offを発生させて復帰処理を実行しても、解除から30秒経過後もADAS ECUのCAN受信が再開されないことがある",
          "answers": [
            "can basuhukaritu90%ijounojoutaidebus-offwohasseisasetefukkishoriwojikkoushitemo kaijokara30byoukeikagomoadas ecu no can jushingasaikaisarenaikotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "CANoeを接続しCANバスを高負荷状態にしていること",
          "answers": [
            "canoe wosetsuzokushi can basuwokoufukajoutainishiteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. CANoeでADAS ECUに送信エラーを連続発生させる",
          "answers": [
            "1.canoe deadas ecu nisoushinnera-worennzokuhasseisaseru"
          ]
        },
        {
          "kind": "line",
          "text": "2. ADAS ECUがBus-Offへ遷移したことを確認する",
          "answers": [
            "2.adas ecu ga bus-off hesennishitakotowokakuninsuru"
          ]
        },
        {
          "kind": "line",
          "text": "3. 送信エラーを解除する",
          "answers": [
            "3.soushinnera-wokaijosuru"
          ]
        },
        {
          "kind": "line",
          "text": "4. 規定のBus-Off復帰処理を実行する",
          "answers": [
            "4.kiteino bus-off fukkishoriwojikkousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "Bus-Off解除後500ms以内にADAS ECUのCAN受信を再開すること",
          "answers": [
            "bus-offkaijogo500msinaini adas ecu no can jushinwosaikaisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "Bus-Off解除から30秒経過後もADAS ECUのCAN受信が再開されない",
          "answers": [
            "bus-offkaijokara30byoukeikagomoadas ecu no can jushingasaikaisarenai"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "他のECUは通信を継続しイグニッションOFF/ONでADAS ECUの受信が再開することを確認",
          "answers": [
            "hokano ecu hatsuushinwokeizokushiigunisshon off/on deadas ecu nojushingasaikaisurukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/50",
          "answers": [
            "1/50"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "ADAS ECUで、高バス負荷時のBus-Off復帰処理をテストしています。",
      "notes": [
        "CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました。エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした。",
        "同一条件で50回検証したところ、復帰操作から30秒経過後も車輪速とブレーキ状態を受信しない事象が1回発生しました。他のECUは通信を継続しており、イグニッションOFF/ON後はADAS ECUの受信も再開します。",
        "通信制御仕様では、Bus-Off解除後500ms以内に受信処理を再開します。なお、計測PCの省電力設定は無効であり、別CANチャンネルの記録にも中断はありません。"
      ]
    },
    "specificationReference": "ADAS ECU通信制御仕様書 Rev.5.12「7.4 Bus-Off復帰処理」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、高負荷試験でBus-Offから復帰したADAS ECU v5.12.3です。車輪速とブレーキ状態の受信が停止しますが、ほかのECUは通信を継続します。",
      "workaround": "走行中に受信を再開させる回避策はありません。警告灯が点灯した場合は、安全な場所へ停車します。",
      "recovery": "車両を停止してイグニッションをOFFにし、再度ONにするとADAS ECUのCAN受信が再開します。",
      "risk": "衝突被害軽減ブレーキなどの運転支援機能が利用できない状態が続きます。基本制動は独立した系統で動作します。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "ADAS ECUで、高バス負荷時のBus-Off復帰処理をテストしています。",
      "environment": [
        "ECU Software: v5.12.3",
        "Hardware Rev: C",
        "Vehicle profile: TEST-02"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました。エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一条件で50回検証したところ、復帰操作から30秒経過後も車輪速とブレーキ状態を受信しない事象が1回発生しました。他のECUは通信を継続しており、イグニッションOFF/ON後はADAS ECUの受信も再開します。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "通信制御仕様では、Bus-Off解除後500ms以内に受信処理を再開します。なお、計測PCの省電力設定は無効であり、別CANチャンネルの記録にも中断はありません。"
        }
      ],
      "specificationReference": "ADAS ECU通信制御仕様書 Rev.5.12「7.4 Bus-Off復帰処理」",
      "alternativeExcellentAnswer": {
        "subject": "CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました、エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした",
        "sections": {
          "detail": "CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました。エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした。",
          "preconditions": "確認環境：ECU Software: v5.12.3、Hardware Rev: C、Vehicle profile: TEST-02",
          "steps": "CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました",
          "expected": "ADAS ECU通信制御仕様書 Rev.5.12「7.4 Bus-Off復帰処理」\n通信制御仕様では、Bus-Off解除後500ms以内に受信処理を再開します。なお、計測PCの省電力設定は無効であり、別CANチャンネルの記録にも中断はありません。",
          "actual": "エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした",
          "remarks": "他のECUは通信を継続しており、イグニッションOFF/ON後はADAS ECUの受信も再開します。",
          "reproducibility": "同一条件で50回検証したところ、復帰操作から30秒経過後も車輪速とブレーキ状態を受信しない事象が1回発生しました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『CANバス負荷率を90%以上とし、送信エラーを連続して発生させた結果、ADAS ECUがBus-Offへ遷移しました。エラー解除および規定の復帰操作後も、当該ECUの受信カウンタのみ更新されませんでした。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一条件で50回検証したところ、復帰操作から30秒経過後も車輪速とブレーキ状態を受信しない事象が1回発生しました。他のECUは通信を継続しており、イグニッションOFF/ON後はADAS ECUの受信も再開します。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『通信制御仕様では、Bus-Off解除後500ms以内に受信処理を再開します。なお、計測PCの省電力設定は無効であり、別CANチャンネルの記録にも中断はありません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "payment-idempotency-key-double-charge": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "payment-idempotency-key-double-charge",
      "projectId": "payment",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "API version: 2024-06-20",
          "answer": "api version 2024-06-20"
        },
        {
          "text": "Environment: Sandbox",
          "answer": "environment sandbox"
        },
        {
          "text": "Gateway build: 7.18.4",
          "answer": "gateway build 7.18.4"
        }
      ],
      "subject": {
        "text": "決済APIで同じ冪等キーを再利用すると売上が二重確定されてしまうことがある",
        "answers": [
          "kessaiapideonajibekitouki-wosairiyousurutouriageganijuukakuteisareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "5,000円の決済に使用した冪等キーで10秒後に同額の決済を再試行すると、異なる取引IDで売上が2件確定してしまうことがある",
          "answers": [
            "5,000ennnokessainishiyoushitabekitouki-de10byougonidougakunokessaiwosaishikousuruto kotonarutorihikiiddeuriagega2kennkakuteishiteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "Sandbox環境でテスト加盟店を利用できること",
          "answers": [
            "sandbox kannkyoude tesuto kameitennwo riyou dekiru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 同じ冪等キーで決済APIを再試行する",
          "answers": [
            "1.onajibekitouki-dekessai api wosaishikousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "同じ冪等キーには最初の処理結果を返すこと",
          "answers": [
            "onajibekitouki-nihahajimenoshorikekkawokaesukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ冪等キーに対し、異なる取引IDで売上が2件確定する",
          "answers": [
            "onajibekitouki-nitaishi kotonarutorihikiiddeuriagega2kennkakuteisuru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "2回のリクエストで冪等キーと決済内容は一致していることを確認",
          "answers": [
            "2kainorikuesutodebekitouki-tokessainaiyouhaittishiteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "2/10",
          "answers": [
            "2/10"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "決済APIで、同じ冪等キーを使った再試行をテストしています。",
      "notes": [
        "Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました。2回とも成功し、それぞれ異なる取引IDが発行されました。",
        "同一条件で10回検証したところ、2回は売上が2件確定し、検証用カードにも同額の請求が2件記録されました。再試行前の取引照会では、初回取引はすでに成功状態でした。",
        "決済API仕様では、同一加盟店から同じ冪等キーを受信した場合、処理を追加せず、初回の結果を返します。なお、2回目の送信時のみ画面幅を変更しましたが、送信内容は同一です。"
      ]
    },
    "specificationReference": "決済API仕様書 Rev.2024-06「2.4 冪等キー」",
    "judgement": {
      "severity": "s1",
      "scope": "影響を受けるのは、タイムアウト後に同じ冪等キーで再試行された決済です。対象顧客へ同額の請求が二重に発生します。",
      "workaround": "修正までは、決済を再試行する前に取引照会を行い、最初の決済が成立していないことを確認します。",
      "recovery": "二重に成立した決済を照合し、2件目の決済を取り消すか返金します。",
      "risk": "顧客に金銭的な被害が生じるほか、加盟店への信用低下と決済データの不整合につながります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "決済APIで、同じ冪等キーを使った再試行をテストしています。",
      "environment": [
        "API version: 2024-06-20",
        "Environment: Sandbox",
        "Gateway build: 7.18.4"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました。2回とも成功し、それぞれ異なる取引IDが発行されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一条件で10回検証したところ、2回は売上が2件確定し、検証用カードにも同額の請求が2件記録されました。再試行前の取引照会では、初回取引はすでに成功状態でした。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "決済API仕様では、同一加盟店から同じ冪等キーを受信した場合、処理を追加せず、初回の結果を返します。なお、2回目の送信時のみ画面幅を変更しましたが、送信内容は同一です。"
        }
      ],
      "specificationReference": "決済API仕様書 Rev.2024-06「2.4 冪等キー」",
      "alternativeExcellentAnswer": {
        "subject": "Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました、2回とも成功し、それぞれ異なる取引IDが発行されました",
        "sections": {
          "detail": "Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました。2回とも成功し、それぞれ異なる取引IDが発行されました。",
          "preconditions": "確認環境：API version: 2024-06-20、Environment: Sandbox、Gateway build: 7.18.4",
          "steps": "Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました",
          "expected": "決済API仕様書 Rev.2024-06「2.4 冪等キー」\n決済API仕様では、同一加盟店から同じ冪等キーを受信した場合、処理を追加せず、初回の結果を返します。なお、2回目の送信時のみ画面幅を変更しましたが、送信内容は同一です。",
          "actual": "2回とも成功し、それぞれ異なる取引IDが発行されました",
          "remarks": "再試行前の取引照会では、初回取引はすでに成功状態でした。",
          "reproducibility": "同一条件で10回検証したところ、2回は売上が2件確定し、検証用カードにも同額の請求が2件記録されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『Sandbox環境で5,000円の決済要求を送信し、10秒後に同一の冪等キーおよびJSON本文で再試行しました。2回とも成功し、それぞれ異なる取引IDが発行されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一条件で10回検証したところ、2回は売上が2件確定し、検証用カードにも同額の請求が2件記録されました。再試行前の取引照会では、初回取引はすでに成功状態でした。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『決済API仕様では、同一加盟店から同じ冪等キーを受信した場合、処理を追加せず、初回の結果を返します。なお、2回目の送信時のみ画面幅を変更しましたが、送信内容は同一です。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "payment-timeout-authorization-remains": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "payment-timeout-authorization-remains",
      "projectId": "payment",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "API version: 2024-06-20",
          "answer": "api version 2024-06-20"
        },
        {
          "text": "Environment: Sandbox",
          "answer": "environment sandbox"
        },
        {
          "text": "Gateway build: 7.18.4",
          "answer": "gateway build 7.18.4"
        }
      ],
      "subject": {
        "text": "決済APIのタイムアウト後もカードの与信枠が残ってしまうことがある",
        "answers": [
          "kessaiapinotaimuautogomoka-donoyoshinnwakuganokotteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "30秒でタイムアウトした取引を再照会すると決済失敗となっているが、50,000円の与信枠が15分後も残ってしまうことがある",
          "answers": [
            "30byoudetaimuautoshitatorihikiwosaishoukaisurutokessaishippaitonatteiruga 50,000ennnoyoshinnwakuga15pungomonokotteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "Sandbox環境でテスト加盟店を利用できること",
          "answers": [
            "sandbox kannkyoude tesuto kameitennwo riyou dekiru koto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 応答をタイムアウトさせて取引と与信の状態を確認する",
          "answers": [
            "1.outouwotaimuautosase-tetorihikitoyoshinnnojoutaiwokakuninsuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "再照会で決済失敗を確定した場合、5分以内に与信を取り消すこと",
          "answers": [
            "saishoukaidekessaishippaiwokakuteishitabaai 5puninainiyoshinwotorikesukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "決済失敗の確定から15分後も50,000円の与信枠が残っている",
          "answers": [
            "kessaishippainokakuteikara15pungomo50,000ennnoyoshinnwakuganokotteiru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "売上確定と売上取消は発生せず与信だけが残っていることを確認",
          "answers": [
            "uriagekakuteitouriagetorikesihahasseisezu yoshinndakeganokotteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/40",
          "answers": [
            "1/40"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "決済システムで、タイムアウト後の取引照会と与信取消をテストしています。",
      "notes": [
        "Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました。取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした。",
        "同一条件で40回検証したところ、1回は15分経過後も与信枠が解放されませんでした。売上確定および売上取消の履歴はなく、与信のみ残存しています。",
        "与信管理仕様では、取引照会によって決済失敗が確定した場合、5分以内に与信を取り消します。なお、別のカードブランドでも同様にタイムアウトが発生しました。"
      ]
    },
    "specificationReference": "与信管理仕様書 Rev.2024-06「5.2 タイムアウト時の与信取消」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、処理がタイムアウトしたカード取引です。売上は確定していませんが、確保された与信枠が顧客のカードに残ります。",
      "workaround": "修正までは、再決済する前に取引照会を行い、残っている与信の有無を確認します。",
      "recovery": "決済事業者へ与信の取消要求を送り、顧客のカードに残った利用枠を解放します。",
      "risk": "顧客の利用可能額が一時的に減少し、同じ取引を再試行すると与信が二重に確保される可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "決済システムで、タイムアウト後の取引照会と与信取消をテストしています。",
      "environment": [
        "API version: 2024-06-20",
        "Environment: Sandbox",
        "Gateway build: 7.18.4"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました。取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一条件で40回検証したところ、1回は15分経過後も与信枠が解放されませんでした。売上確定および売上取消の履歴はなく、与信のみ残存しています。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "与信管理仕様では、取引照会によって決済失敗が確定した場合、5分以内に与信を取り消します。なお、別のカードブランドでも同様にタイムアウトが発生しました。"
        }
      ],
      "specificationReference": "与信管理仕様書 Rev.2024-06「5.2 タイムアウト時の与信取消」",
      "alternativeExcellentAnswer": {
        "subject": "Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました、取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした",
        "sections": {
          "detail": "Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました。取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした。",
          "preconditions": "確認環境：API version: 2024-06-20、Environment: Sandbox、Gateway build: 7.18.4",
          "steps": "Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました",
          "expected": "与信管理仕様書 Rev.2024-06「5.2 タイムアウト時の与信取消」\n与信管理仕様では、取引照会によって決済失敗が確定した場合、5分以内に与信を取り消します。なお、別のカードブランドでも同様にタイムアウトが発生しました。",
          "actual": "取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした",
          "remarks": "売上確定および売上取消の履歴はなく、与信のみ残存しています。",
          "reproducibility": "同一条件で40回検証したところ、1回は15分経過後も与信枠が解放されませんでした。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『Sandbox環境で50,000円の取引要求を送信し、クライアント側で30秒後にタイムアウトさせました。取引照会では失敗状態でしたが、カードの利用可能額は50,000円減少した状態でした。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一条件で40回検証したところ、1回は15分経過後も与信枠が解放されませんでした。売上確定および売上取消の履歴はなく、与信のみ残存しています。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『与信管理仕様では、取引照会によって決済失敗が確定した場合、5分以内に与信を取り消します。なお、別のカードブランドでも同様にタイムアウトが発生しました。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "medical-weight-conversion-dose-thousandfold": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "medical-weight-conversion-dose-thousandfold",
      "projectId": "medical",
      "difficulty": "intermediate",
      "environment": [
        {
          "text": "Client version: 4.8.2",
          "answer": "client version 4.8.2"
        },
        {
          "text": "Database schema: 2026.07",
          "answer": "database schema 2026.07"
        },
        {
          "text": "Windows 11 Enterprise 23H2",
          "answer": "windows 11 enterprise 23h2"
        }
      ],
      "subject": {
        "text": "投薬量計算で体重の単位変換が行われず投薬量が1000倍になってしまう",
        "answers": [
          "touyakuryoukeisanndetaijuunotannihennkanngaokonawarezutouyakuryouga1000baininatteshimau"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "体重18,000gの患者に10mg/kgの薬剤を指定して自動計算すると、期待値180mgに対して180,000mgと算出されてしまう",
          "answers": [
            "taijuu18,000gnokannjani10mg/kgnoyakuzaiwoshiteishitejidoukeisansuruto kitaichi180mgnitaishite180,000mgtosannshutsusareteshimau"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト患者と検査・処方データが登録されていること",
          "answers": [
            "tesutokannjatokensashohoude-tagatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. グラム単位の体重を連携して投薬量を自動計算する",
          "answers": [
            "1.guramutannitaijuuworenkeishitetouyakuryouwojidoukeisansuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "体重18,000gを18kgへ変換し、投薬量を180mgと計算すること",
          "answers": [
            "taijuu18000gwo18kghehenkanshi touyakuryouwo180mgtokeisansurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "投薬量が期待値180mgではなく180,000mgと算出される",
          "answers": [
            "touyakuryougakitaichi180mgdewanaku180,000mgtosannshutsusareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "連携元からは体重18000gが正しい単位情報付きで送信されていることを確認",
          "answers": [
            "renkeimotokarahataijuu18000gagatadashiitannijouhoutukidesoushinsareteirukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "3/3",
          "answers": [
            "3/3"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "投薬量計算機能で、連携された体重の単位換算をテストしています。",
      "notes": [
        "検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました。処方候補欄には180,000mgと表示されました。",
        "連携データを再作成し、同一条件で3回検証したところ、いずれも同じ計算結果となりました。送信元データには体重単位としてgが設定されています。画面倍率を125%から100%へ変更しても、計算結果は変わりませんでした。",
        "投薬量計算仕様では、受信した体重をkgへ換算した後に用量を乗算します。対象患者の換算後体重は18kgです。なお、誤った投薬量の処方候補は承認していません。"
      ]
    },
    "specificationReference": "投薬量計算仕様書 Rev.4.8「4.2.1 体重単位の換算」",
    "judgement": {
      "severity": "s1",
      "scope": "影響を受けるのは、体重をグラム単位で受信した患者の自動投薬量計算です。同じ条件で作成される処方候補すべてに影響します。",
      "workaround": "修正までは自動計算を使用せず、医療従事者が体重をkgへ換算して投薬量を計算します。",
      "recovery": "誤った投薬量の処方候補を破棄し、正しい体重単位で再計算したうえで再承認します。",
      "risk": "誤った投薬量を承認すると、過量投与によって患者の生命や身体へ重大な危害を与える可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "投薬量計算機能で、連携された体重の単位換算をテストしています。",
      "environment": [
        "Client version: 4.8.2",
        "Database schema: 2026.07",
        "Windows 11 Enterprise 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました。処方候補欄には180,000mgと表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "連携データを再作成し、同一条件で3回検証したところ、いずれも同じ計算結果となりました。送信元データには体重単位としてgが設定されています。画面倍率を125%から100%へ変更しても、計算結果は変わりませんでした。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "投薬量計算仕様では、受信した体重をkgへ換算した後に用量を乗算します。対象患者の換算後体重は18kgです。なお、誤った投薬量の処方候補は承認していません。"
        }
      ],
      "specificationReference": "投薬量計算仕様書 Rev.4.8「4.2.1 体重単位の換算」",
      "alternativeExcellentAnswer": {
        "subject": "検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました、処方候補欄には180,000mgと表示されました",
        "sections": {
          "detail": "検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました。処方候補欄には180,000mgと表示されました。",
          "preconditions": "確認環境：Client version: 4.8.2、Database schema: 2026.07、Windows 11 Enterprise 23H2",
          "steps": "検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました",
          "expected": "投薬量計算仕様書 Rev.4.8「4.2.1 体重単位の換算」\n投薬量計算仕様では、受信した体重をkgへ換算した後に用量を乗算します。対象患者の換算後体重は18kgです。なお、誤った投薬量の処方候補は承認していません。",
          "actual": "処方候補欄には180,000mgと表示されました",
          "remarks": "送信元データには体重単位としてgが設定されています。画面倍率を125%から100%へ変更しても、計算結果は変わりませんでした。",
          "reproducibility": "連携データを再作成し、同一条件で3回検証したところ、いずれも同じ計算結果となりました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『検査システムから体重18,000gの患者データを連携し、10mg/kgの薬剤で投薬量を自動計算しました。処方候補欄には180,000mgと表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『連携データを再作成し、同一条件で3回検証したところ、いずれも同じ計算結果となりました。送信元データには体重単位としてgが設定されています。画面倍率を125%から100%へ変更しても、計算結果は変わりませんでした。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『投薬量計算仕様では、受信した体重をkgへ換算した後に用量を乗算します。対象患者の換算後体重は18kgです。なお、誤った投薬量の処方候補は承認していません。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  },
  "medical-lab-result-resend-duplicate": {
    "schemaVersion": "scenario-authoring.v2",
    "scenario": {
      "scenarioId": "medical-lab-result-resend-duplicate",
      "projectId": "medical",
      "difficulty": "advanced",
      "environment": [
        {
          "text": "Client version: 4.8.2",
          "answer": "client version 4.8.2"
        },
        {
          "text": "Database schema: 2026.07",
          "answer": "database schema 2026.07"
        },
        {
          "text": "Windows 11 Enterprise 23H2",
          "answer": "windows 11 enterprise 23h2"
        }
      ],
      "subject": {
        "text": "検査結果連携で同じ検査結果を再送すると患者記録が重複登録されてしまうことがある",
        "answers": [
          "kensakekkarenkeideonajikensakekkawosaisousurutokannjakirokugajouhukutourokusareteshimaukotogaaru"
        ]
      },
      "report": [
        {
          "kind": "section",
          "text": "■詳細"
        },
        {
          "kind": "line",
          "text": "検査結果ID「LAB-9031」の連携データを再送すると、同じ測定時刻と測定値の結果が患者記録に2件登録されてしまうことがある",
          "answers": [
            "kensakekkaid lab-9031norenkeide-tawosaisousuruto onajisokuteijikokutosokuteichinokekkagakannjakirokuni2kenntourokusareteshimaukotogaaru"
          ]
        },
        {
          "kind": "section",
          "text": "■前提条件"
        },
        {
          "kind": "line",
          "text": "テスト患者と検査・処方データが登録されていること",
          "answers": [
            "tesutokannjatokensashohoude-tagatourokusareteirukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■操作手順"
        },
        {
          "kind": "line",
          "text": "1. 同じ検査結果IDの連携データを再送する",
          "answers": [
            "1.onajikensakekka id norennkeide-tawosaisousuru"
          ]
        },
        {
          "kind": "section",
          "text": "■期待結果"
        },
        {
          "kind": "line",
          "text": "検査結果IDを使って重複登録を防止すること",
          "answers": [
            "kensakekka id wotukattetyouhukutourokuwoboushisurukoto"
          ]
        },
        {
          "kind": "section",
          "text": "■実際の動作"
        },
        {
          "kind": "line",
          "text": "同じ測定時刻と測定値の検査結果が患者記録に2件登録される",
          "answers": [
            "onajisokuteijikokutosokuteichinokensakekkagakannjakirokuni2kenntourokusareru"
          ]
        },
        {
          "kind": "section",
          "text": "■備考"
        },
        {
          "kind": "line",
          "trainingRole": "remark",
          "text": "重複した2件は検査結果IDと測定時刻が同一であることを確認",
          "answers": [
            "tyouhukushita2kennhakensakekka id tosokuteijikokugadouitsudearukotowokakunin"
          ]
        },
        {
          "kind": "section",
          "text": "■再現性"
        },
        {
          "kind": "line",
          "text": "1/30",
          "answers": [
            "1/30"
          ]
        }
      ]
    },
    "briefing": {
      "testTarget": "診療情報システムで、同じ検査結果を再受信した場合の重複防止をテストしています。",
      "notes": [
        "患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました。診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました。",
        "同一メッセージの再送を30回実施したところ、1回のみ検査結果が2件表示されました。DB上の2レコードも検査結果IDおよび測定時刻が一致しています。初回送信のみの場合は1件です。",
        "検査結果連携仕様では、登録済みの検査結果IDを再受信した場合も、患者記録を追加しません。なお、再送時に検査装置の画面テーマを変更しましたが、連携メッセージの本文は初回送信時と同一です。"
      ]
    },
    "specificationReference": "検査結果連携仕様書 Rev.4.8「6.1.3 検査結果IDによる重複防止」",
    "judgement": {
      "severity": "s2",
      "scope": "影響を受けるのは、検査連携から同じ検査結果IDを再受信した患者記録です。同じ測定結果が診療画面へ重複して表示されます。",
      "workaround": "修正までは、検査結果IDと測定時刻を照合し、重複した行を除外して参照します。",
      "recovery": "重複して登録された検査結果を削除し、患者記録と監査ログに不整合がないことを確認します。",
      "risk": "検査の実施回数や結果の時系列を誤認し、診療判断を誤る可能性があります。"
    },
    "reviewSource": {
      "schemaVersion": "scenario-review-source.v1",
      "sourceType": "scenario-observations",
      "testTarget": "診療情報システムで、同じ検査結果を再受信した場合の重複防止をテストしています。",
      "environment": [
        "Client version: 4.8.2",
        "Database schema: 2026.07",
        "Windows 11 Enterprise 23H2"
      ],
      "observations": [
        {
          "id": "observation-1",
          "role": "primary-observation",
          "text": "患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました。診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました。"
        },
        {
          "id": "observation-2",
          "role": "comparison-check",
          "text": "同一メッセージの再送を30回実施したところ、1回のみ検査結果が2件表示されました。DB上の2レコードも検査結果IDおよび測定時刻が一致しています。初回送信のみの場合は1件です。"
        },
        {
          "id": "observation-3",
          "role": "specification-and-context",
          "text": "検査結果連携仕様では、登録済みの検査結果IDを再受信した場合も、患者記録を追加しません。なお、再送時に検査装置の画面テーマを変更しましたが、連携メッセージの本文は初回送信時と同一です。"
        }
      ],
      "specificationReference": "検査結果連携仕様書 Rev.4.8「6.1.3 検査結果IDによる重複防止」",
      "alternativeExcellentAnswer": {
        "subject": "患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました、診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました",
        "sections": {
          "detail": "患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました。診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました。",
          "preconditions": "確認環境：Client version: 4.8.2、Database schema: 2026.07、Windows 11 Enterprise 23H2",
          "steps": "患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました",
          "expected": "検査結果連携仕様書 Rev.4.8「6.1.3 検査結果IDによる重複防止」\n検査結果連携仕様では、登録済みの検査結果IDを再受信した場合も、患者記録を追加しません。なお、再送時に検査装置の画面テーマを変更しましたが、連携メッセージの本文は初回送信時と同一です。",
          "actual": "診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました",
          "remarks": "DB上の2レコードも検査結果IDおよび測定時刻が一致しています。初回送信のみの場合は1件です。",
          "reproducibility": "同一メッセージの再送を30回実施したところ、1回のみ検査結果が2件表示されました。"
        }
      }
    },
    "reviewGuide": {
      "sourceBoundary": "受講者に提示した観測記録、仕様、選択可能な環境および添付証跡だけを確定済み情報として扱う。記載例は事実源にも正解にも使用しない",
      "strengthCriteria": [
        "観測記録『患者P-903へ検査結果ID LAB-9031を連携した後、同一メッセージを再送しました。診療画面には、測定時刻と測定値が同一の検査結果が2件表示されました。』について、対象・操作条件・観測結果をどこまで明確に伝えているか評価する",
        "比較確認『同一メッセージの再送を30回実施したところ、1回のみ検査結果が2件表示されました。DB上の2レコードも検査結果IDおよび測定時刻が一致しています。初回送信のみの場合は1件です。』について、正常条件との差や発生範囲をどこまで絞り込めているか評価する",
        "仕様・周辺情報『検査結果連携仕様では、登録済みの検査結果IDを再受信した場合も、患者記録を追加しません。なお、再送時に検査装置の画面テーマを変更しましたが、連携メッセージの本文は初回送信時と同一です。』について、期待動作と確認済み事実を推測から分けているか評価する"
      ],
      "nonScoringInvestigationIdeas": [],
      "disallowedGenericPraise": [
        "期待結果と実際の動作が分離されている",
        "再現回数が数値で明記されている",
        "操作手順が具体的に書かれている",
        "必要項目が埋められている"
      ]
    }
  }
};

  window.TYPING_WORKBENCH_SCENARIO_AUTHORING = Object.freeze(scenarios);
})();
