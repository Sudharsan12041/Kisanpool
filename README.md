# KisanPool

**Sell together. Earn more.**

Built for the Smart India Hackathon. Problem statement: *Multiple intermediaries reduce farmers' earnings and increase consumer prices.*

## The idea

Middlemen exist because one small farmer cannot do three jobs: gather a truckload, set a fair price, and guarantee payment. KisanPool replaces those jobs with software.

| Middleman's job | KisanPool's replacement |
|---|---|
| Gather small lots into a truckload | **Pooling engine**: groups farmers with the same crop, within 15 km, with harvest dates within 3 days, into one 2000 kg lot |
| Set the price | Suggested price range per crop (price model: in progress) |
| Guarantee payment and quality | **Order flow with an OTP**: a buyer can only order a full lot, and delivery is confirmed with a code the buyer gives the agent (escrow is simulated, grading model: in progress) |

## What works today

- Farmer lists produce (village dropdown, voice input for the village) and joins a lot automatically
- Pooling: lots fill up and become READY at 2000 kg
- Buyer shelf: only READY lots can be ordered; ordering creates a real order with a 4-digit OTP
- Delivery agent confirms delivery with the OTP, and the order status moves forward
- Order status flow that refuses skipped or backward steps
- English / Hindi / Tamil labels, offline banner, error messages everywhere
- Role-based responsive workspaces, lot map, pooling details and order tracking
- Backend-configured suggested prices shown separately from live market data
- Demo data script: 10 farmers, 3 buyers, 3 lots

## Still placeholder

| Part | Today | Planned |
|---|---|---|
| Quality grading | Not connected | Photo model and `POST /grade` endpoint |
| Price suggestion | Fixed range per crop | Mandi price forecast model |
| Escrow and payout | Order status only; payment hold is simulated | Real escrow and payout split |
| Accounts and notifications | Role selection only; no personal accounts or event feed | Authentication, profiles and notification APIs |

## Run it locally

Needs Python 3 and Node.js.

### 1. Backend

From the project folder (first time):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
python -m pip install -r requirements.txt
python seed_demo.py
python -m uvicorn main:app --reload
```

The API runs at http://localhost:8000. Its interactive test page is at http://localhost:8000/docs.

If PowerShell blocks the activation script, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned` first.

Next time, only activate the environment and run the last command:

```powershell
.\.venv\Scripts\Activate.ps1
cd backend
python -m uvicorn main:app --reload
```

### 2. Frontend (in a second terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### Reset the demo data

```powershell
cd backend
python seed_demo.py
```

This **erases everything** and reloads the demo data. Run it before every demo.

## Demo walkthrough (about 3 minutes)

Start from fresh demo data.

| # | Who | Do this | You should see |
|---|---|---|---|
| 1 | Buyer | Open **Buyer** | Onion lot "Ready to order". Tomato lot "Needs 300 kg more" with a disabled button |
| 2 | Farmer | Open **Farmer**: Tomato, 300 kg, Peelamedu, harvest date 29-10-2026, Submit | "Your produce joined lot #1!" and "It is full and ready for buyers" |
| 3 | Buyer | **Refresh**, then **Order Lot** on Tomato | Order page with a 4-digit OTP |
| 4 | Agent | **Open delivery agent screen**, enter the OTP, **Verify OTP & confirm delivery** | "Delivery verified"; quality grading remains unavailable |
| 5 | Buyer | **Refresh status** on the order page | OTP hidden and "Delivered" highlighted. Grading and payment remain pending until backend services exist |

The demo data uses fixed dates (see `backend/seed_demo.py`). A farmer's harvest date must be within 3 days of the lot's date (25 to 31 Oct 2026 for the tomato lot), or a new lot is created.

## How an order moves

`ESCROW_HELD` → `PICKUP_SCHEDULED` → `DELIVERED` → `GRADED` → `PAYMENT_RELEASED`

The backend refuses skipped or backward moves. A lot goes `OPEN` → `READY` (2000 kg reached) → `ORDERED`.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/lots` | All lots with totals, status, suggested price, center coordinates and harvest date |
| GET | `/price?crop=Tomato` | Fixed suggested range for a supported crop; no history or forecast |
| POST | `/listings` | A farmer adds produce; it joins or creates a lot |
| POST | `/orders` | A buyer orders a READY lot; returns the OTP |
| POST | `/orders/{id}/confirm` | The agent confirms delivery with the OTP |
| GET | `/orders/{id}` | Order status, OTP (demo only), and available lot summary |

## Project structure

```
backend/
  main.py          API routes and input checks
  pooling.py       the lot-forming logic
  pricing.py       fixed suggested ranges shared by API responses
  orders.py        orders, OTP and the status flow
  database.py      SQLite tables
  seed_demo.py     reset and load demo data
frontend/src/
  api.js           every call to the backend
  pages/           role dashboards, map, prices, grading and account screens
  components/      shared app shell, UI components and interactive map
  i18n.js          English, Hindi and Tamil labels
```

## Known limitations

- No login yet. A farmer's lot is remembered through the page navigation, and `GET /orders/{id}` returns the OTP so the buyer screen can show it. A real version would restrict it to the buyer.
- Wrong OTP guesses are not limited yet.
- Payments are simulated: there is no real money movement.
- Only 8 villages are known, because the pooling distance needs their coordinates.
- The newest messages are English only.
- Pages update when you press Refresh, not live.
- Lot coordinates are available for the pooled-lot map; individual farmer coordinates, delivery destinations and agent assignments are not exposed.
- The frontend requests `POST /grade`, but no grading route exists yet. The interface does not show a fabricated grade.
- Historical market prices, price forecasts, account/profile APIs and notifications are not implemented.

## Team

Add your team name and members here.