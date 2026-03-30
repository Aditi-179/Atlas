"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { usePopulationData } from "@/lib/hooks/usePopulationData"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

function getRiskFactors(r: Record<string, number | string>): string[] {
  const factors: string[] = []
  if (r.HighBP === 1) factors.push("High BP")
  if (r.HighChol === 1) factors.push("High Cholesterol")
  if (r.Smoker === 1) factors.push("Smoker")
  if (r.HvyAlcoholConsump === 1) factors.push("Heavy Alcohol")
  if (r.DiffWalk === 1) factors.push("Mobility Issue")
  if ((r.BMI as number) >= 30) factors.push(`BMI ${r.BMI}`)
  return factors.length ? factors : ["No flags"]
}

export default function DashboardPage() {
  const { records, stats, loading } = usePopulationData()

  // Top 5 by Overall_NCD_Risk descending
  const top = [...records]
    .sort((a, b) => (b.Overall_NCD_Risk ?? 0) - (a.Overall_NCD_Risk ?? 0))
    .slice(0, 5)

  return (
    <AppShell title="CareFlow AI - NGO Dashboard" subtitle="Calm command surface for district-level NCD risk operations">
      <section className="rounded-3xl bg-white/70 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 divide-y divide-[#0f172a]/10 lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          <div className="space-y-4 pb-6 lg:pb-0 lg:pr-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0f172a]/60">Risk Pulse</p>
            <h2 className="font-[var(--font-playfair)] text-[44px] leading-[1] md:text-[60px]">
              {loading ? "…" : (stats?.highRiskCount ?? 0)}
            </h2>
            <p className="text-[#0f172a]/80">people at high NCD risk</p>
            <motion.div initial={{ width: 0 }} animate={{ width: 180 }} transition={SPRING} className="h-[3px] rounded-full bg-[#0d9488]" />
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-[#f7c9c5] px-3 py-1">High</span>
              <span className="rounded-full bg-[#f4ddb3] px-3 py-1">Medium</span>
              <span className="rounded-full bg-[#9ce6df] px-3 py-1">Low</span>
            </div>
          </div>

          <div className="space-y-4 py-6 lg:py-0 lg:px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0f172a]/60">Hotspot Cities</p>
            <div className="rounded-2xl bg-[#f8f9f8] p-3">
              {loading ? (
                <p className="text-xs text-[#0f172a]/50 py-4 text-center">Loading…</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {Object.entries(
                    records.reduce((acc: Record<string, number>, r) => {
                      const city = r.City as string
                      acc[city] = (acc[city] ?? 0) + (r.NCD_Risk === 1 ? 1 : 0)
                      return acc
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([city, count]) => (
                      <li key={city} className="flex justify-between text-[#0f172a]/70">
                        <span className="truncate pr-2">{city}</span>
                        <span className="font-semibold text-[#0d9488]">{count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-6 lg:pt-0 lg:pl-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0f172a]/60">Population Summary</p>
            <div className="rounded-2xl bg-[#f8f9f8] p-3 space-y-2 text-xs text-[#0f172a]/70">
              {loading ? (
                <p className="text-center py-4">Loading…</p>
              ) : (
                <>
                  <div className="flex justify-between"><span>Total Screened</span><span className="font-semibold">{stats?.totalScreened.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Avg Age</span><span className="font-semibold">{stats?.averageAge} yrs</span></div>
                  <div className="flex justify-between"><span>High BP</span><span className="font-semibold">{stats?.highBPCount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Obese (BMI≥30)</span><span className="font-semibold">{stats?.obeseCount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Avg Risk Score</span><span className="font-semibold">{stats?.averageNcdRisk}</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-[var(--font-playfair)] text-2xl">Patients Quick Sheet Flow</h3>
          <p className="text-sm text-[#0f172a]/60">
            {loading ? "Loading…" : `${top.length} patients sorted by highest risk`}
          </p>
        </div>
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/50 animate-pulse" />
              ))
            : top.map((patient) => {
                const patientId = encodeURIComponent(patient.Patient_Name as string)
                const factors = getRiskFactors(patient as unknown as Record<string, number | string>)
                return (
                  <motion.article
                    key={patientId}
                    whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15,23,42,0.08)" }}
                    transition={SPRING}
                    className="rounded-2xl bg-white/85 px-4 py-4 md:px-5"
                  >
                    <div className="grid items-center gap-3 md:grid-cols-[auto_1fr_auto]">
                      <div className="h-11 w-11 rounded-full bg-[#0d9488]/80 shadow-[0_0_20px_rgba(13,148,136,0.4)]" />
                      <div>
                        <p className="font-semibold">{patient.Patient_Name}</p>
                        <p className="text-sm text-[#0f172a]/65">{patient.City} · Age {patient.Age_Group}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {factors.slice(0, 3).map((f) => (
                            <span key={f} className="rounded-full bg-[#0d9488]/12 px-2 py-0.5 text-xs">{f}</span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/patients/${patientId}`}
                        className="rounded-full bg-[#0d9488] px-4 py-2 text-sm text-white"
                      >
                        Open Quick Sheet
                      </Link>
                    </div>
                  </motion.article>
                )
              })}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-2xl">Population Health Analytics</h3>
          <p className="text-sm text-foreground/60">District-level resource allocation & forecasting</p>
        </div>
        <motion.article
          whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15,23,42,0.08)" }}
          transition={SPRING}
          className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 px-6 py-6"
        >
          <div className="flex items-start justify-between">
            <div className="max-w-2xl">
              <h4 className="font-semibold text-lg">Resource Allocation & Intervention Planning</h4>
              <p className="text-foreground/70 mt-2">
                Aggregate population-level risk data across villages and PHCs. Simulate intervention strategies and forecast hospitalization reductions over 6 months.
              </p>
              <div className="flex gap-2 mt-4 text-sm">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">📊 Real-time aggregation</span>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">🎯 What-if simulator</span>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">📈 AI insights</span>
              </div>
            </div>
            <Link 
              href="/dashboard/population-health" 
              className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground font-semibold hover:bg-primary/90 transition flex-shrink-0"
            >
              Open Analytics →
            </Link>
          </div>
        </motion.article>
      </section>
    </AppShell>
  )
}
