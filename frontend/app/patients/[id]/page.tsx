"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { usePopulationData } from "@/lib/hooks/usePopulationData"
import { api } from "@/lib/api"
import type { RiskPredictionOutput, ClinicalProtocolOutput } from "@/lib/types"
import type { PatientRecord } from "@/lib/types"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

function getRiskColor(tier: string) {
  if (tier === "Red") return "text-[#dc2626]"
  if (tier === "Yellow") return "text-[#d97706]"
  return "text-[#0d9488]"
}

function buildRiskInput(r: PatientRecord) {
  // Map CSV age group to a numeric age (midpoint of range)
  const ageMap: Record<string, number> = {
    "18-24": 21, "25-29": 27, "30-34": 32, "35-39": 37,
    "40-44": 42, "45-49": 47, "50-54": 52, "55-59": 57,
    "60-64": 62, "65-69": 67, "70-74": 72, "75-79": 77, "80+": 82,
  }
  return {
    HighBP: r.HighBP as number,
    HighChol: r.HighChol as number,
    BMI: Math.min(Math.max(r.BMI as number, 10), 60),
    DiffWalk: r.DiffWalk as number,
    Age: ageMap[r.Age_Group as string] ?? 45,
    Sex: r.Sex as number,
    Smoker: r.Smoker as number,
    PhysActivity: r.PhysActivity as number,
    Veggies: r.Veggies as number,
    HvyAlcoholConsump: r.HvyAlcoholConsump as number,
    Income: Math.min(Math.max(r.Income as number, 1), 8),
    Education: Math.min(Math.max(r.Education as number, 1), 6),
  }
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const name = decodeURIComponent(params.id)
  const { records, loading: recordsLoading } = usePopulationData()
  const [generated, setGenerated] = useState(false)
  const [completed, setCompleted] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState("")
  const [riskResult, setRiskResult] = useState<RiskPredictionOutput | null>(null)
  const [protocol, setProtocol] = useState<ClinicalProtocolOutput | null>(null)
  const [riskLoading, setRiskLoading] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [riskError, setRiskError] = useState<string | null>(null)

  const patient = useMemo(
    () => records.find((r) => r.Patient_Name === name) ?? null,
    [records, name]
  )

  // Auto-fetch risk prediction once patient record is found
  useEffect(() => {
    if (!patient) return
    setRiskLoading(true)
    setRiskError(null)
    api.getRiskPrediction(buildRiskInput(patient))
      .then(setRiskResult)
      .catch((e) => setRiskError(e.message ?? "Risk prediction failed"))
      .finally(() => setRiskLoading(false))
  }, [patient])

  const handleGeneratePlan = async () => {
    if (!patient || !riskResult) return
    setGenerated(true)
    setPlanLoading(true)
    try {
      const result = await api.generateClinicalProtocol({
        patient_id: name,
        age: riskResult ? parseInt(patient.Age_Group as string) || 45 : 45,
        gender: patient.Gender as string,
        vitals: { bmi: patient.BMI, systolic_bp: patient.HighBP === 1 ? 145 : 115 },
        habits: {
          smoking: patient.Smoker === 1 ? "current" : "never",
          diet: patient.Veggies === 1 ? "moderate" : "poor",
        },
        risk_tier: riskResult?.risk_tier ?? "Yellow",
      })
      setProtocol(result)
    } catch {
      // fallback gracefully — show no plan
    } finally {
      setPlanLoading(false)
    }
  }

  if (recordsLoading) {
    return (
      <AppShell title="Loading patient…">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/50 animate-pulse" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!patient) {
    return (
      <AppShell title="Patient not found">
        <Link href="/patients" className="text-[#0d9488] hover:underline">
          Back to patients
        </Link>
      </AppShell>
    )
  }

  const riskTierLabel = riskResult?.risk_tier ?? "—"
  const riskScore = riskResult?.risk_score ?? (patient.Overall_NCD_Risk ?? 0)
  const riskColorClass = getRiskColor(riskTierLabel)

  return (
    <AppShell title={patient.Patient_Name as string} subtitle={`${patient.City} · ${patient.Age_Group} · ${patient.Gender}`}>
      <div className="space-y-5">
        <Link href="/patients" className="inline-flex text-sm text-[#0d9488] hover:underline">
          ← Back to Patients
        </Link>

        {/* Risk Score Card */}
        <section className="rounded-2xl bg-white/85 p-4">
          <p className="text-sm text-[#0f172a]/70">NCD Risk Score</p>
          {riskLoading ? (
            <div className="h-12 w-32 rounded-xl bg-[#0f172a]/8 animate-pulse mt-1" />
          ) : (
            <>
              <h2 className={`font-[var(--font-playfair)] text-5xl leading-none ${riskColorClass}`}>
                {Math.round(riskScore as number)}%
              </h2>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskTierLabel === "Red" ? "bg-[#fee2e2] text-[#dc2626]" :
                    riskTierLabel === "Yellow" ? "bg-[#fef3c7] text-[#d97706]" :
                      "bg-[#d1fae5] text-[#0d9488]"
                  }`}>
                  {riskTierLabel} Risk
                </span>
                {riskResult && (
                  <span className="text-xs text-[#0f172a]/55">Model: {riskResult.model_used}</span>
                )}
              </div>
              {riskError && <p className="mt-1 text-xs text-[#dc2626]">{riskError}</p>}
            </>
          )}
        </section>

        {/* SHAP Top Contributors */}
        {riskResult && riskResult.top_contributors.length > 0 && (
          <section className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold mb-3">Top Risk Drivers (AI Explanation)</h3>
            <div className="space-y-2">
              {riskResult.top_contributors.map((c, i) => {
                const impact = typeof c === "object" && "impact" in c ? (c as unknown as { feature: string; impact: number }).impact : 0
                const feat = typeof c === "object" && "feature" in c ? (c as unknown as { feature: string; impact: number }).feature : String(c)
                const pct = Math.min(Math.abs(impact * 100), 100)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-40 truncate text-xs text-[#0f172a]/70">{feat}</span>
                    <div className="flex-1 rounded-full bg-[#0f172a]/8 h-2">
                      <div
                        className={`h-2 rounded-full ${impact > 0 ? "bg-[#dc2626]" : "bg-[#0d9488]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono ${impact > 0 ? "text-[#dc2626]" : "text-[#0d9488]"}`}>
                      {impact > 0 ? "+" : ""}{impact.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Patient Details */}
        <section className="rounded-2xl bg-white/85 p-4">
          <h3 className="font-semibold mb-3">Health Indicators</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-[#0f172a]/70">
            <span>BMI: <strong>{patient.BMI}</strong></span>
            <span>High BP: <strong>{patient.HighBP === 1 ? "Yes" : "No"}</strong></span>
            <span>High Chol: <strong>{patient.HighChol === 1 ? "Yes" : "No"}</strong></span>
            <span>Smoker: <strong>{patient.Smoker === 1 ? "Yes" : "No"}</strong></span>
            <span>Active: <strong>{patient.PhysActivity === 1 ? "Yes" : "No"}</strong></span>
            <span>Phone: <strong>{patient.Phone_Number}</strong></span>
          </div>
        </section>

        {/* Generate Care Plan */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          transition={SPRING}
          onClick={handleGeneratePlan}
          disabled={riskLoading || !riskResult}
          className="w-full rounded-2xl bg-[#0d9488] px-4 py-3 text-base font-medium text-white shadow-[0_18px_38px_rgba(13,148,136,0.32)] disabled:opacity-50"
        >
          {planLoading ? "Generating Care Plan…" : "Generate Today's Care Plan"}
        </motion.button>

        {/* Care Plan from Decision Support API */}
        {generated && (
          <section className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold">AI-Generated Care Plan</h3>
            {planLoading ? (
              <div className="space-y-2 mt-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-xl bg-[#0f172a]/8 animate-pulse" />)}
              </div>
            ) : protocol ? (
              <>
                <p className="text-sm text-[#0f172a]/65 mt-1 mb-3">{protocol.summary}</p>
                <div className="space-y-2">
                  {protocol.protocol_steps.map((step, idx) => (
                    <label key={idx} className="flex items-start gap-2 rounded-xl bg-[#f8f9f8] px-3 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!completed[idx]}
                        onChange={(e) => setCompleted((prev) => ({ ...prev, [idx]: e.target.checked }))}
                        className="mt-1 h-4 w-4 accent-[#0d9488]"
                      />
                      <div>
                        <span className="text-sm font-medium">{step.action}</span>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-xs text-[#0f172a]/50">{step.category}</span>
                          <span className={`text-xs font-semibold ${step.urgency === "High" ? "text-[#dc2626]" : "text-[#d97706]"}`}>
                            {step.urgency}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#0f172a]/55 mt-2">Could not load plan — try again.</p>
            )}
          </section>
        )}

        {/* Visit Notes */}
        <section className="rounded-2xl bg-white/85 p-4">
          <h3 className="mb-2 font-semibold">Visit Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type quick observations from this home visit…"
            className="min-h-28 w-full rounded-xl border border-[#0f172a]/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0d9488]"
          />
        </section>
      </div>
    </AppShell>
  )
}
