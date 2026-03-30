"use client"

import { cn } from "@/lib/utils"
import { type Patient, type RiskLevel } from "@/lib/mock-data"
import { ShapChart } from "./shap-chart"
import { VitalsGrid } from "./vitals-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, Clock, Send } from "lucide-react"

interface PatientDeepDiveProps {
  patient: Patient
  onBack: () => void
  onAskCopilot: (question: string) => void
}

const riskConfig: Record<RiskLevel, { label: string; className: string }> = {
  critical: { label: "Critical Risk", className: "bg-risk-critical/10 text-risk-critical border-risk-critical/30" },
  warning: { label: "Elevated Risk", className: "bg-risk-warning/10 text-risk-warning border-risk-warning/30" },
  stable: { label: "Stable", className: "bg-risk-stable/10 text-risk-stable border-risk-stable/30" },
}

const dispatchConfig: Record<Patient["dispatchStatus"], { icon: typeof AlertTriangle; className: string }> = {
  Urgent: { icon: AlertTriangle, className: "text-risk-critical" },
  Dispatched: { icon: Send, className: "text-primary" },
  Pending: { icon: Clock, className: "text-risk-warning" },
  Reviewed: { icon: CheckCircle, className: "text-risk-stable" },
}

const promptPills = [
  "Draft WHO Care Plan",
  "Explain Risk Factors",
  "Check Treatment Protocol",
  "Smoking Cessation Steps",
  "Suggest BP Management",
]

export function PatientDeepDive({ patient, onBack, onAskCopilot }: PatientDeepDiveProps) {
  const risk = riskConfig[patient.riskLevel]
  const dispatch = dispatchConfig[patient.dispatchStatus]
  const DispatchIcon = dispatch.icon

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="animate-fade-in-up bg-card border border-border rounded-xl p-5 shadow-sm"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors mt-0.5 shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold px-2.5",
                    risk.className,
                    patient.riskLevel === "critical" && "risk-pulse"
                  )}
                >
                  {patient.riskLevel === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {risk.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                <span>{patient.age} years old · {patient.gender === "M" ? "Male" : "Female"}</span>
                <span className="text-border">•</span>
                <span>{patient.region}</span>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">AI Risk Score</p>
              <p className={cn(
                "text-3xl font-bold tabular-nums",
                patient.riskLevel === "critical" ? "text-risk-critical" :
                patient.riskLevel === "warning" ? "text-risk-warning" : "text-risk-stable"
              )}>
                {patient.riskScore}
                <span className="text-base text-muted-foreground font-normal">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Dispatch</p>
              <div className="flex items-center gap-1.5 mt-1 justify-end">
                <DispatchIcon className={cn("w-4 h-4", dispatch.className)} />
                <span className="text-sm font-semibold text-foreground">{patient.dispatchStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copilot Prompt Pills */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-widest">Ask Clinical Copilot</p>
          <div className="flex flex-wrap gap-2">
            {promptPills.map((pill) => (
              <button
                key={pill}
                onClick={() => onAskCopilot(pill)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-medium"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <ShapChart patient={patient} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <VitalsGrid patient={patient} />
        </div>
      </div>
    </div>
  )
}
