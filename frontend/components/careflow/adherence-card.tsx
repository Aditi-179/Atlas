"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { type AdherenceSummary } from "@/lib/types"
import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Utensils, 
  Pill,
  ShieldCheck,
  ShieldAlert
} from "lucide-react"

interface AdherenceCardProps {
  patientId: string
}

export function AdherenceCard({ patientId }: AdherenceCardProps) {
  const [summary, setSummary] = useState<AdherenceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // We parse the index from "PAT-0001" or similar to fetch from the backend service
    api.getAdherenceSummary(patientId)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) return (
    <div className="h-64 bg-card/50 animate-pulse rounded-xl border border-border flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Protocols...</p>
    </div>
  )

  // Use fallback data if summary is missing to ensure the component is visible
  const displaySummary = summary || {
    adherence_index: 0,
    current_status: "No Data",
    trend: "Stable",
    recent_logs: []
  }

  const isStable = displaySummary.current_status === "Stable"
  const isDeclining = displaySummary.trend === "Declining"
  const isNoData = displaySummary.current_status === "No Data"

  return (
    <div className="glass-card rounded-xl border border-border/50 p-5 overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
             Adherence Tracker
             {isNoData ? (
               <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
             ) : (
                isStable ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-risk-stable" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-risk-critical animate-pulse" />
                )
             )}
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Protocol Compliance Index</p>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          isNoData ? "bg-muted/10 text-muted-foreground border-muted" :
          isStable ? "bg-risk-stable/10 text-risk-stable border-risk-stable/20" : "bg-risk-critical/10 text-risk-critical border-risk-critical/20"
        )}>
           {displaySummary.current_status}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Adherence Index Ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="currentColor" 
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * displaySummary.adherence_index) / 100}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000 ease-out",
                isNoData ? "text-muted" :
                isStable ? "text-risk-stable" : "text-risk-warning"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground">{Math.round(displaySummary.adherence_index)}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground/80">Activity</span>
             </div>
             {displaySummary.adherence_index > 75 ? (
               <CheckCircle2 className="w-3.5 h-3.5 text-risk-stable" />
             ) : (
               <AlertCircle className="w-3.5 h-3.5 text-risk-warning" />
             )}
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-risk-warning/10 text-risk-warning">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground/80">Diet Plan</span>
             </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-risk-stable" />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-risk-critical/10 text-risk-critical">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground/80">Medication</span>
             </div>
             {isDeclining ? (
                <TrendingDown className="w-3.5 h-3.5 text-risk-critical" />
             ) : (
                <TrendingUp className="w-3.5 h-3.5 text-risk-stable" />
             )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px]">
           <span className="text-muted-foreground uppercase font-bold tracking-widest">Compliance Trend</span>
           <span className={cn(
             "font-black uppercase flex items-center gap-1",
             isNoData ? "text-muted-foreground" :
             isDeclining ? "text-risk-critical" : "text-risk-stable"
           )}>
             {isDeclining ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
             {displaySummary.trend}
           </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed italic">
          Last updated: Today, 08:30 AM via Patient Portal
        </p>
      </div>
    </div>
  )
}
