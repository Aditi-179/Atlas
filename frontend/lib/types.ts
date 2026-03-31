// ==========================================
// RISK ENGINE TYPES
// ==========================================
export interface RiskPredictionInput {
  HighBP: number;
  HighChol: number;
  BMI: number;
  DiffWalk: number;
  Age: number;
  Sex: number;
  Smoker: number;
  PhysActivity: number;
  Veggies: number;
  HvyAlcoholConsump: number;
  Income: number;
  Education: number;
}

export interface RiskContributor {
  feature: string;
  impact: number;
}

export interface RiskPredictionOutput {
  risk_score: number;
  risk_tier: string;
  model_used: string;
  accuracy_at_training: number;
  top_contributors: RiskContributor[];
}

// ==========================================
// DECISION SUPPORT TYPES
// ==========================================
export interface PatientClinicalData {
  patient_id?: string;
  age: number;
  gender: string;
  vitals: Record<string, any>;
  habits: Record<string, string>;
  risk_tier: string;
}

export interface ActionStep {
  category: string;
  action: string;
  urgency: string;
  evidence_citation: string;
}

export interface ClinicalProtocolOutput {
  summary: string;
  protocol_steps: ActionStep[];
}

// ==========================================
// RAG NLP INTEGRATION TYPES
// ==========================================
export interface RAGPatientHealthData {
  bmi: number;
  age: number;
  high_bp: number;
  high_chol: number;
  smoker: number;
  phys_activity: number;
  hvy_alcohol: number;
  ncd_risk_probability: number;
  risk_tier: string;
}

export interface RAGInsightResponse {
  analysis_summary: string;
  primary_risk_factors: string[];
  clinical_guidelines: string[];
  recommended_action: string;
}

// ==========================================
// POPULATION HEALTH TYPES
// ==========================================
export interface PatientRecord {
  Patient_ID: string;
  Diabetes: number;
  HighBP: number;
  HighChol: number;
  BMI: number;
  Smoker: number;
  HeartDiseaseorAttack: number;
  PhysActivity: number;
  Fruits: number;
  Veggies: number;
  HvyAlcoholConsump: number;
  DiffWalk: number;
  Sex: number;
  Age: number;
  Education: number;
  Income: number;
  NCD_Risk: number;
  Metabolic_Risk_Index: number;
  Clinical_Burden: number;
  Healthy_Habits_Score: number;
  Unhealthy_Lifestyle_Index: number;
  Physical_Mobility_Risk: number;
  Patient_Name: string;
  Phone_Number: string;
  City: string;
  Overall_NCD_Risk: number;
  Age_Group: string;
  Gender: string;
}

// ==========================================
// AUTHENTICATION TYPES
// ==========================================
export interface UserRegister {
  email: string;
  password: string;
  role: "worker" | "patient";
}

export interface UserLogin {
  username: string; // Used for email in OAuth2
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

// ==========================================
// MOBILE API TYPES
// ==========================================
export interface MobileRecordUpdate {
  age?: number;
  gender?: string;
  vitals?: Record<string, number>;
  habits?: Record<string, string>;
}

export interface PatientProfile {
  id: string;
  email: string;
  role: string;
  latest_record?: any;
}

export interface MobilePatientData extends PatientProfile {
  // Can expand with assigned_worker specific tracking
}

export interface SimulationRequest {
  current_state: RiskPredictionInput;
  modified_habits: Record<string, number>;
}

export interface SimulationResponse {
  current_risk: number;
  simulated_risk: number;
  risk_reduction: number;
  impact_message: string;
}

// ==========================================
// DIGITAL TWIN TYPES
// ==========================================
export interface TwinProjection {
  month: number;
  risk_score: number;
  clinical_state: Record<string, number>;
}

export interface DigitalTwinResponse {
  baseline_trajectory: TwinProjection[];
  optimized_trajectory: TwinProjection[];
  clinical_narrative: string;
}

// ==========================================
// HEALTH AGENT TYPES
// ==========================================
export interface VoiceInput {
  transcript: string;
}

export interface HealthAgentResponse {
  structured_data: RiskPredictionInput;
  spoken_response: string;
}

// ==========================================
// POPULATION HEALTH ANALYTICS TYPES
// ==========================================
export interface RiskDistribution {
  red: number;
  yellow: number;
  green: number;
}

export interface InterventionImpact {
  before_hospitalizations: number;
  after_hospitalizations: number;
  reduction_percent: number;
}

export interface PopulationGroup {
  phc: string;
  population: number;
  avg_risk_score: number;
  risk_distribution: RiskDistribution;
  intervention_impact: InterventionImpact;
}

export interface PopulationAggregateResponse {
  source: string;
  groups: PopulationGroup[];
}

export interface InterventionConfig {
  home_visit_increase: number;
  counseling_sessions: number;
  screening_boost: number;
}

export interface PopulationSimulationRequest {
  source?: "mongo" | "csv";
  location_field?: string;
  phc?: string;
  csv_path?: string;
  forecast_months?: number;
  intervention: InterventionConfig;
}

// ==========================================
// ADHERENCE MONITOR TYPES
// ==========================================
export interface AdherenceLog {
  patient_id: string;
  log_date: string; // ISO date string
  took_meds: boolean;
  healthy_diet: boolean;
  exercised: boolean;
  meds_detail?: string;
  exercise_detail?: string;
}

export interface AdherenceSummary {
  adherence_index: number; // Percentage (0-100)
  current_status: string;  // "Stable", "At Risk", "Critical"
  trend: string;           // "Improving" or "Declining"
  recent_logs: any[];
}

// ==========================================
// BIAS AUDITOR TYPES
// ==========================================
export interface EquityMetric {
  group_name: string;
  avg_risk_score: number;
  population_percentage: number;
  disparate_impact_ratio: number;
}

export interface AuditReport {
  gender_equity: EquityMetric[];
  income_equity: EquityMetric[];
  overall_fairness_score: number;
  llm_governance_advice: string;
}
