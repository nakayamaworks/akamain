# AI採点フィクスチャ自動検証（廃止済み）

Status: Deprecated

置き換え先: [AIレビュー商品品質評価](../testing/ai-quality-evaluation.md)

この文書は、初期のシナリオ別fixture検証方式を記録するために残している。現在の`scoring/fixtures/scenario-fixtures.json`に実行対象はなく、次のコマンドは`0シナリオ / 0回答`を返す。

```sh
cd backend
npm run verify:scoring-fixtures:dry-run
```

現行の商品品質検証は、QA経験者が確認した代表15シナリオ×4回答、合計60回答を使用する。

```sh
cd backend
npm run verify:product-quality:dry-run -- --runs 3
```

実Gemini APIを使う反復評価:

```sh
cd backend
npm run verify:product-quality:reliable -- \
  --output ./reports/product-quality-reliable.json
```

旧fixture方式と現行gold set方式の結果を合算してはならない。モデル、プロンプト、採点方式、評価ケースが異なるためである。
