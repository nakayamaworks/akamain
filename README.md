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

## 検証

```sh
node validate-scenarios.js
```

現行16シナリオ × 5回答のGemini実採点を検証する手順は
`docs/setup/ai-scoring-fixture-validation.md`を参照する。
