import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI(title="FurniLoop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        os.environ.get("FRONTEND_ORIGIN", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- auth helper ----
def get_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        res = sb.auth.get_user(token)
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")
    if not res or not res.user:
        raise HTTPException(401, "Invalid token")
    return res.user


# ---- schemas ----
class ItemIn(BaseModel):
    name: str
    condition: str
    suburb: str
    pickup_window: Optional[str] = None
    item_size: Optional[str] = None
    still_available: bool = True
    remarks: Optional[str] = None
    photo_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ReportIn(BaseModel):
    status: str


class ProfileIn(BaseModel):
    full_name: Optional[str] = None
    suburb: Optional[str] = None
    consent_given: Optional[bool] = None


class SignupIn(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    consent_given: bool = False


# ---- routes ----
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/signup")
def admin_signup(payload: SignupIn):
    """Create a confirmed user via admin API (bypasses email confirmation + rate limits)."""
    try:
        res = sb.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": payload.full_name,
                    "consent_given": payload.consent_given,
                },
            }
        )
    except Exception as e:
        msg = str(e)
        if "already" in msg.lower() or "duplicate" in msg.lower():
            raise HTTPException(409, "Email already registered. Try logging in instead.")
        raise HTTPException(400, f"Signup failed: {msg}")

    user = res.user if hasattr(res, "user") else None
    if not user:
        raise HTTPException(500, "Signup did not return a user")

    # best-effort profile row (won't block signup if it fails)
    try:
        sb.table("profiles").upsert(
            {
                "id": user.id,
                "full_name": payload.full_name,
                "consent_given": payload.consent_given,
            }
        ).execute()
    except Exception as e:
        print(f"profile upsert warning: {e}")

    return {"ok": True, "user_id": user.id, "email": user.email}


@app.get("/api/items")
def list_items(suburb: Optional[str] = None):
    q = (
        sb.table("items")
        .select("*")
        .eq("still_available", True)
        .order("created_at", desc=True)
    )
    if suburb:
        q = q.ilike("suburb", f"%{suburb}%")
    return q.execute().data


@app.post("/api/items")
def create_item(payload: ItemIn, user=Depends(get_user)):
    row = payload.model_dump()
    row["owner_id"] = user.id
    res = sb.table("items").insert(row).execute()
    return res.data[0]


@app.post("/api/items/{item_id}/claim")
def claim_item(item_id: str, user=Depends(get_user)):
    res = (
        sb.table("items")
        .update(
            {
                "claimed_by": user.id,
                "still_available": False,
                "claimed_at": "now()",
            }
        )
        .eq("id", item_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Item not found")
    return res.data[0]


@app.post("/api/items/{item_id}/report")
def report_status(item_id: str, payload: ReportIn, user=Depends(get_user)):
    res = (
        sb.table("item_reports")
        .insert(
            {
                "item_id": item_id,
                "reporter_id": user.id,
                "status": payload.status,
            }
        )
        .execute()
    )
    return res.data[0]


@app.get("/api/items/{item_id}/reports")
def list_reports(item_id: str):
    return (
        sb.table("item_reports")
        .select("*")
        .eq("item_id", item_id)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
        .data
    )


@app.post("/api/profile")
def upsert_profile(payload: ProfileIn, user=Depends(get_user)):
    row = payload.model_dump(exclude_none=True)
    row["id"] = user.id
    res = sb.table("profiles").upsert(row).execute()
    return res.data[0]
