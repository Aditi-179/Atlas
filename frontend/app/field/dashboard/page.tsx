"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { demoPatients } from "@/lib/patients"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function FieldDashboardPage() {
  const assigned = demoPatients.slice(0, 5)

  return (
    <AppShell title="Good morning, Meena" subtitle="Your Assigned Patients Today">
      <section className="space-y-3">
        {assigned.map((patient) => (
          <motion.article
            key={patient.id}
            whileHover={{ y: -4, boxShadow: "0 14px 28px rgba(15,23,42,0.08)" }}
            transition={SPRING}
            className="rounded-2xl bg-white/85 px-4 py-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-[#0f172a]/70">{patient.village}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patient.factors.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-full bg-[#0d9488]/12 px-2.5 py-1 text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#0f172a]/75">Risk {patient.risk}%</span>
                <Link href={`/patients/${patient.id}`} className="rounded-full bg-[#0d9488] px-4 py-2 text-sm text-white">
                  Open Profile
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      <motion.button
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
        transition={SPRING}
        className="fixed bottom-24 right-5 z-30 rounded-full bg-[#0d9488] px-5 py-3 text-sm font-medium text-white shadow-[0_20px_40px_rgba(13,148,136,0.3)] lg:bottom-7 lg:right-8"
      >
        + New Patient Visit
      </motion.button>
    </AppShell>
  )
}
