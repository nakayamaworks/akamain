# Architecture Decision Records

このディレクトリには、現行コードから確認できる重要な設計判断をAs-Built ADRとして残す。

これらは開発開始時にすべて確定していた設計書ではない。実装、障害、QA評価を通じて採用された判断を、後から検証可能な形に整理したものである。

| ADR | 判断 | 状態 |
| --- | --- | --- |
| [0001](./0001-ai-reviews-but-does-not-author.md) | AIは代筆せずレビューする | Accepted |
| [0002](./0002-hybrid-deterministic-scoring.md) | 最終点をGeminiの感覚点から分離する | Accepted |
| [0003](./0003-storage-behind-repository.md) | SheetsをRepository境界の背後へ置く | Accepted |
| [0004](./0004-save-before-ai-review.md) | 起票保存とAIレビューを分離する | Accepted |
| [0005](./0005-anonymous-first-authentication.md) | ローカルゲストから必要時に匿名認証する | Accepted |

## ADRの書き方

- Context: 何が問題だったか
- Decision: 何を選んだか
- Consequences: 得られる利点と負う制約
- Evidence: 現行コードの根拠

将来判断を変更した場合は過去ADRを消さず、`Superseded`へ変更して新しいADRから参照する。
