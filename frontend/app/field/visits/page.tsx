"use client"

import { AppShell } from "@/components/app-shell"

const visits = [
  { time: "09:30 AM", patient: "Asha Devi", status: "In progress" },
  { time: "11:00 AM", patient: "Rukmini Bai", status: "Scheduled" },
  { time: "01:15 PM", patient: "Kiran Yadav", status: "Scheduled" },
  { time: "03:00 PM", patient: "Fatima Sheikh", status: "Completed" },
]

export default function FieldVisitsPage() {
  return (
    <AppShell title="Today's Visits" subtitle="Field schedule with visit status and quick routing">
      <div className="space-y-3">
        {visits.map((visit) => (
          <article key={`${visit.time}-${visit.patient}`} className="rounded-2xl bg-white/85 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{visit.patient}</p>
                <p className="text-sm text-[#0f172a]/65">{visit.time}</p>
              </div>
              <span className="rounded-full bg-[#0d9488]/12 px-3 py-1 text-xs text-[#0f172a]">{visit.status}</span>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
