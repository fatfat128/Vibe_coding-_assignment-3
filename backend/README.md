# FurniLoop Backend (Python FastAPI)

## Local dev
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: paste your SUPABASE_SERVICE_KEY from Supabase Dashboard → Project Settings → API
uvicorn api.index:app --reload --port 8000
```

Test:
- http://localhost:8000/api/health → `{"ok": true, "service": "FurniLoop API"}`
- http://localhost:8000/docs → interactive Swagger UI

## Endpoints
- `GET /api/health`
- `GET /api/items?suburb=Carlton`
- `POST /api/items` (auth required)
- `POST /api/items/{id}/claim` (auth required)
- `POST /api/items/{id}/report` (auth required)
- `GET /api/items/{id}/reports`
- `POST /api/profile` (auth required, upsert)

Auth = `Authorization: Bearer <supabase_jwt>` header from frontend.
