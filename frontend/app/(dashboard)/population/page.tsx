"use client"

import { usePopulationData } from "@/lib/hooks/usePopulationData"

export default function PopulationPage() {
  const { stats, loading: statsLoading } = usePopulationData()

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Population Overview</h1>
        <p className="text-muted-foreground">Comprehensive population health analytics and demographics</p>
      </div>
      {statsLoading ? (
        <p className="text-sm text-muted-foreground">Loading population data…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Total Screened</p>
            <p className="text-3xl font-bold text-foreground">{stats?.totalScreened?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Active participants</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Average Age</p>
            <p className="text-3xl font-bold text-foreground">{stats?.averageAge ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">years</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Gender Split</p>
            <p className="text-3xl font-bold text-foreground">
              {stats ? `${stats.femaleCount}F / ${stats.maleCount}M` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Female / Male</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <p className="text-sm text-muted-foreground mb-2">High NCD Risk</p>
            <p className="text-3xl font-bold text-foreground">{stats?.highRiskCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">patients flagged</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Avg NCD Risk Score</p>
            <p className="text-3xl font-bold text-foreground">{stats?.averageNcdRisk ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">out of 100</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Normal Vitals</p>
            <p className="text-3xl font-bold text-foreground">{stats?.normalVitalsCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">no risk flags</p>
          </div>
        </div>
      )}
    </div>
  )
}
