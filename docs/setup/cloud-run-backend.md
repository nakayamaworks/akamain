# Cloud Runバックエンド

## 目的

ローカルADCへ依存せず、Cloud RunのサービスIDでGoogle Sheetsへ接続する。Google Workspaceの再認証期限が切れても、成績保存を停止させない。

## セキュリティ方針

- 実行IDは保存専用サービスアカウントを使用する
- サービスアカウントJSON鍵は作成しない
- Gemini APIキーはSecret Managerから環境変数へ渡す
- Cloud Run自体はブラウザから到達できるよう公開する
- ドメイン制限を回避するためにIAMへ`allUsers`を追加せず、Invoker IAMチェックを無効化する
- `/api/*`はアプリ側でGoogle IDトークンを必ず検証する
- CORSは許可したフロントエンドのオリジンだけに限定する
- スプレッドシートは保存専用サービスアカウントだけに共有する

## コンテナ

プロジェクトルートの`Dockerfile`は、バックエンドとAI採点ルーブリックだけをコンテナへ含める。`backend/.env`は`.dockerignore`で除外する。

Cloud Runでは次を環境変数として設定する。

```env
STORAGE_DRIVER=sheets
GOOGLE_SHEETS_SPREADSHEET_ID=スプレッドシートID
GOOGLE_WEB_CLIENT_ID=OAuth WebクライアントID
GEMINI_MODEL=gemini-3.5-flash-lite
ALLOWED_ORIGINS=http://localhost:5500
```

`GOOGLE_IMPERSONATE_SERVICE_ACCOUNT`は設定しない。Cloud Runへ割り当てたサービスIDをApplication Default Credentialsとして直接使用する。

`GEMINI_API_KEY`は通常の環境変数に直接設定せず、Secret Managerの`typing-workbench-gemini-api-key`から渡す。

## デプロイ設定

- プロジェクト: `typing-workbench-misemaru`
- リージョン: `asia-northeast1`
- サービス: `typing-workbench-backend`
- 実行ID: `typing-workbench-storage@typing-workbench-misemaru.iam.gserviceaccount.com`
- URL: `https://typing-workbench-backend-91251265328.asia-northeast1.run.app`
- 最小インスタンス: `0`
- 最大インスタンス: `2`
- 同時実行数: `10`

新規プロジェクトのCloud BuildはCompute Engineデフォルトサービスアカウントを使用する。このプロジェクトでは、ビルド専用にGoogle公式の`roles/run.builder`だけを付与し、デプロイ時に次を明示する。

```text
--build-service-account=projects/typing-workbench-misemaru/serviceAccounts/91251265328-compute@developer.gserviceaccount.com
```

`misemaru.cloud`のドメイン制限により`allUsers`のIAM追加は失敗する。公開到達性はCloud Run公式の次の設定で確保する。

```text
--no-invoker-iam-check
```

Cloud RunのIAMチェックを通過した後も、`/api/*`はGoogle OAuthのIDトークンをアプリ内で検証する。未ログインリクエストは`401 AUTH_REQUIRED`を返す。

## デプロイ後

1. `/health`が`storageDriver: sheets`を返すことを確認する
2. フロントエンドの`runtime-config.js`をCloud Run URLへ変更する
3. Googleログイン後に`/api/me`、`/api/progress`、`/api/leaderboard`を確認する
4. 採点保存を検証する場合は、検証用Googleアカウントを使って本番履歴を汚さない
