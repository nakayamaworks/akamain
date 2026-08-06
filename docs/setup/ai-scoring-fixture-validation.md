# AI採点フィクスチャ自動検証

現行16シナリオに5種類ずつ用意した回答をGeminiへ送り、合計80件の採点品質を検証する。

## 合否条件

- 総合点がフィクスチャの期待範囲内である
- 重要な不足事実IDが期待値と一致する
- 根拠のない断定IDが期待値と一致する
- 採点基準バージョンが一致する
- 読み手の疑問と切り分け案がそれぞれ2〜4件ある
- 総評が空ではない
- 検証用に補完したチケット項目と必須証跡が採点基準に一致する

文章以外の減点が混ざらないよう、チケット項目と必須証跡は各シナリオの正解値を自動設定する。

## 実行前確認

```sh
cd backend
npm run verify:scoring-fixtures:dry-run
```

既定では現行16シナリオ、合計80回答が表示される。

## 80件を実行

`backend/.env`へ`GEMINI_API_KEY`と必要に応じて`GEMINI_MODEL`を設定して実行する。

```sh
cd backend
npm run verify:scoring-fixtures
```

APIの連続実行を避けるため、既定では4秒間隔で直列実行する。結果は`backend/reports/`へJSONで保存され、期待値違反またはAPIエラーが1件でもあれば終了コード1になる。

## 対象を限定

```sh
npm run verify:scoring-fixtures -- --scenario attendance-overnight-break-not-deducted
npm run verify:scoring-fixtures -- --fixture excellent
npm run verify:scoring-fixtures -- --scenario attendance-overnight-break-not-deducted --fixture excellent
```

登録済みの旧シナリオを含む27件、合計135回答を対象にする場合：

```sh
npm run verify:scoring-fixtures -- --all-rubrics
```

## 中断後に再開

実行中も1回答ごとにレポートが更新される。中断した場合は、合格済みの結果を再利用して続行できる。

```sh
npm run verify:scoring-fixtures -- --resume ./reports/scoring-fixtures-2026-08-06T00-00-00-000Z.json
```

不合格とAPIエラーだけが再実行される。

## 主なオプション

- `--delay-ms 6000`: API呼び出し間隔を変更する
- `--max-retries 3`: 一時エラーの再試行回数を変更する
- `--output ./reports/custom.json`: レポート保存先を指定する
- `--help`: 全オプションを表示する
