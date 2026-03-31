"use client"

import { usePopulationData } from "@/lib/hooks/usePopulationData"

export default function VitalsPage() {
  const { stats, loading: statsLoading } = usePopulationData()

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Vitals Monitor</h1>
        <p className="text-muted-foreground">Real-time patient vitals monitoring and trends</p>
      </div>
      {statsLoading ? (
        <p className="text-sm text-muted-foreground">Loading vitals data…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Blood Pressure (High)</p>
            <p className="text-3xl font-bold text-risk-critical">{stats?.highBPCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">patients</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-muted-foreground mb-2">High Cholesterol</p>
            <p className="text-3xl font-bold text-risk-warning">{stats?.highCholCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">patients</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <p className="text-sm text-muted-foreground mb-2">BMI (Obese)</p>
            <p className="text-3xl font-bold text-primary">{stats?.obeseCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">patients (BMI ≥ 30)</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <p className="text-sm text-muted-foreground mb-2">Normal Vitals</p>
            <p className="text-3xl font-bold text-risk-stable">{stats?.normalVitalsCount?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">patients</p>
          </div>
        </div>
      )}
    </div>
  )
}
