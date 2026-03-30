"use client"

import { dashboardStats, patients } from "@/lib/mock-data"
import { type Patient } from "@/lib/mock-data"
import { StatCard } from "./stat-card"
import { TriageTable } from "./triage-table"
import { Users, ShieldAlert, Cigarette, SendHorizontal, Radar, CircleDot } from "lucide-react"

interface MacroRadarProps {
  selectedPatientId: string | null
  onSelectPatient: (patient: Patient) => void
}

export function MacroRadar({ selectedPatientId, onSelectPatient }: MacroRadarProps) {
  const criticalCount = patients.filter((p) => p.riskLevel === "critical").length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-in-up flex items-start justify-between" style={{ animationDelay: "0ms" }}>
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radar className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Population Macro-Radar</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10.5 flex items-center gap-2">
            <CircleDot className="w-3 h-3 text-risk-stable animate-pulse" />
            <span>Real-time NCD risk surveillance</span>
            <span className="text-border">·</span>
            <span>Dakar Region</span>
            <span className="text-border">·</span>
            <span className="text-primary font-medium">Updated today</span>
          </p>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Population"
          value={dashboardStats.totalPopulation.toLocaleString()}
          subtext="Active records"
          icon={Users}
          trend="up"
          trendLabel="+12 this week"
          colorClass="text-primary"
          delay={100}
        />
        <StatCard
          label="High-Risk Patients"
          value={`${dashboardStats.highRiskPercent}%`}
          subtext={`${criticalCount} critical cases`}
          icon={ShieldAlert}
          trend="up"
          trendLabel="+2.1% MoM"
          colorClass="text-risk-critical"
          delay={200}
        />
        <StatCard
          label="Top Determinant"
          value={dashboardStats.topDeterminant}
          subtext="38% of high-risk patients"
          icon={Cigarette}
          colorClass="text-risk-warning"
          delay={300}
        />
        <StatCard
          label="Dispatch Pending"
          value={dashboardStats.dispatchPending}
          subtext="Require field visit"
          icon={SendHorizontal}
          trend="down"
          trendLabel="-8 from last week"
          colorClass="text-primary"
          delay={400}
        />
      </div>

      {/* Triage Table */}
      <TriageTable
        selectedPatientId={selectedPatientId}
        onSelectPatient={onSelectPatient}
      />
    </div>
  )
}
