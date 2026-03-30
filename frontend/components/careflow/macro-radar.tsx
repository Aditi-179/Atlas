"use client"

import { usePopulationData } from "@/lib/hooks/usePopulationData"
import { StatCard } from "./stat-card"
import { TriageTable } from "./triage-table"
import { 
  Users, 
  ShieldAlert, 
  Cigarette, 
  Zap, 
  Radar, 
  CircleDot, 
  HeartPulse, 
  Activity, 
  Scale,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck
} from "lucide-react"
import { 
  RiskDistributionChart, 
  DeterminantsChart, 
  AgeMetabolicChart, 
  IncomeMobilityChart, 
  LifestyleRadarChart 
} from "./risk-charts"
import { cn } from "@/lib/utils"

interface MacroRadarProps {
  selectedPatientId: string | null
  onSelectPatient: (patient: any) => void
}

export function MacroRadar({ selectedPatientId, onSelectPatient }: MacroRadarProps) {
  const { stats, loading, error } = usePopulationData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4 animate-fade-in-up">
        <Radar className="w-12 h-12 text-primary/20 animate-spin-slow" />
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Synchronizing Intelligence...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-risk-critical/5 border border-risk-critical/20 rounded-2xl">
        <ShieldAlert className="w-12 h-12 text-risk-critical mb-4" />
        <h3 className="font-heading text-xl font-bold text-foreground">Data Pipeline Error</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">{error || "Unable to fetch macro insights."}</p>
      </div>
    )
  }

  const riskTierData = [
    { name: 'Critical', value: stats.riskTiers.red, color: 'var(--risk-critical)' },
    { name: 'At Risk', value: stats.riskTiers.yellow, color: 'var(--risk-warning)' },
    { name: 'Stable', value: stats.riskTiers.green, color: 'var(--risk-stable)' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up flex items-end justify-between border-b border-border pb-6" style={{ animationDelay: "0ms" }}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Population Health Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13 flex items-center gap-2">
            <CircleDot className="w-3 h-3 text-risk-stable animate-pulse" />
            <span className="font-medium tracking-tight">Active Surveillance · Dakar North Sector</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
           <Zap className="w-3.5 h-3.5 text-primary" />
           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Auto-Sync Active</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Population Size"
          value={stats.totalScreened.toLocaleString()}
          subtext="Screened Participants"
          icon={Users}
          trend="up"
          trendLabel="+4.2%"
          colorClass="text-primary"
          delay={100}
        />
        <StatCard
          label="Clinical Burden"
          value={stats.avgClinicalBurden.toFixed(2)}
          subtext="Average Complexity"
          icon={HeartPulse}
          trend="up"
          trendLabel="+0.12"
          colorClass="text-risk-critical"
          delay={200}
        />
        <StatCard
          label="Healthy Habits"
          value={stats.avgHealthyHabits.toFixed(2)}
          subtext="Habit Velocity /10"
          icon={Activity}
          trend="down"
          trendLabel="-0.05"
          colorClass="text-risk-stable"
          delay={300}
        />
         <StatCard
          label="Population BMI"
          value={stats.avgBMI.toFixed(1)}
          subtext="Aggregate Index"
          icon={Scale}
          colorClass="text-primary"
          delay={400}
        />
      </div>

      {/* Risk Tiers Row - Refined Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        {[
          { label: 'Critical (Red)', icon: ShieldAlert, color: 'var(--risk-critical)', count: stats.riskTiers.red, sub: 'Immediate Intervention' },
          { label: 'At Risk (Yellow)', icon: AlertTriangle, color: 'var(--risk-warning)', count: stats.riskTiers.yellow, sub: 'Enhanced Monitoring' },
          { label: 'Stable (Green)', icon: ShieldCheck, color: 'var(--risk-stable)', count: stats.riskTiers.green, sub: 'Standard Wellness' }
        ].map((tier, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: tier.color }} />
            <div className="flex items-center gap-2.5 mb-3">
              <tier.icon className="w-4 h-4" style={{ color: tier.color }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{tier.label}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-foreground tracking-tighter">{tier.count}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{tier.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Pyramid & Determinants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <h3 className="font-heading text-lg font-bold text-foreground mb-6">Risk Distribution Pyramid</h3>
          <RiskDistributionChart data={riskTierData} />
        </div>
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
          <h3 className="font-heading text-lg font-bold text-foreground mb-6">Primary Risk Determinants</h3>
          <DeterminantsChart data={stats.determinants} />
        </div>
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Age x Metabolic Index', component: AgeMetabolicChart, data: stats.ageMetabolicData, delay: 800 },
          { title: 'Income x Mobility Risk', component: IncomeMobilityChart, data: stats.incomeMobilityData, delay: 900 },
          { title: 'Community Lifestyle Profile', component: LifestyleRadarChart, data: stats.lifestyleProfile, delay: 1000 }
        ].map((chart, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: `${chart.delay}ms` }}>
            <h3 className="font-heading text-sm font-bold text-foreground mb-2">{chart.title}</h3>
            <chart.component data={chart.data} />
          </div>
        ))}
      </div>

      {/* Triage Table */}
      <TriageTable
        records={stats.topHighRiskPatients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={onSelectPatient}
      />
    </div>
  )
}
