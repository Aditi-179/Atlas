"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { demoPatients } from "@/lib/patients"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function PatientsPage() {
  return (
    <AppShell title="Patients" subtitle="Patient records prioritized for today's outreach">
      <div className="space-y-3">
        {demoPatients.map((patient) => (
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
                  {patient.factors.map((f) => (
                    <span key={f} className="rounded-full bg-[#0d9488]/12 px-2.5 py-1 text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#0f172a]/70">Risk {patient.risk}%</span>
                <Link href={`/patients/${patient.id}`} className="rounded-full bg-[#0d9488] px-4 py-2 text-sm text-white">
                  Open Profile
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </AppShell>
  )
}
