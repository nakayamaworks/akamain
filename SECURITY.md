# Security Policy

## Reporting a vulnerability

あかマインの脆弱性、認証回避、他利用者データへのアクセス、秘密情報の露出、AI APIの不正利用につながる問題を発見した場合は、公開Issueへ詳細を書かず、`contact@nakayamaworks.jp`へ連絡してください。

連絡時は、可能な範囲で次を含めてください。

- 問題が発生するURLまたは機能
- 再現手順
- 想定される影響
- 確認した日時と環境
- 修正案がある場合はその概要

実在利用者の個人情報、IDトークン、APIキー、Cookie、完全な攻撃用ペイロードは公開Issueへ投稿しないでください。

## Scope

- `https://akamain.com/`
- あかマインのFirebase Hostingフロントエンド
- Cloud Run API
- 認証、保存、AIレビュー、ランキング

第三者サービス自体の脆弱性は、各サービス提供者の窓口へ報告してください。ただし、あかマイン側の設定や利用方法が原因の場合は上記窓口へ連絡してください。

## Security design

実装済み対策、残存リスク、未確認の運用設定は[脅威モデル](./docs/security/threat-model.md)に記載しています。
