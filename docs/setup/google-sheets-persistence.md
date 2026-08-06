# Google Sheets永続化セットアップ

## 構成

```text
ブラウザのGoogleログイン
  └─ IDトークン → Node.jsバックエンドで検証

Node.jsバックエンド
  └─ サービスアカウント → Google Sheets API
```

利用者のIDトークンをSheets APIの認証には流用しない。利用者認証とサーバーの保存権限は分離する。

## Google Cloud側

1. Typing Workbench専用Google CloudプロジェクトでGoogle Sheets APIを有効にする
2. 保存専用サービスアカウントを作成する
3. 成績保存用スプレッドシートを1つ作成する
4. スプレッドシートをサービスアカウントのメールアドレスへ「編集者」として共有する

サービスアカウントへプロジェクト全体の強いIAMロールは不要。対象スプレッドシートの共有権限だけでよい。

## ローカル環境

組織ポリシーでJSON鍵の作成を禁止したまま運用する。ローカル開発者には、保存専用サービスアカウントだけを対象とする`roles/iam.serviceAccountTokenCreator`を付与する。

Google CLIでADCを作成する。

```shell
gcloud auth application-default login \
  --account=support@example.com \
  --disable-quota-project \
  --scopes=openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/cloud-platform
```

`backend/.env`へ次を追加する。

```env
STORAGE_DRIVER=sheets
GOOGLE_SHEETS_SPREADSHEET_ID=スプレッドシートURLのdとeditの間の値
GOOGLE_IMPERSONATE_SERVICE_ACCOUNT=保存専用サービスアカウントのメールアドレス
```

`.env`とgcloudのADCファイルは共有・コミットしない。サービスアカウントのJSON鍵は作成しない。

起動時の最初の保存アクセスで、次の3タブとヘッダーが自動作成される。

- `Users`
- `Attempts`
- `ScoringResults`

既存タブのヘッダーが契約と異なる場合は、データ破壊を避けるため起動処理を失敗させる。

接続確認は`backend`ディレクトリで次を実行する。

```shell
npm run test:sheets
```

検証用のユーザー・挑戦・採点結果を一時保存し、履歴・進捗・ランキング集計を確認したあと、その検証行だけを削除する。

## 将来の本番環境

Cloud RunなどGoogle Cloud上で動かす場合は、実行サービスへ保存専用サービスアカウントを直接関連付け、`GOOGLE_IMPERSONATE_SERVICE_ACCOUNT`を設定しない。保存先をDBへ変える場合は`StorageRepository`の実装だけを差し替える。
