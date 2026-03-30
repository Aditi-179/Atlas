export type RiskLevel = "critical" | "warning" | "stable"

export interface ShapFeature {
  feature: string
  value: number // positive = increases risk, negative = decreases risk
  rawValue: string // e.g. "Yes", "BMI 31.2"
}

export interface Vitals {
  bmi: { value: number; trend: "up" | "down" | "stable"; label: string }
  bloodPressure: { systolic: number; diastolic: number; trend: "up" | "down" | "stable" }
  bloodSugar: { value: number; unit: string; trend: "up" | "down" | "stable" }
  physicalActivity: { value: number; unit: string; trend: "up" | "down" | "stable" }
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: "M" | "F"
  region: string
  riskScore: number // 0–100
  riskLevel: RiskLevel
  primaryRiskFactor: string
  dispatchStatus: "Dispatched" | "Pending" | "Reviewed" | "Urgent"
  shapFeatures: ShapFeature[]
  vitals: Vitals
  lastVisit: string
}

export const patients: Patient[] = [
  {
    id: "p-001",
    name: "Amara Diallo",
    age: 54,
    gender: "F",
    region: "Dakar North",
    riskScore: 91,
    riskLevel: "critical",
    primaryRiskFactor: "Smoking",
    dispatchStatus: "Urgent",
    lastVisit: "2024-01-08",
    shapFeatures: [
      { feature: "Smoking (20 yrs)", value: 22, rawValue: "Yes — Heavy" },
      { feature: "High BP (Stage 2)", value: 18, rawValue: "158/96 mmHg" },
      { feature: "Age (54)", value: 14, rawValue: "54 years" },
      { feature: "High BMI", value: 11, rawValue: "BMI 32.1" },
      { feature: "Low Activity", value: 8, rawValue: "<60 min/week" },
      { feature: "Education", value: -8, rawValue: "Secondary" },
      { feature: "Diet Score", value: -5, rawValue: "Moderate" },
    ],
    vitals: {
      bmi: { value: 32.1, trend: "up", label: "Obese I" },
      bloodPressure: { systolic: 158, diastolic: 96, trend: "up" },
      bloodSugar: { value: 118, unit: "mg/dL", trend: "stable" },
      physicalActivity: { value: 45, unit: "min/wk", trend: "down" },
    },
  },
  {
    id: "p-002",
    name: "Kwame Asante",
    age: 47,
    gender: "M",
    region: "Accra Central",
    riskScore: 83,
    riskLevel: "critical",
    primaryRiskFactor: "Hypertension",
    dispatchStatus: "Dispatched",
    lastVisit: "2024-01-11",
    shapFeatures: [
      { feature: "High BP (Stage 2)", value: 24, rawValue: "165/102 mmHg" },
      { feature: "Diabetes Risk", value: 16, rawValue: "FBG 121 mg/dL" },
      { feature: "High BMI", value: 13, rawValue: "BMI 29.8" },
      { feature: "Smoking", value: 9, rawValue: "Former smoker" },
      { feature: "Age (47)", value: 7, rawValue: "47 years" },
      { feature: "Physical Activity", value: -10, rawValue: "120 min/week" },
      { feature: "Medication Adherence", value: -6, rawValue: "High" },
    ],
    vitals: {
      bmi: { value: 29.8, trend: "stable", label: "Overweight" },
      bloodPressure: { systolic: 165, diastolic: 102, trend: "up" },
      bloodSugar: { value: 121, unit: "mg/dL", trend: "up" },
      physicalActivity: { value: 120, unit: "min/wk", trend: "up" },
    },
  },
  {
    id: "p-003",
    name: "Fatou Ndiaye",
    age: 61,
    gender: "F",
    region: "Thiès",
    riskScore: 78,
    riskLevel: "critical",
    primaryRiskFactor: "Diabetes Risk",
    dispatchStatus: "Pending",
    lastVisit: "2024-01-05",
    shapFeatures: [
      { feature: "Blood Sugar (High)", value: 20, rawValue: "FBG 138 mg/dL" },
      { feature: "Age (61)", value: 17, rawValue: "61 years" },
      { feature: "BMI", value: 12, rawValue: "BMI 30.5" },
      { feature: "Family History", value: 10, rawValue: "T2D parent" },
      { feature: "Low Activity", value: 6, rawValue: "30 min/week" },
      { feature: "Education", value: -7, rawValue: "University" },
      { feature: "Non-Smoker", value: -4, rawValue: "Never" },
    ],
    vitals: {
      bmi: { value: 30.5, trend: "up", label: "Obese I" },
      bloodPressure: { systolic: 138, diastolic: 85, trend: "stable" },
      bloodSugar: { value: 138, unit: "mg/dL", trend: "up" },
      physicalActivity: { value: 30, unit: "min/wk", trend: "down" },
    },
  },
  {
    id: "p-004",
    name: "Moussa Coulibaly",
    age: 39,
    gender: "M",
    region: "Dakar South",
    riskScore: 62,
    riskLevel: "warning",
    primaryRiskFactor: "High BMI",
    dispatchStatus: "Reviewed",
    lastVisit: "2024-01-14",
    shapFeatures: [
      { feature: "High BMI", value: 18, rawValue: "BMI 34.2" },
      { feature: "Low Activity", value: 12, rawValue: "20 min/week" },
      { feature: "High BP (Stage 1)", value: 9, rawValue: "142/88 mmHg" },
      { feature: "Age (39)", value: 4, rawValue: "39 years" },
      { feature: "Non-Smoker", value: -6, rawValue: "Never" },
      { feature: "Diet Score", value: -8, rawValue: "Good" },
      { feature: "Education", value: -5, rawValue: "University" },
    ],
    vitals: {
      bmi: { value: 34.2, trend: "up", label: "Obese II" },
      bloodPressure: { systolic: 142, diastolic: 88, trend: "stable" },
      bloodSugar: { value: 99, unit: "mg/dL", trend: "stable" },
      physicalActivity: { value: 20, unit: "min/wk", trend: "down" },
    },
  },
  {
    id: "p-005",
    name: "Ama Owusu",
    age: 45,
    gender: "F",
    region: "Kumasi",
    riskScore: 58,
    riskLevel: "warning",
    primaryRiskFactor: "Smoking",
    dispatchStatus: "Pending",
    lastVisit: "2024-01-10",
    shapFeatures: [
      { feature: "Smoking (8 yrs)", value: 15, rawValue: "Yes — Light" },
      { feature: "Age (45)", value: 8, rawValue: "45 years" },
      { feature: "Mild BP Elevation", value: 7, rawValue: "135/84 mmHg" },
      { feature: "BMI", value: 5, rawValue: "BMI 27.1" },
      { feature: "Physical Activity", value: -9, rawValue: "140 min/week" },
      { feature: "Blood Sugar", value: -6, rawValue: "FBG 94 mg/dL" },
    ],
    vitals: {
      bmi: { value: 27.1, trend: "stable", label: "Borderline" },
      bloodPressure: { systolic: 135, diastolic: 84, trend: "stable" },
      bloodSugar: { value: 94, unit: "mg/dL", trend: "stable" },
      physicalActivity: { value: 140, unit: "min/wk", trend: "up" },
    },
  },
  {
    id: "p-006",
    name: "Ibrahim Touré",
    age: 33,
    gender: "M",
    region: "Abidjan",
    riskScore: 31,
    riskLevel: "stable",
    primaryRiskFactor: "Mild BP Elevation",
    dispatchStatus: "Reviewed",
    lastVisit: "2024-01-15",
    shapFeatures: [
      { feature: "Mild BP Elevation", value: 10, rawValue: "128/80 mmHg" },
      { feature: "Age (33)", value: 3, rawValue: "33 years" },
      { feature: "Physical Activity", value: -12, rawValue: "180 min/week" },
      { feature: "Non-Smoker", value: -8, rawValue: "Never" },
      { feature: "Healthy BMI", value: -7, rawValue: "BMI 23.4" },
      { feature: "Blood Sugar", value: -5, rawValue: "FBG 88 mg/dL" },
    ],
    vitals: {
      bmi: { value: 23.4, trend: "stable", label: "Healthy" },
      bloodPressure: { systolic: 128, diastolic: 80, trend: "down" },
      bloodSugar: { value: 88, unit: "mg/dL", trend: "stable" },
      physicalActivity: { value: 180, unit: "min/wk", trend: "up" },
    },
  },
  {
    id: "p-007",
    name: "Nkechi Okafor",
    age: 52,
    gender: "F",
    region: "Lagos East",
    riskScore: 74,
    riskLevel: "critical",
    primaryRiskFactor: "Diabetes Risk",
    dispatchStatus: "Urgent",
    lastVisit: "2024-01-03",
    shapFeatures: [
      { feature: "Blood Sugar (High)", value: 19, rawValue: "FBG 131 mg/dL" },
      { feature: "Age (52)", value: 14, rawValue: "52 years" },
      { feature: "High BMI", value: 11, rawValue: "BMI 31.8" },
      { feature: "Smoking History", value: 8, rawValue: "Quit 5 yrs ago" },
      { feature: "High BP", value: 7, rawValue: "145/90 mmHg" },
      { feature: "Physical Activity", value: -8, rawValue: "90 min/week" },
      { feature: "Education", value: -5, rawValue: "Secondary" },
    ],
    vitals: {
      bmi: { value: 31.8, trend: "stable", label: "Obese I" },
      bloodPressure: { systolic: 145, diastolic: 90, trend: "up" },
      bloodSugar: { value: 131, unit: "mg/dL", trend: "up" },
      physicalActivity: { value: 90, unit: "min/wk", trend: "stable" },
    },
  },
  {
    id: "p-008",
    name: "Seun Adeyemi",
    age: 41,
    gender: "M",
    region: "Lagos West",
    riskScore: 44,
    riskLevel: "warning",
    primaryRiskFactor: "High BMI",
    dispatchStatus: "Pending",
    lastVisit: "2024-01-12",
    shapFeatures: [
      { feature: "High BMI", value: 14, rawValue: "BMI 28.9" },
      { feature: "Low Activity", value: 9, rawValue: "60 min/week" },
      { feature: "Age (41)", value: 5, rawValue: "41 years" },
      { feature: "Non-Smoker", value: -7, rawValue: "Never" },
      { feature: "Normal BP", value: -6, rawValue: "122/78 mmHg" },
      { feature: "Blood Sugar", value: -5, rawValue: "FBG 96 mg/dL" },
    ],
    vitals: {
      bmi: { value: 28.9, trend: "up", label: "Overweight" },
      bloodPressure: { systolic: 122, diastolic: 78, trend: "stable" },
      bloodSugar: { value: 96, unit: "mg/dL", trend: "stable" },
      physicalActivity: { value: 60, unit: "min/wk", trend: "stable" },
    },
  },
]

export const dashboardStats = {
  totalPopulation: 1284,
  highRiskPercent: 34.2,
  topDeterminant: "Smoking",
  dispatchPending: 47,
}
