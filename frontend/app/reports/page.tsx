"use client"

import { AppShell } from "@/components/app-shell"
import { usePopulationData } from "@/lib/hooks/usePopulationData"

export default function ReportsPage() {
  const { stats, records, loading } = usePopulationData()

  // Group by Age_Group for the distribution report
  const ageGroups = records.reduce((acc: Record<string, number>, r) => {
    const g = r.Age_Group as string
    acc[g] = (acc[g] ?? 0) + 1
    return acc
  }, {})

  const topCities = Object.entries(
    records.reduce((acc: Record<string, number>, r) => {
      const c = r.City as string
      if (r.NCD_Risk === 1) acc[c] = (acc[c] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <AppShell title="Reports & Export" subtitle="Live population health summaries generated from screening data">
      <div className="space-y-4">

        {/* Summary stats */}
        <article className="rounded-2xl bg-white/85 px-5 py-5">
          <p className="font-semibold mb-1">Monthly Risk Summary</p>
          <p className="text-sm text-[#0f172a]/65 mb-4">NCD screening statistics from the current dataset.</p>
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl bg-[#0f172a]/8" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl bg-[#f8f9f8] px-4 py-3">
                <p className="text-xs text-[#0f172a]/50 mb-0.5">Total Screened</p>
                <p className="text-xl font-bold">{stats?.totalScreened.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#f8f9f8] px-4 py-3">
                <p className="text-xs text-[#0f172a]/50 mb-0.5">High Risk</p>
                <p className="text-xl font-bold text-[#dc2626]">{stats?.highRiskCount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#f8f9f8] px-4 py-3">
                <p className="text-xs text-[#0f172a]/50 mb-0.5">High BP</p>
                <p className="text-xl font-bold text-[#d97706]">{stats?.highBPCount.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#f8f9f8] px-4 py-3">
                <p className="text-xs text-[#0f172a]/50 mb-0.5">Normal Vitals</p>
                <p className="text-xl font-bold text-[#0d9488]">{stats?.normalVitalsCount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </article>

        {/* Age group distribution */}
        <article className="rounded-2xl bg-white/85 px-5 py-5">
          <p className="font-semibold mb-1">Age Group Distribution</p>
          <p className="text-sm text-[#0f172a]/65 mb-4">Screened population by age bracket.</p>
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-[#0f172a]/8" />
          ) : (
            <div className="space-y-2">
              {Object.entries(ageGroups)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([group, count]) => {
                  const pct = Math.round((count / (stats?.totalScreened ?? 1)) * 100)
                  return (
                    <div key={group} className="flex items-center gap-3 text-sm">
                      <span className="w-14 text-xs text-[#0f172a]/60">{group}</span>
                      <div className="flex-1 rounded-full bg-[#0f172a]/8 h-2">
                        <div className="h-2 rounded-full bg-[#0d9488]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-mono text-[#0f172a]/60">{count}</span>
                    </div>
                  )
                })}
            </div>
          )}
        </article>

        {/* Top Risk Cities */}
        <article className="rounded-2xl bg-white/85 px-5 py-5">
          <p className="font-semibold mb-1">High-Risk Hotspot Cities</p>
          <p className="text-sm text-[#0f172a]/65 mb-4">Cities with the most NCD-positive patients.</p>
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl bg-[#0f172a]/8" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {topCities.map(([city, count]) => (
                <div key={city} className="rounded-xl bg-[#f8f9f8] px-3 py-2 text-sm">
                  <p className="font-medium truncate">{city}</p>
                  <p className="text-xs text-[#dc2626] font-semibold">{count} high risk</p>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Export placeholder */}
        <article className="rounded-2xl bg-white/85 px-5 py-5">
          <p className="font-semibold">Export Queue</p>
          <p className="text-sm text-[#0f172a]/65">CSV and PDF export jobs for NGO reporting workflows.</p>
          <p className="text-xs text-[#0f172a]/40 mt-2 italic">Export functionality coming soon.</p>
        </article>
      </div>
    </AppShell>
  )
}
