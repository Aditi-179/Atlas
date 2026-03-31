import { useState } from "react"
import { cn } from "@/lib/utils"
import { type PatientRecord } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle, Send, Clock, CheckCircle } from "lucide-react"

const PAGE_SIZE = 10

interface TriageTableProps {
  records: PatientRecord[]
  selectedPatientId: string | null
  onSelectPatient: (patient: any) => void
}

type RiskLevel = "critical" | "warning" | "stable"

const riskConfig: Record<RiskLevel, { label: string; className: string; pulse: boolean }> = {
  critical: {
    label: "Critical",
    className: "bg-risk-critical/10 text-risk-critical border-risk-critical/30",
    pulse: true,
  },
  warning: {
    label: "Warning",
    className: "bg-risk-warning/10 text-risk-warning border-risk-warning/30",
    pulse: false,
  },
  stable: {
    label: "Stable",
    className: "bg-risk-stable/10 text-risk-stable border-risk-stable/30",
    pulse: false,
  },
}

function getRiskLevel(mri: number): RiskLevel {
  if (mri > 250) return "critical"
  if (mri > 150) return "warning"
  return "stable"
}

/**
 * Maps a real backend PatientRecord to the more complex Patient interface
 * used by the DeepDive, ShapChart, and VitalsGrid components.
 */
export function mapRecordToPatient(record: PatientRecord, idx: number): any {
  const mri = record.Metabolic_Risk_Index
  const riskLevel = getRiskLevel(mri)
  const riskScore = Math.min(99, 85 + Math.floor(mri / 50))

  // 1. Deriving SHAP features from backend flags
  const shapFeatures = [
     { feature: "Metabolic Risk Index", value: Math.min(25, mri / 15), rawValue: mri.toString() },
     { feature: "Age Score", value: (record.Age * 2), rawValue: `${(record.Age * 5) + 15} yrs` },
  ]
  if (record.HighBP === 1) shapFeatures.push({ feature: "Hypertension", value: 18, rawValue: "Present" })
  if (record.Smoker === 1) shapFeatures.push({ feature: "Smoking History", value: 15, rawValue: "Yes" })
  if (record.HighChol === 1) shapFeatures.push({ feature: "Cholesterol Index", value: 12, rawValue: "Elevated" })
  if (record.BMI >= 30) shapFeatures.push({ feature: "BMI (Obesity)", value: 10, rawValue: `BMI ${record.BMI}` })
  if (record.PhysActivity === 0) shapFeatures.push({ feature: "Sedentary Lifestyle", value: 8, rawValue: "Inactive" })
  
  // Protective factors (negative SHAP)
  if (record.Veggies === 1) shapFeatures.push({ feature: "Vegetable Intake", value: -6, rawValue: "Daily" })
  if (record.HvyAlcoholConsump === 0) shapFeatures.push({ feature: "Alcohol Control", value: -5, rawValue: "Normal" })

  // 2. Mapping Vitals structure
  const vitals = {
    bmi: { 
        value: record.BMI, 
        label: record.BMI >= 30 ? "Obese" : record.BMI >= 25 ? "Overweight" : "Normal", 
        trend: (record.BMI > 28 ? "up" : "stable") as "up" | "stable"
    },
    bloodPressure: { 
        systolic: record.HighBP === 1 ? 145 : 122, 
        diastolic: record.HighBP === 1 ? 92 : 78, 
        trend: (record.HighBP === 1 ? "up" : "stable") as "up" | "stable"
    },
    bloodSugar: { 
        value: record.Diabetes === 1 ? 138 : record.Diabetes === 2 ? 112 : 94, 
        unit: "mg/dL", 
        trend: (record.Diabetes === 1 ? "up" : "stable") as "up" | "stable"
    },
    physicalActivity: { 
        value: record.PhysActivity === 1 ? 140 : 45, 
        unit: "min/wk", 
        trend: (record.PhysActivity === 1 ? "up" : "down") as "up" | "down"
    },
  }

  return {
    id: record.Patient_ID || `p-${idx}`,
    name: record.Patient_Name,
    age: (record.Age * 5) + 15,
    gender: record.Sex === 1 ? "M" : "F",
    region: record.City,
    riskScore: riskScore,
    riskLevel: riskLevel,
    primaryRiskFactor: record.Smoker === 1 ? "Smoking" : record.HighBP === 1 ? "Hypertension" : "Metabolic",
    dispatchStatus: riskLevel === "critical" ? "Urgent" : "Pending",
    shapFeatures: shapFeatures.sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
    vitals: vitals,
    hvyAlcohol: record.HvyAlcoholConsump,
    veggies: record.Veggies,
    lastVisit: "2024-03-30"
  }
}

function RiskScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  const color =
    level === "critical" ? "bg-risk-critical" : level === "warning" ? "bg-risk-warning" : "bg-risk-stable"
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums font-medium w-7 text-right">{score}%</span>
    </div>
  )
}

export function TriageTable({ records, selectedPatientId, onSelectPatient }: TriageTableProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [sortDesc, setSortDesc] = useState(true)

  const filtered = records
    .map((record, originalIdx) => ({ record, originalIdx }))
    .filter(
      ({ record }) =>
        record.Patient_Name.toLowerCase().includes(search.toLowerCase()) ||
        record.City.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (sortDesc ? b.record.Metabolic_Risk_Index - a.record.Metabolic_Risk_Index : a.record.Metabolic_Risk_Index - b.record.Metabolic_Risk_Index))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "1100ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Priority Triage Queue</h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium tracking-tight">Active cases requiring clinical oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter patients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-9 h-9 text-xs w-56 bg-muted/30 border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-6 py-4">
                Patient
              </th>
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-4 py-4">
                Clinical Context
              </th>
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-4 py-4">
                <button
                  onClick={() => setSortDesc(!sortDesc)}
                  className="flex items-center gap-2 hover:text-foreground transition-colors group"
                >
                  Metabolic Index
                  <ArrowUpDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </th>
              <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-4 py-4">
                Action Status
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(({ record, originalIdx }) => {
              const patient = mapRecordToPatient(record, originalIdx)
              const risk = riskConfig[patient.riskLevel as RiskLevel]
              const riskScore = patient.riskScore
              const mri = record.Metabolic_Risk_Index
              const riskLevel = patient.riskLevel

              return (
                <tr
                  key={originalIdx}
                  onClick={() => onSelectPatient(patient)}
                  className={cn(
                    "border-b border-border/40 cursor-pointer transition-all duration-200 hover:bg-primary/[0.02]"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ring-1 ring-inset",
                          riskLevel === "critical"
                            ? "bg-risk-critical/10 text-risk-critical ring-risk-critical/20"
                            : riskLevel === "warning"
                            ? "bg-risk-warning/10 text-risk-warning ring-risk-warning/20"
                            : "bg-risk-stable/10 text-risk-stable ring-risk-stable/20"
                        )}
                      >
                        {patient.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground tracking-tight">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase opacity-70">{patient.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-semibold text-foreground tracking-tight">{patient.age}Y · {patient.gender}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">{patient.region}</div>
                  </td>
                  <td className="px-4 py-4 w-44">
                    <div className="space-y-1.5">
                      <RiskScoreBar score={riskScore} level={riskLevel} />
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-foreground tabular-nums">MRI: {mri}</span>
                         <div
                          className={cn(
                            "text-[9px] h-4 px-1.5 rounded-md font-bold uppercase tracking-wider flex items-center border",
                            risk.className,
                            risk.pulse && "risk-pulse"
                          )}
                        >
                          {riskLevel === "critical" && <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                          {risk.label}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                       {riskLevel === "critical" ? (
                         <div className="flex items-center gap-1.5 text-risk-critical bg-risk-critical/10 px-2.5 py-1 rounded-full border border-risk-critical/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Priority Dispatch</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-risk-warning bg-risk-warning/10 px-2.5 py-1 rounded-full border border-risk-warning/20">
                            <Clock className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em]">Verification Queue</span>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Entries {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} <span className="opacity-40">/</span> {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-border"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-lg border-border"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
