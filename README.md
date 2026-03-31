
# 🏥 CareFlow AI — Predictive NCD Intelligence & Decision Support

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![ML](https://img.shields.io/badge/ML-XGBoost%20%2B%20Random%20Forest-orange)
![AI](https://img.shields.io/badge/RAG-Groq%20LLM-red)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB)

> **"Transforming Public Health from Reactive Treatment to Predictive Prevention."**

**CareFlow AI** is a full-stack clinical operating system for NGOs and public health departments. It bridges the critical gap in Non-Communicable Disease (NCD) management by combining **Predictive ML Risk Stratification**, **Explainable AI (SHAP)**, **Retrieval-Augmented Generation (RAG) Clinical Decision Support**, and a **real-time community health worker mobile app** — all in one integrated platform.

---

## 🌟 Unique Selling Propositions

| # | USP | Detail |
|---|---|---|
| 1 | **CDC-Backed Science** | Trained on the CDC's BRFSS dataset — real clinical, behavioral & social determinant data |
| 2 | **Explainable AI (XAI)** | SHAP values surface exactly *why* a patient is at risk in plain language |
| 3 | **Zero-Hallucination RAG** | Every recommendation is grounded in WHO/NGO guidelines with direct citations |
| 4 | **Social Determinants (SDoH)** | Income and Education levels explicitly factored into every risk score |
| 5 | **Unified Stack** | Web dashboard + REST API + React Native mobile app — all integrated end-to-end |

---

## 🚀 Features

### 🖥️ NGO Admin Web Dashboard (`/frontend`)

| Feature | Description |
|---|---|
| **Population Macro-Radar** | Live KPI cards: total screened, high-risk count, average age, gender split, average NCD risk score |
| **Hotspot City Map** | Auto-computed top cities by NCD-positive patient count from real CSV data |
| **Population Overview** | Drill-down stats: total screened, risk distribution, obese count, normal vitals count |
| **Vitals Monitor** | Real counts for High BP, High Cholesterol, Obese (BMI ≥ 30), Normal Vitals patients |
| **Patients Priority Queue** | 1000 real records sorted by `Overall_NCD_Risk`, with live search by name/city/age group |
| **Patient Deep-Dive** | Individual page with live AI risk score, SHAP bar chart, health indicators, AI care plan |
| **Clinical Copilot** | AI chat sidebar powered by real RAG endpoint — context-aware per selected patient |
| **Reports & Export** | Live stats, age group distribution chart, hotspot city grid — all from real data |

---

### 🤖 Backend Feature Modules (`/backend/app/features`)

| Module | Endpoint | What It Does |
|---|---|---|
| **`risk_engine`** | `POST /api/v1/risk-engine/predict` | Runs XGBoost + Random Forest unified predictor; returns `risk_score`, `risk_tier` (Red/Yellow/Green), SHAP `top_contributors` |
| **`decision_support`** | `POST /api/v1/decision-support/generate` | Groq LLM generates a structured care protocol: `summary` + `protocol_steps[]` with urgency levels and evidence citations |
| **`RAG`** | `POST /api/v1/rag/insights` | Retrieval-Augmented Generation against WHO/NGO medical guidelines; returns `analysis_summary`, `primary_risk_factors`, `clinical_guidelines`, `recommended_action` |
| **`population_health`** | `GET /api/v1/population-health/raw-stats` | Serves the full 1000-patient demo CSV as structured JSON (27 fields per record) |
| **`auth`** | `POST /api/v1/auth/register` · `POST /api/v1/auth/login` | JWT token-based authentication; roles: `worker` / `patient` |
| **`mobile_api`** | `GET /api/v1/mobile/worker/patients` · `POST /api/v1/mobile/.../update` · `GET /api/v1/mobile/patient/me` | Protected Bearer-token endpoints for health workers and patients |
| **`adherence_monitor`** | *(In development)* | Tracks medication and care plan adherence over time |
| **`behavioral_sim`** | *(In development)* | Simulates behavior change outcomes for intervention planning |
| **`bias_auditor`** | *(In development)* | Audits model predictions for demographic bias |
| **`digital_twin`** | *(In development)* | Patient digital twin for longitudinal health trajectory simulation |
| **`health_agent`** | *(In development)* | Autonomous AI health agent for proactive outreach scheduling |

---

### 🧠 ML Model Pipeline (`/backend/app/models`)

| Model | Accuracy | Role |
|---|---|---|
| **XGBoost** (primary) | **82.4%** | Optimized binary NCD risk classifier with hyperparameter tuning |
| **Random Forest** (secondary) | **77.3%** | Ensemble baseline; used when XGBoost confidence is low |
| **Unified Predictor** | Adaptive | `unified_predictor.py` auto-selects best model; runs SHAP on XGBoost output |

**Feature Engineering (applied at inference):**
- `Metabolic_Risk_Index` = BMI × Age
- `Clinical_Burden` = HighBP + HighChol
- `Healthy_Habits_Score` = PhysActivity + Veggies
- `Unhealthy_Lifestyle_Index` = Smoker + HvyAlcohol + HighBP
- `Physical_Mobility_Risk` = BMI × DiffWalk

**Input features:** `HighBP`, `HighChol`, `BMI`, `DiffWalk`, `Age`, `Sex`, `Smoker`, `PhysActivity`, `Veggies`, `HvyAlcoholConsump`, `Income`, `Education`

---

### 📱 Mobile App (`/mobile`) — React Native

| Screen | Description |
|---|---|
| **Worker Dashboard** | Lists all assigned patients sorted by risk; real-time updates from `/mobile/worker/patients` |
| **Patient Record Update** | Field worker can log vitals, habits, age, gender directly from the field |
| **Patient Profile** | Patient view of their own profile and latest risk record via `/mobile/patient/me` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CareFlow AI                          │
├────────────────┬────────────────┬───────────────────────┤
│  Next.js 16    │   FastAPI      │   React Native         │
│  Web Dashboard │   REST API     │   Mobile App           │
│                │                │                        │
│  /app          │  /app/features │  /mobile/src           │
│  /components   │  /app/models   │                        │
│  /lib/api.ts   │  /app/core     │                        │
└────────────────┴───────┬────────┴───────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     MongoDB          XGBoost +      Groq LLM
     (Motor)       Random Forest     (RAG Engine)
                    + SHAP
```

### Frontend API Client (`lib/api.ts`)

All 4 API methods are fully integrated into the frontend:

| Method | Endpoint | Used In |
|---|---|---|
| `getPopulationStats()` | `GET /population-health/raw-stats` | `usePopulationData` hook → dashboard, patients list, population view, vitals view, reports |
| `getRiskPrediction()` | `POST /risk-engine/predict` | `patients/[id]/page.tsx` — auto-fires on patient open |
| `generateClinicalProtocol()` | `POST /decision-support/generate` | `patients/[id]/page.tsx` — "Generate Care Plan" button |
| `generateRagInsights()` | `POST /rag/insights` | `CopilotSidebar` component — every chat message |

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/careflow-ai.git
cd Atlas
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  

### 3. Train ML Models (first time only)
```bash
cd backend/app/models/RadomForest
python train.py
# → saves rf_model.joblib to app/models/artifacts/

cd ../Xgboost
python train.py
# → saves xgb_model.pkl + xgb_columns.pkl to app/models/artifacts/
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 5. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

### 6. Environment Variables

**`backend/.env`**
```env
MONGO_URI=mongodb://localhost:27017
GROQ_API_KEY=your_groq_key_here
SECRET_KEY=your_jwt_secret_here
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 📁 Project Structure

```
Atlas/
├── backend/
│   └── app/
│       ├── core/            # Config, database, security, dependencies
│       ├── features/
│       │   ├── risk_engine/         # XGBoost/RF prediction API
│       │   ├── decision_support/    # Groq LLM care protocol generator
│       │   ├── RAG/                 # Retrieval-Augmented Generation
│       │   ├── population_health/   # CSV population data API
│       │   ├── auth/                # JWT authentication
│       │   ├── mobile_api/          # Health worker & patient endpoints
│       │   ├── adherence_monitor/   # (In development)
│       │   ├── behavioral_sim/      # (In development)
│       │   ├── bias_auditor/        # (In development)
│       │   ├── digital_twin/        # (In development)
│       │   └── health_agent/        # (In development)
│       ├── models/
│       │   ├── artifacts/           # Trained model files (.joblib, .pkl)
│       │   ├── RadomForest/         # RF training scripts
│       │   ├── Xgboost/             # XGBoost training scripts
│       │   ├── data/                # CSV datasets
│       │   └── unified_predictor.py # Auto-selects best model + SHAP
│       └── main.py
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Landing → main dashboard shell
│   │   ├── dashboard/         # NGO dashboard (risk pulse, patient list)
│   │   ├── patients/          # Patient list with search
│   │   ├── patients/[id]/     # Individual patient: risk score, SHAP, care plan
│   │   ├── reports/           # Live population stats & age distribution
│   │   └── settings/          # User preferences
│   ├── components/
│   │   └── careflow/
│   │       ├── copilot-sidebar.tsx  # Clinical AI chat (RAG-powered)
│   │       ├── macro-radar.tsx      # Main dashboard grid
│   │       ├── patient-deep-dive.tsx
│   │       ├── app-sidebar.tsx
│   │       └── landing-page.tsx
│   └── lib/
│       ├── api.ts             # Centralized API client (4 methods)
│       ├── types.ts           # TypeScript interfaces (1:1 with Pydantic models)
│       └── hooks/
│           └── usePopulationData.ts  # Shared data hook
│
└── mobile/
    └── src/                   # React Native screens
```

---

## 💼 Business Model & Impact

### Target Market
- **B2G:** National Health Missions, State Health Departments
- **B2NGO:** WHO, Bill & Melinda Gates Foundation, Doctors Without Borders

### Value Proposition
- Preventative NCD care is **10× cheaper** than treating late-stage complications
- Frontline workers can manage **3× more patients** with AI-guided decision support
- Real-time population intelligence helps governments **allocate resources 40% more efficiently**

### Revenue Streams
1. **SaaS Subscription** — tiered pricing by patient volume
2. **Custom Deployment** — on-premise for government data sovereignty
3. **Insights-as-a-Service** — anonymized population health trends for pharma research


---

## 📜 License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with ❤️ for public health. CareFlow AI — 2026*
