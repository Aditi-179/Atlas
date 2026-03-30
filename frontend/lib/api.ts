import {
  RiskPredictionInput,
  RiskPredictionOutput,
  PatientClinicalData,
  ClinicalProtocolOutput,
  RAGPatientHealthData,
  RAGInsightResponse,
  PatientRecord,
  UserRegister,
  UserLogin,
  Token,
  MobilePatientData,
  MobileRecordUpdate,
  PatientProfile
} from './types';

// Assuming the FastAPI backend runs on localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = {
  // ------------------------------------------
  // RISK ENGINE
  // ------------------------------------------
  async getRiskPrediction(data: RiskPredictionInput): Promise<RiskPredictionOutput> {
    const res = await fetch(`${API_BASE_URL}/risk-engine/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to fetch risk prediction");
    return res.json();
  },

  // ------------------------------------------
  // DECISION SUPPORT
  // ------------------------------------------
  async generateClinicalProtocol(data: PatientClinicalData): Promise<ClinicalProtocolOutput> {
    const res = await fetch(`${API_BASE_URL}/decision-support/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to generate clinical protocol");
    return res.json();
  },

  // ------------------------------------------
  // RAG NLP INSIGHTS
  // ------------------------------------------
  async generateRagInsights(data: RAGPatientHealthData): Promise<RAGInsightResponse> {
    const res = await fetch(`${API_BASE_URL}/rag/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to generate RAG insights");
    return res.json();
  },

  // ------------------------------------------
  // POPULATION HEALTH
  // ------------------------------------------
  async getPopulationStats(): Promise<PatientRecord[]> {
    const res = await fetch(`${API_BASE_URL}/population-health/raw-stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to fetch population stats");
    return res.json();
  },
  // ------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------
  async register(data: UserRegister): Promise<Token> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to register");
    return res.json();
  },

  async login(data: UserLogin): Promise<Token> {
    // Form data encoding for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    if (!res.ok) throw new Error("Failed to login");
    return res.json();
  },

  // ------------------------------------------
  // MOBILE API (Protected Endpoints)
  // ------------------------------------------
  async getWorkerPatients(token: string): Promise<MobilePatientData[]> {
    const res = await fetch(`${API_BASE_URL}/mobile/worker/patients`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch worker patients");
    return res.json();
  },

  async updatePatientRecord(patientId: string, data: MobileRecordUpdate, token: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/mobile/worker/patients/${patientId}/update`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update patient record");
    return res.json();
  },

  async getPatientProfile(token: string): Promise<PatientProfile> {
    const res = await fetch(`${API_BASE_URL}/mobile/patient/me`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch patient profile");
    return res.json();
  }
};
