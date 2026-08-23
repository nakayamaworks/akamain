(() => {
  const typeDefaults = {
    image: {
      icon: "🖼️",
      type: "PNG 画像",
      size: "184 KB",
      source: "画面キャプチャ",
      previewKind: "capture",
    },
    video: {
      icon: "🎞️",
      type: "MP4 ビデオ",
      size: "2.4 MB",
      source: "操作画面録画",
      previewKind: "capture",
    },
    har: {
      icon: "🌐",
      type: "HTTP Archive",
      size: "92 KB",
      source: "ブラウザ開発ツール",
      previewKind: "har",
    },
    log: {
      icon: "📄",
      type: "LOG ファイル",
      size: "28 KB",
      source: "アプリケーションログ",
      previewKind: "log",
    },
    json: {
      icon: "🧩",
      type: "JSON ファイル",
      size: "6 KB",
      source: "APIテストツール",
      previewKind: "log",
    },
    csv: {
      icon: "📊",
      type: "CSV ファイル",
      size: "4 KB",
      source: "検証DB 読み取り専用クエリ",
      previewKind: "csv",
    },
    table: {
      icon: "🖼️",
      type: "PNG 画像",
      size: "176 KB",
      source: "画面キャプチャ",
      previewKind: "table",
    },
    trace: {
      icon: "📡",
      type: "CANoe ASC ログ",
      size: "1.1 MB",
      source: "CANoe 計測",
      previewKind: "log",
    },
    db: {
      icon: "🗄️",
      type: "DB 抽出CSV",
      size: "3 KB",
      source: "検証DB 読み取り専用クエリ",
      previewKind: "csv",
    },
  };

  const candidate = (
    id,
    name,
    kind,
    correct,
    summary,
    preview,
    resultReason,
    overrides = {}
  ) => ({
    id,
    name,
    correct,
    summary,
    preview,
    resultReason,
    ...typeDefaults[kind],
    ...overrides,
  });

  const table = (title, headers, rows) => ({ title, headers, rows });

  const profile = (subject, code, environment, files, occurredAt = "2026/07/29 10:30") => ({
    subject,
    folder: `PC > ドキュメント > BugEvidence > ${code}`,
    requiredIds: files.filter((file) => file.correct).map((file) => file.id),
    files: files.map(({ correct, ...file }, index) => ({
      ...file,
      createdAt: file.createdAt || `${occurredAt}:${String(12 + index * 4).padStart(2, "0")}`,
      modifiedAt: file.modifiedAt || `${occurredAt}:${String(13 + index * 4).padStart(2, "0")}`,
      environment: file.environment || environment,
    })),
  });

  window.TYPING_WORKBENCH_EVIDENCE_PROFILES = [
    profile(
      "顧客一覧画面で右クリックしてもコンテキストメニューが表示されない",
      "CU-RCLICK-20260729",
      "App version 2.3.1 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "right-click-video",
          "customer_list_right_click_103012.mp4",
          "video",
          true,
          "顧客を選択して右クリックしてもメニューが表示されない一連の操作録画。",
          ["00:02 顧客 C-2048を選択", "00:05 右クリックを実行", "00:08 メニューは表示されない"],
          "操作対象と右クリック後の現象を連続した画面で確認できる。"
        ),
        candidate(
          "context-event-log",
          "contextmenu_event_103015.log",
          "log",
          true,
          "発生時のブラウザイベント記録。contextmenuイベント後もメニュー生成が行われていない。",
          [
            "10:30:15.201 contextmenu target=customer-row:C-2048",
            "10:30:15.204 selectedCustomer=C-2048",
            "10:30:15.207 menuComponent.render count=0",
          ],
          "右クリック操作を画面が受け取った後、メニューが生成されていないことを補強する。"
        ),
        candidate(
          "left-click-normal",
          "customer_detail_left_click_101500.png",
          "image",
          false,
          "左クリックで顧客詳細を正常に開いた別操作の画像。",
          ["顧客ID: C-2011", "操作: 左クリック", "顧客詳細画面を表示"],
          "右クリック時の現象ではなく、今回の不具合を直接示さない。"
        ),
        candidate(
          "search-bug-image",
          "customer_search_all_rows_102200.png",
          "image",
          false,
          "存在しない氏名の検索で全件表示された別不具合の画像。",
          ["検索条件: ZZZZZZ", "検索結果: 248件"],
          "同じ画面でも操作と不具合が異なる。"
        ),
      ]
    ),
    profile(
      "顧客一覧画面で存在しない氏名を検索すると顧客が全件表示されてしまう",
      "CU-SEARCH-20260729",
      "Web release 2026.07.24 / Edge 126 / Windows 11 23H2",
      [
        candidate(
          "search-result-screen",
          "search_zzzzzz_result_103014.png",
          "table",
          true,
          "検索欄に存在しない氏名を入力しても248件が表示された結果画面。",
          table(
            "顧客一覧 — 検索条件 ZZZZZZ / 248件",
            ["顧客ID", "氏名", "電話番号"],
            [
              ["C-1001", "青木 一郎", "090-1111-1001"],
              ["C-1002", "井上 花子", "090-1111-1002"],
              ["…", "全248件を表示", "…"],
            ]
          ),
          "検索条件と誤った全件表示を同じ画面で確認できる。"
        ),
        candidate(
          "search-request-har",
          "customer_search_zzzzzz_103013.har",
          "har",
          true,
          "発生時の検索API通信。name=ZZZZZZに対しtotal=248を返している。",
          [
            "GET /api/customers?name=ZZZZZZ  200",
            "request-id: req-search-8821",
            "response.total: 248",
            "response.items[0].customerId: C-1001",
          ],
          "入力した検索条件とサーバー応答の不整合を結び付けられる。"
        ),
        candidate(
          "customer-id-normal",
          "search_customer_id_c1001_101100.png",
          "image",
          false,
          "顧客番号C-1001で1件を正常検索した画像。",
          ["検索条件: C-1001", "検索結果: 1件"],
          "正常系の別条件で、存在しない氏名の現象を示さない。"
        ),
        candidate(
          "empty-search-log",
          "customer_search_empty_100500.har",
          "har",
          false,
          "検索条件を空欄にして全件取得した正常通信。",
          ["GET /api/customers  200", "response.total: 248"],
          "全件表示は正常だが検索条件が空で、発生条件が異なる。"
        ),
      ]
    ),
    profile(
      "勤怠実績登録で日をまたぐ休憩時間が勤務時間から控除されないことがある",
      "AT-BREAK-20260729",
      "Web version 4.12.0 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "work-summary-screen",
          "overnight_work_summary_103014.png",
          "table",
          true,
          "22:00〜翌07:00、休憩01:00〜02:00の勤務が実労働9時間と表示された画面。",
          table(
            "勤務実績 — 7月28日",
            ["開始", "終了", "休憩", "実労働"],
            [["22:00", "翌07:00", "01:00〜02:00", "09:00"]]
          ),
          "入力した勤務・休憩条件と誤った集計結果を確認できる。"
        ),
        candidate(
          "calculation-log",
          "worktime_calculation_103013.log",
          "log",
          true,
          "日またぎ勤務の集計ログ。休憩時間が0分として計算されている。",
          [
            "shiftMinutes=540",
            "breakStart=2026-07-29T01:00 breakEnd=2026-07-29T02:00",
            "deductedBreakMinutes=0",
            "calculatedWorkMinutes=540",
          ],
          "9時間になった計算過程と、休憩控除が欠落した事実を示している。"
        ),
        candidate(
          "work-export",
          "employee_e042_work_20260728.csv",
          "csv",
          true,
          "対象従業員の確定済み勤務実績をエクスポートしたファイル。",
          [
            "employee,start,end,break_minutes,work_minutes",
            "E-042,2026-07-28 22:00,2026-07-29 07:00,60,540",
          ],
          "画面だけでなく、確定データにも540分が保存されたことを示している。"
        ),
        candidate(
          "daytime-break-normal",
          "day_shift_break_100200.png",
          "image",
          false,
          "同じ従業員の日中勤務で休憩が正常控除された画像。",
          ["09:00〜18:00", "休憩 12:00〜13:00", "実労働 08:00"],
          "日をまたがない正常系で、今回の発生条件と異なる。"
        ),
        candidate(
          "other-employee",
          "employee_e019_work_103000.csv",
          "csv",
          false,
          "別従業員E-019の勤務実績。",
          ["E-019,08:30,17:30,60,480"],
          "対象者も勤務条件も異なる。"
        ),
      ]
    ),
    profile(
      "月末処理中の同時打刻で残業時間が二重計上されてしまうことがある",
      "AT-CLOCK-20260729",
      "Web version 4.12.0 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "terminal-a-log",
          "clock_terminal_a_235959.log",
          "log",
          true,
          "端末Aから送信した退勤打刻ログ。",
          ["23:59:59.102 terminal=A employee=E-118 action=clock_out", "request-id=clk-a901 response=200"],
          "同時送信の一方の要求時刻と識別子を確認できる。",
          { createdAt: "2026/07/31 23:59:59", modifiedAt: "2026/07/31 23:59:59" }
        ),
        candidate(
          "terminal-b-log",
          "clock_terminal_b_235959.log",
          "log",
          true,
          "端末Bからほぼ同時に送信した同じ従業員の退勤打刻ログ。",
          ["23:59:59.184 terminal=B employee=E-118 action=clock_out", "request-id=clk-b447 response=200"],
          "同一従業員へ82ms差で別要求が成功したことを示している。",
          { createdAt: "2026/07/31 23:59:59", modifiedAt: "2026/07/31 23:59:59" }
        ),
        candidate(
          "overtime-export",
          "monthly_overtime_e118_000015.csv",
          "csv",
          true,
          "月次集計後の対象従業員の残業明細。",
          ["employee,date,source_request,overtime_minutes", "E-118,2026-07-31,clk-a901,30", "E-118,2026-07-31,clk-b447,30", "TOTAL,,,60"],
          "2件の要求がそれぞれ30分として加算された結果を確認できる。",
          { createdAt: "2026/08/01 00:00:15", modifiedAt: "2026/08/01 00:00:16" }
        ),
        candidate(
          "single-clock-normal",
          "clock_terminal_a_183000.log",
          "log",
          false,
          "通常日に端末Aだけで行った退勤打刻。",
          ["18:30:00 terminal=A employee=E-118 response=200", "overtime_minutes=30"],
          "同時打刻でも月末処理中でもない正常記録。"
        ),
        candidate(
          "previous-month-export",
          "monthly_overtime_e118_202606.csv",
          "csv",
          false,
          "前月の残業時間集計。",
          ["employee,month,total_minutes", "E-118,2026-06,420"],
          "対象月と発生操作が異なる。"
        ),
      ],
      "2026/07/31 23:59"
    ),
    profile(
      "予約をキャンセルした後も対象時間帯が予約済みのままになってしまう",
      "SL-CANCEL-20260729",
      "Release 2026.07.2 / Safari 18.5 / macOS 15.5",
      [
        candidate(
          "cancel-request",
          "reservation_cancel_r8821_103012.har",
          "har",
          true,
          "予約R-8821のキャンセルAPIが成功した通信。",
          ["DELETE /api/reservations/R-8821  204", "request-id: cancel-551", "completed: 10:30:12.288"],
          "キャンセル操作自体が成功応答だったことを示している。"
        ),
        candidate(
          "slot-screen",
          "stylist_slot_1400_after_cancel_103016.png",
          "table",
          true,
          "キャンセル後も14:00枠が予約済みのまま表示された画面。",
          table("空き状況 — 7月30日", ["担当者", "13:30", "14:00", "14:30"], [["神野 美容", "空き", "予約済み", "空き"]]),
          "キャンセル後の利用者影響を直接確認できる。"
        ),
        candidate(
          "reservation-db",
          "reservation_r8821_after_cancel.csv",
          "db",
          true,
          "キャンセル後の予約と予約枠の状態を抽出したデータ。",
          ["reservation_id,status,slot_status", "R-8821,cancelled,reserved"],
          "予約はキャンセル済みだが枠だけ解放されていない不整合を示している。"
        ),
        candidate(
          "before-cancel",
          "stylist_slot_1400_before_cancel.png",
          "image",
          false,
          "キャンセル操作前に14:00枠が予約済みだった画像。",
          ["14:00 神野 美容", "状態: 予約済み"],
          "操作前の正常状態だけで、キャンセル後の不具合を示さない。"
        ),
        candidate(
          "other-stylist",
          "stylist_slot_1400_other_staff.png",
          "image",
          false,
          "別担当者の14:00枠が空いている画像。",
          ["14:00 揃井 美容", "状態: 空き"],
          "担当者と予約番号が異なる。"
        ),
      ]
    ),
    profile(
      "複数端末からの同時予約で同じ担当者の予約が二重登録されてしまうことがある",
      "SL-DOUBLE-20260729",
      "Release 2026.07.2 / Safari 18.5 / macOS 15.5",
      [
        candidate(
          "device-a-booking",
          "booking_device_a_140000.har",
          "har",
          true,
          "端末Aから14:00枠を確定した要求。",
          ["14:00:00.104 POST /api/reservations 201", "staff=ST-12 slot=14:00 reservation=R-9101"],
          "同時予約の一方が成功した時刻と予約番号を示している。"
        ),
        candidate(
          "device-b-booking",
          "booking_device_b_140000.har",
          "har",
          true,
          "端末Bから同じ枠を確定した要求。",
          ["14:00:00.287 POST /api/reservations 201", "staff=ST-12 slot=14:00 reservation=R-9102"],
          "183ms差の二つ目の要求も成功したことを示している。"
        ),
        candidate(
          "double-reservation-db",
          "reservation_slot_st12_1400.csv",
          "db",
          true,
          "同じ担当者・日時で保存された2件の予約データ。",
          ["reservation_id,staff,slot,customer", "R-9101,ST-12,14:00,C-501", "R-9102,ST-12,14:00,C-744"],
          "異なる予約番号で二重に永続化された結果を示している。"
        ),
        candidate(
          "sequential-conflict",
          "booking_sequential_conflict.har",
          "har",
          false,
          "5秒後に同じ枠を予約して409エラーになった正常系通信。",
          ["POST /api/reservations 409", "error=slot_already_reserved"],
          "同時操作ではなく、二重登録も発生していない。"
        ),
        candidate(
          "different-date",
          "reservation_slot_st12_next_day.csv",
          "csv",
          false,
          "同じ担当者の翌日の予約データ。",
          ["R-9140,ST-12,2026-07-31 14:00,C-802"],
          "対象日が異なる。"
        ),
      ]
    ),
    profile(
      "商品一覧画面で税込価格の端数処理が商品ごとに異なってしまう",
      "EC-TAX-20260729",
      "Storefront v8.4.2 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "price-comparison",
          "product_tax_comparison_103014.png",
          "table",
          true,
          "同じ税抜価格・税率の商品AとBで税込価格が異なる一覧画面。",
          table("商品価格比較", ["商品", "税抜", "税率", "税込"], [["商品A", "105円", "10%", "115円"], ["商品B", "105円", "10%", "116円"]]),
          "同一条件で表示結果だけが異なる現象を直接比較できる。"
        ),
        candidate(
          "pricing-trace",
          "pricing_calculation_103013.log",
          "log",
          true,
          "商品ごとの税込計算処理ログ。",
          ["item=A base=105 tax=10% mode=floor result=115", "item=B base=105 tax=10% mode=round result=116"],
          "商品Bだけ異なる端数処理が使われた計算過程を示している。"
        ),
        candidate(
          "product-settings",
          "product_tax_settings_103010.csv",
          "csv",
          true,
          "商品A・Bの税率と端数設定を抽出したデータ。",
          ["item,base_price,tax_rate,rounding_setting", "A,105,10,floor", "B,105,10,floor"],
          "入力設定は同一であり、商品マスタ差によるものではないことを補強する。"
        ),
        candidate(
          "reduced-tax-item",
          "product_c_reduced_tax.png",
          "image",
          false,
          "軽減税率8%の商品Cの価格画面。",
          ["商品C", "税抜105円", "税率8%", "税込113円"],
          "税率が異なる別商品のため比較証跡にならない。"
        ),
        candidate(
          "sale-discount",
          "product_b_sale_price.log",
          "log",
          false,
          "セール割引適用時の商品Bの計算ログ。",
          ["base=105 discount=10 tax=10% result=104"],
          "割引条件が入り、今回の通常価格計算と異なる。"
        ),
      ]
    ),
    profile(
      "注文連携で決済通知を再送すると注文が二重確定されてしまうことがある",
      "EC-WEBHOOK-20260729",
      "Storefront v8.4.2 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "webhook-replay-log",
          "payment_webhook_pay4821.log",
          "log",
          true,
          "同じ通知IDを初回受信・再送したアプリケーションログ。",
          ["10:30:10 notification=PAY-4821 order=O-7811 result=created", "10:30:18 notification=PAY-4821 order=O-7812 result=created"],
          "同じ通知IDから異なる注文番号が2件作られた処理を示している。"
        ),
        candidate(
          "duplicate-orders",
          "orders_for_pay4821.csv",
          "db",
          true,
          "通知ID PAY-4821に紐づく注文をDBから抽出した結果。",
          ["order_id,notification_id,amount,status", "O-7811,PAY-4821,12800,confirmed", "O-7812,PAY-4821,12800,confirmed"],
          "二重確定が永続化されていることを確認できる。"
        ),
        candidate(
          "order-admin-screen",
          "order_admin_pay4821_103022.png",
          "table",
          true,
          "管理画面に同額の確定注文が2件表示された画像。",
          table("注文管理", ["注文番号", "通知ID", "金額", "状態"], [["O-7811", "PAY-4821", "12,800円", "確定"], ["O-7812", "PAY-4821", "12,800円", "確定"]]),
          "運用画面で確認できる影響を示している。"
        ),
        candidate(
          "different-notifications",
          "payment_webhook_two_ids.log",
          "log",
          false,
          "異なる通知IDがそれぞれ別注文を作った正常ログ。",
          ["notification=PAY-4819 order=O-7808", "notification=PAY-4820 order=O-7809"],
          "通知IDが異なり、再送時の重複ではない。"
        ),
        candidate(
          "failed-webhook",
          "payment_webhook_500.log",
          "log",
          false,
          "別通知が500エラーで失敗したログ。",
          ["notification=PAY-4701 response=500 order=none"],
          "対象通知でも二重確定でもない。"
        ),
      ]
    ),
    profile(
      "出庫登録画面で期限切れのロットが出庫候補に表示されてしまう",
      "IV-LOT-20260729",
      "Client 5.7.0 Build 1842 / Edge 126 / Windows 10 22H2",
      [
        candidate(
          "allocation-screen",
          "shipment_lot_candidates_103014.png",
          "table",
          true,
          "出庫候補の先頭に期限切れロットが表示された画面。",
          table("出庫ロット候補 — ITEM-441", ["優先", "ロット", "有効期限", "在庫"], [["1", "LOT-0726", "2026/07/26", "12"], ["2", "LOT-0831", "2026/08/31", "18"]]),
          "期限切れロットが有効ロットより優先された現象を確認できる。"
        ),
        candidate(
          "lot-master",
          "item441_lot_master_103010.csv",
          "csv",
          true,
          "対象商品のロット、有効期限、在庫数を抽出したデータ。",
          ["lot,expiry_date,stock", "LOT-0726,2026-07-26,12", "LOT-0831,2026-08-31,18"],
          "候補画面に使われたロットの期限と在庫条件を確認できる。"
        ),
        candidate(
          "allocation-log",
          "fifo_allocation_item441_103013.log",
          "log",
          true,
          "出庫候補を決定した処理ログ。",
          ["item=ITEM-441 target_date=2026-07-29", "candidate LOT-0726 expiry=2026-07-26 rank=1", "candidate LOT-0831 expiry=2026-08-31 rank=2"],
          "期限判定を除外せずFIFO順だけで選択した処理を示している。"
        ),
        candidate(
          "normal-valid-lots",
          "item512_lot_candidates.png",
          "image",
          false,
          "別商品で期限内ロットだけが並んだ正常画面。",
          ["ITEM-512", "LOT-0810", "LOT-0905"],
          "対象商品と期限条件が異なる。"
        ),
        candidate(
          "received-order",
          "item441_receiving_history.csv",
          "csv",
          false,
          "対象商品の過去の入庫履歴。",
          ["LOT-0726,2026-06-10,12", "LOT-0831,2026-06-18,18"],
          "入庫順は分かるが、発生時の出庫候補と期限判定を証明しない。"
        ),
      ]
    ),
    profile(
      "複数端末からの同時出庫で在庫数がマイナスになってしまうことがある",
      "IV-CONCURRENT-20260729",
      "Client 5.7.0 Build 1842 / Edge 126 / Windows 10 22H2",
      [
        candidate(
          "shipment-terminal-a",
          "shipment_terminal_a_103012.log",
          "log",
          true,
          "端末Aから在庫1個の商品を1個出庫した要求ログ。",
          ["10:30:12.104 terminal=A item=ITEM-990 qty=1", "request=ship-a12 response=200 remaining=0"],
          "同時出庫の一方が成功した時刻と結果を確認できる。"
        ),
        candidate(
          "shipment-terminal-b",
          "shipment_terminal_b_103012.log",
          "log",
          true,
          "端末Bから同じ商品を1個出庫した要求ログ。",
          ["10:30:12.189 terminal=B item=ITEM-990 qty=1", "request=ship-b77 response=200 remaining=-1"],
          "85ms差の二つ目の要求も成功し、残数が負になったことを示している。"
        ),
        candidate(
          "negative-stock",
          "item990_stock_after_shipments.csv",
          "db",
          true,
          "二つの出庫後に保存された在庫数と出庫履歴。",
          ["item,current_stock,shipment_id", "ITEM-990,-1,S-4412", "ITEM-990,-1,S-4413"],
          "在庫数-1と二つの出庫レコードが永続化された結果を示している。"
        ),
        candidate(
          "sequential-rejection",
          "shipment_sequential_rejection.log",
          "log",
          false,
          "5秒後の追加出庫が在庫不足で拒否された正常ログ。",
          ["item=ITEM-990 qty=1 response=409 error=insufficient_stock"],
          "同時実行ではなく、マイナス在庫も発生していない。"
        ),
        candidate(
          "other-item-stock",
          "item991_stock.csv",
          "csv",
          false,
          "別商品ITEM-991の在庫データ。",
          ["ITEM-991,24"],
          "対象商品が異なる。"
        ),
      ]
    ),
    profile(
      "プッシュ通知から開くと別のお知らせが表示されてしまうことがある",
      "MB-NOTIFY-20260729",
      "App 3.4.0 Build 34018 / iOS 18.5 / iPhone 15",
      [
        candidate(
          "notification-payload",
          "push_news102_payload.json",
          "json",
          true,
          "端末へ送信したお知らせID NEWS-102の通知ペイロード。",
          ["{", '  "notificationId": "PUSH-8821",', '  "newsId": "NEWS-102",', '  "title": "重要なお知らせ"', "}"],
          "タップ対象の通知がNEWS-102を指定していたことを確認できる。"
        ),
        candidate(
          "notification-video",
          "tap_news102_open_news101.mp4",
          "video",
          true,
          "NEWS-102の通知をタップするとNEWS-101が開く操作録画。",
          ["00:01 通知 NEWS-102を表示", "00:04 通知をタップ", "00:06 詳細画面 NEWS-101を表示"],
          "通知と誤った遷移先を一続きで確認できる。"
        ),
        candidate(
          "navigation-log",
          "notification_navigation_103015.log",
          "log",
          true,
          "通知タップ後のアプリ内遷移ログ。",
          ["payload.newsId=NEWS-102", "cache.lastNewsId=NEWS-101", "navigate /news/NEWS-101"],
          "ペイロードと実際の遷移IDが異なることを示している。"
        ),
        candidate(
          "home-news-open",
          "news102_from_home.mp4",
          "video",
          false,
          "アプリの一覧画面からNEWS-102を正常に開いた録画。",
          ["一覧からNEWS-102を選択", "NEWS-102詳細を表示"],
          "通知経由ではなく、発生経路が異なる。"
        ),
        candidate(
          "different-push",
          "push_news099_payload.json",
          "json",
          false,
          "過去に送信したNEWS-099の通知ペイロード。",
          ['"newsId": "NEWS-099"', '"notificationId": "PUSH-8700"'],
          "対象通知IDが異なる。"
        ),
      ]
    ),
    profile(
      "バックグラウンド復帰後に未送信データが消えてしまうことがある",
      "MB-BGDATA-20260729",
      "App 3.4.0 Build 34018 / iOS 18.5 / iPhone 15",
      [
        candidate(
          "pending-before",
          "pending_queue_before_memory_release.csv",
          "csv",
          true,
          "メモリ解放前に端末内へ保持されていた未送信データ3件。",
          ["local_id,status,payload_size", "L-901,pending,482", "L-902,pending,516", "L-903,pending,471"],
          "復帰前には未送信データが3件存在したことを示している。",
          { source: "端末ローカルDB 読み取り" }
        ),
        candidate(
          "lifecycle-log",
          "app_lifecycle_memory_release.log",
          "log",
          true,
          "バックグラウンド移行、メモリ解放、復帰時の端末ログ。",
          ["10:30:12 appDidEnterBackground pending=3", "10:30:18 memoryWarning queueCache released", "10:30:25 appWillEnterForeground restored=0"],
          "発生条件と復帰時に0件しか復元されなかった処理を結び付ける。"
        ),
        candidate(
          "pending-after",
          "pending_queue_after_restore.csv",
          "csv",
          true,
          "アプリ復帰後の端末内未送信キュー。",
          ["local_id,status,payload_size", "(0 rows)"],
          "復帰後に3件すべて消失した結果を示している。",
          { source: "端末ローカルDB 読み取り" }
        ),
        candidate(
          "synced-empty-queue",
          "pending_queue_after_successful_sync.csv",
          "csv",
          false,
          "サーバー同期成功後にキューが0件になった正常データ。",
          ["sync_result=success", "pending_rows=0"],
          "データ消失ではなく正常送信後の状態。"
        ),
        candidate(
          "other-device-log",
          "iphone14_memory_warning.log",
          "log",
          false,
          "別端末iPhone 14で取得したメモリ警告ログ。",
          ["device=iPhone14 pending=0 memoryWarning"],
          "端末とデータ条件が異なる。"
        ),
      ]
    ),
    profile(
      "車載メーターでCAN信号がDBC定義と異なる値で表示されてしまう",
      "AU-ENDIAN-20260729",
      "ECU Software v5.12.3 / Hardware Rev C / Vehicle TEST-02",
      [
        candidate(
          "canoe-voltage-trace",
          "battery_voltage_0bb8.asc",
          "trace",
          true,
          "CANoeから0x0BB8を送信した発生時のCANトレース。",
          ["10.301234 1 18FF50E5 Rx d 8 B8 0B 00 00 00 00 00 00", "Signal BatteryVoltage raw=0x0BB8 expected=30.00V"],
          "ECUへ入力した生データと送信時刻を確認できる。"
        ),
        candidate(
          "ecu-decode-log",
          "ecu_voltage_decode_103013.log",
          "log",
          true,
          "対象ECUが受信バイトを復号したログ。",
          ["rawBytes=B8 0B", "interpretedRaw=0xB80B", "physicalValue=471.15V"],
          "バイト順を逆に解釈して471.15Vを生成した処理を示している。",
          { source: "ECU デバッグログ" }
        ),
        candidate(
          "voltage-display",
          "battery_voltage_display_47115.png",
          "image",
          true,
          "0x0BB8送信中に471.15Vと表示されたモニター画面。",
          ["入力信号: 0x0BB8", "バッテリー電圧表示: 471.15V"],
          "誤復号が利用者に見える表示へ反映された結果を示している。"
        ),
        candidate(
          "dbc-definition",
          "vehicle_test02.dbc",
          "log",
          false,
          "BatteryVoltage信号のリトルエンディアン定義ファイル。",
          ['SG_ BatteryVoltage : 0|16@1+ (0.01,0) [0|655.35] "V"'],
          "仕様根拠としては有用だが、発生時の実行結果を証明するエビデンスではない。",
          { type: "DBC ファイル", source: "車両通信仕様リポジトリ" }
        ),
        candidate(
          "speed-signal-trace",
          "vehicle_speed_trace.asc",
          "trace",
          false,
          "同じ車両で取得した車速信号のCANトレース。",
          ["18FEF100 Rx 32 00 00 00 00 00 00 00"],
          "対象信号が異なる。"
        ),
      ]
    ),
    profile(
      "ADAS ECUでBus-Off復帰後もCAN受信が再開されないことがある",
      "AU-BUSOFF-20260729",
      "ECU Software v5.12.3 / Hardware Rev C / Vehicle TEST-02",
      [
        candidate(
          "busoff-trace",
          "adas_busoff_recovery_90pct.asc",
          "trace",
          true,
          "バス負荷率90%以上でBus-Off発生から解除後30秒までを記録したトレース。",
          ["10:30:12.104 BUS_LOAD=92.4%", "10:30:12.880 ADAS_ECU BUS_OFF", "10:30:14.010 ERROR_RELEASED", "10:30:44.010 ADAS_RX_COUNT=0"],
          "高負荷、Bus-Off、解除、30秒間受信なしの時間関係を確認できる。"
        ),
        candidate(
          "adas-recovery-log",
          "adas_ecu_recovery_103012.log",
          "log",
          true,
          "Bus-Off解除後のADAS ECU復帰処理ログ。",
          ["busOffDetected=true", "controllerReset=done", "canRxTask state=SUSPENDED", "resumeCanRxTask called=false"],
          "リセット後も受信タスクが再開されなかった内部状態を示している。",
          { source: "ADAS ECU デバッグログ" }
        ),
        candidate(
          "canoe-measurement",
          "adas_rx_monitor_103044.png",
          "table",
          true,
          "解除後30秒時点でもADAS受信カウンタが増えないCANoe計測画面。",
          table("CANoe Measurement", ["時刻", "バス負荷率", "ADAS Rx/s", "状態"], [["10:30:14", "92.4%", "0", "解除"], ["10:30:44", "91.8%", "0", "受信停止"]]),
          "復帰しない現象を計測値で確認できる。"
        ),
        candidate(
          "low-load-normal",
          "adas_busoff_recovery_40pct.asc",
          "trace",
          false,
          "バス負荷率40%で500ms以内に復帰した正常トレース。",
          ["BUS_LOAD=40.1%", "ERROR_RELEASED 11.000", "FIRST_RX 11.342"],
          "負荷条件が異なり、現象も発生していない。"
        ),
        candidate(
          "body-ecu-log",
          "body_ecu_busoff.log",
          "log",
          false,
          "Body ECUで取得したBus-Offログ。",
          ["ecu=BODY busOff=true recovered=320ms"],
          "対象ECUが異なる。"
        ),
      ]
    ),
    profile(
      "決済APIで同じ冪等キーを再利用すると売上が二重確定されてしまうことがある",
      "PY-IDEMPOTENCY-20260729",
      "API 2024-06-20 / Sandbox / Gateway build 7.18.4",
      [
        candidate(
          "idempotency-requests",
          "payment_idem_a81f_requests.json",
          "json",
          true,
          "同じ冪等キーで10秒差に送信した2回の決済要求と応答。",
          ["10:30:12 POST /payments key=idem-a81f amount=5000 -> txn=T-8811", "10:30:22 POST /payments key=idem-a81f amount=5000 -> txn=T-8812"],
          "同じキーと金額に対し異なる取引IDが返ったことを確認できる。"
        ),
        candidate(
          "transaction-export",
          "transactions_idem_a81f.csv",
          "csv",
          true,
          "冪等キーidem-a81fで確定した売上取引の抽出結果。",
          ["transaction_id,idempotency_key,amount,status", "T-8811,idem-a81f,5000,captured", "T-8812,idem-a81f,5000,captured"],
          "二つの売上が確定状態で保存されたことを示している。",
          { source: "決済Sandbox 管理API" }
        ),
        candidate(
          "gateway-screen",
          "gateway_idem_a81f_103025.png",
          "table",
          true,
          "決済ゲートウェイ管理画面に5,000円の売上が2件表示された画像。",
          table("Sandbox Transactions", ["取引ID", "冪等キー", "金額", "状態"], [["T-8811", "idem-a81f", "5,000円", "売上確定"], ["T-8812", "idem-a81f", "5,000円", "売上確定"]]),
          "外部ゲートウェイ側でも二重売上になった影響を確認できる。"
        ),
        candidate(
          "different-keys",
          "payment_two_keys.json",
          "json",
          false,
          "異なる冪等キーで行った2件の正常決済。",
          ["key=idem-b10 txn=T-8701", "key=idem-b11 txn=T-8702"],
          "キーが異なるため、2取引の成立は正常。"
        ),
        candidate(
          "declined-payment",
          "payment_declined_5000.json",
          "json",
          false,
          "同額だが与信否決となった別取引。",
          ["amount=5000 status=declined txn=none"],
          "対象キーでも二重売上でもない。"
        ),
      ]
    ),
    profile(
      "決済APIのタイムアウト後もカードの与信枠が残ってしまうことがある",
      "PY-AUTH-20260729",
      "API 2024-06-20 / Sandbox / Gateway build 7.18.4",
      [
        candidate(
          "timeout-requery",
          "payment_timeout_requery_t9021.json",
          "json",
          true,
          "30秒タイムアウト後に再照会して決済失敗を確認したAPI記録。",
          ["10:30:12 POST /payments amount=50000 timeout after 30s", "transactionRef=T-9021", "10:30:45 GET /payments/T-9021 status=failed"],
          "対象取引のタイムアウトと失敗確定を確認できる。"
        ),
        candidate(
          "authorization-export",
          "authorization_t9021_after_15min.csv",
          "csv",
          true,
          "失敗確定から15分後も残っていた与信枠の管理API出力。",
          ["transaction_ref,amount,auth_status,checked_at", "T-9021,50000,held,2026-07-29 10:45:45"],
          "期限を超えて50,000円の与信が残存した結果を示している。",
          { source: "決済Sandbox 管理API", createdAt: "2026/07/29 10:45:45", modifiedAt: "2026/07/29 10:45:46" }
        ),
        candidate(
          "auth-admin-screen",
          "gateway_auth_t9021_104546.png",
          "table",
          true,
          "ゲートウェイ管理画面で対象取引の与信が保持中になっている画像。",
          table("Authorization Detail", ["取引参照", "決済", "与信", "金額"], [["T-9021", "失敗", "保持中", "50,000円"]]),
          "決済状態と与信状態の不整合を運用画面で確認できる。",
          { createdAt: "2026/07/29 10:45:46", modifiedAt: "2026/07/29 10:45:46" }
        ),
        candidate(
          "normal-void",
          "authorization_t8990_voided.csv",
          "csv",
          false,
          "別取引で3分後に与信取消が完了した正常記録。",
          ["T-8990,50000,voided,elapsed=180s"],
          "対象取引が異なり、残存もしていない。"
        ),
        candidate(
          "other-timeout",
          "payment_timeout_t8770.json",
          "json",
          false,
          "別の1,000円取引で発生したタイムアウト記録。",
          ["transactionRef=T-8770 amount=1000 status=timeout"],
          "取引参照と金額が異なる。"
        ),
      ]
    ),
    profile(
      "投薬量計算で体重の単位変換が行われず投薬量が1000倍になってしまう",
      "MD-DOSE-20260729",
      "Client 4.8.2 / DB schema 2026.07 / Windows 11 Enterprise",
      [
        candidate(
          "dose-screen",
          "patient_p204_dose_180000mg.png",
          "table",
          true,
          "体重18,000g・10mg/kgの入力に対し180,000mgと表示された処方画面。",
          table("処方確認 — 患者 P-204", ["体重", "投与基準", "計算結果"], [["18,000g", "10mg/kg", "180,000mg"]]),
          "入力値・単位・誤った投薬量を同じ画面で確認できる。"
        ),
        candidate(
          "dose-calculation-log",
          "dose_calculation_p204_103013.log",
          "log",
          true,
          "投薬量の計算処理ログ。",
          ["patient=P-204 weightValue=18000 weightUnit=g", "normalizedWeight=18000 unit=kg", "dosePerKg=10 resultMg=180000"],
          "gからkgへ変換せず18,000kgとして計算した過程を示している。",
          { source: "医療クライアント監査ログ" }
        ),
        candidate(
          "prescription-audit",
          "prescription_audit_p204.csv",
          "csv",
          true,
          "対象患者の処方計算監査データ。",
          ["patient,input_weight,input_unit,dose_rule,calculated_mg", "P-204,18000,g,10,180000"],
          "誤計算結果が処方データへ記録されたことを確認できる。",
          { source: "監査DB 読み取り専用クエリ" }
        ),
        candidate(
          "dose-kg-normal",
          "patient_p204_dose_18kg.png",
          "image",
          false,
          "体重を18kgで入力して180mgとなった正常画面。",
          ["体重18kg", "10mg/kg", "計算結果180mg"],
          "入力単位がkgで、発生条件と異なる。"
        ),
        candidate(
          "other-patient",
          "prescription_audit_p311.csv",
          "csv",
          false,
          "別患者P-311の処方監査データ。",
          ["P-311,22,kg,10,220"],
          "患者と入力条件が異なる。"
        ),
      ]
    ),
    profile(
      "検査結果連携で同じ検査結果を再送すると患者記録が重複登録されてしまうことがある",
      "MD-LAB-20260729",
      "Client 4.8.2 / DB schema 2026.07 / Windows 11 Enterprise",
      [
        candidate(
          "lab-interface-log",
          "lab_result_lab9031_replay.log",
          "log",
          true,
          "同じ検査結果IDを初回受信・再送した連携ログ。",
          ["10:30:12 resultId=LAB-9031 received record=LR-7711 accepted", "10:30:20 resultId=LAB-9031 replay record=LR-7712 accepted"],
          "同じ結果IDの再送が別レコードとして受理されたことを示している。",
          { source: "検査システム連携ログ" }
        ),
        candidate(
          "patient-record-screen",
          "patient_p552_lab9031_duplicate.png",
          "table",
          true,
          "患者記録に同一測定時刻・値の結果が2件表示された画面。",
          table("患者 P-552 — 検査結果", ["記録ID", "検査結果ID", "測定時刻", "値"], [["LR-7711", "LAB-9031", "09:50", "6.2"], ["LR-7712", "LAB-9031", "09:50", "6.2"]]),
          "患者記録上の重複と、同じ検査結果IDを確認できる。"
        ),
        candidate(
          "lab-result-db",
          "lab_result_lab9031_rows.csv",
          "db",
          true,
          "検査結果ID LAB-9031で抽出した患者結果テーブル。",
          ["record_id,result_id,patient,measured_at,value", "LR-7711,LAB-9031,P-552,09:50,6.2", "LR-7712,LAB-9031,P-552,09:50,6.2"],
          "重複結果がDBへ2件保存されたことを示している。",
          { source: "医療DB 読み取り専用クエリ" }
        ),
        candidate(
          "different-result-ids",
          "patient_p552_two_tests.csv",
          "csv",
          false,
          "同じ患者の異なる検査結果IDを持つ2件の正常データ。",
          ["LAB-9029,09:20,5.8", "LAB-9030,09:35,6.0"],
          "結果IDと測定時刻が異なり、重複ではない。"
        ),
        candidate(
          "single-original",
          "lab_result_lab9031_before_replay.png",
          "image",
          false,
          "再送前にLAB-9031が1件だけ表示されていた画面。",
          ["LAB-9031", "09:50", "6.2", "1件"],
          "操作前の状態だけで、再送後の重複を示さない。"
        ),
      ]
    ),
    profile(
      "勤怠実績登録で退勤時刻が翌日の18:00として保存されてしまう",
      "AT-CLOCKOUT-20260729",
      "Web version 4.12.0 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "attendance-screen",
          "attendance_e031_saved_date_103014.png",
          "table",
          true,
          "同日09:00〜18:00の勤務が、翌日18:00退勤として保存された画面。",
          table("勤務実績 — E-031", ["勤務開始", "退勤", "勤務日"], [["2026/07/29 09:00", "2026/07/30 18:00", "2026/07/29"]]),
          "入力した開始日と、誤って翌日になった退勤日時を確認できる。"
        ),
        candidate(
          "attendance-row",
          "attendance_e031_20260729.csv",
          "db",
          true,
          "保存後の対象勤務レコードを抽出したデータ。",
          ["employee,clock_in,clock_out,work_date", "E-031,2026-07-29 09:00,2026-07-30 18:00,2026-07-29"],
          "画面だけでなく翌日の退勤日時がDBへ保存されたことを示している。"
        ),
        candidate(
          "manual-correction",
          "attendance_e031_corrected.png",
          "image",
          false,
          "勤務日を手動修正した後の正常画面。",
          ["09:00〜18:00", "勤務時間09:00"],
          "復旧後の状態で、登録直後の不具合を示さない。"
        ),
        candidate(
          "night-shift",
          "attendance_e044_night_shift.csv",
          "csv",
          false,
          "実際に日付をまたいだ別従業員の夜勤データ。",
          ["E-044,2026-07-29 22:00,2026-07-30 07:00"],
          "翌日退勤が正しい別条件。"
        ),
      ]
    ),
    profile(
      "予約登録画面で予約済みの時間帯を重複予約できてしまう",
      "SL-RESERVED-20260729",
      "Release 2026.07.2 / Safari 18.5 / macOS 15.5",
      [
        candidate(
          "reserved-slot-request",
          "reserved_slot_second_booking.har",
          "har",
          true,
          "予約済み14:00枠へ2件目を登録して成功した通信。",
          ["POST /api/reservations 201", "staff=ST-08 slot=2026-07-30T14:00", "reservation=R-8402"],
          "予約済み枠への2件目の確定要求が成功したことを示している。"
        ),
        candidate(
          "reserved-slot-screen",
          "reserved_slot_double_booking.png",
          "table",
          true,
          "同じ担当者・14:00枠に予約が2件表示された管理画面。",
          table("予約管理 — 7月30日", ["予約番号", "担当者", "開始", "顧客"], [["R-8401", "髪野 美咲", "14:00", "C-141"], ["R-8402", "髪野 美咲", "14:00", "C-209"]]),
          "利用者が確認できる二重予約結果を示している。"
        ),
        candidate(
          "reserved-slot-db",
          "reservation_st08_1400.csv",
          "db",
          true,
          "同じ担当者・開始時刻で保存された2件の予約データ。",
          ["R-8401,ST-08,2026-07-30 14:00,C-141", "R-8402,ST-08,2026-07-30 14:00,C-209"],
          "二重予約がDBへ永続化されたことを確認できる。"
        ),
        candidate(
          "different-staff",
          "reservation_other_staff_1400.png",
          "image",
          false,
          "同じ時刻に別担当者へ入った正常な予約。",
          ["14:00 揃井 梢", "予約番号R-8403"],
          "担当者が異なるため重複予約ではない。"
        ),
        candidate(
          "different-time",
          "reservation_st08_1430.csv",
          "csv",
          false,
          "同じ担当者の14:30枠の予約データ。",
          ["R-8404,ST-08,2026-07-30 14:30"],
          "開始時刻が異なる。"
        ),
      ]
    ),
    profile(
      "商品詳細画面で在庫切れの商品をカートに追加できてしまう",
      "EC-OUTOFSTOCK-20260729",
      "Storefront v8.4.2 / Chrome 126 / Windows 11 23H2",
      [
        candidate(
          "stock-zero-response",
          "product_p771_stock_zero.har",
          "har",
          true,
          "商品APIが在庫数0を返した発生時の通信。",
          ["GET /api/products/P-771 200", "stock=0 purchasable=false"],
          "カート追加前から対象商品が在庫切れだったことを確認できる。"
        ),
        candidate(
          "cart-add-response",
          "cart_add_p771_103014.har",
          "har",
          true,
          "在庫数0の商品をカートへ追加して成功した通信。",
          ["POST /api/cart/items 201", "product=P-771 quantity=1", "cartItem=CI-991"],
          "在庫切れにもかかわらずカート追加APIが成功したことを示している。"
        ),
        candidate(
          "checkout-screen",
          "checkout_outofstock_p771.png",
          "table",
          true,
          "在庫切れ商品を含んだまま注文確認まで進んだ画面。",
          table("注文確認", ["商品", "数量", "在庫", "小計"], [["P-771 テスト商品", "1", "0", "3,980円"]]),
          "購入者が注文確認まで進めてしまう影響を確認できる。"
        ),
        candidate(
          "instock-product",
          "cart_add_p552.har",
          "har",
          false,
          "在庫12個の商品を正常にカート追加した通信。",
          ["product=P-552 stock=12 POST /cart/items 201"],
          "在庫条件が異なる正常系。"
        ),
        candidate(
          "wishlist-add",
          "wishlist_p771.png",
          "image",
          false,
          "在庫切れ商品をお気に入りへ追加した画像。",
          ["P-771", "お気に入り追加済み"],
          "カートではなく、在庫切れでも許可される別機能。"
        ),
      ]
    ),
    profile(
      "出庫登録画面で在庫数を超える出庫数を登録できてしまう",
      "IV-OVERQTY-20260729",
      "Client 5.7.0 Build 1842 / Edge 126 / Windows 10 22H2",
      [
        candidate(
          "overqty-screen",
          "shipment_item330_qty8.png",
          "table",
          true,
          "現在庫5個の商品へ出庫数8個を登録できた画面。",
          table("出庫登録完了", ["商品", "登録前在庫", "出庫数", "登録後在庫"], [["ITEM-330", "5", "8", "-3"]]),
          "入力数量とマイナスになった在庫を同じ画面で確認できる。"
        ),
        candidate(
          "overqty-log",
          "shipment_validation_item330.log",
          "log",
          true,
          "出庫数8の登録処理で在庫上限チェックを通過したログ。",
          ["item=ITEM-330 currentStock=5 requested=8", "validateAvailableQuantity skipped=true", "shipment=S-3308 result=created"],
          "在庫超過を拒否せず登録した処理を示している。"
        ),
        candidate(
          "overqty-db",
          "item330_after_shipment.csv",
          "db",
          true,
          "登録後の在庫数と出庫実績を抽出したデータ。",
          ["item,current_stock,shipment,quantity", "ITEM-330,-3,S-3308,8"],
          "マイナス在庫と出庫実績が保存された結果を確認できる。"
        ),
        candidate(
          "valid-quantity",
          "shipment_item330_qty3.png",
          "image",
          false,
          "同じ商品を3個出庫して残数2となった正常画面。",
          ["現在庫5", "出庫3", "残数2"],
          "在庫数以下の正常条件。"
        ),
        candidate(
          "other-item-error",
          "shipment_item441_stock_error.log",
          "log",
          false,
          "別商品で在庫不足エラーになったログ。",
          ["ITEM-441 current=2 requested=4 response=409"],
          "対象商品と実行結果が異なる。"
        ),
      ]
    ),
    profile(
      "問い合わせフォームで画面回転後に入力内容が消えてしまう",
      "MB-ROTATE-20260729",
      "App 3.4.0 Build 34018 / Android 15 / Pixel 9",
      [
        candidate(
          "rotation-video",
          "inquiry_form_rotation.mp4",
          "video",
          true,
          "問い合わせフォームへ120文字入力後、横向きにすると全文が消える操作録画。",
          ["00:03 問い合わせ本文 120文字", "00:06 端末を横向きへ回転", "00:08 本文 0文字"],
          "回転前後の同じ入力欄を連続して確認できる。"
        ),
        candidate(
          "rotation-lifecycle-log",
          "inquiry_rotation_lifecycle.log",
          "log",
          true,
          "端末回転による画面再生成時の状態保存ログ。",
          ["onSaveInstanceState textLength=0", "Activity recreated orientation=landscape", "restore textLength=0"],
          "回転時に入力内容を保存せず0文字で復元した処理を示している。",
          { source: "Android Logcat" }
        ),
        candidate(
          "submitted-form",
          "inquiry_submitted_success.png",
          "image",
          false,
          "送信済み問い合わせが正常保存された完了画面。",
          ["問い合わせ番号 Q-901", "送信完了"],
          "未保存入力の回転ではなく、操作条件が異なる。"
        ),
        candidate(
          "background-restore",
          "inquiry_background_restore.mp4",
          "video",
          false,
          "画面回転せずバックグラウンド復帰した正常録画。",
          ["120文字入力", "バックグラウンド", "復帰後120文字"],
          "端末回転を行っていない。"
        ),
      ]
    ),
    profile(
      "車載メーターで車速変更後の速度表示が最大1.2秒遅れてしまう",
      "AU-SPEED-20260729",
      "ECU Software v5.12.3 / Hardware Rev C / Vehicle TEST-02",
      [
        candidate(
          "speed-can-trace",
          "vehicle_speed_60_to_80.asc",
          "trace",
          true,
          "車速信号を60km/hから80km/hへ変更したCANトレース。",
          ["10:30:12.000 VehicleSpeed=60km/h", "10:30:13.000 VehicleSpeed=80km/h", "10:30:13.010 VehicleSpeed=80km/h"],
          "CAN入力が10:30:13.000に80km/hへ更新されたことを確認できる。"
        ),
        candidate(
          "meter-measurement",
          "meter_speed_delay_1200ms.png",
          "table",
          true,
          "CAN入力とメーター表示の更新時刻を比較した計測画面。",
          table("速度表示タイミング", ["時刻", "CAN車速", "メーター表示"], [["13.000", "80km/h", "60km/h"], ["13.200", "80km/h", "60km/h"], ["14.200", "80km/h", "80km/h"]]),
          "仕様200msに対し最大1.2秒遅れた時間差を確認できる。"
        ),
        candidate(
          "hmi-speed-log",
          "hmi_speed_update.log",
          "log",
          true,
          "HMIが車速変更通知を受けて表示を更新したログ。",
          ["13.001 rx VehicleSpeed=80", "13.004 displayUpdate queued", "14.201 displayValue=80 latency=1200ms"],
          "遅延がHMI表示更新までの処理で発生したことを補強する。",
          { source: "メーターHMI デバッグログ" }
        ),
        candidate(
          "normal-speed-update",
          "vehicle_speed_40_to_60_normal.asc",
          "trace",
          false,
          "別条件で180ms以内に更新した正常計測。",
          ["input=60 at 10.000", "display=60 at 10.180"],
          "遅延が仕様内で、今回の発生結果と異なる。"
        ),
        candidate(
          "rpm-trace",
          "engine_rpm_update.asc",
          "trace",
          false,
          "同じ計測中のエンジン回転数信号。",
          ["EngineSpeed=2200rpm"],
          "対象信号が車速ではない。"
        ),
      ]
    ),
    profile(
      "決済失敗時にも加盟店の日次売上へ売上データが計上されてしまう",
      "PY-FAILED-SALE-20260729",
      "API 2024-06-20 / Sandbox / Gateway build 7.18.4",
      [
        candidate(
          "gateway-failure",
          "gateway_txn_t8110_failed.json",
          "json",
          true,
          "12,800円の対象決済に対するゲートウェイ失敗応答。",
          ["transactionRef=T-8110", "amount=12800", "gatewayStatus=failed", "charged=false"],
          "外部決済が失敗し、顧客請求も発生していないことを確認できる。"
        ),
        candidate(
          "sales-row",
          "sales_for_t8110.csv",
          "db",
          true,
          "失敗取引T-8110に対して作成された売上データ。",
          ["sales_id,transaction_ref,amount,status", "S-6612,T-8110,12800,posted"],
          "決済失敗にもかかわらず同額の売上が計上された結果を示している。"
        ),
        candidate(
          "merchant-screen",
          "merchant_sales_t8110.png",
          "table",
          true,
          "加盟店管理画面で失敗取引の売上が計上済みになった画像。",
          table("売上明細", ["売上ID", "取引参照", "金額", "決済結果"], [["S-6612", "T-8110", "12,800円", "失敗"]]),
          "日次集計へ影響する運用上の不整合を確認できる。"
        ),
        candidate(
          "successful-sale",
          "sales_for_t8099.csv",
          "csv",
          false,
          "決済成功後に売上計上された正常データ。",
          ["S-6590,T-8099,12800,posted,payment=success"],
          "決済結果が成功で、今回の条件と異なる。"
        ),
        candidate(
          "failed-no-sale",
          "gateway_txn_t8002_failed.json",
          "json",
          false,
          "別取引で失敗後に売上が作られなかった正常記録。",
          ["T-8002 failed salesRows=0"],
          "対象取引が異なり、不具合も発生していない。"
        ),
      ]
    ),
    profile(
      "患者切替後も別の患者の検査結果が表示されてしまう",
      "MD-PATIENT-SWITCH-20260729",
      "Client 4.8.2 / DB schema 2026.07 / Windows 11 Enterprise",
      [
        candidate(
          "patient-switch-video",
          "patient_a_to_b_results.mp4",
          "video",
          true,
          "患者Aの結果表示後、患者Bへ切り替えてもAの結果3件が残る操作録画。",
          ["00:02 患者A ID=P-101 / 結果3件", "00:06 患者B ID=P-202へ切替", "00:08 見出しはP-202 / 内容はP-101の3件"],
          "患者切替操作と誤表示を一続きで確認できる。"
        ),
        candidate(
          "patient-b-api",
          "patient_b_results_response.har",
          "har",
          true,
          "切替後に患者Bの検査結果を正しく返したAPI通信。",
          ["GET /api/patients/P-202/results 200", "resultIds=[LAB-B21,LAB-B22]", "patientId=P-202"],
          "サーバー応答は患者Bであり、画面表示だけが患者Aのキャッシュだったことを示す。"
        ),
        candidate(
          "result-cache-log",
          "patient_result_cache.log",
          "log",
          true,
          "患者切替時のクライアントキャッシュ利用ログ。",
          ["selectedPatient=P-202", "apiPatient=P-202 resultCount=2", "render cacheKey=P-101 resultCount=3"],
          "選択患者と描画に使ったキャッシュキーの不一致を確認できる。",
          { source: "医療クライアント監査ログ" }
        ),
        candidate(
          "patient-a-original",
          "patient_a_results_before_switch.png",
          "image",
          false,
          "切替前に患者Aの結果3件を正常表示した画像。",
          ["患者P-101", "検査結果3件"],
          "切替前の正常状態だけで誤表示を示さない。"
        ),
        candidate(
          "patient-b-reloaded",
          "patient_b_results_after_reload.png",
          "image",
          false,
          "画面再読み込み後に患者Bの結果へ戻った画像。",
          ["患者P-202", "検査結果2件"],
          "復旧後の状態で、切替直後の誤表示を示さない。"
        ),
      ]
    ),
  ];

  const additionalScenarioIds = [
    "customer-search-delete-last-page-stays-empty",
    "attendance-approved-correction-total-stale",
    "salon-reservation-auto-assigns-off-duty-staff",
    "ec-payment-notification-header-case-rejected",
    "inventory-lot-leading-zero-lost-export",
    "mobile-notification-token-not-reregistered",
    "automotive-can-rolling-counter-rollover-rejected",
    "automotive-multimedia-navigation-guidance-not-resumed-after-call",
    "automotive-multimedia-audio-volume-max-after-ignition-restart",
    "automotive-multimedia-lane-departure-toggle-not-sent",
    "automotive-multimedia-rear-door-status-stale-after-wake",
    "payment-refund-event-before-response-stale",
    "medical-lab-result-unit-conversion-wrong",
  ];

  additionalScenarioIds.forEach((scenarioId, scenarioIndex) => {
    const authoring = window.TYPING_WORKBENCH_SCENARIO_AUTHORING?.[scenarioId];
    if (!authoring) {
      return;
    }
    const scenario = authoring.scenario;
    const observations = authoring.reviewSource.observations;
    const environment = scenario.environment.map(({ text }) => text).join(" / ");
    const prefix = scenarioId.split("-").slice(0, 2).join("-");
    const evidenceFiles = [
      candidate(
        `${prefix}-operation`,
        `${prefix}_operation.mp4`,
        "video",
        true,
        observations[0].text,
        ["操作開始", observations[0].text, "操作終了"],
        "主要な操作条件と画面上の結果を一続きで確認できる。"
      ),
      candidate(
        `${prefix}-comparison`,
        `${prefix}_comparison.log`,
        "log",
        true,
        observations[1].text,
        ["comparison-check", observations[1].text],
        "再現回数と正常条件との差を確認できる。"
      ),
      candidate(
        `${prefix}-state`,
        `${prefix}_state.json`,
        "json",
        true,
        `発生時の内部状態。${observations[0].text}`,
        [JSON.stringify({ scenarioId, result: "observed", sequence: scenarioIndex + 1 })],
        "画面上の結果と同じ時点の処理状態を追跡できる。"
      ),
      candidate(
        `${prefix}-unrelated`,
        `${prefix}_unrelated.png`,
        "image",
        false,
        "同じプロジェクトで別の確認作業を行った画面。今回の発生条件とは一致しない。",
        ["別日時の確認", "対象操作なし"],
        "対象シナリオの操作と結果を示さないため、添付対象ではない。"
      ),
    ];
    window.TYPING_WORKBENCH_EVIDENCE_PROFILES.push(
      profile(
        scenario.subject.text,
        `ADDITIONAL-${String(scenarioIndex + 1).padStart(2, "0")}`,
        environment,
        evidenceFiles,
        "2026/08/15 10:30"
      )
    );
  });
})();
