"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { type AuditReport } from "@/lib/types"
import { cn } from "@/lib/utils"
import { 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  Users, 
  Banknote,
  Cpu,
  ArrowRight,
  Info
} from "lucide-react"

export function EquityAuditSection() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.runBiasAudit()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="h-64 bg-card/50 animate-pulse rounded-2xl border border-border flex flex-col items-center justify-center space-y-4">
       <Scale className="w-10 h-10 text-primary/20 animate-bounce" />
       <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Running Equity Audit Engine...</p>
    </div>
  )

  if (!report) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-5 pt-10">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
             <Scale className="w-6 h-6 text-primary" />
             AI Governance & Equity Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">SAHI Compliance · Algorithmic Fairness Check · Groq-Audit Engine</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-risk-stable/10 border border-risk-stable/20 shadow-sm">
           <ShieldCheck className="w-4 h-4 text-risk-stable" />
           <span className="text-sm font-black text-risk-stable">{report.overall_fairness_score}% Fair</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Equity */}
        <div className="glass-card rounded-2xl p-6 border border-border relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
          <div className="flex items-center gap-3 mb-6">
             <Users className="w-5 h-5 text-primary" />
             <h3 className="font-bold text-foreground tracking-tight">Gender Risk Parity</h3>
          </div>
          
          <div className="space-y-6">
            {report.gender_equity.map((metric) => (
              <div key={metric.group_name} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>{metric.group_name}</span>
                  <span className="text-foreground">{metric.avg_risk_score} Score</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(metric.avg_risk_score / 10) * 100}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Impact Ratio: {metric.disparate_impact_ratio}</span>
                  <span>{metric.population_percentage}% Pop</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Socio-Economic Equity */}
        <div className="glass-card rounded-2xl p-6 border border-border relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-risk-warning/40 group-hover:bg-risk-warning transition-colors" />
          <div className="flex items-center gap-3 mb-6">
             <Banknote className="w-5 h-5 text-risk-warning" />
             <h3 className="font-bold text-foreground tracking-tight">Income Distribution Equity</h3>
          </div>

          <div className="space-y-6">
            {report.income_equity.map((metric) => (
              <div key={metric.group_name} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="truncate pr-2">{metric.group_name}</span>
                  <span className="text-foreground shrink-0">{metric.avg_risk_score} Score</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-risk-warning transition-all duration-1000" 
                    style={{ width: `${(metric.avg_risk_score / 10) * 100}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Impact Ratio: {metric.disparate_impact_ratio}</span>
                  <span>{metric.population_percentage}% Pop</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Governance Advice */}
        <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6">
             <Cpu className="w-5 h-5 text-primary animate-pulse-slow" />
             <h3 className="font-bold text-primary tracking-tight uppercase tracking-widest text-xs">Governance Insights</h3>
          </div>
          
          <div className="relative">
             <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-primary/30" />
             <p className="pl-4 text-xs font-medium text-foreground italic leading-relaxed">
               "{report.llm_governance_advice}"
             </p>
          </div>

          <div className="mt-8 space-y-3">
             <div className="flex items-center gap-3 text-xs font-bold text-primary/80 group-hover:text-primary transition-colors cursor-pointer">
                <ArrowRight className="w-3 h-3" />
                <span>Export Audit Documentation</span>
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground italic">
                <Info className="w-3 h-3" />
                <span>Last full audit: 2h ago</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
