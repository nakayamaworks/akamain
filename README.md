# typing_workbench

Redmine風の画面で、見本入力と実践起票を練習するバグ起票トレーニング。

## 方針

- 見本入力では完成したバグ報告をタイピングする
- 実践起票では未整理の報告から題名と各セクションを自作する
- フェーズ2では1シナリオの採点基準と構造化結果を検証する
- フェーズ3AではGoogleログインで保護したGemini採点を1シナリオへ接続する
- フェーズ3BではGAS・Sheets保存と過去成績を接続する
- 永続化は共通APIの背後へ置き、Sheetsからデータベースへ移行できるようにする

## 主なファイル

```txt
typing_workbench/
  index.html
  styles.css
  main.js
  scenario-authoring-library.js
  scenario-briefing-library.js
  scenario-library.js
  evidence-library.js
  scoring-preview.js
  runtime-config.js
  auth-client.js
  scoring-api.js
  backend/
  scoring/
    schemas/
    rubrics/
    fixtures/
  docs/
    spec/
```

## シナリオの手修正

全27シナリオは `scenario-authoring-library.js` で、次の内容をまとめて編集できる。

- `scenario.subject`: 題名とタイピング入力候補
- `scenario.report`: 記載例入力の詳細、前提条件、操作手順、期待結果、実際の動作、備考、再現性
- `briefing`: 受講者へ提示する確認内容、比較条件、仕様情報
- `reviewSource`: AIレビューが事実判定に使う観測記録、環境、仕様根拠（記載例とは独立）
- `specificationReference`: 仕様根拠
- `judgement`: 障害レベル、影響範囲、回避策、復旧方法、リスク
- `reviewGuide`: 内容固有の評価観点、減点しない追加調査、禁止する定型的な称賛

`scoring/rubrics/scenario-rubrics.json` と `scoring/fixtures/scenario-fixtures.json` は生成物のため、直接編集しない。編集後は次を実行して採点データを更新する。

```sh
node validate-scenarios.js --write-scoring-rubrics
npm run verify
```

## 検証

```sh
node validate-scenarios.js
```

公開用ファイルの生成と検証は次を実行する。

```sh
npm run verify
```

Firebase Hostingへの本番公開手順は
`docs/setup/production-release.md`を参照する。

現行システムの全体像は
`docs/spec/system-architecture.md`を参照する。

ポートフォリオや面談での説明方法は
`docs/portfolio/akamain-explanation-guide.md`を参照する。

現行16シナリオ × 5回答のGemini実採点を検証する手順は
`docs/setup/ai-scoring-fixture-validation.md`を参照する。
