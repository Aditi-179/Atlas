"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { demoPatients } from "@/lib/patients"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function DashboardPage() {
  const top = demoPatients.slice(0, 5)

  return (
    <AppShell title="CareFlow AI - NGO Dashboard" subtitle="Calm command surface for district-level maternal risk operations">
      <section className="rounded-3xl bg-secondary p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 divide-y divide-border lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
          <div className="space-y-4 pb-6 lg:pb-0 lg:pr-6">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Risk Pulse</p>
            <h2 className="font-[var(--font-playfair)] text-[44px] leading-[1] md:text-[60px]">248</h2>
            <p className="text-foreground/80">people at high risk this month</p>
            <motion.div initial={{ width: 0 }} animate={{ width: 180 }} transition={SPRING} className="h-[3px] rounded-full bg-primary" />
            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-[#f7c9c5] px-3 py-1">High</span>
              <span className="rounded-full bg-[#f4ddb3] px-3 py-1">Medium</span>
              <span className="rounded-full bg-[#9ce6df] px-3 py-1">Low</span>
            </div>
          </div>

          <div className="space-y-4 py-6 lg:py-0 lg:px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">Hotspot Map</p>
            <div className="rounded-2xl bg-muted p-3">
              <svg viewBox="0 0 400 220" className="h-[180px] w-full">
                <path
                  d="M95 32 L130 24 L178 34 L226 46 L268 70 L290 102 L286 136 L296 165 L272 190 L242 195 L221 181 L196 191 L164 186 L138 195 L116 176 L100 156 L92 130 L86 102 L97 78 Z"
                  fill="none"
                  stroke="rgba(15,23,42,0.4)"
                  strokeWidth="1.6"
                />
                {[
                  [160, 110],
                  [188, 136],
                  [220, 112],
                  [240, 132],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={4} fill="var(--primary)" />
                ))}
              </svg>
            </div>
          </div>

          <div className="space-y-4 pt-6 lg:pt-0 lg:pl-6">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">30-Day Trend</p>
            <div className="rounded-2xl bg-muted p-3">
              <svg viewBox="0 0 320 150" className="h-[180px] w-full">
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <path d="M20 120 L60 100 L100 105 L140 86 L180 92 L220 72 L260 82 L300 70 L300 130 L20 130 Z" fill="url(#g)" />
                <motion.path
                  d="M20 120 L60 100 L100 105 L140 86 L180 92 L220 72 L260 82 L300 70"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={SPRING}
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-2xl">Patients Quick Sheet Flow</h3>
          <p className="text-sm text-foreground/60">3 patients need attention before sunset</p>
        </div>
        <div className="space-y-3">
          {top.map((patient) => (
            <motion.article
              key={patient.id}
              whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15,23,42,0.08)" }}
              transition={SPRING}
              className="rounded-2xl bg-white/85 px-4 py-4 md:px-5"
            >
              <div className="grid items-center gap-3 md:grid-cols-[auto_1fr_auto]">
                <div className="h-11 w-11 rounded-full bg-primary/80 shadow-[0_0_20px_var(--primary-foreground)]" />
                <div>
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm text-foreground/65">{patient.village}</p>
                  <p className="text-sm text-foreground/80">{patient.summary}</p>
                </div>
                <Link href={`/patients/${patient.id}`} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
                  Open Quick Sheet
                </Link>
              </div>
            </motion.article>
          ))}
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
