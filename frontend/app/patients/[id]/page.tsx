"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { getPatientById } from "@/lib/patients"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = useMemo(() => getPatientById(params.id), [params.id])
  const [generated, setGenerated] = useState(false)
  const [completed, setCompleted] = useState<Record<number, boolean>>({})
  const [notes, setNotes] = useState("")

  if (!patient) {
    return (
      <AppShell title="Patient not found">
        <Link href="/patients" className="text-[#0d9488] hover:underline">
          Back to patients
        </Link>
      </AppShell>
    )
  }

  return (
    <AppShell title={patient.name} subtitle={`${patient.village} - Field visit profile`}>
      <div className="space-y-5">
        <Link href="/patients" className="inline-flex text-sm text-[#0d9488] hover:underline">
          Back to Patients
        </Link>

        <section className="rounded-2xl bg-white/85 p-4">
          <p className="text-sm text-[#0f172a]/70">Risk Score</p>
          <h2 className="font-[var(--font-playfair)] text-5xl leading-none">{patient.risk}%</h2>
          <p className="mt-2 text-sm text-[#0f172a]/80">{patient.summary}</p>
        </section>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          transition={SPRING}
          onClick={() => setGenerated(true)}
          className="w-full rounded-2xl bg-[#0d9488] px-4 py-3 text-base font-medium text-white shadow-[0_18px_38px_rgba(13,148,136,0.32)]"
        >
          Generate Today's Care Plan
        </motion.button>

        {generated ? (
          <section className="rounded-2xl bg-white/85 p-4">
            <h3 className="font-semibold">Today's 3-step Care Plan</h3>
            <div className="mt-3 space-y-2">
              {patient.carePlan.map((step, idx) => (
                <label key={step} className="flex items-start gap-2 rounded-xl bg-[#f8f9f8] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!completed[idx]}
                    onChange={(e) => setCompleted((prev) => ({ ...prev, [idx]: e.target.checked }))}
                    className="mt-1 h-4 w-4 accent-[#0d9488]"
                  />
                  <span className="text-sm">{step}</span>
                </label>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white/85 p-4">
          <h3 className="mb-2 font-semibold">Visit Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type quick observations from this home visit..."
            className="min-h-28 w-full rounded-xl border border-[#0f172a]/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0d9488]"
          />
        </section>
      </div>
    </AppShell>
  )
}
