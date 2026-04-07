# 🏥 Health Insurance Premium Prediction — Full Project Documentation

> **Project Title:** Health Insurance Premium Prediction  
> **Type:** Full-Stack Web Application (React + Flask + MongoDB + ML)  
> **University:** Ganpat University, Institute of Computer Technology (ICT), Gujarat  
> **Course:** Semester 8 — IBM Industry Project  
> **Team:** Dhananjay, Shreyas & Krish  
> **Repository:** [github.com/Panchal-Krish/Health_Insurance_Prediction](https://github.com/Panchal-Krish/Health_Insurance_Prediction)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & System Design](#2-architecture--system-design)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Backend — In Detail](#5-backend--in-detail)
   - 5.1 [Entry Point (`app.py`)](#51-entry-point-apppy)
   - 5.2 [Configuration (`config.py`)](#52-configuration-configpy)
   - 5.3 [Database Layer (`database.py`)](#53-database-layer-databasepy)
   - 5.4 [Machine Learning Service (`ml_service.py`)](#54-machine-learning-service-ml_servicepy)
   - 5.5 [Authentication & Authorization (`utils.py`)](#55-authentication--authorization-utilspy)
   - 5.6 [API Routes — Complete Reference](#56-api-routes--complete-reference)
6. [Database Schema (MongoDB)](#6-database-schema-mongodb)
7. [Machine Learning Model — Deep Dive](#7-machine-learning-model--deep-dive)
8. [Frontend — In Detail](#8-frontend--in-detail)
   - 8.1 [Application Entry & Routing (`App.js`)](#81-application-entry--routing-appjs)
   - 8.2 [Authentication System (Context + Utils)](#82-authentication-system-context--utils)
   - 8.3 [Route Protection (`ProtectedRoute.jsx`)](#83-route-protection-protectedroutejsx)
   - 8.4 [Shared Components (Header, Footer)](#84-shared-components-header-footer)
   - 8.5 [Pages — Detailed Breakdown](#85-pages--detailed-breakdown)
9. [User Roles & Access Control](#9-user-roles--access-control)
10. [Authentication Flow — End to End](#10-authentication-flow--end-to-end)
11. [Prediction Flow — End to End](#11-prediction-flow--end-to-end)
12. [Support Ticket Lifecycle](#12-support-ticket-lifecycle)
13. [Environment Variables](#13-environment-variables)
14. [Setup & Installation Guide](#14-setup--installation-guide)
15. [Running the Application](#15-running-the-application)
16. [API Reference (Quick Table)](#16-api-reference-quick-table)
17. [Security Considerations](#17-security-considerations)
18. [Known Limitations & Future Scope](#18-known-limitations--future-scope)

---

## 1. Project Overview

This project is a **full-stack web application** that predicts health insurance premiums using a trained **ExtraTrees (Extremely Randomized Trees) machine learning model**. Users input their personal health profile — age, gender, BMI, number of dependents, smoking status, and region — and the application returns an estimated annual insurance premium in US dollars.

### Key Features

| Feature | Description |
|---|---|
| **ML-Powered Predictions** | Uses an ExtraTreesRegressor model (800 estimators) trained on real insurance data with an R² of 81.2% |
| **User Accounts** | Full signup/login system with JWT-based authentication and "Remember Me" persistence |
| **Role-Based Access** | Three distinct roles — `user`, `manager`, `admin` — each with their own dashboard and permissions |
| **Prediction History** | Every prediction is logged and displayed on the user's dashboard with pagination |
| **Self/Other Predictions** | Users can predict premiums for themselves or for a named beneficiary |
| **Support Ticket System** | Users can raise categorized, prioritized support tickets; admins assign them to managers |
| **Contact Form** | Guest (unauthenticated) users can submit contact messages; staff can view and mark them as read |
| **Admin Panel** | Full ticket management, manager creation, contact message review, and filtering/pagination |
| **Manager Dashboard** | View assigned tickets, update status, respond, mark contact messages as read |
| **Responsive Design** | Mobile-first with a hamburger menu, glassmorphism cards, animated orbs, and dark theme |
| **Fallback Formula** | If the ML model fails to load, a hand-crafted formula approximates the premium |

---

## 2. Architecture & System Design

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│                                                                   │
│   React 19  ·  React Router 7  ·  Lucide Icons  ·  Vanilla CSS   │
│                                                                   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│
│   │  Home    │ │ SignIn/  │ │Dashboard │ │ Admin / Manager      ││
│   │  About   │ │ SignUp   │ │ Predict  │ │ HelpDesk / Contact   ││
│   └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘│
│        │              │             │               │             │
│        └──────────────┴─────────────┴───────────────┘             │
│                          │  HTTP + JWT                            │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                       BACKEND (Flask API)                         │
│                                                                   │
│   Flask 3.1  ·  Flask-CORS  ·  PyJWT  ·  Werkzeug  ·  Joblib    │
│                                                                   │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │
│   │ Auth       │ │ Predict    │ │ Tickets    │ │ Admin /      │  │
│   │ Routes     │ │ Routes     │ │ Routes     │ │ Manager /    │  │
│   │ (signup/   │ │ (predict,  │ │ (create,   │ │ Stats /      │  │
│   │  login)    │ │  history)  │ │  my-tickets│ │ Contact      │  │
│   └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │
│        │              │               │               │           │
│        └──────────────┴───────────────┴───────────────┘           │
│                          │                                        │
│                    ┌─────┴──────┐                                  │
│                    │ ML Service │  ← ExtraTrees model (.pkl)      │
│                    └────────────┘                                  │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                             │
│                                                                   │
│   Database: insurance_data                                        │
│                                                                   │
│   Collections:                                                    │
│     • customers         (user accounts)                           │
│     • prediction_logs   (prediction history)                      │
│     • support_tickets   (help desk tickets)                       │
│     • contacts          (guest contact messages)                  │
└───────────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Frontend → Backend**: All API calls use `fetch()` with JSON payloads. Authenticated requests include a `Bearer <JWT>` token in the `Authorization` header.
2. **Backend → Database**: PyMongo connects directly to MongoDB. Collections are initialized with indexes on startup.
3. **Backend → ML Model**: The `.pkl` model file is loaded once at server startup via `joblib.load()`.

---

## 3. Technology Stack

### Backend

| Component | Technology | Version |
|---|---|---|
| Web Framework | Flask | 3.1.3 |
| CORS | flask-cors | 6.0.2 |
| Database Driver | pymongo | 4.16.0 |
| Authentication | PyJWT | 2.12.1 |
| Password Hashing | Werkzeug (built-in) | 3.1.6 |
| ML Model Loading | joblib | 1.5.3 |
| ML Libraries | scikit-learn, pandas, numpy | 1.8.0, 2.3.3, 2.4.1 |
| Env Variables | python-dotenv | 1.2.2 |
| Algorithm | ExtraTreesRegressor (scikit-learn) | — |

### Frontend

| Component | Technology | Version |
|---|---|---|
| UI Library | React | 19.2.3 |
| Routing | react-router-dom | 7.12.0 |
| Icons | lucide-react | 0.562.0 |
| HTTP Client | Fetch API (native) | — |
| Styling | Vanilla CSS (custom) | — |
| Build Tool | Create React App (react-scripts) | 5.0.1 |

### Database

| Component | Technology |
|---|---|
| Database | MongoDB (NoSQL) |
| Connection | PyMongo |
| Database Name | `insurance_data` |

---

## 4. Project Structure

```
Health_Insurance_Prediction/
│
├── .gitignore                          # Git ignore rules
├── tmp_clean_db.py                     # Utility: wipe DB collections for dev/testing
│
├── backend/
│   ├── app.py                          # Flask app factory & entry point
│   ├── config.py                       # Config class (env vars)
│   ├── database.py                     # MongoDB connection & collection setup
│   ├── ml_service.py                   # ML model loading & prediction logic
│   ├── utils.py                        # JWT helpers & auth decorators
│   ├── requirements.txt                # Python dependencies
│   ├── insurance_extra_trees_model.pkl # Trained ML model (≈49 MB)
│   │
│   └── routes/
│       ├── __init__.py                 # Package marker
│       ├── auth_routes.py              # POST /signup, POST /login
│       ├── predict_routes.py           # POST /predict-premium, GET /premium-history, GET /my-predictions
│       ├── ticket_routes.py            # POST /create-ticket, GET /my-tickets
│       ├── contact_routes.py           # POST /contact
│       ├── admin_routes.py             # Admin-only: tickets, managers, contacts
│       ├── manager_routes.py           # Manager-only: assigned tickets
│       └── stats_routes.py             # GET /public-stats (no auth)
│
└── frontend/
    ├── package.json                    # Node.js dependencies & scripts
    ├── package-lock.json               # Locked dependency tree
    ├── README.md                       # CRA boilerplate readme
    │
    ├── public/
    │   ├── index.html                  # HTML shell
    │   ├── Logo.svg                    # SVG logo variant
    │   ├── PRO.svg                     # SVG pro badge
    │   ├── manifest.json               # PWA manifest
    │   └── robots.txt                  # SEO robots config
    │
    └── src/
        ├── index.js                    # React DOM entry; wraps <App> in <AuthProvider>
        ├── index.css                   # Minimal global CSS reset
        ├── App.js                      # Root component; defines all <Routes>
        │
        ├── assets/
        │   ├── logo.png                # Primary logo (used in Header & Footer)
        │   ├── logo2.png               # Alternative logo
        │   ├── logo-testing.png        # Hi-res testing logo
        │   ├── footer.png              # Footer background image
        │   ├── footer1.png             # Footer variant 1
        │   ├── footer2.png             # Footer variant 2
        │   └── footerr.png             # Footer variant 3
        │
        ├── components/
        │   ├── Header.jsx              # Navigation bar (role-aware, responsive)
        │   ├── Footer.jsx              # Site footer with links & credits
        │   └── ProtectedRoute.jsx      # 3 route guards: ProtectedRoute, RoleBasedRoute, GuestRoute
        │
        ├── context/
        │   └── AuthContext.jsx         # React Context for auth state (login, logout, user)
        │
        ├── utils/
        │   └── auth.js                 # Token storage, expiry check, fetchWithAuth wrapper
        │
        ├── pages/
        │   ├── Home.jsx                # Landing page (hero, stats, features, CTA)
        │   ├── SignIn.jsx              # Login form with "Remember Me"
        │   ├── SignUp.jsx              # Registration form with validations
        │   ├── Dashboard.jsx           # User dashboard (latest prediction, timeline, pagination)
        │   ├── Predict.jsx             # Premium calculator form (self/other)
        │   ├── HelpDesk.jsx            # Create & view support tickets
        │   ├── Contact.jsx             # Guest contact form
        │   ├── About.jsx               # About us page
        │   ├── Howitworks.jsx          # How It Works page
        │   ├── AdminPanel.jsx          # Admin: tickets table, manager CRUD, messages inbox
        │   └── ManagerDashboard.jsx    # Manager: assigned tickets, messages inbox
        │
        └── styles/
            ├── App.css                 # Global app styles, layout, dark theme tokens
            ├── Home.css                # Home page: hero, stats bar, features, CTA
            ├── SignIn.css              # Auth pages (shared by SignIn & SignUp)
            ├── SignUp.css              # SignUp-specific overrides
            ├── Dashboard.css           # User dashboard: hero card, stats grid, timeline
            ├── Predict.css             # Premium calculator form styles
            ├── HelpDesk.css            # Help desk: form, ticket cards
            ├── Contact.css             # Contact form page
            ├── About.css               # About us page
            ├── HowItWorks.css          # How it Works page
            ├── AdminPanel.css          # Admin panel: tables, modals, stats
            ├── ManagerDashboard.css    # Manager panel styles
            ├── Header.css              # Navbar, mobile menu
            └── Footer.css              # Footer layout
```

---

## 5. Backend — In Detail

### 5.1 Entry Point (`app.py`)

The application uses the **Flask application factory pattern**:

```python
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    import database       # Initializes MongoDB connection
    import ml_service     # Loads the ML model into memory

    # Register all Blueprints
    from routes.auth_routes import auth_bp
    from routes.predict_routes import predict_bp
    # ... (all 7 blueprints)

    app.register_blueprint(auth_bp)
    # ...

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "model_loaded": ml_model is not None
        }), 200

    return app
```

**Key points:**
- CORS is configured to allow the React dev server at `localhost:3000`.
- Both `database.py` and `ml_service.py` run their initialization code at import time (module-level execution).
- There are **7 Blueprints**: `auth`, `predict`, `contact`, `ticket`, `admin`, `manager`, `stats`.
- A `/health` endpoint provides a liveness check and confirms whether the ML model is loaded.
- The server runs on `0.0.0.0:5000` in debug mode during development.

---

### 5.2 Configuration (`config.py`)

```python
class Config:
    SECRET_KEY         = os.getenv('SECRET_KEY')         # JWT signing secret
    JWT_EXPIRATION_HOURS = 24                              # Token validity
    MONGO_URI          = os.getenv('MONGO_URI')            # MongoDB connection string
    MODEL_PATH         = os.getenv('MODEL_PATH', 'insurance_extra_trees_model.pkl')
```

All sensitive values are loaded from a `.env` file via `python-dotenv`. The `.env` file is git-ignored.

---

### 5.3 Database Layer (`database.py`)

This module runs **at import time** and performs:

1. **Connection**: Creates a `MongoClient` using `MONGO_URI`.
2. **Database selection**: Uses the `insurance_data` database.
3. **Collection binding**: Exposes 4 collection handles as module-level variables:
   - `users_collection` → `customers`
   - `prediction_logs` → `prediction_logs`
   - `tickets_collection` → `support_tickets`
   - `contacts_collection` → `contacts`
4. **Index creation**: Creates indexes for performance:
   - `customers.email` — unique index (prevents duplicate accounts)
   - `prediction_logs.user_id` — for fast per-user lookups
   - `support_tickets.user_id` — for fast per-user ticket retrieval
   - `contacts.created_at` — for chronological sorting
5. **Fail-fast**: If `MONGO_URI` is not set or the connection fails, the process exits with `sys.exit(1)`.

---

### 5.4 Machine Learning Service (`ml_service.py`)

#### Model Loading

```python
ml_model = joblib.load(Config.MODEL_PATH)  # ~49 MB .pkl file
```

The model is loaded once at server startup and cached in the `ml_model` module variable.

#### Feature Engineering

The `predict_premium_ml()` function takes 6 raw inputs and engineers **14 features** for the model:

| # | Feature | Derivation |
|---|---|---|
| 1 | `age` | Direct input |
| 2 | `sex` | Direct input (0=female, 1=male) |
| 3 | `bmi` | Direct input |
| 4 | `children` | Direct input |
| 5 | `smoker` | Direct input (0/1) |
| 6 | `region_northwest` | One-hot encoded from region string |
| 7 | `region_southeast` | One-hot encoded from region string |
| 8 | `region_southwest` | One-hot encoded from region string |
| 9 | `age_bmi` | `age × bmi` (interaction term) |
| 10 | `age_smoker` | `age × smoker` (interaction term) |
| 11 | `bmi_smoker` | `bmi × smoker` (interaction term) |
| 12 | `children_smoker` | `children × smoker` (interaction term) |
| 13 | `bmi_sq` | `bmi²` (polynomial term) |
| 14 | `age_sq` | `age²` (polynomial term) |

> **Note:** The `northeast` region serves as the baseline (reference category) in the one-hot encoding — it is implicitly represented when all three region columns are 0.

#### Prediction Output

The model predicts the **log-transformed premium** (`log1p(premium)`). The result is then back-transformed using `np.expm1()` to get the actual dollar amount.

```python
log_pred = ml_model.predict(features)[0]
return round(float(np.expm1(log_pred)), 2)
```

#### Fallback Formula

If the model fails to load (e.g., `.pkl` file missing), a hand-crafted heuristic formula is used:

```
premium = 3000 + (age × 250) + bmi_penalty + (children × 500)
          + (20000 if smoker) + (500 if male) + region_penalty
```

Where `bmi_penalty` ranges from $0 (normal) to $3000 (obese) and `region_penalty` ranges from $0 (NE) to $1500 (SW).

---

### 5.5 Authentication & Authorization (`utils.py`)

#### JWT Token System

| Function | Purpose |
|---|---|
| `generate_token(user_id, email, role)` | Creates a HS256-signed JWT with `user_id`, `email`, `role`, `exp` (24h), and `iat` |
| `decode_token(token)` | Validates and decodes a JWT; returns `None` on expiry or tampering |
| `token_required` | Decorator — extracts the token from `Authorization: Bearer <token>`, decodes it, and attaches the payload to `request.current_user` |
| `role_required(allowed_roles)` | Decorator — checks `request.current_user.role` against the allowed list; returns 403 if unauthorized |

#### Token Lifecycle

```
 [Client]                    [Server]
    │                            │
    │  POST /login               │
    │ ─────────────────────────► │
    │                            │  ✓ Validate credentials
    │                            │  ✓ Generate JWT (24h expiry)
    │  ◄───────────────────────  │
    │  { token, email, role }    │
    │                            │
    │  GET /my-predictions       │
    │  Authorization: Bearer xxx │
    │ ─────────────────────────► │
    │                            │  @token_required: decode JWT
    │                            │  Set request.current_user
    │  ◄───────────────────────  │
    │  [prediction data]         │
```

---

### 5.6 API Routes — Complete Reference

#### Authentication Routes (`auth_routes.py`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ No | Register a new user account |
| `POST` | `/login` | ❌ No | Authenticate and receive JWT |

**`POST /signup`** — Request body:
```json
{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepass123"
}
```
- Validates: name ≥ 2 chars, password ≥ 6 chars, email not already registered
- Password is hashed with `werkzeug.security.generate_password_hash()`
- New users always get `role: "user"`

**`POST /login`** — Request body:
```json
{
    "email": "john@example.com",
    "password": "securepass123"
}
```
- Returns: `{ token, email, role, fullName }`
- On success, the client stores the JWT and user metadata

---

#### Prediction Routes (`predict_routes.py`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/predict-premium` | ✅ JWT | Calculate insurance premium |
| `GET` | `/premium-history` | ✅ JWT | Get the most recent prediction |
| `GET` | `/my-predictions` | ✅ JWT | Get all predictions (max 20, sorted desc) |

**`POST /predict-premium`** — Request body:
```json
{
    "age": 30,
    "sex": 1,
    "bmi": 25.5,
    "children": 2,
    "smoker": 0,
    "region": "northwest",
    "prediction_for": "self",
    "beneficiary_name": null
}
```

Input validations:
- `age`: integer, 18–100
- `bmi`: float, 10–60
- `children`: integer, 0–10
- `smoker`: 0 or 1
- `sex`: 0 (female) or 1 (male)
- `region`: one of `northeast`, `northwest`, `southeast`, `southwest`
- `prediction_for`: `self` or `other`
- `beneficiary_name`: required if `prediction_for == "other"`, min 2 chars, max 100 chars

The prediction result is saved to `prediction_logs` and returned:
```json
{ "predicted_premium": 12345.67 }
```

---

#### Ticket Routes (`ticket_routes.py`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create-ticket` | ✅ JWT | Submit a new support ticket |
| `GET` | `/my-tickets` | ✅ JWT | List the current user's tickets |

**`POST /create-ticket`** — Request body:
```json
{
    "subject": "Prediction seems too high",
    "description": "I entered my details but the premium...",
    "category": "Prediction Error",
    "priority": "Medium"
}
```

Category options: `Model Issue`, `Prediction Error`, `Technical Problem`, `Account Problem`, `Other`  
Priority options: `Low`, `Medium`, `High`

Each ticket gets a unique `ticket_id` in the format `TICK-XXXXXXXX` (UUID-derived).

---

#### Contact Routes (`contact_routes.py`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/contact` | ❌ No | Submit a contact message (guests) |

**`POST /contact`** — Request body:
```json
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Question about your service",
    "message": "I would like to know more about how..."
}
```

Validations:
- `name`: 3–100 chars
- `subject`: 5–100 chars
- `message`: 20–1000 chars
- Status is set to `"unread"` by default

---

#### Admin Routes (`admin_routes.py`)

All admin routes require `@token_required` and `@role_required(['admin'])`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/all-tickets` | Fetch all tickets system-wide |
| `POST` | `/admin/assign-ticket` | Assign a ticket to a manager |
| `PUT` | `/admin/update-ticket/<ticket_id>` | Update ticket status & admin response |
| `POST` | `/admin/create-manager` | Create a new manager account |
| `GET` | `/admin/managers` | List all manager accounts |
| `GET` | `/api/contacts` | Fetch all contact messages (admin + manager) |
| `PUT` | `/api/contacts/<contact_id>/read` | Mark a contact message as read |

---

#### Manager Routes (`manager_routes.py`)

All manager routes require `@token_required` and `@role_required(['manager', 'admin'])`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/manager/my-tickets` | Fetch tickets assigned to this manager |
| `PUT` | `/manager/update-ticket/<ticket_id>` | Update ticket status & manager response |

---

#### Stats Routes (`stats_routes.py`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/public-stats` | ❌ No | Get real-time stats for the home page |

Returns:
```json
{
    "prediction_count": 147,
    "prediction_count_display": "140+",
    "model_accuracy": 81.2
}
```

The model accuracy (`81.2%`) is a hardcoded constant based on 5-fold cross-validation of the ExtraTreesRegressor.

---

## 6. Database Schema (MongoDB)

### Database: `insurance_data`

#### Collection: `customers`

Stores all user accounts (regular users, managers, admins).

```json
{
    "_id": ObjectId("..."),
    "fullName": "John Doe",
    "email": "john@example.com",          // unique index
    "password": "pbkdf2:sha256:...",       // Werkzeug hashed
    "role": "user",                        // "user" | "manager" | "admin"
    "created_at": ISODate("2026-04-01T10:00:00Z")
}
```

#### Collection: `prediction_logs`

Stores every premium prediction ever made.

```json
{
    "_id": ObjectId("..."),
    "user_id": "661a...",                  // indexed
    "email": "john@example.com",
    "prediction_for": "self",              // "self" | "other"
    "beneficiary_name": null,              // or "Jane Doe"
    "age": 30,
    "gender": "male",
    "bmi": 25.5,
    "children": 2,
    "smoker": false,
    "region": "northwest",
    "predicted_premium": 12345.67,
    "last_checked_at": ISODate("2026-04-07T08:00:00Z")
}
```

#### Collection: `support_tickets`

Stores support tickets created by users.

```json
{
    "_id": ObjectId("..."),
    "ticket_id": "TICK-A1B2C3D4",         // human-readable ID
    "user_id": "661a...",
    "email": "john@example.com",
    "subject": "Prediction seems too high",
    "description": "I entered my details but...",
    "category": "Prediction Error",        // predefined categories
    "priority": "Medium",                  // "Low" | "Medium" | "High"
    "status": "Open",                      // "Open" | "In Progress" | "Waiting Admin" | "Resolved" | "Closed"
    "assigned_to": null,                   // manager email or null
    "assigned_role": null,                 // "manager" or null
    "admin_response": "",                  // admin's written response
    "manager_response": "",                // manager's written response
    "created_at": ISODate("2026-04-01T10:00:00Z")
}
```

#### Collection: `contacts`

Stores contact form submissions from unauthenticated users.

```json
{
    "_id": ObjectId("..."),
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Question about your service",
    "message": "I would like to know more about...",
    "status": "unread",                    // "unread" | "read"
    "created_at": ISODate("2026-04-01T10:00:00Z")
}
```

### Indexes

| Collection | Field | Type | Purpose |
|---|---|---|---|
| `customers` | `email` | Unique | Prevent duplicate accounts |
| `prediction_logs` | `user_id` | Standard | Fast per-user queries |
| `support_tickets` | `user_id` | Standard | Fast per-user queries |
| `contacts` | `created_at` | Standard | Chronological sorting |

---

## 7. Machine Learning Model — Deep Dive

### Algorithm: ExtraTreesRegressor

**ExtraTrees (Extremely Randomized Trees)** is an ensemble method similar to Random Forest but with two key differences:
1. **Random splits**: Instead of finding the best split threshold, ExtraTrees selects thresholds randomly for each feature at each node.
2. **Full bootstrap**: Uses the entire training set (no bagging by default).

This results in lower variance and faster training compared to Random Forest.

### Training Pipeline

```
Raw Data (insurance.csv)
    │
    ▼
Feature Engineering
    ├── One-hot encode: region (drop 'northeast')
    ├── Interaction terms: age×bmi, age×smoker, bmi×smoker, children×smoker
    └── Polynomial terms: bmi², age²
    │
    ▼
Target Transformation
    └── y = log1p(charges)   # log-transform the target for better residuals
    │
    ▼
Model Training
    └── ExtraTreesRegressor(n_estimators=800)
    │
    ▼
Model Serialization
    └── joblib.dump(model, 'insurance_extra_trees_model.pkl')   # ~49 MB
```

### Model Performance

| Metric | Value |
|---|---|
| Algorithm | ExtraTreesRegressor |
| Estimators | 800 |
| Evaluation | 5-fold Cross-Validation |
| R² Score | **0.8118 (81.2%)** |
| Target Transform | `log1p(charges)` / `expm1(prediction)` |

### Input Features (14 total)

| Feature | Type | Derivation |
|---|---|---|
| `age` | int | Direct input |
| `sex` | int | 0=female, 1=male |
| `bmi` | float | Direct input |
| `children` | int | Direct input |
| `smoker` | int | 0=no, 1=yes |
| `region_northwest` | bool | Derived from region |
| `region_southeast` | bool | Derived from region |
| `region_southwest` | bool | Derived from region |
| `age_bmi` | float | age × bmi |
| `age_smoker` | int | age × smoker |
| `bmi_smoker` | float | bmi × smoker |
| `children_smoker` | int | children × smoker |
| `bmi_sq` | float | bmi² |
| `age_sq` | int | age² |

---

## 8. Frontend — In Detail

### 8.1 Application Entry & Routing (`App.js`)

The app is a **Single Page Application (SPA)** using `react-router-dom` v7 for client-side routing.

The React tree structure:

```
<React.StrictMode>
  <AuthProvider>        ← Context provider wraps entire app
    <Router>
      <Header />        ← Always visible (adapts to auth state + role)
      <main>
        <Routes>
          /* Public */       /            → Home
                             /contact     → Contact
                             /about       → About
                             /howitworks  → HowItWorks

          /* Guest Only */   /signin      → GuestRoute → SignIn
                             /signup      → GuestRoute → SignUp

          /* Auth Required */  /dashboard   → ProtectedRoute → Dashboard
                               /predict     → ProtectedRoute → Predict
                               /helpdesk    → ProtectedRoute → HelpDesk

          /* Admin Only */     /admin       → RoleBasedRoute(['admin']) → AdminPanel

          /* Manager Only */   /manager     → RoleBasedRoute(['manager']) → ManagerDashboard

          /* Placeholders */   /privacy-policy
                               /terms-of-service

          /* 404 */            *            → "Page Not Found"
        </Routes>
      </main>
      <Footer />        ← Always visible (adapts to auth state + role)
    </Router>
  </AuthProvider>
</React.StrictMode>
```

---

### 8.2 Authentication System (Context + Utils)

#### `AuthContext.jsx` — State Management

The `AuthProvider` component provides a **React Context** that holds the current auth state and exposes functions to modify it:

| Property/Method | Type | Description |
|---|---|---|
| `user` | Object | `{ email, role, fullName, isLoggedIn }` |
| `isLoggedIn` | boolean | Quick shortcut |
| `role` | string | `"user"`, `"admin"`, `"manager"`, or `null` |
| `fullName` | string | User's display name |
| `login(token, email, role, fullName, rememberMe)` | function | Saves auth data & updates state |
| `logout()` | function | Clears storage & resets state |
| `refreshAuth()` | function | Re-reads auth from storage (for cross-tab sync) |

**Cross-tab synchronization**: The provider listens for `storage` events (fired when localStorage changes in another tab) and custom `authChange` events (fired locally after login/logout).

#### `auth.js` — Storage & Token Utilities

| Function | Purpose |
|---|---|
| `getToken()` | Gets JWT from localStorage OR sessionStorage |
| `isTokenExpired(token)` | Decodes the JWT payload and checks `exp` |
| `isAuthenticated()` | Combines `getToken()` + `isTokenExpired()` |
| `getCurrentUser()` | Returns the user object from storage |
| `saveAuthData(token, email, role, fullName, rememberMe)` | Saves to localStorage (persistent) or sessionStorage (session-only) |
| `logout()` | Clears all auth keys from both storages |
| `fetchWithAuth(url, options)` | **THE authenticated fetch wrapper** — auto-injects Bearer token, checks expiry before request, handles 401 responses by forcing logout + redirect |

**Remember Me behavior:**
- ✅ Checked → Data stored in `localStorage` (persists across browser sessions)
- ❌ Unchecked → Data stored in `sessionStorage` (cleared when tab closes)

---

### 8.3 Route Protection (`ProtectedRoute.jsx`)

Three guard components:

| Component | Logic |
|---|---|
| `ProtectedRoute` | If not logged in → redirect to `/signin` |
| `RoleBasedRoute({ allowedRoles })` | If not logged in → `/signin`. If role not allowed → redirect to the user's own dashboard (`/admin`, `/manager`, or `/dashboard`) |
| `GuestRoute` | If logged in → redirect to the user's own dashboard. Prevents logged-in users from accessing `/signin` or `/signup` |

---

### 8.4 Shared Components (Header, Footer)

#### `Header.jsx`

- Displays the logo + branding ("Insurance Predictor")
- Shows different navigation links based on:
  - **Not logged in**: Home, Contact Us, How it Works, About us, Sign In / Sign Up
  - **Logged in (user)**: Dashboard, Help Desk, How it Works, About us, Logout
  - **Logged in (admin)**: Admin Panel, Logout
  - **Logged in (manager)**: Manager Panel, Logout
- Mobile-responsive: hamburger menu with slide-in overlay
- Active route highlighting via React Router's `NavLink`

#### `Footer.jsx`

- Brand section with logo and project description
- Quick links section (adapts: "Contact" for guests, "Help Desk" for users)
- Account section (adapts: Sign In/Up for guests, Dashboard/Predict for users)
- Contact info: email, location (Ganpat University ICT), GitHub link
- Credits bar: "Built by Dhananjay, Shreyas & Krish"
- Auto-scrolls to top on route changes

---

### 8.5 Pages — Detailed Breakdown

#### 🏠 Home (`Home.jsx`)

**URL:** `/`  
**Auth:** Public

Sections:
1. **Hero**: "Know Your Premium Before You Commit" with CTA buttons
   - Logged in: "Calculate Premium" → `/predict`
   - Not logged in: "Get Started Free" → `/signup`
2. **Stats Bar**: Fetches `/public-stats` — shows prediction count, model accuracy (81.2%), average response time (<2s), and 100% data privacy
3. **Features Grid**: 4 cards — Data-Driven Predictions, Instant Results, Secure & Private, Track Your History
4. **CTA Section**: Glassmorphism card with call-to-action

---

#### 🔑 SignIn (`SignIn.jsx`)

**URL:** `/signin`  
**Auth:** Guest only (wrapped in `GuestRoute`)

Features:
- Split layout: left branding panel + right form panel
- Email + password fields with show/hide toggle
- "Remember Me" checkbox (localStorage vs sessionStorage)
- Post-login routing: admin → `/admin`, manager → `/manager`, user → `/dashboard`
- Error display for invalid credentials or server issues

---

#### 📝 SignUp (`SignUp.jsx`)

**URL:** `/signup`  
**Auth:** Guest only (wrapped in `GuestRoute`)

Features:
- Full name, email, password, confirm password fields
- Client-side validation before API call
- Success → auto-redirect to `/signin`

---

#### 📊 Dashboard (`Dashboard.jsx`)

**URL:** `/dashboard`  
**Auth:** Logged-in users only

Three states:
1. **Loading**: Animated spinner with "Analyzing your data..."
2. **Empty**: "No Predictions Yet" with a large CTA button → `/predict`
3. **Data**: Full dashboard with:
   - **Hero Card**: Latest predicted premium in large font, with "For Self" or "For [Name]" badge
   - **Vitals Grid**: 4 stat cards — Age/Gender, BMI Score, Smoker Status (color-coded), Dependents
   - **Prediction Timeline**: Paginated list (5 per page) showing date/time, for whom, traits (BMI, smoker, children, region badges), and premium amount
   - **Pagination controls**: Prev/Next with page counter

---

#### 🧮 Predict (`Predict.jsx`)

**URL:** `/predict`  
**Auth:** Logged-in users only

The premium calculator form collects:

| Field | Type | Validation |
|---|---|---|
| Prediction For | Toggle: "Myself" / "Someone Else" | Required |
| Beneficiary Name | Text (conditional) | Required if "Someone Else", min 2 chars |
| Age | Number | 18–100 |
| Gender | Select: Male / Female | Required |
| BMI | Number (step 0.1) | 10–60 |
| Number of Dependents | Number | 0–10 |
| Region | Select: NE/NW/SE/SW | Required |
| Smoker | Checkbox | Optional |

**User Experience:**
- Inline validation errors appear below each field
- Global errors (network issues) appear at the top
- On success: immediately redirects to `/dashboard` (no result page — the dashboard shows it)
- Loading state disables the submit button

---

#### 🎫 HelpDesk (`HelpDesk.jsx`)

**URL:** `/helpdesk`  
**Auth:** Logged-in users only

Two sections:
1. **Create Ticket Form**:
   - Subject (5–100 chars), Description (10–1000 chars with live character count), Category dropdown, Priority dropdown
   - Success message with ticket ID auto-dismisses after 5 seconds
2. **My Tickets List**:
   - Cards showing ticket ID, subject, status badge, priority badge, category
   - Click-to-expand: reveals creation date, assigned staff, description, admin/manager responses
   - "Waiting for response..." placeholder if no responses yet

---

#### ✉️ Contact (`Contact.jsx`)

**URL:** `/contact`  
**Auth:** Public (for non-logged-in users; logged-in users see HelpDesk instead)

Standard contact form with name, email, subject, and message fields.

---

#### ℹ️ About (`About.jsx`)

**URL:** `/about`  
**Auth:** Public

Information about the project, team, and technology.

---

#### ❓ How It Works (`Howitworks.jsx`)

**URL:** `/howitworks`  
**Auth:** Public

Step-by-step explanation of how the prediction system works.

---

#### 🛡️ AdminPanel (`AdminPanel.jsx`)

**URL:** `/admin`  
**Auth:** Admin only

A comprehensive admin dashboard with:

**Stats Cards (4):** Total Tickets, Managers Count, Resolved Count, Unread Messages

**Two Tabs:**

1. **Tickets Tab**:
   - **Team Management**: Lists all managers with a "Create Manager" button
   - **Manager Creation Modal**: Full Name, Email, Password form
   - **Tickets Table**: Filterable by status and priority with columns: ID, User, Subject, Priority badge, Status badge, Assigned To, Manager Notes, Actions
   - **Actions per ticket**: Assign dropdown (select manager → click Assign), Update button (opens modal)
   - **Ticket Update Modal**: View ticket details, change status (Open → In Progress → Waiting Admin → Resolved → Closed), write admin response (min 10 chars)

2. **Messages Tab**:
   - Inbox of contact form submissions
   - Each card shows: name, email, date, subject, message body
   - Unread indicator (dot) + "Mark Read" button
   - Paginated (5 per page)

**Keyboard support**: Escape key closes any open modal.

---

#### 💼 ManagerDashboard (`ManagerDashboard.jsx`)

**URL:** `/manager`  
**Auth:** Manager only

Similar to AdminPanel but scoped to the manager's assigned tickets:

**Stats Cards (4):** Total Assigned, Open count, In Progress count, Unread Messages

**Two Tabs:**

1. **Tickets Tab**:
   - Table of assigned tickets with filters
   - Actions: "Start Work" (changes status to In Progress) or "Update" and "Resolve"
   - Update modal with status dropdown and response textarea
   - Tickets marked Resolved/Closed have disabled action buttons

2. **Messages Tab**:
   - Same inbox as admin (managers also have `admin` OR `manager` access to contacts)
   - Mark as read functionality
   - Pagination

---

## 9. User Roles & Access Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ADMIN ──── Full system access                                     │
│     │        • View ALL tickets                                     │
│     │        • Assign tickets to managers                           │
│     │        • Update ticket status & respond                       │
│     │        • Create manager accounts                              │
│     │        • View & manage contact messages                       │
│     │                                                               │
│   MANAGER ── Limited staff access                                   │
│     │        • View OWN assigned tickets only                       │
│     │        • Update assigned ticket status & respond              │
│     │        • View & manage contact messages                       │
│     │        • CANNOT assign tickets                                │
│     │        • CANNOT create users                                  │
│     │                                                               │
│   USER ──── Standard access                                        │
│              • Make predictions (self and others)                   │
│              • View own prediction history                          │
│              • Create support tickets                               │
│              • View own tickets + responses                         │
│              • CANNOT access admin/manager panels                   │
│                                                                     │
│   GUEST ─── No account required                                    │
│              • View Home, About, How it Works                       │
│              • Submit contact form                                  │
│              • CANNOT make predictions                              │
│              • CANNOT view dashboard                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### How Roles Are Created

| Role | Creation Method |
|---|---|
| `user` | Self-registration via `/signup` |
| `manager` | Created by admin via AdminPanel → "Create Manager" |
| `admin` | Manually inserted into MongoDB (no UI for admin creation) |

---

## 10. Authentication Flow — End to End

```
 ┌────────────┐         ┌────────────┐         ┌──────────┐
 │   Browser  │         │   Flask    │         │  MongoDB │
 └─────┬──────┘         └─────┬──────┘         └────┬─────┘
       │                      │                      │
  1. User fills SignIn form   │                      │
       │                      │                      │
  2. POST /login              │                      │
  ──────────────────────────► │                      │
       │                      │  3. Query customers  │
       │                      │ ────────────────────►│
       │                      │      ◄──────────────│
       │                      │  4. check_password_hash()
       │                      │  5. generate_token() │
       │  ◄──────────────────  │                      │
       │  { token, role, ... } │                      │
       │                      │                      │
  6. saveAuthData()           │                      │
     (localStorage or        │                      │
      sessionStorage)        │                      │
       │                      │                      │
  7. AuthContext.login()      │                      │
     → setUser() updates UI  │                      │
       │                      │                      │
  8. Navigate to dashboard   │                      │
     based on role           │                      │
       │                      │                      │
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
       │                      │                      │
  9. Future API call with    │                      │
     fetchWithAuth()          │                      │
  ──────────────────────────► │                      │
  Authorization: Bearer xxx  │                      │
       │                      │  @token_required     │
       │                      │  decode & validate   │
       │                      │  attach to request   │
       │  ◄──────────────────  │                      │
       │  200 OK + data       │                      │
```

---

## 11. Prediction Flow — End to End

```
 ┌────────────┐       ┌────────────┐       ┌──────────┐        ┌───────────┐
 │  Predict   │       │   Flask    │       │ ML Model │        │  MongoDB  │
 │   Page     │       │  Backend   │       │  (.pkl)  │        │           │
 └─────┬──────┘       └─────┬──────┘       └────┬─────┘        └─────┬─────┘
       │                     │                    │                     │
  1. User fills form         │                    │                     │
     (age, bmi, etc.)       │                    │                     │
       │                     │                    │                     │
  2. Client-side validate   │                    │                     │
       │                     │                    │                     │
  3. POST /predict-premium  │                    │                     │
  ─────────────────────────►│                    │                     │
       │                     │                    │                     │
       │                     │ 4. Server-side     │                     │
       │                     │    validate        │                     │
       │                     │                    │                     │
       │                     │ 5. Engineer 14     │                     │
       │                     │    features        │                     │
       │                     │ ──────────────────►│                     │
       │                     │                    │ 6. model.predict()  │
       │                     │                    │    (log-space)      │
       │                     │ ◄──────────────────│                     │
       │                     │ 7. np.expm1(pred)  │                     │
       │                     │                    │                     │
       │                     │ 8. Save record     │                     │
       │                     │ ────────────────────────────────────────►│
       │                     │                    │                     │
       │ ◄───────────────────│                    │                     │
       │ { predicted_premium }                    │                     │
       │                     │                    │                     │
  9. navigate("/dashboard") │                    │                     │
       │                     │                    │                     │
  10. Dashboard fetches     │                    │                     │
      /my-predictions       │                    │                     │
  ─────────────────────────►│ ────────────────────────────────────────►│
       │                     │ ◄──────────────────────────────────────│
       │ ◄───────────────────│                    │                     │
       │ [list of predictions]                    │                     │
       │                     │                    │                     │
  11. Render dashboard with │                    │                     │
      latest + timeline     │                    │                     │
```

---

## 12. Support Ticket Lifecycle

```
                    ┌────────────┐
                    │   OPEN     │ ◄── User creates ticket
                    └─────┬──────┘
                          │
                 Admin assigns to Manager
                          │
                    ┌─────▼──────┐
                    │IN PROGRESS │ ◄── Manager starts work
                    └─────┬──────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────▼──────┐         ┌─────▼──────┐
        │  WAITING   │         │  RESOLVED  │ ◄── Manager resolves
        │   ADMIN    │         └─────┬──────┘
        └─────┬──────┘               │
              │                      │
     Admin reviews &           ┌─────▼──────┐
     responds                  │   CLOSED   │ ◄── Admin closes
              │                └────────────┘
              ▼
        Back to RESOLVED
        or CLOSED
```

### Ticket Fields & Who Can Modify Them

| Field | Created By | Modified By |
|---|---|---|
| `subject`, `description`, `category`, `priority` | User | — (immutable after creation) |
| `status` | System (`"Open"`) | Admin, Manager |
| `assigned_to`, `assigned_role` | — | Admin only |
| `admin_response` | — | Admin only |
| `manager_response` | — | Manager only |

---

## 13. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
SECRET_KEY=your-jwt-secret-key-here
MONGO_URI=mongodb://localhost:27017/insurance_data

# Optional
MODEL_PATH=insurance_extra_trees_model.pkl
```

Create a `.env` file in the `frontend/` directory (optional):

```env
# Override the default API URL (default: http://localhost:5000)
REACT_APP_API_URL=http://localhost:5000
```

> ⚠️ **Important:** The `.env` files are git-ignored and must be created manually on each development machine.

---

## 14. Setup & Installation Guide

### Prerequisites

- **Python 3.10+** (with pip)
- **Node.js 18+** (with npm)
- **MongoDB** (local or cloud — e.g., MongoDB Atlas)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/Panchal-Krish/Health_Insurance_Prediction.git
cd Health_Insurance_Prediction
```

### Step 2: Backend Setup

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create the .env file
# (see Environment Variables section above)
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install Node.js dependencies
npm install
```

### Step 4: Database Setup

1. Start MongoDB (local) or configure a MongoDB Atlas cluster.
2. Set the `MONGO_URI` in `backend/.env`.
3. The database and collections are created automatically on first run.

### Step 5: Create an Admin Account

Since there's no admin creation UI, insert one directly into MongoDB:

```javascript
// In MongoDB shell or Compass:
use insurance_data

db.customers.insertOne({
    fullName: "Admin User",
    email: "admin@example.com",
    password: "<werkzeug-generated-hash>",  // Generate with Python
    role: "admin",
    created_at: new Date()
})
```

To generate the password hash in Python:
```python
from werkzeug.security import generate_password_hash
print(generate_password_hash("your-admin-password"))
```

---

## 15. Running the Application

### Start the Backend (API Server)

```bash
cd backend
python app.py
```

The Flask server starts on `http://localhost:5000`.

### Start the Frontend (Dev Server)

```bash
cd frontend
npm start
```

The React dev server starts on `http://localhost:3000` and proxies API calls to `:5000`.

### Verify

1. Open `http://localhost:3000` in your browser.
2. Check `http://localhost:5000/health` for API status:
   ```json
   {
       "status": "healthy",
       "message": "API is running",
       "model_loaded": true
   }
   ```

---

## 16. API Reference (Quick Table)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/health` | ❌ | — | Health check |
| `GET` | `/public-stats` | ❌ | — | Home page stats |
| `POST` | `/signup` | ❌ | — | Register user |
| `POST` | `/login` | ❌ | — | Login (returns JWT) |
| `POST` | `/contact` | ❌ | — | Submit contact message |
| `POST` | `/predict-premium` | ✅ | any | Calculate premium |
| `GET` | `/premium-history` | ✅ | any | Latest prediction |
| `GET` | `/my-predictions` | ✅ | any | All predictions (max 20) |
| `POST` | `/create-ticket` | ✅ | any | Create support ticket |
| `GET` | `/my-tickets` | ✅ | any | User's own tickets |
| `GET` | `/admin/all-tickets` | ✅ | admin | All tickets |
| `POST` | `/admin/assign-ticket` | ✅ | admin | Assign ticket to manager |
| `PUT` | `/admin/update-ticket/:id` | ✅ | admin | Update ticket + respond |
| `POST` | `/admin/create-manager` | ✅ | admin | Create manager account |
| `GET` | `/admin/managers` | ✅ | admin | List all managers |
| `GET` | `/api/contacts` | ✅ | admin/manager | All contact messages |
| `PUT` | `/api/contacts/:id/read` | ✅ | admin/manager | Mark message as read |
| `GET` | `/manager/my-tickets` | ✅ | manager/admin | Manager's assigned tickets |
| `PUT` | `/manager/update-ticket/:id` | ✅ | manager/admin | Update ticket + respond |

---

## 17. Security Considerations

| Aspect | Implementation |
|---|---|
| **Password Storage** | Werkzeug PBKDF2-SHA256 hash (never stored in plaintext) |
| **Authentication** | JWT tokens with HS256 signing and 24-hour expiry |
| **Token Storage** | localStorage (persistent) or sessionStorage (session-only) based on "Remember Me" |
| **Token Validation** | Both client-side (expiry check before request) and server-side (decode + verify) |
| **CORS** | Restricted to `localhost:3000` origins only |
| **Input Validation** | Both client-side (React form validation) and server-side (Flask route validation) |
| **SQL Injection** | N/A — MongoDB with PyMongo (no raw SQL) |
| **Role Enforcement** | `@role_required` decorator on every admin/manager route |
| **Auto-Logout** | Client detects 401 responses and expired tokens → clears storage → redirects to `/signin` |
| **Cross-Tab Sync** | Storage events keep auth state consistent across browser tabs |

### Areas for Improvement (Production)

- Use HTTPS in production
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Use httpOnly cookies instead of localStorage for tokens
- Add refresh token rotation
- Implement account lockout after failed login attempts
- Add input sanitization for XSS prevention

---

## 18. Known Limitations & Future Scope

### Current Limitations

| Limitation | Details |
|---|---|
| **No password reset** | Users cannot reset forgotten passwords |
| **No email verification** | Signup does not verify email ownership |
| **No admin creation UI** | Admin accounts must be created directly in MongoDB |
| **Static model accuracy** | The 81.2% value is hardcoded, not dynamically computed |
| **No model retraining** | The ML model is a static `.pkl` file with no retraining pipeline |
| **Limited prediction inputs** | Only 6 health factors; real insurance uses many more |
| **USD only** | Premiums are displayed in US dollars only |
| **No rate limiting** | API endpoints are not rate-limited |
| **No file attachments** | Tickets don't support file/screenshot uploads |
| **Single region scheme** | Uses US regions (NE/NW/SE/SW) — not adaptable to other countries |

### Future Scope

- **Password reset via email** (OTP or magic link)
- **Email verification** on signup
- **Two-factor authentication** (2FA)
- **Model retraining pipeline** with new data
- **Multiple ML models** (compare Random Forest, XGBoost, Neural Network)
- **PDF report export** for predictions
- **Premium comparison** over time (charts/graphs)
- **Admin analytics dashboard** with prediction trends
- **Notification system** (email/push for ticket updates)
- **Deployment** to cloud (AWS/GCP/Azure) with CI/CD
- **Docker containerization** for easy deployment
- **Unit & integration tests** (pytest for backend, Jest for frontend)

---

## Utility Scripts

### `tmp_clean_db.py`

A development utility to wipe specific MongoDB collections:

```python
# Usage: python tmp_clean_db.py
# Drops: premium_history, prediction_logs, support_tickets
```

> ⚠️ **Warning:** This script permanently deletes data. Use only in development.

---

*Documentation generated on April 7, 2026.*  
*Last updated: v1.0*
