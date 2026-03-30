"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { patients, type Patient, type RiskLevel } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle } from "lucide-react"

const PAGE_SIZE = 5

interface TriageTableProps {
  selectedPatientId: string | null
  onSelectPatient: (patient: Patient) => void
}

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

const dispatchConfig: Record<Patient["dispatchStatus"], string> = {
  Urgent: "bg-risk-critical/10 text-risk-critical border-risk-critical/30",
  Dispatched: "bg-primary/10 text-primary border-primary/30",
  Pending: "bg-risk-warning/10 text-risk-warning border-risk-warning/30",
  Reviewed: "bg-risk-stable/10 text-risk-stable border-risk-stable/30",
}

function RiskScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  const color =
    level === "critical" ? "bg-risk-critical" : level === "warning" ? "bg-risk-warning" : "bg-risk-stable"
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs tabular-nums font-medium w-7 text-right">{score}</span>
    </div>
  )
}

export function TriageTable({ selectedPatientId, onSelectPatient }: TriageTableProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [sortDesc, setSortDesc] = useState(true)

  const filtered = patients
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.region.toLowerCase().includes(search.toLowerCase()) ||
        p.primaryRiskFactor.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (sortDesc ? b.riskScore - a.riskScore : a.riskScore - b.riskScore))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Patient Triage Queue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} patients • sorted by risk score</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search patients…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-8 h-8 text-xs w-52 bg-muted/50"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-5 py-3">
                Patient
              </th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">
                <button
                  onClick={() => setSortDesc(!sortDesc)}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  Risk Score
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">
                Primary Factor
              </th>
              <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">
                Dispatch
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((patient) => {
              const risk = riskConfig[patient.riskLevel]
              const isSelected = selectedPatientId === patient.id
              return (
                <tr
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className={cn(
                    "border-b border-border/50 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-muted/40"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                          patient.riskLevel === "critical"
                            ? "bg-risk-critical/15 text-risk-critical"
                            : patient.riskLevel === "warning"
                            ? "bg-risk-warning/15 text-risk-warning"
                            : "bg-risk-stable/15 text-risk-stable"
                        )}
                      >
                        {patient.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{patient.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {patient.age}y · {patient.gender} · {patient.region}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 w-44">
                    <div className="space-y-1">
                      <RiskScoreBar score={patient.riskScore} level={patient.riskLevel} />
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] h-4 px-1.5 font-medium",
                          risk.className,
                          risk.pulse && "risk-pulse"
                        )}
                      >
                        {patient.riskLevel === "critical" && (
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        )}
                        {risk.label}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className="text-[10px] h-5 px-2 border font-medium bg-secondary/50 text-secondary-foreground border-border">
                      {patient.primaryRiskFactor}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 px-2 font-medium", dispatchConfig[patient.dispatchStatus])}
                    >
                      {patient.dispatchStatus}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
        <p className="text-[11px] text-muted-foreground">
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
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
