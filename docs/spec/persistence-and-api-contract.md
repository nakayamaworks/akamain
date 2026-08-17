# 受講履歴・採点結果 永続化契約

## 1. 目的

最初は既存のNode.jsバックエンドからGoogle Sheets APIを使用し、利用増加時にデータベースへ移行する。GASは必須にしない。

画面側をSheetsの列番号やGoogle固有APIへ直接依存させない。ブラウザは共通APIだけを呼び、Sheetsと将来のデータベースは保存アダプターとして交換する。

```text
ブラウザ
  ↓ 共通API
認証・採点バックエンド
  ├─ Google IDトークン検証
  ├─ Gemini採点
  └─ StorageRepository
        ├─ Google Sheets API adapter（初期）
        └─ Database adapter（将来）
```

ブラウザからSheetsへ直接書き込ませない。利用者ID、点数、ランキング値をブラウザから受け取ってそのまま保存しない。

## 2. 永続化の単位

### 2.1 Users

Googleアカウントと公開プロフィールを管理する。

| 列 | 内容 |
| --- | --- |
| `schema_version` | `user.v1` |
| `user_id` | バックエンドで検証したGoogle IDトークンの`sub` |
| `auth_provider` | 初期値は`google` |
| `provider_subject` | Google IDトークンの`sub`。将来の認証方式追加に備えて保持する |
| `email` | 検証済みIDトークンから取得する非公開属性 |
| `email_verified` | Googleがメール確認済みか |
| `display_name` | アカウント画面用の表示名 |
| `ranking_name` | ランキング公開用ニックネーム |
| `ranking_opt_in` | ランキング参加可否 |
| `created_at` | 初回登録日時 |
| `last_login_at` | 最終認証日時 |
| `updated_at` | 更新日時 |

メールアドレスを主キーにしない。メールアドレスとGoogleアカウントの本名はランキングへ表示しない。

### 2.2 Attempts

初回起票と修正版の保存ごとに1行を追記する。過去行を上書きしない。

| 列 | 内容 |
| --- | --- |
| `schema_version` | `attempt.v3`（既存の`attempt.v1`、`attempt.v2`は読み取り互換を維持） |
| `attempt_id` | 1回の提出・修正版を一意に識別するUUID |
| `user_id` | Usersの`user_id` |
| `scenario_id` | 固定シナリオID |
| `project_id` | プロジェクトID |
| `authoring_mode` | `reference` または `practice` |
| `answer_json` | 題名、セクション別回答、起票時に選択したチケット設定 |
| `selected_evidence_ids_json` | 選択した証跡ID |
| `started_at` | 開始日時 |
| `completed_at` | 完了日時 |
| `ticket_number` | Redmine風の表示用連番。`40001`から採番し、一度割り当てた番号は変更しない |
| `ticket_id` | 初版と全修正版を束ねるUUID。初版では`attempt_id`と同じ値 |
| `revision_number` | チケット内の版番号。初版は`1`、修正版は`2`以降 |
| `parent_attempt_id` | 直前の版の`attempt_id`。初版は空 |

修正版は同じ`ticket_id`と`ticket_number`を引き継ぐ。題名や説明を変更しても同一チケットとして扱い、一覧には最新版だけを表示する。詳細では全版を時系列で参照できる。

正式な構造は`scoring/schemas/attempt-record.schema.json`を正とする。

### 2.3 ScoringResults

AI採点1回につき1行を追記する。再採点は同じAttemptへ別のScoringResultを追加し、過去結果を残す。

| 列 | 内容 |
| --- | --- |
| `schema_version` | `scoring-result.v2` |
| `scoring_result_id` | 採点結果UUID |
| `attempt_id` | Attemptsの`attempt_id` |
| `status` | `succeeded`、`failed`、`unavailable` |
| `total_score` | バックエンドが配点から算出した総合点 |
| `dimensions_json` | 評価軸別点数 |
| `verdict` | `開発着手可能`、`追加確認を推奨`、`再整理を推奨` |
| `overall_assessment` | 開発・QAの読み手としての総評 |
| `reader_questions_json` | 読み手が疑問に思う点。不足情報と調査提案を区別する |
| `ambiguity_risks_json` | 誤解や原因断定につながる表現 |
| `investigation_advice_json` | 次に行う確認・切り分け |
| `rewrite_suggestions_json` | 改善効果がある場合の書き換え例 |
| `strengths_json` | 良かった点 |
| `rubric_version` | 採点基準バージョン |
| `prompt_version` | プロンプトバージョン |
| `model_id` | 固定したGeminiモデルID |
| `scored_at` | 採点日時 |
| `error_code` | 採点失敗理由 |

正式な構造は`scoring/schemas/scoring-result.schema.json`を正とする。

## 3. 保存インターフェース

Sheetsと将来のデータベースは、次の操作を同じ意味で提供する。

```text
upsertUser(profile)
getUser(userId)
updateRankingProfile(userId, profile)
appendAttempt(attempt)
appendScoringResult(result)
listAttemptsByUser(userId, options)
listTicketsByUser(userId, options)
getTicketById(userId, ticketId)
getScenarioProgress(userId)
getLeaderboard(options)
```

画面はSheetsのタブ名、セル範囲、行番号を知らない。Sheetsアダプターだけが物理構造を扱う。

バックエンドのHTTP APIは次を提供する。すべてGoogle IDトークンを検証し、URLやリクエスト本文から`user_id`を受け取らない。

| Method | Path | 内容 |
| --- | --- | --- |
| `GET` | `/api/me` | 非公開の本人プロフィール |
| `PUT` | `/api/me/ranking-profile` | 公開名とランキング参加可否の更新 |
| `POST` | `/api/scoring` | 受験保存とAI採点 |
| `GET` | `/api/history` | 本人の受験・採点履歴 |
| `GET` | `/api/progress` | 本人のシナリオ別ステータス |
| `GET` | `/api/leaderboard` | 公開名だけのランキング。本人行には`isCurrentUser: true`を付ける |
| `POST` | `/api/attempts` | 全シナリオ共通の実践起票保存。クライアント発行UUIDで冪等化する |
| `POST` | `/api/attempts/:attempt_id/review` | 保存済みAttemptをAIレビューする。対応ルーブリックがある場合だけ実行する |
| `GET` | `/api/tickets` | 本人の実践起票をプロジェクト別のチケット概要として返す |
| `GET` | `/api/tickets/:ticket_id` | 本人の実践起票の最新版、全版、版ごとのAIレビュー詳細を返す |
| `POST` | `/api/tickets/:ticket_id/revisions` | 最新版を親に持つ修正版を追記する。チケット番号は変えない |

`POST /api/scoring`ではAttemptをGemini呼び出し前に保存する。Geminiが失敗した場合も、0点にはせず`failed`または`unavailable`のScoringResultを追記する。

新しい画面フローでは保存とレビューを分離する。`POST /api/attempts`の成功を画面へ返した後に`POST /api/attempts/:attempt_id/review`を呼ぶ。レビュー失敗時も保存済みチケットを一覧へ残し、再送でAttemptを重複させない。`POST /api/scoring`は旧クライアント互換用とする。

`POST /api/attempts/:attempt_id/review`は次の順で採点結果を決定する。

1. 同一Attemptに成功済み結果があれば、その結果を返して再採点しない
2. 同じチケットの過去版に内容指紋が一致する成功結果があれば、現在版用のScoringResultとして複製する
3. 内容が変わった修正版は前回版と前回レビューをGeminiへ渡し、前回基準からの変化を評価する
4. 明確な事実・設定・添付の後退がないのに総合点が下がった場合、バックエンドが前回点を下限として評価軸を安定化する

内容指紋には`scenarioId`、`projectId`、題名、本文、チケット項目、選択添付、添付説明を含める。Attempt ID、版番号、開始・完了日時は含めない。

`answer_json.ticketFields`は`tracker`、`private`、`status`、`severity`、`priority`、`assigneeId`、`category`、`version`、`environment`、`startDate`、`dueDate`、`progress`、`watcherIds`を保持する。Sheetsの列追加は行わない。

## 4. ステータス

シナリオごとの実践起票ステータスは次のとおりとする。

| ステータス | 条件 |
| --- | --- |
| `not_started` | 実践起票の完了履歴がない |
| `in_progress` | 完了履歴があり、成功した採点の最高点が80点未満 |
| `achieved` | 成功した採点の最高点が80点以上 |
| `scoring_pending` | 回答は保存されたが、成功した採点結果がない |

採点失敗を低得点として扱わない。

`GET /api/progress`の各シナリオには、`attemptCount`、`bestScore`、`latestScore`、`latestAttemptAt`を含める。`bestScore`は成功した全採点の最高点、`latestScore`は直近の挑戦に紐づく成功した採点結果とする。直近の採点が未完了または失敗した場合、`latestScore`は`null`とし、過去の点数で埋めない。

## 5. ランキング

見本入力のタイピング成績と、実践起票の文章採点を同じランキングへ混ぜない。

実践起票ランキングの初期ルール：

1. ランキング対象は各チケットの初版（`revision_number = 1`）だけとする
2. シナリオごとに初版の成功した採点の最高点を採用する
3. 最高点の合計を`achievement_points`とする
4. 同点の場合は`achieved`になったシナリオ数が多い利用者を上位とする
5. それでも同じ場合は同順位とする
6. `ranking_opt_in`が有効な利用者だけを表示する
7. 公開名には`ranking_name`だけを使用する
8. 本人行の強調用に`isCurrentUser: true`を返すが、ユーザーIDは返さない

修正版の点数は学習状況の`bestScore`には反映するが、ランキングには反映しない。AIレビューを受けて何度も書き換える学習行動と、初見での起票力を混同しないためである。

ランキングはAttemptsとScoringResultsから算出する派生データであり、利用者が送信した値を保存しない。

## 6. Geminiへ送る情報

Geminiへ送る情報：

- シナリオID
- 採点基準
- 題名
- セクション別回答
- 必要な場合だけ、選択した証跡の内容

Geminiへ送らない情報：

- Googleの`sub`
- メールアドレス
- アカウントの氏名・画像
- ランキング名
- 過去の他利用者の回答

無料枠を使用している間は架空のトレーニングデータだけを扱い、実在顧客や実案件の機密情報を入力させない。

## 7. Sheets認証と秘密情報

- ブラウザのGoogleログインは利用者本人を識別するために使う
- Sheetsへのアクセスはバックエンドのサービスアカウントで行う
- サービスアカウントの秘密鍵をブラウザへ配布しない
- 秘密鍵ファイルをリポジトリへ保存しない
- スプレッドシートはサービスアカウントにだけ編集権限を付与する
- ランキングレスポンスへ`email`、`display_name`、`user_id`を含めない

## 8. データベース移行

Sheetsからデータベースへ移行するときは、次の対応で移せる。

| Sheets | Database |
| --- | --- |
| Usersタブ | `users`テーブル |
| Attemptsタブ | `attempts`テーブル |
| ScoringResultsタブ | `scoring_results`テーブル |
| `answer_json` | JSON列または回答セクション子テーブル |
| `ticket_id`、`revision_number`、`parent_attempt_id` | チケット本体とリビジョンの親子テーブル、または版管理列 |
| レビュー系JSON列 | JSON列またはレビュー子テーブル |

移行時も`user_id`、`attempt_id`、`scoring_result_id`、`scenario_id`を変更しない。画面側のAPI形式も変更しない。
