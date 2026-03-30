export type PatientProfile = {
  id: string
  name: string
  village: string
  risk: number
  factors: string[]
  summary: string
  carePlan: string[]
}

export const demoPatients: PatientProfile[] = [
  {
    id: "asha-devi",
    name: "Asha Devi",
    village: "Mansar",
    risk: 86,
    factors: ["Anaemia", "Missed ANC", "Low nutrition"],
    summary: "Risk rising due to persistent anaemia and ANC gaps in the last 14 days.",
    carePlan: ["Confirm Hb test and iron adherence", "Home visit within 48 hours", "Schedule ANC reminder calls"],
  },
  {
    id: "rukmini-bai",
    name: "Rukmini Bai",
    village: "Kotri",
    risk: 74,
    factors: ["High BP trend", "Missed vitals"],
    summary: "Blood pressure trend has worsened and needs urgent supervised follow-up.",
    carePlan: ["Repeat BP today", "Escalate if systolic > 140", "Hydration and rest counselling"],
  },
  {
    id: "meena-kumari",
    name: "Meena Kumari",
    village: "Gopalganj",
    risk: 69,
    factors: ["Low dietary diversity", "Fatigue"],
    summary: "Nutrition indicators dipped, increasing short-term maternal risk.",
    carePlan: ["7-day meal diversity check", "Nutrition counselling", "ANM follow-up in next camp"],
  },
  {
    id: "kiran-yadav",
    name: "Kiran Yadav",
    village: "Chandrapur",
    risk: 79,
    factors: ["Preeclampsia history", "Missed ANC"],
    summary: "Historical profile and repeated ANC misses place her in urgent outreach priority.",
    carePlan: ["Doorstep BP and symptom check", "Fast-track clinician consult", "Family counselling for ANC adherence"],
  },
  {
    id: "fatima-sheikh",
    name: "Fatima Sheikh",
    village: "Supaul",
    risk: 71,
    factors: ["Severe fatigue", "Delayed Hb retest"],
    summary: "Delayed Hb retest and unresolved fatigue indicate high near-term risk.",
    carePlan: ["Urgent Hb retest booking", "Iron adherence review", "Follow-up call tomorrow morning"],
  },
]

export function getPatientById(id: string) {
  return demoPatients.find((p) => p.id === id) ?? null
}
