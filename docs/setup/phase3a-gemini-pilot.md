# フェーズ3A：認証付きGemini採点パイロット（開発履歴）

> **Historical:** この文書は1シナリオでGemini接続を検証した当時の記録であり、現行セットアップ手順ではない。現在はFirebase匿名認証、任意のGoogle連携、全120シナリオのAIレビューへ移行している。現行構成は`docs/spec/system-architecture.md`を参照する。

## 実装範囲

- Google Identity Servicesでログインする
- IDトークンを採点バックエンドで検証する
- 「保存ボタンの連続クリックによる重複登録」だけをGeminiで採点する
- Geminiから総評、読み手の疑問、誤解リスク、切り分け案、書き換え例を構造化出力で取得する
- 評価軸の重みから総合点をバックエンドで算出する
- 採点失敗時も入力内容を画面へ残す
- 見本回答は初期表示せず、利用者が任意で開く

この段階ではSheetsへ保存しない。採点品質を確認した後、同じバックエンドへ保存アダプターを追加する。

## 接続に必要な値

### ブラウザ

`runtime-config.js`へ次の公開設定を記入する。

- `apiBaseUrl`: 採点バックエンドのURL
- `googleClientId`: Google Cloudで作成したウェブクライアントID

Gemini APIキーは記入しない。

### バックエンド

`backend/.env.example`を基に、実行環境へ次を設定する。

- `GOOGLE_WEB_CLIENT_ID`: ブラウザと同じウェブクライアントID
- `GEMINI_API_KEY`: Google AI Studioで発行したサーバー側APIキー
- `GEMINI_MODEL`: 初期値は`gemini-3.5-flash-lite`（無料枠対応・低遅延の安定版）
- `ALLOWED_ORIGINS`: 画面を公開するオリジン

## ローカル確認

1. `backend/.env`へGemini APIキーを設定する
2. `backend`で`npm start`を実行する
3. プロジェクト直下で`python3 -m http.server 5500`を実行する
4. `http://localhost:5500`を開く
5. Googleログイン後、パイロットシナリオの実践起票を完了する

Google CloudのOAuthクライアントには、承認済みのJavaScript生成元として
`http://localhost:5500`を登録する。`file://`で直接開いた画面ではGoogleログインできない。

## セキュリティ条件

- Gemini APIキーをHTML、JavaScript、URLへ含めない
- メールアドレスを利用者IDにしない
- バックエンドで検証したGoogle `sub`だけを利用者IDにする
- 許可したオリジン以外から採点APIを呼べないようにする
- パイロットでは利用者ごとの採点回数を1分5回までに制限する
- Googleの氏名、メールアドレス、`sub`をGeminiへ送らない
- 無料枠では架空のトレーニングデータだけを扱う
