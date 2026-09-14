# ADR-0002: 最終点をGeminiの感覚点から分離する

- Status: Accepted
- Confirmed: 2026-09-14

## Context

初期方式ではGeminiの観点別点数を重み付けして総合点にしていた。`practice-review.v37`の反復評価では、提出可否の判定は一致した一方、悪回答の点数安定率が33.3%となり、同じ回答で最大40点揺れた。

学習サービスで同じ回答の点数が大きく変わると、改善前後を比較できず、評価への信頼を失う。

## Decision

- Geminiは必須事実を`present / missing / contradicted`で返す
- バックエンドが重要事実、重大断定、QA回答可能性から品質ゲートを決める
- 同じ品質ゲートは同じ基準点へ固定する
- チケット設定と証跡だけを客観的な固定点で加減する
- 観点別点数は説明用に残すが最終点の直接計算に使わない
- 攻撃・採点操作はGemini実行前に40点上限・不合格とする

## Consequences

### Positive

- 既知ケースの反復点数を安定化できた
- 何を満たせば点数帯が変わるか説明しやすい
- 設定・証跡の正誤をAIの文章評価と分離できる

### Negative

- 表示点は連続的な精密測定ではなく段階評価に近い
- fact定義の品質が採点品質へ直接影響する
- 新しいシナリオごとにrubric設計・検証が必要
- 未知回答への一般化精度は別途ホールドアウトで測る必要がある

## Evidence

- `calculateStructuredScoreBreakdown()`
- `structuredTargetScore()`
- `buildRubricFindings()`
- `scoring/product-quality/human-gold-set.json`
- `docs/reviews/ai-quality-reliability-2026-09-02.md`
- `docs/reviews/ai-quality-reliability-2026-09-05.md`
