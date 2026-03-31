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
  PatientProfile,
  PopulationAggregateResponse,
  PopulationSimulationRequest,
  SimulationRequest,
  SimulationResponse,
  DigitalTwinResponse,
  VoiceInput,
  HealthAgentResponse,
  AdherenceLog,
  AdherenceSummary,
  AuditReport,
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
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch population stats");
    return res.json();
  },

  async getResourceAllocation(
    source: string = "mongo",
    location_field: string = "phc",
    phc?: string
  ): Promise<PopulationAggregateResponse> {
    const params = new URLSearchParams({
      source,
      location_field,
      ...(phc && { phc }),
    });
    const res = await fetch(`${API_BASE_URL}/population-health/resource-allocation?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to fetch resource allocation");
    return res.json();
  },

  async simulateIntervention(
    request: PopulationSimulationRequest
  ): Promise<PopulationAggregateResponse> {
    const res = await fetch(`${API_BASE_URL}/population-health/resource-allocation/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("Failed to simulate intervention");
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
    const params = new URLSearchParams();
    params.append("username", data.username);
    params.append("password", data.password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
  },

  // ------------------------------------------
  // BEHAVIORAL SIMULATION
  // ------------------------------------------
  async runBehavioralSim(data: SimulationRequest): Promise<SimulationResponse> {
    const res = await fetch(`${API_BASE_URL}/behavioral-sim/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to run behavioral simulation");
    return res.json();
  },

  // ------------------------------------------
  // DIGITAL TWIN
  // ------------------------------------------
  async projectDigitalTwin(data: RiskPredictionInput): Promise<DigitalTwinResponse> {
    const res = await fetch(`${API_BASE_URL}/digital-twin/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to project digital twin");
    return res.json();
  },

  // ------------------------------------------
  // HEALTH AGENT (VOICE)
  // ------------------------------------------
  async processVoice(data: VoiceInput): Promise<HealthAgentResponse> {
    const res = await fetch(`${API_BASE_URL}/health-agent/process-voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Health Agent failed to process voice");
    return res.json();
  },

  // ------------------------------------------
  // ADHERENCE MONITOR
  // ------------------------------------------
  async logAdherence(data: AdherenceLog): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/adherence/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to log adherence");
    return res.json();
  },

  async getAdherenceSummary(patientId: string): Promise<AdherenceSummary> {
    const res = await fetch(`${API_BASE_URL}/adherence/summary/${patientId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch adherence summary");
    return res.json();
  },

  // ------------------------------------------
  // BIAS AUDITOR
  // ------------------------------------------
  async runBiasAudit(): Promise<AuditReport> {
    const res = await fetch(`${API_BASE_URL}/bias-auditor/run-audit`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to run equity audit");
    return res.json();
  },
}