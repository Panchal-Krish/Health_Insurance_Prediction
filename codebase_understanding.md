# Health Insurance Prediction — Full Developer Codebase Walkthrough

> **Goal**: Understand every file, every pattern, and every design decision from a developer's perspective — not as a user story, but as engineering detail.

---

## 1. Technology Stack at a Glance

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19 + CRA (`react-scripts`) | SPA, component-based UI |
| Routing | `react-router-dom` v7 | Client-side routing |
| Icons | `lucide-react` | SVG icon library via JSX |
| HTTP | Native `fetch` (no axios in hot paths) | No extra dependency needed (axios installed but unused) |
| Backend | Flask (Python) | Lightweight REST API |
| Auth | PyJWT + `werkzeug` password hashing | Stateless JWT tokens |
| Database | MongoDB via `pymongo` | NoSQL, flexible schema |
| ML Model | `scikit-learn` ExtraTreesRegressor (pkl) | Loaded once at startup |
| Email | Brevo API (HTTP REST, no SDK) | Transactional email |
| Deploy | Docker → Docker Hub → IBM Code Engine | GitHub Actions CI/CD |

---

## 2. Project Root Layout

```
Health_Insurance_Prediction/
├── backend/          # Flask API server
├── frontend/         # React SPA
├── Dockerfile        # Multi-stage build
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
└── tmp_clean_db.py   # One-off DB cleanup utility
```

---

## 3. Backend Deep Dive

### 3.1 `backend/config.py` — Configuration Class

**Pattern**: Centralised config object loaded once from `.env`.

```python
class Config:
    SECRET_KEY          # Used to sign JWTs
    JWT_EXPIRATION_HOURS = 24
    MONGO_URI           # Full MongoDB connection string
    MODEL_PATH          # Path to the .pkl model file
    BREVO_API_KEY       # Third-party email API key
    FRONTEND_URL        # Used to build email verification/reset links
    SENDER_EMAIL        # From address on outbound emails
```

- `load_dotenv()` is called **twice** — first from the current dir, then from `../.env`. The second load is conditional: only triggers if `BREVO_API_KEY` is not found in the first pass. This handles both local dev (`.env` inside `backend/`) and Docker (`.env` at project root).
- `SENDER_EMAIL` has a hardcoded default of `'g16@ibmproject@gmail.com'` (note: this appears to be a malformed email with double `@`).
- All other modules import from `Config`, never from `os.getenv` directly.

---

### 3.2 `backend/database.py` — MongoDB Module-Level Singleton

**Pattern**: Module-level execution. When Python first `import database` runs, it executes the entire file — so the connection and index creation happen exactly once at startup.

```python
client              = MongoClient(Config.MONGO_URI)
db                  = client["insurance_data"]
users_collection    = db["customers"]
prediction_logs     = db["prediction_logs"]
tickets_collection  = db["support_tickets"]
contacts_collection = db["contacts"]
email_tokens_collection = db["email_tokens"]
```

**Collections and their purpose**:

| Collection | Purpose | Key Indexes |
|---|---|---|
| `customers` | Stores users (all roles) | `email` (unique), auth lookup |
| `prediction_logs` | Every prediction ever run | `user_id` (for per-user queries) |
| `support_tickets` | Help desk tickets | `user_id`, `status`, `assigned_to` |
| `contacts` | Contact form submissions | `created_at`, `status` |
| `email_tokens` | Verification + reset tokens | `expires_at` (TTL index → MongoDB auto-deletes), `email` |

> **Key insight**: The `email_tokens_collection` index uses `expireAfterSeconds=0` — MongoDB reads the `expires_at` field's datetime value and auto-deletes the document when that time passes. This is how tokens expire without a cron job.

**Failure behaviour**: If `MONGO_URI` is not set, a `RuntimeError` is raised immediately — before even attempting a connection. If the environment variable exists but the connection fails, `sys.exit(1)` kills the process. There is no graceful retry — it is intentional: the app is unusable without a database.

---

### 3.3 `backend/ml_service.py` — ML Model Module

**Pattern**: Module-level model load, same singleton pattern as `database.py`.

```python
ml_model = joblib.load(Config.MODEL_PATH)  # Loads insurance_extra_trees_model.pkl
```

**The model** is an `ExtraTreesRegressor` trained on the classic US health insurance dataset. It predicts on **log-normalized premiums** (training target was `log(premium + 1)`), so after prediction you see:

```python
log_pred = ml_model.predict(features)[0]
return round(float(np.expm1(log_pred)), 2)  # expm1 = e^x - 1, reverses the log transform
```

**Feature Engineering** (done at inference time, not stored):
- Raw inputs: `age`, `sex (0/1)`, `bmi`, `children`, `smoker (0/1)`, `region`
- Region is **one-hot encoded**: northeast is the baseline (all 3 dummies = 0), northwest/southeast/southwest get a `1` in their column
- Interaction terms: `age_bmi`, `age_smoker`, `bmi_smoker`, `children_smoker`
- Polynomial: `bmi_sq`, `age_sq`

**Fallback formula**: If the `.pkl` file fails to load (e.g., missing in development), a hardcoded linear formula runs instead. This lets the dev environment function without the 49MB model file.

---

### 3.4 `backend/email_service.py` — Email Sender

A single function `send_transactional_email(to_email, subject, html_content, to_name)`.

- Calls **Brevo v3 REST API** directly via `requests.post()` — no SDK installed
- Auth is the `api-key` header (not Bearer)
- Returns `True`/`False` — callers do not crash if email fails
- Accepts status codes 200, 201, or 202 as success (Brevo returns 201 on creation)

---

### 3.5 `backend/utils.py` — JWT Auth Utilities

Three things live here:

#### `generate_token(user_id, email, role)`
- Creates a JWT payload with `user_id`, `email`, `role`, `exp` (expiry), `iat` (issued at)
- Signs with `HS256` algorithm using `SECRET_KEY`
- Returns the encoded token string

#### `decode_token(token)`
- Verifies signature and expiry
- Returns the payload dict, or `None` if invalid/expired

#### `token_required` (decorator)
- Expects the HTTP header: `Authorization: Bearer <token>`
- Extracts the token, decodes it, and injects the payload into `request.current_user`
- Returns 401 if missing or invalid

```python
# Usage pattern — applied on any protected route:
@predict_bp.route("/predict-premium", methods=["POST"])
@token_required
def predict_premium():
    user_id = request.current_user.get('user_id')  # ← set by decorator
```

#### `role_required(allowed_roles)` (decorator factory)
- Must be applied **after** `@token_required` (decorators run bottom-to-top in Python)
- Checks `request.current_user['role']` against the whitelist
- Returns 403 if not allowed

```python
# Double-decorator pattern for admin-only routes:
@admin_bp.route("/admin/all-tickets")
@token_required        # runs second (inner)
@role_required(['admin'])  # runs first (outer) — checks AFTER token is set
```

> **Correct stacking order**: Because decorators wrap from bottom to top, `token_required` runs first (setting `request.current_user`), *then* `role_required` reads it.

---

### 3.6 `backend/app.py` — Application Factory

**Pattern**: Flask Application Factory (`create_app()` function).

```python
app = Flask(__name__, static_folder=None)  # ← static_folder=None is crucial
```

Why `static_folder=None`? If Flask's default `/static/` endpoint were active, a request for `static/js/main.abc123.js` would be intercepted by Flask's built-in static file handler *before* reaching the SPA catch-all. Disabling it means all non-API paths fall through to the custom catch-all.

**CORS** — allows all origins (`"*"`):
```python
CORS(app, resources={r"/*": {"origins": "*", ...}})
```
This is safe because in production, both the frontend and backend share the same origin (same Docker container). In development, it permits the React dev server at `localhost:3000` to call the API at `localhost:5000`.

**Blueprint Registration** — all at `/api` prefix:
```
/api/signup, /api/login, /api/verify-email/<token>  → auth_bp
/api/predict-premium, /api/my-predictions, /api/premium-history → predict_bp
/api/contact                                         → contact_bp
/api/create-ticket, /api/my-tickets                 → ticket_bp
/api/admin/*                                         → admin_bp
/api/manager/*                                       → manager_bp
/api/public-stats                                    → stats_bp
/api/health                                          → direct on app (not a blueprint)
```

**The SPA Catch-All** (the most important piece for production):
```python
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api'):      # 1. Guard: real API 404s
        return jsonify(...), 404
    full_path = os.path.join(FRONTEND_BUILD, path)
    if path and os.path.isfile(full_path):
        return send_from_directory(FRONTEND_BUILD, path)   # 2. Serve JS/CSS/images
    return send_from_directory(FRONTEND_BUILD, 'index.html')  # 3. Fall back to React
```

This is what lets a user refresh on `/dashboard` — Flask can't find a file called `dashboard`, so it returns `index.html`, and React Router handles the URL client-side.

---

### 3.7 Route Blueprints

#### `auth_routes.py`

| Endpoint | Method | Auth | What it does |
|---|---|---|---|
| `/api/signup` | POST | None | Creates user (`is_verified=False`), generates UUID token, inserts into `email_tokens`, sends verification email |
| `/api/login` | POST | None | Finds user by email, checks `is_deleted != True`, verifies `werkzeug` password hash, checks `is_verified`, returns JWT |
| `/api/verify-email/<token>` | GET | None | Looks up token in `email_tokens` where `type="verify"`, sets `is_verified=True`, deletes token |
| `/api/request-password-reset` | POST | None | Always returns 200 (prevents email enumeration), generates reset token, sends link |
| `/api/reset-password` | POST | None | Validates reset token (`type="reset"`), hashes new password, deletes token |

**Security note on signup**: `generate_password_hash` uses Werkzeug's default (PBKDF2-HMAC-SHA256 with a salt). The plain password never touches the database.

**Security note on forgot password**: Always returns the same message whether the email exists or not — prevents an attacker from discovering which emails are registered.

---

#### `predict_routes.py`

| Endpoint | Method | Auth | What it does |
|---|---|---|---|
| `/api/predict-premium` | POST | JWT | Validates inputs server-side, calls `predict_premium_ml()`, saves log to `prediction_logs`, returns `predicted_premium` |
| `/api/premium-history` | GET | JWT | Returns the **single most recent** prediction for the user |
| `/api/my-predictions` | GET | JWT | Returns last 20 predictions, sorted newest-first |

**Input encoding** (frontend sends strings, backend coerces):
- `sex`: `"male"` → `1`, `"female"` → `0`
- `smoker`: `true` → `1`, `false` → `0`
- Region strings are passed as-is

**What gets stored** in `prediction_logs`:
```python
{
  user_id, email, prediction_for ("self"/"other"),
  beneficiary_name, age, gender ("male"/"female"),
  bmi, children, smoker (bool), region,
  predicted_premium (float, USD), last_checked_at (UTC datetime)
}
```

---

#### `ticket_routes.py`

| Endpoint | Method | Auth | What it does |
|---|---|---|---|
| `/api/create-ticket` | POST | JWT | Creates support ticket with unique ID (`TICK-` + 8 UUID chars uppercased) |
| `/api/my-tickets` | GET | JWT | Returns all tickets for the logged-in user |

Ticket structure: `ticket_id`, `user_id`, `email`, `subject`, `description`, `category`, `priority`, `status`, `assigned_to`, `assigned_role`, `admin_response`, `manager_response`, `created_at`, `updated_at`.

Valid categories: `Model Issue`, `Prediction Error`, `Technical Problem`, `Account Problem`, `Other`
Valid priorities: `Low`, `Medium`, `High`
Initial status: always `"Open"`

---

#### `admin_routes.py`

All routes require `@role_required(['admin'])`. Key routes:

| Endpoint | What it does |
|---|---|
| `GET /api/admin/all-tickets` | Returns all tickets system-wide |
| `POST /api/admin/assign-ticket` | Sets `assigned_to` (email) + `assigned_role` on a ticket |
| `PUT /api/admin/update-ticket/<ticket_id>` | Updates `status` and/or `admin_response` (min 10 chars) |
| `POST /api/admin/create-manager` | Creates a user with `role="manager"`, `is_verified=True` (no email verification needed) |
| `GET /api/admin/managers` | Lists all managers (email + fullName only) |
| `GET /api/contacts` | Accessible to both admin + manager — lists contact messages |
| `PUT /api/contacts/<id>/read` | Marks a contact message as `status="read"` |

> **Note**: These routes under `admin_routes.py` are registered via the `admin_bp`. Since the blueprint is registered with a `/api` prefix in `app.py`, the routes are defined as `/contacts` and `/contacts/<id>/read` to resolve correctly to `/api/contacts`.

---

#### `manager_routes.py`

| Endpoint | Auth | What it does |
|---|---|---|
| `GET /api/manager/my-tickets` | JWT + manager/admin | Returns tickets `assigned_to` the current manager's email. Admin can optionally pass `?email=<other>` |
| `PUT /api/manager/update-ticket/<ticket_id>` | JWT + manager/admin | Updates `status` and/or `manager_response` |

**Permission logic**: A manager can only see tickets assigned to themselves. An admin can query any manager's tickets by passing the `email` query param.

---

#### `contact_routes.py`

Single endpoint `POST /api/contact` — **no auth required**. Validates name (3-100 chars), subject (5-100), message (20-1000), then inserts with `status="unread"`.

---

#### `stats_routes.py`

Single endpoint `GET /api/public-stats` — **no auth required**. Returns:
- `prediction_count`: raw count of all documents in `prediction_logs`
- `prediction_count_display`: rounded down to nearest 10, formatted as `"30+"` 
- `model_accuracy`: hardcoded `89.71` (ExtraTreesRegressor R² from test set)

---

## 4. Frontend Deep Dive

### 4.1 Entry Point Chain

```
public/index.html
    └── src/index.js          # ReactDOM.createRoot, wraps App in AuthProvider
            └── src/App.js    # BrowserRouter, all Routes defined
```

**`index.js`** — This is where the React tree is mounted. Two key wrappers:
1. `<React.StrictMode>` — runs lifecycle methods twice in dev to catch side effects
2. `<AuthProvider>` — makes auth state available to the entire tree via context

---

### 4.2 `src/utils/auth.js` — The Auth Brain

This is the **lowest layer** of authentication. Every auth operation goes through here.

**Storage strategy** (the "remember me" logic):

```
rememberMe = true  → localStorage   (persists across browser restarts)
rememberMe = false → sessionStorage (cleared when tab closes)
```

Both are checked on every read — `getToken()` checks `localStorage` first, then falls back to `sessionStorage`.

**Storage keys** (single source of truth object):
```js
TOKEN, EMAIL, ROLE, FULL_NAME, IS_LOGGED_IN
```

**`isTokenExpired(token)`**: Decodes the JWT payload (middle section, base64) *client-side* without a library. It reads `payload.exp * 1000` (JWT exp is in seconds, JS uses milliseconds) and compares to `Date.now()`.

**`fetchWithAuth(url, options)`**: A wrapper around `fetch()` that:
1. Checks token expiry **before** the request — if expired, clears storage + redirects to `/signin`
2. Attaches `Authorization: Bearer <token>` header automatically
3. On 401 response — clears storage + redirects (handles server-side token invalidation)

**Event system**: Uses a custom `'authChange'` browser event via `window.dispatchEvent(new Event('authChange'))`. This lets the `AuthContext` update React state when auth changes happen outside of React (e.g., `logout()` called from a non-React utility).

---

### 4.3 `src/context/AuthContext.jsx` — The React Auth Layer

**Pattern**: React Context + `useCallback` for stable references.

```jsx
const [user, setUser] = useState(() => getCurrentUser());  // lazy initializer
```

The lazy initializer `() => getCurrentUser()` reads from storage exactly once when the context mounts — this avoids unnecessary re-reads on every render.

**`login(token, email, role, fullName, rememberMe)`**:
1. Calls `saveAuthData()` (writes to storage)
2. Calls `setUser(getCurrentUser())` (re-reads from storage → updates React state)

**`logout()`**:
1. Calls `authLogout()` (clears storage + dispatches `authChange` event)
2. Directly sets user to a logged-out object (doesn't need to re-read storage)

**Cross-tab sync**: The `useEffect` listens for both:
- `window storage` event — fires when localStorage changes in *another* tab
- `window authChange` event — fires when the custom event is dispatched in the *current* tab

The value object exposed by context:
```js
{ user, isLoggedIn, role, fullName, login, logout, refreshAuth }
```

**`useAuth()` hook**: Just a `useContext` call with a guard error if used outside `<AuthProvider>`.

---

### 4.4 `src/components/ProtectedRoute.jsx` — Three Route Guards

Three guard components used in `App.js`:

| Component | Condition | Redirect |
|---|---|---|
| `<ProtectedRoute>` | Must be logged in | → `/signin` if not |
| `<RoleBasedRoute allowedRoles={[...]}>` | Must be logged in AND have correct role | → `/signin` if not logged in; → role-appropriate dashboard if wrong role |
| `<GuestRoute>` | Must NOT be logged in | → dashboard for their role if already logged in |

**RoleBasedRoute redirect logic**:
```js
if (!allowedRoles.includes(role)) {
    if (role === 'admin')   → /admin
    if (role === 'manager') → /manager
    else                    → /dashboard        // regular user
}
```

---

### 4.5 `src/App.js` — Route Map

Every route defined in one place. You can read the entire access control matrix here:

```
/                           Public            Home
/contact                    Public            Contact form
/verify-email/:token        Public            Email verification handler
/forgot-password            Public            Request reset link
/reset-password/:token      Public            Set new password

/signin                     GuestRoute        → redirects logged-in users away
/signup                     GuestRoute        → redirects logged-in users away

/dashboard                  ProtectedRoute    Regular users only (by convention)
/profile                    ProtectedRoute    Any logged-in user
/predict                    ProtectedRoute    Any logged-in user
/helpdesk                   ProtectedRoute    Any logged-in user

/admin                      RoleBasedRoute('admin')    Admin panel
/manager                    RoleBasedRoute('manager')  Manager dashboard

/about, /howitworks         Public (no guard)
/privacy-policy             Placeholder (no content yet)
/terms-of-service           Placeholder (no content yet)
/*                          404 placeholder
```

---

### 4.6 `src/components/Header.jsx`

Reads `{ isLoggedIn, role, logout }` from `useAuth()` — single source of truth, no local state for auth.

**Nav rendering logic**:
- If guest: shows Home, Contact Us, How it Works, About, Sign In/Sign Up
- If `role === 'user'`: shows Dashboard, Help Desk (not Contact), How it Works, About, Profile, Logout
- If `role === 'admin'`: shows Admin Panel, Profile, Logout *(no public nav links)*
- If `role === 'manager'`: shows Manager Panel, Profile, Logout *(no public nav links)*

Mobile menu uses a boolean `mobileMenuOpen` state + an overlay div that closes the menu on click.

---

### 4.7 Pages — Auth Flow Pages

#### `SignUp.jsx`
- Local state: `formData`, `agreeTerms`, `loading`, `error`, `success`
- `getPasswordStrength()`: Pure function, returns a `{strength: 0-4, text, color}` object — drives the visual progress bar
- On success: sets `success=true`, **does not** redirect automatically — user must see the "check your email" message
- Calls: `POST /api/signup`

#### `SignIn.jsx`
- On success: calls `login()` from context (not directly `saveAuthData`), then navigates based on `data.role`
- `API_URL = process.env.REACT_APP_API_URL || '/api'` — this pattern appears in **every page**. In production (same-origin deployment), `REACT_APP_API_URL` is undefined, so it uses `/api` (relative path). In local dev, you'd set it to `http://localhost:5000/api`.

#### `VerifyEmail.jsx`
- Uses `useRef(hasCalled)` with `if (hasCalled.current) return` to prevent **React Strict Mode's double `useEffect` call** from verifying the token twice
- State machine: `status` = `'verifying'` | `'success'` | `'error'`
- Calls: `GET /api/verify-email/:token`

#### `ForgotPassword.jsx`
- Calls: `POST /api/request-password-reset`
- Always shows success message (matches backend anti-enumeration behavior)

#### `ResetPassword.jsx`
- Reads `token` from URL params via `useParams()`
- On success: `setTimeout(() => navigate('/signin'), 3000)` — auto-redirect after 3 seconds
- Calls: `POST /api/reset-password`

#### `Profile.jsx`
- Read-only display of `user.fullName`, `user.email`, `user.role` from context
- No API calls — data comes entirely from what was stored at login (localStorage/sessionStorage)
- "Change Password" button simply navigates to `/forgot-password`

---

### 4.8 Pages — Core App Pages

#### `Predict.jsx`
- `form` state object mirrors the API payload shape
- Two-layer validation: client-side `validateForm()` runs first (per-field error state), then the API call can still return an error (caught as `globalError`)
- On success: **immediately navigates to `/dashboard`** — user sees the result there, not on this page
- Uses `fetchWithAuth` (not plain `fetch`) because the endpoint is JWT-protected

**Gender/sex encoding** (at submit time, not in form state):
```js
sex: form.gender === "male" ? 1 : 0
smoker: form.smoker ? 1 : 0
```

#### `Dashboard.jsx`
- On mount: calls `GET /api/my-predictions` — returns up to 20 records sorted newest-first
- Three render states: loading spinner, error block, or data view
- Empty state: shows "no predictions yet" CTA
- Data state: shows latest prediction as "hero card", stats grid from latest, and full paginated timeline
- Pagination: **client-side** (no API pagination) — 5 records per page, sliced from the full array
- Dates formatted with `en-IN` locale + `Asia/Kolkata` timezone (hardcoded)

---

### 4.9 Pages — Admin & Management

#### `AdminPanel.jsx` (30KB — the largest file)
Multi-tab interface with tabs like: Tickets, Managers, Contacts, etc.
- Fetches all tickets at mount
- Can assign tickets (sets `assigned_to` + `assigned_role`)
- Can create managers (`POST /api/admin/create-manager`)
- Can update ticket status and add admin responses

#### `ManagerDashboard.jsx` (26KB)
- Shows only tickets assigned to the logged-in manager
- Can update status and add manager responses

#### `HelpDesk.jsx`
- Lets regular users create and view their own support tickets
- Calls `POST /api/create-ticket` and `GET /api/my-tickets`

---

## 5. The ML Prediction Pipeline (End-to-End)

```
User fills form (Predict.jsx)
    ↓
Client validation (validateForm)
    ↓
fetchWithAuth POST /api/predict-premium
    ↓ (JWT verified by @token_required)
predict_routes.py: server-side validation
    ↓
predict_premium_ml(age, sex, bmi, children, smoker, region)
    ↓
Feature engineering (one-hot region, interaction terms)
    ↓
ml_model.predict(features)[0]  → log-space prediction
    ↓
np.expm1(log_pred)  → actual dollar amount
    ↓
Store in prediction_logs
    ↓
Return { predicted_premium: X }
    ↓
Frontend navigates to /dashboard
    ↓
Dashboard fetches /api/my-predictions → shows result
```

---

## 6. Auth Token Lifecycle

```
Signup → email sent (token in DB, expires 24h via TTL index)
    ↓
User clicks link → GET /api/verify-email/:token
    ↓
is_verified = True on user doc, token deleted from DB
    ↓
User logs in → JWT generated (24h expiry, signed HS256)
    ↓
JWT stored in localStorage or sessionStorage
    ↓
Each API call → fetchWithAuth adds Bearer header
    ↓
Backend @token_required decodes + validates JWT
    ↓
On expiry: client detects via isTokenExpired() → clears storage → /signin
    ↓
On logout: storage cleared, authChange event fired, context updated
```

---

## 7. Deployment Pipeline

### Dockerfile (Multi-Stage Build)

**Stage 1** (`frontend_build`): Node 18 Alpine  
→ `npm install` + `npm run build` → outputs `frontend/build/`

**Stage 2** (final image): Python 3.11 slim  
→ Installs `libgomp1` (required by XGBoost/some tree models)  
→ `pip install -r requirements.txt`  
→ Copies backend source  
→ Copies the React build from Stage 1 to `../frontend/build` (relative to `/app/backend`)  
→ Exposes port 5000, runs `python app.py`

The result: **one container** serves both the API and the React static files.

### GitHub Actions (`deploy.yml`)

Trigger: push to `main` branch (or manual via `workflow_dispatch`)

Steps:
1. Checkout code
2. Login to Docker Hub (credentials from GitHub Secrets)
3. Build + push image as `dhananjay0901/health-insurance-prediction:latest`
4. Install IBM Cloud CLI + Code Engine plugin
5. `ibmcloud login` with IAM API key, target `eu-gb` region
6. Select Code Engine project by ID
7. `ibmcloud ce application update` — rolls the running application to the new image

---

## 8. Key Patterns Summary

| Pattern | Where | Detail |
|---|---|---|
| Module-level singleton | `database.py`, `ml_service.py` | Python imports are cached — the code runs once |
| App Factory | `app.py → create_app()` | Allows multiple instances in testing |
| Blueprint + prefix | All routes | Clean `/api/...` namespace separation |
| SPA catch-all | `app.py serve()` | Flask serves React for any non-API, non-file path |
| TTL index | `email_tokens_collection` | MongoDB auto-deletes expired tokens |
| Decorator stacking | `@token_required` + `@role_required` | Order matters — token first, role check second |
| `rememberMe` in storage | `auth.js saveAuthData()` | localStorage vs sessionStorage based on user choice |
| Custom DOM event | `auth.js` → `authChange` | Bridges non-React code to React state |
| LazyInit state | `AuthContext useState(() => ...)` | Runs storage read once on mount |
| StrictMode double-call guard | `VerifyEmail.jsx hasCalled.current` | Prevents double token consumption in dev |
| Relative API URL | All pages `process.env.REACT_APP_API_URL \|\| '/api'` | Same-origin in prod, override in dev |
| Anti-enumeration | `request-password-reset` | Always 200 regardless of email existence |
| Wildcard CORS | `app.py CORS(origins="*")` | Safe: same-origin in production; permissive for dev |

---

## 9. File-by-File Quick Reference

### Backend
| File | Role |
|---|---|
| `app.py` | App factory, CORS, blueprint registration, SPA catch-all |
| `config.py` | All env vars, single Config class |
| `database.py` | MongoDB connection, all 5 collection references, indexes |
| `ml_service.py` | Model load, prediction function, fallback formula |
| `email_service.py` | Brevo HTTP email sender |
| `utils.py` | JWT generate/decode, `@token_required`, `@role_required` |
| `routes/auth_routes.py` | Signup, login, verify email, reset password |
| `routes/predict_routes.py` | Run prediction, get history, get all predictions |
| `routes/ticket_routes.py` | Create ticket, get user's tickets |
| `routes/admin_routes.py` | Admin CRUD on tickets + managers + contacts |
| `routes/manager_routes.py` | Manager view + update assigned tickets |
| `routes/contact_routes.py` | Public contact form submission |
| `routes/stats_routes.py` | Public stats (prediction count + model accuracy) |

### Frontend
| File | Role |
|---|---|
| `index.js` | App mount, `AuthProvider` wrapper |
| `App.js` | All route definitions, route guards applied |
| `context/AuthContext.jsx` | React auth state, `login()`, `logout()`, cross-tab sync |
| `utils/auth.js` | Storage, token decode, `fetchWithAuth`, events |
| `components/ProtectedRoute.jsx` | Three guard components |
| `components/Header.jsx` | Role-aware nav, mobile menu |
| `components/Footer.jsx` | Static footer |
| `pages/SignIn.jsx` | Login form, role-based redirect after login |
| `pages/SignUp.jsx` | Registration, password strength meter |
| `pages/VerifyEmail.jsx` | Token verification page (strict mode safe) |
| `pages/ForgotPassword.jsx` | Request reset link |
| `pages/ResetPassword.jsx` | Set new password via URL token |
| `pages/Predict.jsx` | Prediction form, two-layer validation |
| `pages/Dashboard.jsx` | Prediction history, paginated timeline |
| `pages/Profile.jsx` | Read-only user info from context |
| `pages/HelpDesk.jsx` | Create + view support tickets |
| `pages/AdminPanel.jsx` | Full admin interface |
| `pages/ManagerDashboard.jsx` | Manager ticket interface |
| `pages/Contact.jsx` | Public contact form |
| `pages/Home.jsx` | Landing page |
| `pages/About.jsx` | About page |
| `pages/Howitworks.jsx` | How it works page |
