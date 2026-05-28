#!/usr/bin/env python3
"""Insert demonstration furniture items into FurniLoop's Supabase database.

Usage (from backend folder with venv active):
    source .venv/bin/activate && python seed_demo.py
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ── find an owner ──────────────────────────────────────────────
resp = sb.auth.admin.list_users()
users = resp if isinstance(resp, list) else getattr(resp, "users", None) or resp

if not users:
    print("No users found. Please register an account first (sign up via the frontend), then re-run this script.")
    sys.exit(1)

owner_id = users[0].id
print(f"Using owner  : {users[0].email}")

# ── demo items (12) ───────────────────────────────────────────
ITEMS = [
    {
        "name": "IKEA Billy Bookshelf",
        "condition": "Good",
        "suburb": "Carlton",
        "pickup_window": "Weekdays after 5pm",
        "item_size": "Large",
        "still_available": True,
        "remarks": "Birch veneer, 202cm tall. Two shelves have minor scratches.",
        "lat": -37.7986,
        "lng": 144.9700,
    },
    {
        "name": "Vintage Coffee Table",
        "condition": "Fair",
        "suburb": "Fitzroy",
        "pickup_window": "Anytime Saturday",
        "item_size": "Medium",
        "still_available": True,
        "remarks": "Solid hardwood, 1960s. Some water rings on top — great restoration project.",
        "lat": -37.7995,
        "lng": 144.9778,
    },
    {
        "name": "Dining Chairs (Set of 4)",
        "condition": "Good",
        "suburb": "Brunswick",
        "pickup_window": "Mon‑Fri 9am‑3pm",
        "item_size": "Medium",
        "still_available": True,
        "remarks": "Scandi-style light oak, barely used. Cushions included.",
        "lat": -37.7667,
        "lng": 144.9611,
    },
    {
        "name": "Tripod Floor Lamp",
        "condition": "Good",
        "suburb": "Richmond",
        "pickup_window": "Evenings after 6pm",
        "item_size": "Small",
        "still_available": True,
        "remarks": "Matte black metal with linen shade. Works perfectly.",
        "lat": -37.8197,
        "lng": 144.9938,
    },
    {
        "name": "King Bed Frame",
        "condition": "Fair",
        "suburb": "South Yarra",
        "pickup_window": "Sunday only",
        "item_size": "Large",
        "still_available": True,
        "remarks": "Dark wood, no slats included. A few scuffs on the headboard.",
        "lat": -37.8389,
        "lng": 144.9919,
    },
    {
        "name": "Corner Office Desk",
        "condition": "Good",
        "suburb": "Hawthorn",
        "pickup_window": "Weekday mornings",
        "item_size": "Large",
        "still_available": True,
        "remarks": "L-shaped, black melamine. Cable management tray underneath.",
        "lat": -37.8222,
        "lng": 145.0344,
    },
    {
        "name": "Wooden Wardrobe",
        "condition": "Good",
        "suburb": "St Kilda",
        "pickup_window": "Anytime weekend",
        "item_size": "Large",
        "still_available": True,
        "remarks": "Two-door, cedar-lined. 180×90×55 cm. Doors need slight realignment.",
        "lat": -37.8678,
        "lng": 144.9809,
    },
    {
        "name": "Outdoor Bench Seat",
        "condition": "Fair",
        "suburb": "Footscray",
        "pickup_window": "Flexible — message to arrange",
        "item_size": "Medium",
        "still_available": True,
        "remarks": "Treated pine, 1.5m long. Weathered but solid. Perfect for a front porch.",
        "lat": -37.7997,
        "lng": 144.9011,
    },
    {
        "name": "Tall Storage Cabinet",
        "condition": "Poor",
        "suburb": "Northcote",
        "pickup_window": "Thursday or Friday",
        "item_size": "Large",
        "still_available": True,
        "remarks": "White laminate, missing one shelf. Free to anyone who can collect.",
        "lat": -37.7700,
        "lng": 144.9999,
    },
    {
        "name": "Velvet Armchair",
        "condition": "Good",
        "suburb": "Prahran",
        "pickup_window": "After 4pm weekdays",
        "item_size": "Medium",
        "still_available": True,
        "remarks": "Emerald green, brass legs. Immaculate — moving overseas, must go.",
        "lat": -37.8508,
        "lng": 144.9908,
    },
    {
        "name": "Bar Stools (Pair)",
        "condition": "Good",
        "suburb": "Collingwood",
        "pickup_window": "Any evening",
        "item_size": "Medium",
        "still_available": True,
        "remarks": "Industrial style, black steel + wood seat. Adjustable height.",
        "lat": -37.8013,
        "lng": 144.9882,
    },
    {
        "name": "Kids Study Desk",
        "condition": "Good",
        "suburb": "Docklands",
        "pickup_window": "Weekends 10am‑2pm",
        "item_size": "Small",
        "still_available": True,
        "remarks": "White with pastel-blue drawer. 100×50 cm. Barely used.",
        "lat": -37.8149,
        "lng": 144.9469,
    },
]

# ── insert ─────────────────────────────────────────────────────
inserted = 0
for item in ITEMS:
    row = dict(item)
    row["owner_id"] = owner_id
    result = sb.table("items").insert(row).execute()
    inserted += len(result.data)
    summary = result.data[0]
    print(f"  ✓ {summary['name']} | {summary['condition']} | {summary['suburb']}")

print(f"\nInserted {inserted} items into public.items.")
