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
FIREBASE_PROJECT_ID=typing-workbench-misemaru
GEMINI_MODEL=gemini-3.5-flash-lite
ALLOWED_ORIGINS=http://localhost:5500
RATE_LIMIT_DRIVER=firestore
RATE_LIMIT_SALT=Secret Managerから渡すランダム値
SCORING_LIMIT_PER_MINUTE=5
SCORING_LIMIT_PER_USER_DAY=20
SCORING_LIMIT_PER_IP_DAY=40
SCORING_LIMIT_GLOBAL_DAY=500
ANONYMOUS_DATA_RETENTION_DAYS=31
ANONYMOUS_CLEANUP_BATCH_SIZE=100
CLEANUP_SERVICE_ACCOUNT_EMAIL=typing-workbench-cleanup@typing-workbench-misemaru.iam.gserviceaccount.com
CLEANUP_OIDC_AUDIENCE=https://typing-workbench-backend-91251265328.asia-northeast1.run.app
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

Cloud RunのIAMチェックを通過した後も、本人用`/api/*`はFirebase IDトークンをアプリ内で検証する。トークンがないリクエストは`401 AUTH_REQUIRED`を返す。移行期間中は既存クライアントのGoogle OAuth IDトークンも検証する。

Firebase Authenticationでは匿名プロバイダとGoogleプロバイダを有効にする。AIレビューの利用回数はFirestoreトランザクションで利用者、接続元IPのハッシュ、サービス全体の日次上限を共有する。Cloud Runの実行IDにはFirestoreの読み書き権限を付与する。

Firestoreのコレクショングループ`akamain_scoring_rate_limits`には、タイムスタンプフィールド`expiresAt`を対象とするTTLポリシーを設定する。有効期限のオフセットは0秒とし、期限切れの一時カウンターを自動削除する。アプリが`expiresAt`を書き込むだけでは自動削除されないため、環境構築時にFirestore側のTTL設定も確認する。

## ゲストデータの定期削除

Firebase Authenticationの匿名アカウント自動削除とサーバー側データを同期させるため、Cloud Schedulerから毎日`POST /internal/cleanup/anonymous-users`を呼ぶ。呼び出し元は`typing-workbench-cleanup@typing-workbench-misemaru.iam.gserviceaccount.com`のOIDCトークンだけを許可する。

削除条件はすべて満たす必要がある。

1. Sheetsの利用者が`anonymous`
2. `created_at`から31日以上経過
3. Identity Toolkit APIでFirebase UIDが存在しない

Cloud Run実行IDには読み取り専用の`roles/firebaseauth.viewer`を付与する。削除処理はAIレビュー結果、起票履歴、ランキング設定を含む利用者行をまとめて消去する。Firebase UIDの確認に失敗した場合は削除せず、ジョブを失敗させる。

Cloud Schedulerは毎日03:15（日本時間）に実行する。

```text
15 3 * * *
Asia/Tokyo
```

## デプロイ後

1. `/health`が`storageDriver: sheets`を返すことを確認する
2. フロントエンドの`runtime-config.js`をCloud Run URLへ変更する
3. Googleログイン後に`/api/me`、`/api/progress`、`/api/leaderboard`を確認する
4. 採点保存を検証する場合は、検証用Googleアカウントを使って本番履歴を汚さない
5. `/health`が`anonymousCleanupConfigured: true`を返すことを確認する
6. Cloud Schedulerの手動実行が成功し、削除対象がなければ`deletedUserCount: 0`を返すことを確認する
