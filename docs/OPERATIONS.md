# スケジューリング主要ユースケース動作確認手順

## 前提条件
- バックエンド API を起動する: `uvicorn src.main:app --reload`
- フロントエンドを別ターミナルで起動する: `cd frontend && npm install && npm run dev`
- ブラウザで `http://localhost:5173` を開く。

## 1. 医師の登録
1. API で医師を登録する。例:
   ```bash
   curl -X POST http://localhost:8000/api/doctors \
     -H "Content-Type: application/json" \
     -d '{"id":"d1","name":"Dr. Sato","department":"Cardiology"}'
   ```
2. フロントエンドの医師プルダウンに登録済みの医師が表示されることを確認する。

## 2. 予定の登録
1. 以下のコマンドで手術予定を登録する。
   ```bash
   curl -X POST http://localhost:8000/api/events \
     -H "Content-Type: application/json" \
     -d '{
       "doctor_id":"d1",
       "category":"surgery",
       "title":"Bypass Surgery",
       "start_time":"2024-03-01T09:00:00",
       "end_time":"2024-03-01T11:00:00",
       "operating_room":"OR-1"
     }'
   ```
2. API 応答に `id` が含まれていることを確認する。
3. フロントエンドの日別ビューで、該当日に手術予定がオレンジ色で表示されることを確認する。

## 3. 予定の表示 (週別)
1. フロントエンドの「週別」ボタンをクリックする。
2. 週の一覧に登録済みの予定が表示され、カテゴリごとの色分けが維持されることを確認する。
3. API で週次予定を直接確認することもできる。
   ```bash
   curl "http://localhost:8000/api/doctors/d1/weekly?week_start=2024-02-26"
   ```

## 4. 予定の更新
1. 登録済みイベント ID を `EVENT_ID` とする。
2. 次のコマンドで予定を更新する。
   ```bash
   curl -X PUT http://localhost:8000/api/events/EVENT_ID \
     -H "Content-Type: application/json" \
     -d '{"notes":"Patient requires ICU bed"}'
   ```
3. API 応答で `notes` が更新されていることを確認し、フロントエンドでも反映されることを確認する。

## 5. 予定の削除
1. 次のコマンドで予定を削除する。
   ```bash
   curl -X DELETE http://localhost:8000/api/events/EVENT_ID
   ```
2. API が 204 を返すこと、フロントエンドの一覧から予定が消えることを確認する。

## 6. 検索・フィルタ
1. フロントエンドのフィルタを用い、医師・カテゴリ・期間を指定する。
2. 「検索結果」セクションの件数と内容がフィルタ条件に一致することを確認する。
3. API で検索する場合は以下を利用する。
   ```bash
   curl "http://localhost:8000/api/events?doctor_id=d1&category=surgery&start_date=2024-03-01&end_date=2024-03-07"
   ```

以上で主要なユースケースの動作確認を実施できる。
