# ADR-0004: 起票保存とAIレビューを分離する

- Status: Accepted
- Confirmed: 2026-09-14

## Context

保存とGemini呼び出しを一つの処理にすると、AIのタイムアウト、レート制限、API障害によって受講者の入力まで失われる。また、AI障害を0点として記録すると、受講者の品質と外部サービス障害を混同する。

## Decision

1. `POST /api/attempts`でAttemptを保存する
2. 保存成功後に`POST /api/attempts/:attemptId/review`を呼ぶ
3. AI失敗時もAttemptを残す
4. AI障害は`unavailable`または`failed`、点数は`null`とする
5. 同じAttemptに成功済み結果があれば再実行しない
6. 同一内容の互換レビューがあれば再利用する

旧クライアント互換の`POST /api/scoring`でも、Gemini呼び出し前にAttemptを保存する。

## Consequences

### Positive

- 外部AI障害で回答を失わない
- 採点再試行と保存の重複を分離できる
- API障害と低品質回答を区別できる
- 不要なGemini呼び出しと費用を減らせる

### Negative

- 画面は保存成功・レビュー中・レビュー失敗を別状態として扱う必要がある
- Attemptだけ存在しScoringResultがない状態を許容する必要がある
- 互換性判定と冪等性管理が必要になる

## Evidence

- `backend/src/server.js`の`/api/attempts`と`/api/attempts/:id/review`
- `createFailedScoringResult()`
- `isScoringResultCompatible()`
- 保存前後を検証するバックエンドテスト
