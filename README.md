
# 🏥 CareFlow AI: Predictive NCD Intelligence & Decision Support

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Python](https://img.shields.io/badge/Backend-FastAPI-green)
![ML](https://img.shields.io/badge/ML-XGBoost-orange)
![AI](https://img.shields.io/badge/RAG-Gemini/Groq-red)

> **"Transforming Public Health from Reactive Treatment to Predictive Prevention."**

**CareFlow AI** is an end-to-end clinical operating system designed for NGOs and health departments. It solves the critical gap in Non-Communicable Disease (NCD) management by combining **Predictive Risk Stratification (PS7)** with **Evidence-Based RAG Decision Support (PS8)**.

---

## 🌟 Unique Selling Propositions (USPs)

1.  **Scientific Rigor (CDC-Backed):** Unlike generic health apps, our engine is trained on the **CDC’s BRFSS (Behavioral Risk Factor Surveillance System)** dataset, analyzing real-world clinical, behavioral, and social determinants.
2.  **Explainable AI (XAI):** We solve the "Black Box" problem in healthcare. Using **SHAP (SHapley Additive exPlanations)**, we show frontline workers exactly *why* a patient is at risk (e.g., "30% risk increase due to Tobacco use").
3.  **Zero-Hallucination RAG:** Our clinical copilot uses **Retrieval-Augmented Generation**. Every medical recommendation is strictly grounded in WHO/NGO guidelines and includes **direct citations**, ensuring patient safety.
4.  **Social Determinants Integration:** We explicitly weigh **Income and Education levels**, ensuring that NCD risk is calculated within the context of the patient's socio-economic reality.

---

## 🚀 Core Features

### 👨‍💼 For NGO Admins (PS7 Macro-View)
*   **Population Triage:** Bulk-process thousands of community records to identify high-risk "hotspots."
*   **Resource Allocation Dashboard:** Data-driven insights to decide where to deploy medical mobile units.

### 👩‍⚕️ For Frontline Workers (PS7 Micro-View)
*   **Priority Queue:** A dynamically sorted list of patients based on real-time AI risk scores.
*   **Explainability Panel:** Visual charts explaining risk drivers to help workers focus their counseling sessions.

### 🧠 The Clinical Copilot (PS8 Decision Support)
*   **Context-Aware Chat:** An AI assistant that knows the patient’s clinical history and provides personalized advice.
*   **Actionable Care Plans:** 1-click generation of counseling steps, dietary modifications, and referral protocols.

---

## 🏗️ Technical Architecture

### **Frontend**
*   **Framework:** Next.js 14 (App Router)
*   **Styling:** Tailwind CSS + Shadcn UI
*   **Animations:** Framer Motion
*   **Charts:** Recharts / Chart.js

### **Backend & AI**
*   **API:** FastAPI (Python)
*   **Predictive Model:** XGBoost (Optimized via Hyperparameter Tuning)
*   **Explainability:** SHAP Library
*   **LLM Engine:** Groq (Llama-3-70B) / Google Gemini Pro
*   **Vector DB:** FAISS / ChromaDB for RAG implementation

---

## 💼 Business Model & Impact

### **The Target Market**
*   **B2G (Business to Government):** National Health Missions and State Health Departments.
*   **B2NGO:** International health organizations (WHO, Bill & Melinda Gates Foundation, Doctors Without Borders).

### **Value Proposition**
*   **Cost Reduction:** Preventative care for NCDs is **10x cheaper** than treating late-stage complications like heart failure or kidney dialysis.
*   **Efficiency:** Frontline workers can manage **3x more patients** with AI-guided decision support.

### **Revenue Streams**
1.  **SaaS Subscription:** Tiered pricing based on the number of patients managed.
2.  **Custom Deployment:** On-premise installation for government data privacy compliance.
3.  **Insights-as-a-Service:** Anonymized population health trend reports for pharmaceutical research.

---

## 🛠️ Installation & Setup

1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-username/careflow-ai.git
   cd careflow-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Environment Variables**
   Create a `.env` file in the backend root:
   ```env
   GROQ_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

---

## 🛤️ Future Roadmap
*   **v2.0:** Integration with wearable IoT devices for real-time risk monitoring.
*   **v2.1:** Multilingual Voice-AI for frontline workers in rural regions.
*   **v3.0:** Federated Learning to improve models without moving sensitive patient data.

2024]*
