"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { usePopulationData } from "@/lib/hooks/usePopulationData"
import type { PatientRecord } from "@/lib/types"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

function getRiskFactors(r: PatientRecord): string[] {
  const factors: string[] = []
  if (r.HighBP === 1) factors.push("High BP")
  if (r.HighChol === 1) factors.push("High Cholesterol")
  if (r.Smoker === 1) factors.push("Smoker")
  if (r.HvyAlcoholConsump === 1) factors.push("Heavy Alcohol")
  if (r.DiffWalk === 1) factors.push("Mobility Issue")
  if (r.BMI >= 30) factors.push(`BMI ${r.BMI}`)
  if (r.Diabetes > 0) factors.push("Diabetes")
  return factors.length ? factors : ["No flags"]
}

function getRiskColor(riskScore: number): string {
  if (riskScore >= 60) return "text-[#dc2626]"
  if (riskScore >= 35) return "text-[#d97706]"
  return "text-[#0d9488]"
}

export default function PatientsPage() {
  const { records, loading } = usePopulationData()
  const [search, setSearch] = useState("")

  const sorted = [...records].sort(
    (a, b) => (b.Overall_NCD_Risk ?? 0) - (a.Overall_NCD_Risk ?? 0)
  )

  const filtered = sorted.filter((r) => {
    const q = search.toLowerCase()
    return (
      !q ||
      (r.Patient_Name as string).toLowerCase().includes(q) ||
      (r.City as string).toLowerCase().includes(q) ||
      r.Age_Group.toLowerCase().includes(q)
    )
  })

  return (
    <AppShell title="Patients" subtitle="Patient records prioritized by NCD risk score">
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, city, or age group…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[#0f172a]/12 bg-white/85 px-4 py-2.5 text-sm outline-none focus:border-[#0d9488]"
        />
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/50 animate-pulse" />
            ))
          : filtered.map((patient) => {
              const patientId = encodeURIComponent(patient.Patient_Name as string)
              const factors = getRiskFactors(patient)
              const riskScore = Math.round(patient.Overall_NCD_Risk ?? 0)

              return (
                <motion.article
                  key={patientId}
                  whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15,23,42,0.08)" }}
                  transition={SPRING}
                  className="rounded-2xl bg-white/85 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{patient.Patient_Name}</p>
                      <p className="text-sm text-[#0f172a]/70">{patient.City} · {patient.Age_Group} · {patient.Gender}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {factors.map((f) => (
                          <span key={f} className="rounded-full bg-[#0d9488]/12 px-2.5 py-1 text-xs">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getRiskColor(riskScore)}`}>
                        Risk {riskScore}%
                      </span>
                      <Link
                        href={`/patients/${patientId}`}
                        className="rounded-full bg-[#0d9488] px-4 py-2 text-sm text-white"
                      >
                        Open Profile
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )
            })}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-[#0f172a]/60 text-center py-8">No patients found.</p>
        )}
      </div>
    </AppShell>
  )
}
