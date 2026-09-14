# ADR-0005: ローカルゲストから必要時に匿名認証する

- Status: Accepted
- Confirmed: 2026-09-14

## Context

開始時点でGoogleログインを必須にすると、サービス価値を理解する前に認証が障壁になる。一方、保存・AIレビュー・履歴にはサーバー側で識別できる利用者IDが必要である。

## Decision

- 初回アクセス時はブラウザ内のローカルゲストとして開始する
- 保存・AIレビュー等でIDトークンが必要になった時点でFirebase匿名アカウントを作成する
- Google連携は任意とし、匿名アカウントへリンクする
- すでに別アカウントへ連携済みの場合はゲスト履歴を検証後に統合する
- 匿名データは保持条件を満たした場合に定期削除する

## Consequences

### Positive

- 認証前にサービスを試せる
- 保存時にはユーザースコープを強制できる
- Google連携後もゲスト学習履歴を引き継げる

### Negative

- ローカルゲスト、匿名Firebase、Google連携済みの状態管理が複雑になる
- アカウント統合と削除処理に専用の認証・テストが必要
- Google連携前のデータには保持期限がある

## Evidence

- `auth-client.js`
- `backend/src/server.js`の`/api/identity/claim`
- `backend/src/anonymous-user-cleanup.js`
- `backend/src/firebase-auth-directory.js`
- 認証、統合、削除に関するバックエンドテスト
