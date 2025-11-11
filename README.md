# 医師スケジューリングシステム

このリポジトリは、医師の予定（手術・外来・不在・会議など）を管理するフルスタックのサンプル実装です。FastAPI を用いたバックエンド API と、React/Vite を用いたフロントエンド UI を提供します。

## バックエンド
- `src/scheduler/`: 予定・医師エンティティ、リポジトリ、サービス層を定義。
- `src/api/`: FastAPI で REST エンドポイントを実装。医師登録、予定の登録・更新・削除、フィルタ、日別／週別取得を提供。
- `requirements.txt`: 依存パッケージ。
- テスト: `pytest` を用いたユニットテスト・E2E テストを `tests/` に配置。

### 実行方法
```bash
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## フロントエンド
- `frontend/`: Vite + React + TypeScript を利用。
- 日別／週別のスケジュール表示、医師・カテゴリ・期間での検索／フィルタ UI を提供。

### 実行方法
```bash
cd frontend
npm install
npm run dev
```

## テスト
- バックエンド: `pytest`
- フロントエンド: `cd frontend && npm test`

## ドキュメント
主要ユースケースの操作手順は `docs/OPERATIONS.md` を参照してください。
