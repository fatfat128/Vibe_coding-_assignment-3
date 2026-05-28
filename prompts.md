# FurniLoop — Development Prompt Log (Cline)

**GitHub:** https://github.com/<your-username>/furniloop-bus4012
**Live URL:** https://<your-project>.vercel.app
**Workflow:** VS Code + Cline. Every milestone written in **Plan Mode** first, reviewed, then run in **Act Mode**. Git commit made only after acceptance checks pass.

App: **FurniLoop** — a community furniture-share MVP. People leaving out unwanted furniture post it; neighbours nearby browse a map and claim items, cutting landfill. React + Vite + TypeScript frontend, Python FastAPI backend, Supabase (Auth + Postgres + Storage), deployed as a single Vercel project.

---

## Milestone 1 — Scaffold the project

**Purpose:** Create the monorepo skeleton (frontend + backend), a working health route, the ignore rules, and the first commit — before any feature code.

**Main prompt (Plan Mode):**

```
You are my coding assistant for the FurniLoop project.
Build the first milestone of FurniLoop, a community furniture-share MVP. Keep it beginner-friendly and do not add extra features beyond what is explicitly requested.

PROJECT STRUCTURE
Create a monorepo with exactly these top-level folders:
- backend
- frontend

BACKEND REQUIREMENTS
- Use Python FastAPI.
- Put the FastAPI app in backend/api/index.py.
- The FastAPI variable must be named app.
- Add GET /api/health that returns {"status": "ok"}.
- Add backend/requirements.txt with the minimum packages for FastAPI plus the Supabase Python client and python-dotenv.
- Add backend/.env.example with these names only:
  SUPABASE_URL=
  SUPABASE_SERVICE_KEY=
  FRONTEND_ORIGIN=http://localhost:5173
- Do not create backend/.env yet unless I provide real values.

FRONTEND REQUIREMENTS
- Create a React + TypeScript app in frontend using Vite.
- Install and configure Tailwind CSS v3 (tailwind.config.js, postcss.config.js, src/index.css).
- Define a custom Tailwind colour token "furni-green" (#2E7D32).
- Create a simple starter screen that says "FurniLoop — Connecting communities, reducing waste".
- Add frontend/.env.example with:
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_API_BASE_URL=http://localhost:8001/api

GIT REQUIREMENTS
- Create a root .gitignore that ignores:
  .env
  .env.local
  .env.*.local
  .venv/
  venv/
  node_modules/
  dist/
  __pycache__/
  .DS_Store
  .vercel/
- Initialise a Git repository if one does not exist.

ACCEPTANCE CRITERIA BEFORE COMMIT
1. backend/ and frontend/ exist.
2. Backend starts locally and GET http://localhost:8001/api/health returns {"status":"ok"}.
3. Frontend starts locally with npm run dev.
4. .env files are ignored by Git.
5. No secrets are committed.

COMMIT
After all acceptance criteria pass, create this Git commit:
chore: scaffold furniloop

After the commit, show me the commands you ran, the health check result, the commit hash, and any issues.
```

**Follow-up prompt (if backend used wrong port):**
```
The backend should run on port 8001 to avoid a conflict with another local service. Update any run instructions and the frontend VITE_API_BASE_URL default to use http://localhost:8001/api.
```

---

## Milestone 2 — Database setup (Supabase schema, RLS, storage)

**Purpose:** Create the tables FurniLoop needs, lock them with row-level security, and add a public storage bucket for item photos.

**Main prompt (Plan Mode):**

```
Build Milestone 2: database setup for FurniLoop.
Create the SQL needed for the app's data. Do not add authentication or frontend features yet.

Create backend/sql/setup.sql containing SQL that:
1. Creates public.profiles with: id uuid primary key referencing auth.users(id) on delete cascade, full_name text, suburb text, consent_given boolean default false, created_at timestamptz default now().
2. Creates public.items with: id uuid primary key default gen_random_uuid(), owner_id uuid referencing auth.users(id) on delete cascade, name text not null, condition text check in ('Good','Fair','Poor') not null, suburb text not null, pickup_window text, item_size text, still_available boolean default true, remarks text, photo_url text, lat numeric, lng numeric, claimed_by uuid referencing auth.users(id), claimed_at timestamptz, created_at timestamptz default now().
3. Creates public.item_reports with: id uuid primary key default gen_random_uuid(), item_id uuid referencing public.items(id) on delete cascade, reporter_id uuid referencing auth.users(id), status text check in ('Still there','Just picked up','Looks damaged','Already gone') not null, created_at timestamptz default now().
4. Adds indexes on items(suburb) and item_reports(item_id, created_at desc).
5. Enables row-level security on all three tables with policies:
   - profiles: a user can select/insert/update only their own row (auth.uid() = id).
   - items: anyone may select; only the owner may insert/update (auth.uid() = owner_id); any authenticated user may update to claim.
   - item_reports: any authenticated user may insert their own report and anyone may select.
6. Creates a public storage bucket "item-photos" and storage policies so authenticated users can upload and anyone can view.

The React frontend must not write to these tables directly except photo uploads to storage; the FastAPI backend controls item writes.

ACCEPTANCE CRITERIA
1. I can paste backend/sql/setup.sql into the Supabase SQL Editor and it runs without error.
2. The three tables and the item-photos bucket appear in Supabase.

COMMIT
feat: add database setup

After finishing, show me the SQL file and a short note on how to apply it in Supabase.
```

**Follow-up prompt (storage RLS, if photo upload was blocked):**
```
Photo uploads from the frontend fail with "new row violates row-level security policy". Add storage.objects policies for the item-photos bucket: allow authenticated users to INSERT, allow anyone to SELECT, and allow owners to DELETE their own uploads.
```

---

## Milestone 3 — Authentication (backend-owned signup + protected routes)

**Purpose:** Let users create accounts and log in, and protect the app's screens so only signed-in users reach them.

**Main prompt (Plan Mode):**

```
Build Milestone 3: authentication for FurniLoop.
Only build signup, login session handling, and route protection. Do not build the furniture posting or browsing features yet.

BACKEND AUTH REQUIREMENTS
In backend/api/index.py:
1. Keep GET /api/health returning {"status":"ok"}.
2. Create a Supabase client using SUPABASE_URL and SUPABASE_SERVICE_KEY (service key stays server-side only).
3. Add POST /api/auth/signup that accepts email, password, full_name, consent_given. It must create a confirmed user using the Supabase admin API (email_confirm true) so signups work immediately and are not blocked by email rate limits, then upsert a matching profiles row. Return a clear 409 error if the email already exists.
4. Add a token-verification helper get_user that reads the Authorization: Bearer <access_token> header and validates it with Supabase Auth before any protected action.
5. Add CORS for http://localhost:5173 and any origin set in FRONTEND_ORIGIN, plus Vercel preview origins.
6. Keep comments short and beginner-friendly.

FRONTEND AUTH REQUIREMENTS
In frontend:
1. Build a login screen and a register screen, each with a consent checkbox explaining that the user's suburb (not exact location) is visible to the community.
2. Read VITE_API_BASE_URL from env to call the backend.
3. Registration calls POST /api/auth/signup, then signs the user in with the Supabase JS client (signInWithPassword) and stores the session.
4. Protect /role, /post, /browse, and /confirmation so unauthenticated users are redirected to login. Implement the guard as a helper function (not a component defined inside another component) to avoid remount-on-keystroke focus loss.
5. Show friendly error messages for failed login or signup.
6. Never store the service key or any backend secret in the frontend.

ACCEPTANCE CRITERIA
1. /api/health still works.
2. Signup creates a user visible in Supabase Authentication > Users.
3. Login reaches the protected area.
4. An invalid login shows a friendly error.
5. backend/.env and frontend/.env.local are not staged; no secrets staged.

COMMIT
feat: add authentication

After finishing, show me the auth endpoints, the local test results, and the commit hash.
```

**Follow-up prompt (focus-loss bug):**
```
Typing in a form input loses focus after every keystroke and I must click the field again for each character. Find the cause (a component being defined inside another component's render, causing remounts) and fix it by moving the route-guard logic into a plain helper function so inputs keep focus.
```

**Follow-up prompt (signup database error):**
```
Signup returns "Database error saving new user". Investigate: check for any trigger on auth.users, check for a duplicate row from a previous failed attempt, and confirm we are using the admin create_user path. Fix the root cause and let me re-test with a fresh email.
```

---

## Milestone 4 — Furniture posting, browsing, and claiming flow

**Purpose:** The core product — give furniture, browse a neighbourhood map, claim an item, and see a sustainability confirmation.

**Main prompt (Plan Mode):**

```
Build Milestone 4: the core FurniLoop flow.
Keep the scope strict and keep all existing health and auth routes working.

BACKEND ITEM REQUIREMENTS
In backend/api/index.py:
1. Add GET /api/items with optional suburb filter. Returns items where still_available is true, newest first.
2. Add POST /api/items (requires Bearer token). Validates the token, inserts an item owned by the logged-in user, returns the created row.
3. Add POST /api/items/{id}/claim (requires Bearer token). Marks the item claimed_by the user, still_available false, claimed_at now.
4. Add POST /api/items/{id}/report (requires Bearer token). Inserts a community status report.
5. Add GET /api/items/{id}/reports returning recent reports.
6. Add POST /api/profile (requires Bearer token) to upsert the user's profile.
7. Never print secrets.

FRONTEND FLOW REQUIREMENTS
In frontend:
1. After login, show a role-selection screen: "Give Furniture" or "Find Furniture".
2. Give Furniture: a Post Item form (name, condition, suburb, pickup window, item size, still-available, remarks with a 200-char limit, optional photo). On submit, upload any photo to the item-photos storage bucket, then POST /api/items with the returned photo URL. Navigate to a confirmation screen.
3. Find Furniture: fetch GET /api/items, show a Leaflet map with a pin per item that has coordinates, a suburb filter, and a card list. Each card shows condition, suburb, remarks, a community-status line, a Report Status control, a Claim button, and a Get Directions button that opens Google Maps.
4. Claiming an item calls POST /api/items/{id}/claim and navigates to a confirmation screen.
5. The confirmation screen shows an estimated landfill-saving figure based on item size, and a Start Over button.

ACCEPTANCE CRITERIA
1. Logged-out users cannot create or claim items.
2. A logged-in user can post an item and see it saved in Supabase.
3. Browsing shows items from the database; claiming updates the row.
4. No secrets staged.

COMMIT
feat: add furniture posting browse and claim flow

After finishing, show me the item endpoints, the local test results, and the commit hash.
```

**Follow-up prompt (map pins / demo data):**
```
Posted items have no map pin because they have no coordinates. For demonstration, insert ten sample items across different Melbourne suburbs with realistic lat/lng so the map shows multiple pins, and backfill coordinates for any existing item.
```

---

## Milestone 5 — Single Vercel project deployment

**Purpose:** Configure the monorepo so one Vercel project builds and serves both the React frontend and the FastAPI backend, with /api/* routed to FastAPI.

**Main prompt (Plan Mode):** *(this is the lecture's single-project deployment pattern)*

```
Prepare my FurniLoop monorepo for a single Vercel project deployment.

My repository has:
- frontend/ for the React + Vite app
- backend/ for the FastAPI app
- backend/api/index.py contains the FastAPI app variable named app
- backend routes are already prefixed with /api (e.g. /api/health, /api/auth/signup, /api/items)

Do not move the existing backend app. Add only the deployment files needed for Vercel.

STEP 1 — Create the root Vercel API entry point
Create api/index.py at the repository root that loads and exposes the app from backend/api/index.py using a path-based import so it does not import the root api folder itself:

from pathlib import Path
import importlib.util

backend_index = Path(__file__).resolve().parent.parent / "backend" / "api" / "index.py"
spec = importlib.util.spec_from_file_location("backend_api_index", backend_index)
backend_module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(backend_module)

app = backend_module.app

STEP 2 — Copy backend/requirements.txt to requirements.txt at the repo root. Do not delete the backend copy.

STEP 3 — In frontend/package.json add this script without removing existing scripts:
"vercel-build": "tsc -b && vite build"

STEP 4 — Create frontend/.env.production with:
VITE_API_BASE_URL=/api
(this is not a secret and should be committed)

STEP 5 — Create vercel.json at the repo root:
{
  "version": 2,
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "api/index.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/assets/(.*)", "dest": "/frontend/assets/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/frontend/index.html" }
  ]
}

STEP 6 — Confirm .env, .env.local, .venv/, node_modules/, dist/, __pycache__/, .vercel/ are gitignored. Do not ignore frontend/.env.production.

STEP 7 — Verify before committing:
1. GET http://localhost:8001/api/health still returns {"status":"ok"}.
2. The frontend still starts locally.
3. No secrets staged.

COMMIT
chore: prepare single vercel deployment

After finishing, show me the files created, the final vercel.json, the health check result, and whether any secrets are staged.
```

**Follow-up prompt (blank page after deploy):**
```
The deployed Vercel page is blank. Confirm the /assets/(.*) route in vercel.json points to /frontend/assets/$1 and that frontend/package.json has the vercel-build script, then explain what to redeploy.
```

---

## Deployment & environment variables (Vercel dashboard)

Set in Vercel → Project → Settings → Environment Variables (Production + Preview):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | your Supabase service role key (server-side only) |
| `FRONTEND_ORIGIN` | your https://<project>.vercel.app URL |
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon/publishable key |

`VITE_API_BASE_URL=/api` comes from `frontend/.env.production` (committed), so it does not need to be set in the dashboard.

Then: Add New → Project → import the GitHub repo → keep **Root Directory = ./** → Deploy. Test `https://<project>.vercel.app/api/health` returns `{"status":"ok"}`.
