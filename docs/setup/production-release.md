# あかマイン本番公開

## 公開構成

- ソース管理: GitHub private repository
- フロントエンド: Firebase Hosting
- 独自ドメイン: `akamain.com`
- バックエンド: Cloud Run `typing-workbench-backend`
- 保存先: Google Sheets
- AI採点: Gemini API

GitHub Pagesは商用SaaS用途の制限があるため、本番配信には使用しない。

## 公開成果物

`npm run build`は、公開してよいファイルだけを`dist/`へ生成する。

- `/index.html`: Welcomeページ（ソースの`welcome.html`）
- `/app.html`: Redmine風アプリ画面（ソースの`index.html`）
- `/assets/`: ブランド画像と機能アイコン
- フロントエンド用CSS・JavaScript
- `robots.txt`、`sitemap.xml`、`404.html`

`backend/`、`docs/`、`scoring/`、`.env`、`node_modules/`はHostingへ配信しない。

## 検証

```sh
npm run verify
```

このコマンドは次をまとめて実行する。

1. JavaScript構文確認
2. シナリオ整合性検証
3. `dist/`生成
4. 公開対象外ファイルの混入検査
5. Welcomeからアプリへの本番リンク検査

## 外部サービスの再認証

```sh
gh auth login -h github.com -w
gcloud auth login support@misemaru.cloud
gcloud config set project typing-workbench-misemaru
```

Firebase CLIの初回認証も必要になる。

```sh
npx firebase-tools login
```

## Cloud Run本番設定

`ALLOWED_ORIGINS`へ本番とローカル開発のオリジンを設定する。

```env
ALLOWED_ORIGINS=https://akamain.com,https://www.akamain.com,http://localhost:4173
```

Cloud Run URLは当面変更しない。

```text
https://typing-workbench-backend-91251265328.asia-northeast1.run.app
```

## Google OAuth本番設定

現在使用中のウェブクライアントへ、次の承認済みJavaScript生成元を追加する。

```text
https://akamain.com
https://www.akamain.com
http://localhost:4173
```

Firebaseの仮URLでGoogleログインまで試す場合は、発行された`web.app`のオリジンも一時的に追加する。

## 独自ドメイン

Firebase ConsoleのHostingから`akamain.com`を追加し、表示されたDNSレコードをドメイン管理会社へ登録する。

- `akamain.com`を正規URLとする
- `www.akamain.com`も登録し、正規URLへ転送する
- SSL証明書が有効になってから本番テストを行う

## リリース確認

1. `https://akamain.com/`でWelcomeページが表示される
2. ゲスト体験が`/app.html?guest=1#/tickets`へ遷移する
3. Googleログイン後に`/app.html#/tickets`を利用できる
4. 実践起票を保存できる
5. AI採点結果を取得できる
6. マイページ、履歴、ランキングを表示できる
7. ログアウト後に保護対象データを表示できない
8. `backend/`や`.env`のURLが公開されていない

## 公開前の残課題

- Gemini APIの利用可能残高を用意する
- プライバシーポリシーを公開する
- 利用規約を公開する
- Google OAuth同意画面の本番公開状態を確認する
- Google Cloudの予算アラートを設定する
