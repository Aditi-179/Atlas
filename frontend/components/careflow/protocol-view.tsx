"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { type Patient } from "@/lib/mock-data"
import { type ClinicalProtocolOutput, type PatientClinicalData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProtocolViewProps {
  patient: Patient
}

export function ProtocolView({ patient }: ProtocolViewProps) {
  const [data, setData] = useState<ClinicalProtocolOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const input: PatientClinicalData = {
      patient_id: patient.id,
      age: patient.age,
      gender: patient.gender,
      vitals: {
        systolic: patient.vitals.bloodPressure.systolic,
        diastolic: patient.vitals.bloodPressure.diastolic,
        bmi: patient.vitals.bmi.value,
        blood_sugar: patient.vitals.bloodSugar.value
      },
      habits: {
        smoking: patient.shapFeatures.some(f => f.feature.includes("Smoking") && f.value > 0) ? "yes" : "no",
        activity: patient.vitals.physicalActivity.value >= 90 ? "active" : "sedentary"
      },
      risk_tier: patient.riskLevel
    }

    setLoading(true)
    api.generateClinicalProtocol(input)
      .then(setData)
      .catch(err => setError(err.message ?? "Failed to generate protocol"))
      .finally(() => setLoading(false))
  }, [patient])

  if (loading) return <div className="h-48 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Generating WHO Protocol...</div>
  if (error || !data) return (
    <div className="h-48 flex items-center justify-center">
      <div className="p-4 rounded-xl border border-risk-critical/30 bg-risk-critical/10 flex flex-col items-center justify-center space-y-1 animate-fade-in-up w-full max-w-sm">
        <span className="text-xs text-risk-critical font-bold uppercase tracking-widest text-center">Protocol Engine Offline</span>
        <span className="text-[10px] text-muted-foreground text-center">Could not generate clinical guidelines.</span>
      </div>
    </div>
  )

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Clinical Management Protocol</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Evidence-Based Guidelines</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
         <p className="text-xs text-foreground leading-relaxed">
           {data.summary}
         </p>
      </div>

      <div className="space-y-3">
        {data.protocol_steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-all">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              step.urgency === "high" ? "bg-risk-critical/10 text-risk-critical" :
              step.urgency === "medium" ? "bg-risk-warning/10 text-risk-warning" : "bg-risk-stable/10 text-risk-stable"
            )}>
              {step.urgency === "high" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{step.category}</span>
                <Badge variant="outline" className="text-[8px] h-3.5 uppercase px-1 font-bold">{step.urgency}</Badge>
              </div>
              <p className="text-xs font-bold text-foreground">{step.action}</p>
              <div className="flex items-center gap-1.5 opacity-60">
                <Info className="w-3 h-3 text-primary" />
                <span className="text-[9px] italic">{step.evidence_citation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
