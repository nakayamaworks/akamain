# ADR-0003: Google SheetsをRepository境界の背後へ置く

- Status: Accepted
- Confirmed: 2026-09-14

## Context

個人開発の初期段階では、運用データを直接確認でき、短期間で導入できる保存先が必要だった。一方、Google Sheetsへ画面から直接アクセスすると認証情報が漏れ、列構成が画面へ波及し、将来のDB移行が難しくなる。

## Decision

- ブラウザは保存先を知らず、Cloud Run APIだけを呼ぶ
- バックエンドに`StorageRepository`契約を置く
- 本番は`SheetsStorageRepository`、ローカルテストは`MemoryStorageRepository`を使用する
- Sheetsの列、行、タブ名をアダプター内部へ閉じ込める
- IDとAPI契約を維持したまま、将来FirestoreまたはRDBへ交換できる境界を持つ

## Consequences

### Positive

- 初期運用とデータ確認を短期間で開始できる
- ブラウザへSheets権限を配布しない
- メモリ実装で高速にテストできる
- 保存先移行時の画面変更を抑えられる

### Negative

- Sheetsは同時アクセス、検索性能、データ量、誤操作耐性に限界がある
- アダプターの行移行・競合処理が複雑になる
- 「交換可能な境界」があるだけで、DB移行が自動的に簡単になるわけではない

## Evidence

- `backend/src/storage-repository.js`
- `backend/src/storage-factory.js`
- `backend/src/sheets-storage-repository.js`
- `backend/src/memory-storage-repository.js`
- `docs/spec/persistence-and-api-contract.md`
