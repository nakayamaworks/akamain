# あかマイン ドキュメント

現行仕様と開発履歴を混同しないため、文書を次のように分類する。

## 現行仕様（As-Built）

- [プロダクト要件](./product/product-requirements.md)
- [システム設計](./spec/system-architecture.md)
- [永続化・API契約](./spec/persistence-and-api-contract.md)
- [AIレビュー・採点パイプライン](./architecture/ai-review-pipeline.md)
- [実装トレーサビリティ](./architecture/implementation-traceability.md)
- [脅威モデル](./security/threat-model.md)

## 設計判断

- [Architecture Decision Records](./decisions/README.md)

## テスト・評価

- [AIレビュー品質評価](./testing/ai-quality-evaluation.md)
- [商品品質評価の実行手順](./setup/product-quality-evaluation.md)
- [v37品質評価](./reviews/ai-quality-reliability-2026-09-02.md)
- [v39安定性評価](./reviews/ai-quality-reliability-2026-09-05.md)

## 運用・セットアップ

- [本番公開](./setup/production-release.md)
- [Cloud Runバックエンド](./setup/cloud-run-backend.md)
- [Google Sheets永続化](./setup/google-sheets-persistence.md)

## ポートフォリオ

- [Case Study](./portfolio/case-study.md)
- [説明ガイド](./portfolio/akamain-explanation-guide.md)
- [GitHub公開チェックリスト](./portfolio/github-publishing-checklist.md)

## 開発履歴

以下は現在の仕様書ではなく、段階導入時の判断を残した資料である。

- [作成モード初期設計](./spec/authoring-modes-spec.md)
- [Geminiパイロット](./setup/phase3a-gemini-pilot.md)
- [旧fixture検証](./setup/ai-scoring-fixture-validation.md)

## 事実の優先順位

文書間で矛盾した場合は、次の順に確認する。

1. 現行コードと自動テスト
2. 現行仕様（As-Built）
3. 日付・バージョン付きの実測レポート
4. セットアップ資料
5. 開発履歴

実測結果は別バージョンへ流用しない。特にAI品質の数字には、モデル、プロンプト、採点方式、評価ケース、実行日を併記する。
