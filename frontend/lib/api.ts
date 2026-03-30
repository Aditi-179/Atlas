import {
  RiskPredictionInput,
  RiskPredictionOutput,
  PatientClinicalData,
  ClinicalProtocolOutput,
  RAGPatientHealthData,
  RAGInsightResponse,
  PatientRecord,
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

};