<div align="center">

# 🏥 Health Insurance Premium Predictor

### AI-Powered Insurance Premium Estimation

A full-stack web application that predicts health insurance premiums using an **ExtraTrees Machine Learning model** trained on real insurance data — delivering instant, personalized estimates.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.16-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Semester 8 — IBM Industry Project · Ganpat University ICT, Gujarat**

[Live Demo](#) · [Documentation](PROJECT_DOCUMENTATION.md) · [Report an Issue](https://github.com/Panchal-Krish/Health_Insurance_Prediction/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [ML Model](#-ml-model)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Team](#-team)
- [License](#-license)

---

## 🎯 About the Project

Health insurance premiums vary widely based on individual health profiles, but getting a quick estimate traditionally involves lengthy forms, phone calls, or in-person visits. This project solves that by providing **instant, ML-driven premium predictions** through a clean web interface.

Users input six key health parameters — **age, gender, BMI, number of dependents, smoking status, and region** — and the system returns an estimated annual premium in under 2 seconds. Every prediction is saved to the user's personal dashboard for trend tracking.

The application features a complete **role-based system** with user dashboards, a support ticket workflow, an admin panel for team management, and a manager dashboard for ticket resolution.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🧮 Smart Predictions
- ML-powered premium estimates (81.2% R²)
- Predict for yourself or a named beneficiary
- 6 health factors analyzed with 14 engineered features
- Fallback formula if model unavailable

</td>
<td width="50%">

### 📊 Personal Dashboard
- View latest prediction with visual stats
- Full prediction timeline with pagination
- Track trends over time
- Color-coded smoker/health indicators

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Authentication & Security  
- JWT-based auth with 24h token expiry
- **Email verification** on signup (via Brevo)
- **Password reset** via email link
- "Remember Me" (localStorage vs sessionStorage)
- Role-based access control (User / Manager / Admin)
- Auto-logout on token expiry + cross-tab sync
- User **Profile page** with account management

</td>
<td width="50%">

### 🎫 Support System
- Users create categorized, prioritized tickets
- Admins assign tickets to managers
- Managers respond and resolve
- Full ticket lifecycle tracking

</td>
</tr>
<tr>
<td width="50%">

### 🛡️ Admin Panel
- View & manage all support tickets
- Create manager accounts
- Assign tickets to team members
- Review contact form submissions

</td>
<td width="50%">

### 📱 Modern UI
- Dark theme with glassmorphism effects
- Fully responsive (mobile + desktop)
- Animated hero section with floating orbs
- Lucide icons throughout

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Flask 3.1** | RESTful API framework |
| **PyMongo 4.16** | MongoDB driver |
| **PyJWT 2.12** | JSON Web Token authentication |
| **scikit-learn 1.8** | Machine learning (ExtraTreesRegressor) |
| **Werkzeug** | Password hashing (PBKDF2-SHA256) |
| **pandas / numpy** | Feature engineering & data handling |
| **python-dotenv** | Environment variable management |
| **Brevo (Sendinblue)** | Transactional email (verification & reset) |
| **requests** | HTTP client for Brevo API |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **React Router 7** | Client-side routing & navigation |
| **Lucide React** | Icon system |
| **Vanilla CSS** | Custom styling (dark theme, glassmorphism) |
| **Create React App** | Build tooling |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database |
| **5 Collections** | `customers`, `prediction_logs`, `support_tickets`, `contacts`, `email_tokens` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│  React 19 · React Router 7 · Lucide · Vanilla CSS       │
│                                                         │
│  Pages: Home, SignIn/Up, Dashboard, Predict, Profile,   │
│         HelpDesk, Contact, Admin, Manager, About,       │
│         VerifyEmail, ForgotPassword, ResetPassword       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP + JWT (Bearer Token)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     Flask Backend                       │
│  7 Blueprint Routes · JWT Auth · CORS · Validation      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Auth Routes  │  │ Predict      │  │ Admin/Manager│   │
│  │ (signup,     │  │ Routes       │  │ Routes       │   │
│  │  login,      │  │ (ML predict, │  │ (tickets,    │   │
│  │  verify,     │  │  history)    │  │  teams, msgs)│   │
│  │  reset pwd)  │  │              │  │              │   │
│  └─────────────┘  └──────┬───────┘  └──────────────┘    │
│                          │                              │
│                   ┌──────┴───────┐                      │
│                   │  ML Service  │ ← ExtraTrees .pkl    │
│                   │  (14 feats)  │   (~49 MB)           │
│                   └──────────────┘                      │
└──────────────────────────┬──────────────────────────────┘
                           │ PyMongo
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       MongoDB                           │
│  Database: insurance_data                               │
│  Collections: customers · prediction_logs ·             │
│               support_tickets · contacts                │
└─────────────────────────────────────────────────────────┘
```

---

## 🤖 ML Model

### ExtraTreesRegressor (Extremely Randomized Trees)

| Detail | Value |
|---|---|
| **Algorithm** | ExtraTreesRegressor (scikit-learn) |
| **Estimators** | 800 |
| **Evaluation** | 5-fold Cross-Validation |
| **R² Score** | **81.2%** |
| **Target Transform** | `log1p(charges)` → `expm1(prediction)` |
| **Model Size** | ~49 MB (serialized with joblib) |

### Input Features (6 raw → 14 engineered)

```
Raw Inputs:                    Engineered Features:
  age            ──────────►   age, sex, bmi, children, smoker
  sex (M/F)                    region_northwest, region_southeast, region_southwest
  bmi                          age × bmi, age × smoker, bmi × smoker
  children                     children × smoker, bmi², age²
  smoker (Y/N)
  region (NE/NW/SE/SW)
```

---

## 📂 Project Structure

```
Health_Insurance_Prediction/
│
├── README.md                               # ← You are here
├── PROJECT_DOCUMENTATION.md                # Full technical docs
├── .gitignore
│
├── backend/
│   ├── app.py                              # Flask app factory & entry point
│   ├── config.py                           # Environment config (JWT, Brevo, etc.)
│   ├── database.py                         # MongoDB connection & collections
│   ├── email_service.py                    # Brevo transactional email service
│   ├── ml_service.py                       # ML model loading & prediction
│   ├── utils.py                            # JWT auth helpers & decorators
│   ├── requirements.txt                    # Python dependencies
│   ├── insurance_extra_trees_model.pkl     # Trained model (~49 MB)
│   └── routes/
│       ├── auth_routes.py                  # /signup, /login, /verify-email, /reset-password
│       ├── predict_routes.py               # /predict-premium, /my-predictions
│       ├── ticket_routes.py                # /create-ticket, /my-tickets
│       ├── contact_routes.py               # /contact
│       ├── admin_routes.py                 # Admin-only endpoints
│       ├── manager_routes.py               # Manager-only endpoints
│       └── stats_routes.py                 # /public-stats
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js                          # Root component & routes
        ├── index.js                        # React entry with AuthProvider
        ├── context/AuthContext.jsx         # Auth state management
        ├── utils/auth.js                   # Token utils & fetchWithAuth
        ├── components/
        │   ├── Header.jsx                  # Role-aware navbar
        │   ├── Footer.jsx                  # Site footer
        │   └── ProtectedRoute.jsx          # Route guards (3 types)
        ├── pages/
        │   ├── Home.jsx                    # Landing page
        │   ├── SignIn.jsx / SignUp.jsx     # Authentication
        │   ├── VerifyEmail.jsx             # Email verification handler
        │   ├── ForgotPassword.jsx          # Password reset request
        │   ├── ResetPassword.jsx           # New password form
        │   ├── Profile.jsx                 # User profile & account mgmt
        │   ├── Dashboard.jsx               # User dashboard
        │   ├── Predict.jsx                 # Premium calculator
        │   ├── HelpDesk.jsx                # Support tickets
        │   ├── Contact.jsx                 # Guest contact form
        │   ├── AdminPanel.jsx              # Admin management
        │   ├── ManagerDashboard.jsx        # Manager view
        │   ├── About.jsx                   # About page
        │   └── Howitworks.jsx              # How it Works
        ├── styles/                         # 15 CSS files (one per component)
        │   └── AuthPages.css               # Shared styles for auth flow pages
        └── assets/                         # Logos & images
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** with pip
- **Node.js 18+** with npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/Panchal-Krish/Health_Insurance_Prediction.git
cd Health_Insurance_Prediction
```

### 2. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env   # Then edit with your values
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Create Admin Account

Since there's no admin creation UI, insert one directly:

```python
# Run in Python:
from werkzeug.security import generate_password_hash
print(generate_password_hash("your-admin-password"))
```

Then insert into MongoDB:
```javascript
use insurance_data
db.customers.insertOne({
    fullName: "Admin User",
    email: "admin@example.com",
    password: "<paste-hash-here>",
    role: "admin",
    created_at: new Date()
})
```

### 5. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
python app.py
# → Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# → Running on http://localhost:3000
```

### 6. Verify

Open [http://localhost:3000](http://localhost:3000) in your browser.  
Check API health: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔐 Environment Variables

### `backend/.env`

```env
SECRET_KEY=your-secret-jwt-key-here
MONGO_URI=mongodb://localhost:27017/insurance_data
MODEL_PATH=insurance_extra_trees_model.pkl     # optional, this is the default
BREVO_API_KEY=xkeysib-your-brevo-api-key       # required for email features
SENDER_EMAIL=your-verified@email.com           # must match Brevo sender
FRONTEND_URL=http://localhost:3000             # used in email links
```

### `frontend/.env` (optional)

```env
REACT_APP_API_URL=http://localhost:5000        # optional, this is the default
```

---

## 📡 API Endpoints

### Public (No Auth)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | API health check |
| `GET` | `/public-stats` | Home page stats (prediction count, accuracy) |
| `POST` | `/signup` | Register new user (sends verification email) |
| `POST` | `/login` | Authenticate → returns JWT (requires verified email) |
| `GET` | `/verify-email/:token` | Verify user's email address |
| `POST` | `/request-password-reset` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |
| `POST` | `/contact` | Submit contact message |

### Authenticated (JWT Required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict-premium` | Calculate insurance premium |
| `GET` | `/my-predictions` | User's prediction history (max 20) |
| `GET` | `/premium-history` | User's latest prediction |
| `POST` | `/create-ticket` | Create support ticket |
| `GET` | `/my-tickets` | User's support tickets |

### Admin Only

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/all-tickets` | All tickets system-wide |
| `POST` | `/admin/assign-ticket` | Assign ticket to manager |
| `PUT` | `/admin/update-ticket/:id` | Update status & respond |
| `POST` | `/admin/create-manager` | Create manager account |
| `GET` | `/admin/managers` | List all managers |

### Admin + Manager

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/contacts` | All contact messages |
| `PUT` | `/api/contacts/:id/read` | Mark message as read |
| `GET` | `/manager/my-tickets` | Manager's assigned tickets |
| `PUT` | `/manager/update-ticket/:id` | Update ticket & respond |

> 📄 For full request/response schemas and validation rules, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

---

## 👥 User Roles

| Role | Access | Created By |
|---|---|---|
| **Guest** | Home, About, How It Works, Contact form | — |
| **User** | Dashboard, Predictions, Help Desk, Ticket tracking | Self-registration (`/signup`) |
| **Manager** | Assigned tickets management, Contact messages | Admin (via Admin Panel) |
| **Admin** | Full system access — tickets, managers, messages | Manual DB insert |

```
Admin ─── can create ──► Manager
  │                         │
  │ full access             │ assigned tickets only
  │                         │
  ├── all tickets           ├── own tickets
  ├── assign tickets        ├── update status
  ├── create managers       ├── respond to users
  ├── contact messages      └── contact messages
  └── admin responses

User ─── self-service
  ├── make predictions
  ├── view dashboard
  ├── create tickets
  └── track ticket status
```

---

## 🔒 Security

| Feature | Implementation |
|---|---|
| Password Storage | PBKDF2-SHA256 (Werkzeug) |
| Authentication | JWT with HS256 signing, 24h expiry |
| Email Verification | Token-based via Brevo API, 24h expiry with TTL index |
| Password Reset | Secure token-based reset via email, 1h expiry |
| Authorization | `@role_required` decorator per route |
| CORS | Restricted to `localhost:3000` |
| Input Validation | Client-side (React) + Server-side (Flask) |
| Token Handling | Auto-expiry check, 401 interception, cross-tab sync |
| Soft Delete | `is_deleted` flag on user accounts (no hard deletes) |

---

## 📖 Documentation

For the **full in-depth technical documentation** covering every file, function, database schema, flow diagram, and more, see:

### 📄 [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

Contents include:
- Complete backend breakdown (every route, every validation)
- Database schema with full document shapes
- ML model deep dive (14 features, training pipeline, fallback formula)
- Frontend architecture (every page, every component)
- End-to-end flow diagrams (auth, prediction, ticket lifecycle)
- Security analysis & improvement recommendations

---

## 👨‍💻 Team

<div align="center">

| | Name | Role |
|---|---|---|
| 👨‍💻 | **Dhananjay** | Developer |
| 👨‍💻 | **Shreyas** | Developer |
| 👨‍💻 | **Krish Panchal** | Developer |

**Ganpat University — Institute of Computer Technology (ICT), Gujarat**  
Semester 8 · IBM Industry Project

</div>

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ at Ganpat University ICT

</div>
