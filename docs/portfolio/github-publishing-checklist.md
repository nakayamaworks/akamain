# GitHubポートフォリオ公開チェックリスト

最終確認日: 2026-09-14

## 1. 推奨Repository設定

現在のRepositoryは`nakayamaworks/akamain`で、2026-09-14に`PUBLIC`へ切り替えた。未ログインのHTTPアクセスで`200 OK`、GitHub画面でREADME、Mermaid、スクリーンショット、LICENSE、SECURITYの表示を確認済みである。

### Name

`akamain`

### Description

```text
QA・テストエンジニア向けの、実務シナリオとAIレビューによるバグ起票・QA確認トレーニングサービス
```

### Website

```text
https://akamain.com/
```

### Topics

```text
qa
software-testing
bug-report
test-engineering
ai-review
gemini
firebase
cloud-run
nodejs
javascript
```

Topicsは技術名だけで埋めず、最初にプロダクトの対象領域を置く。

## 2. 公開前に必ず決めること

- [x] 公開リポジトリにする方針（秘密情報・成果物監査後に切り替える）
- [x] ソースコードは`Nakayama Works / All Rights Reserved`
- [x] 教材シナリオ・画像も同じ利用条件に統一する
- [x] 制作者・著作権者名は`Nakayama Works`
- [x] 脆弱性報告先は`contact@nakayamaworks.jp`
- [x] AI支援を利用した開発範囲をREADMEに説明する

2026-09-14、公開ポートフォリオとして閲覧可能にする一方、OSSとしての再利用許諾は与えない方針を確定した。ルートの`LICENSE`で、ソースコード、ドキュメント、教材、データ、画像を含む成果物全体を`All Rights Reserved`としている。第三者のソフトウェア、商標、素材には各権利者の条件が適用される。

## 3. 秘密情報・個人情報

- [x] 現在の追跡ファイルをsecret scan
- [x] Git履歴全体を主要な鍵形式でsecret scan
- [x] `.env`が未追跡であることを確認
- [x] 追跡中のサービスアカウントJSON鍵がないことを確認
- [x] Gemini APIキー・OAuth認可コードの過去コミットがないことを確認
- [x] Spreadsheet ID、メールアドレス、ローカルパスを確認
- [x] `outputs/`のExcel・検査ファイルは公開Git管理から除外する
- [x] AI品質レポートが架空シナリオの評価データであることを確認

2026-09-14の確認では、現在の追跡ファイルとGit履歴から秘密鍵、Gemini APIキー、OAuth認可コード、実Spreadsheet IDは検出されなかった。`runtime-config.js`のFirebase Web APIキー、Google CloudプロジェクトID、Workload Identity Provider、デプロイ用サービスアカウント名は公開設定として追跡されている。これらはパスワードではないが、APIキー制限、IAM最小権限、Workload Identityの属性条件はクラウド設定側で別途確認が必要である。

`outputs/`の4つのExcelも読み取り監査し、メールアドレス、APIキー、OAuth認可コード、実Spreadsheet ID、ローカルパスは検出されなかった。長い文字列28件は`scenarioId（機械用）`であり、秘密情報ではない。内容は架空シナリオ、攻撃回答、AIレビュー、QA担当者の期待評価・内部メモである。`.inspect.ndjson`はExcelのセル内容をほぼ重複して保持するため、公開ポートフォリオには冗長である。

`outputs/`全体を`.gitignore`でGit管理から除外し、再現可能な評価入力、検証スクリプト、集計済みMarkdownレポートだけを公開する。Excel自体を見せる場合は、最終版1ファイルだけを公開用に複製し、内部メモを除去したうえで別途監査する。

## 4. READMEの確認

- [x] プロダクト名が「あかマイン」になっている
- [x] 誰のどんな課題を解決するか分かる
- [x] 公開サービスへのリンクがある
- [x] 学習フローがある
- [x] AIへ点数を丸投げしない設計が分かる
- [x] 技術構成がある
- [x] 検証結果と限界を分けている
- [x] ローカル検証コマンドがある
- [x] As-Built資料へ到達できる
- [x] 現行公開サービスのゲスト画面からスクリーンショットを追加する
- [x] 制作者表記を`Nakayama Works`に確定する
- [x] `Nakayama Works / All Rights Reserved`のLICENSEを追加する

## 5. 推奨スクリーンショット

READMEには次の3枚を掲載する。

1. シナリオ確認画面
   - 現場メモと仕様を読んで判断するサービスだと伝わる
2. Redmine風の実践起票画面
   - 題名、本文、チケット設定、証跡が一画面で分かる
3. AIレビュー結果画面
   - 点数だけでなく、良い点、具体的指摘、内訳が分かる

2026-09-14に実利用者の履歴、メールアドレス、Googleアカウント名が写らないゲスト状態で撮影済み。公開サービス上で架空の上級バグ起票を実行し、レビュー完了まで確認した。

## 6. コミット構成

現在のワークツリーには、AI採点改善のコード変更とポートフォリオ文書変更が混在している。公開前は少なくとも次に分ける。

1. `feat: stabilize AI review scoring and professional-language handling`
2. `docs: add as-built portfolio documentation`

コミットを分ける理由は見た目ではなく、レビュー時に「設計変更」と「その説明」を追跡できるようにするためである。既存変更を無理に分割して壊す場合は、一つの整合したコミットを優先する。

## 7. GitHubで有効にする項目

- [ ] mainブランチ保護
- [ ] pull request時の`npm run verify`と`backend/npm test`
- [x] Dependabotの依存関係アラート
- [x] Secret scanningとpush protection
- [x] Private vulnerability reporting
- [x] GitHub Actionsの最小権限

現行ActionsはFirebase Hosting公開用で、`contents: read`と`id-token: write`を使用し、長期サービスアカウント鍵を置かない構成である。

公開切り替え直後の設定確認で、上記3つのセキュリティ機能が無効だったため有効化した。mainブランチ保護とPR専用CIは、個人開発の直接push運用を変えるため自動では設定していない。

## 8. Portfolioで見せる順番

1. 何の課題を解決するか
2. 実際のユーザーフロー
3. 最も難しかったAI点数安定性の問題
4. 33.3%から設計変更に至った判断
5. As-Built構成とセキュリティ
6. テスト結果
7. まだ証明できていないこと
8. 次に改善すること

機能数やコード行数を前面に出すより、問題発見、仮説、実測、設計変更、再検証の流れを見せる。

## 9. 公開後の確認

- [x] 未ログイン状態でRepositoryを開ける
- [x] READMEのMermaidが表示される
- [x] 画像と相対リンクが切れていない
- [x] 公開サービスへのリンクが開く
- [x] 公開切り替え後のFirebase Hosting Actionが成功する
- [x] 公開切り替え後のActionsログに主要な秘密値パターンが表示されていない
- [ ] GitHub検索で意図しない秘密情報が見つからない
- [ ] スマートフォンでもREADMEの表が最低限読める
