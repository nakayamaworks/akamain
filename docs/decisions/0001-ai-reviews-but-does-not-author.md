# ADR-0001: AIは代筆せずレビューする

- Status: Accepted
- Confirmed: 2026-09-14

## Context

完成文をAIが生成すると短時間で見栄えのよいチケットを作れるが、未整理情報から必要な事実を選び、自分の言葉で構造化する学習工程を失う。正解文の暗記やAIへの丸投げでは、実務の起票能力を測れない。

## Decision

- 実践起票では題名と本文を受講者自身が作る
- 実践中は記載例を表示しない
- Geminiは読み手として改善点、疑問、曖昧さ、良い点を返す
- 記載例は採点の正解文・事実源に使用しない
- QA起票ではGemini自身が仕様の正解を決めない

## Consequences

### Positive

- 受講者の情報整理力を訓練できる
- 同じ事実を別の妥当な文章で表現できる
- AIの役割が教育目的と一致する

### Negative

- 自由記述の評価は単純な文字列一致より難しい
- レビュー品質の継続検証が必要
- 「正解をすぐ見たい」利用者には負荷が高い

## Evidence

- `main.js`の見本入力・実践起票モード
- `backend/src/scoring-service.js`のバグ・QA別システム指示
- authoring libraryの`reviewSource`と`writingExample`分離
