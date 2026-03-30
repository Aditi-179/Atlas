"use client"

import { AppShell } from "@/components/app-shell"

export default function ReportsPage() {
  return (
    <AppShell title="Reports & Export" subtitle="Generate monthly summaries and operational exports">
      <div className="space-y-3">
        <article className="rounded-2xl bg-white/85 px-4 py-4">
          <p className="font-semibold">Monthly Risk Summary</p>
          <p className="text-sm text-[#0f172a]/65">District-wise high risk movement and outreach completion trends.</p>
        </article>
        <article className="rounded-2xl bg-white/85 px-4 py-4">
          <p className="font-semibold">Export Queue</p>
          <p className="text-sm text-[#0f172a]/65">CSV and PDF export jobs for NGO reporting workflows.</p>
        </article>
      </div>
    </AppShell>
  )
}
