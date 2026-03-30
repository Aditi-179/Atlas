// Mock RAG Guidelines — simulates a Retrieval-Augmented Generation knowledge base
// based on WHO NCD Protocol 2023 and related clinical evidence.

export interface GuidelineEntry {
  id: string
  source: string
  section: string
  year: number
  content: string
}

export const guidelines: GuidelineEntry[] = [
  {
    id: "who-ncd-4.2",
    source: "WHO NCD Protocol 2023",
    section: "Section 4.2 — Behavioral Interventions",
    year: 2023,
    content:
      "Brief structured counseling interventions (≥5 minutes) delivered by trained community health workers have demonstrated a 15–22% reduction in tobacco use at 6-month follow-up in low-income settings. Level 3 Counseling requires multi-session motivational interviewing combined with behavioral activation.",
  },
  {
    id: "who-ncd-2.1",
    source: "WHO NCD Protocol 2023",
    section: "Section 2.1 — Hypertension Screening",
    year: 2023,
    content:
      "Adults with repeated BP readings ≥140/90 mmHg should be classified as Stage 2 Hypertension and referred for pharmacological review within 4 weeks. Lifestyle modification should be initiated immediately, including sodium restriction (<5g/day) and aerobic activity (150 min/week).",
  },
  {
    id: "who-diabetes-3.4",
    source: "WHO Diabetes Management Guidelines 2022",
    section: "Section 3.4 — Fasting Blood Glucose Thresholds",
    year: 2022,
    content:
      "Fasting blood glucose ≥126 mg/dL on two separate occasions confirms Type 2 Diabetes. Pre-diabetes is defined as 100–125 mg/dL. Dietary counseling and a structured 16-week physical activity program should be the first-line intervention for pre-diabetic patients in community settings.",
  },
  {
    id: "who-ncd-5.1",
    source: "WHO NCD Protocol 2023",
    section: "Section 5.1 — Care Plan Templates",
    year: 2023,
    content:
      "A WHO-compliant NCD care plan should include: (1) Risk stratification score, (2) Three prioritized behavioral goals, (3) Referral pathway to secondary care if required, (4) 30/60/90-day follow-up schedule, and (5) Social determinant screening using the PRAPARE tool.",
  },
  {
    id: "ihme-sdh-1.3",
    source: "IHME Social Determinants of Health Report 2022",
    section: "Section 1.3 — Socioeconomic Risk Multipliers",
    year: 2022,
    content:
      "Low education attainment (<8 years of schooling) is independently associated with a 1.4x increase in NCD mortality, mediated through health literacy deficits and reduced treatment adherence. Interventions targeting health literacy can reduce this risk by up to 18% over 24 months.",
  },
  {
    id: "who-ncd-6.2",
    source: "WHO NCD Protocol 2023",
    section: "Section 6.2 — Physical Activity Prescription",
    year: 2023,
    content:
      "For patients with BMI >27.5 (Asian populations) or >30 (other populations), a supervised, progressive aerobic exercise program (starting at 30 min × 3 days/week and advancing to 150 min/week) is recommended as a primary intervention alongside dietary modification.",
  },
  {
    id: "who-smoke-7.1",
    source: "WHO MPOWER Tobacco Framework 2023",
    section: "Section 7.1 — Cessation Protocols",
    year: 2023,
    content:
      "The 5A model (Ask, Advise, Assess, Assist, Arrange) is the gold standard for brief tobacco cessation counseling. Combined with nicotine replacement therapy (NRT), cessation rates improve by 50–70% compared to counseling alone. Field workers should be trained on the 5A model.",
  },
]

/**
 * Retrieve the most relevant guidelines for a given patient context and query.
 * Simulates semantic search by keyword matching.
 */
export function retrieveGuidelines(query: string, limit = 2): GuidelineEntry[] {
  const q = query.toLowerCase()
  const scored = guidelines.map((g) => {
    let score = 0
    const text = (g.content + g.section + g.source).toLowerCase()
    const keywords = q.split(/\s+/)
    keywords.forEach((kw) => {
      if (text.includes(kw)) score++
    })
    // Boost domain-specific keywords
    if (q.includes("smok") && text.includes("smok")) score += 3
    if (q.includes("bp") || q.includes("blood pressure") || q.includes("hypertens")) {
      if (text.includes("hypertens") || text.includes("bp")) score += 3
    }
    if (q.includes("diabetes") || q.includes("glucose") || q.includes("blood sugar")) {
      if (text.includes("diabetes") || text.includes("glucose")) score += 3
    }
    if (q.includes("bmi") || q.includes("weight") || q.includes("obese")) {
      if (text.includes("bmi") || text.includes("physical activity")) score += 3
    }
    if (q.includes("care plan") || q.includes("plan")) {
      if (text.includes("care plan")) score += 3
    }
    return { guideline: g, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.guideline)
}
