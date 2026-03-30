"use client"

import { cn } from "@/lib/utils"
import { type Patient } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus, Activity, Droplets, Zap, Dumbbell } from "lucide-react"

interface VitalsGridProps {
  patient: Patient
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-risk-critical" />
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-risk-stable" />
  return <Minus className="w-3 h-3 text-muted-foreground" />
}

function trendText(trend: "up" | "down" | "stable") {
  if (trend === "up") return "Rising"
  if (trend === "down") return "Declining"
  return "Stable"
}

export function VitalsGrid({ patient }: VitalsGridProps) {
  const { vitals } = patient

  const cards = [
    {
      label: "Body Mass Index",
      icon: Activity,
      value: vitals.bmi.value.toFixed(1),
      unit: "kg/m²",
      sub: vitals.bmi.label,
      trend: vitals.bmi.trend,
      critical: vitals.bmi.value >= 30,
      warning: vitals.bmi.value >= 25 && vitals.bmi.value < 30,
    },
    {
      label: "Blood Pressure",
      icon: Droplets,
      value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
      unit: "mmHg",
      sub: vitals.bloodPressure.systolic >= 140 ? "Stage 2 HTN" : vitals.bloodPressure.systolic >= 130 ? "Stage 1 HTN" : "Normal",
      trend: vitals.bloodPressure.trend,
      critical: vitals.bloodPressure.systolic >= 140,
      warning: vitals.bloodPressure.systolic >= 130 && vitals.bloodPressure.systolic < 140,
    },
    {
      label: "Blood Glucose",
      icon: Zap,
      value: vitals.bloodSugar.value,
      unit: vitals.bloodSugar.unit,
      sub: vitals.bloodSugar.value >= 126 ? "Diabetic range" : vitals.bloodSugar.value >= 100 ? "Pre-diabetic" : "Normal",
      trend: vitals.bloodSugar.trend,
      critical: vitals.bloodSugar.value >= 126,
      warning: vitals.bloodSugar.value >= 100 && vitals.bloodSugar.value < 126,
    },
    {
      label: "Physical Activity",
      icon: Dumbbell,
      value: vitals.physicalActivity.value,
      unit: vitals.physicalActivity.unit,
      sub: vitals.physicalActivity.value >= 150 ? "Meets WHO target" : "Below WHO 150 min",
      trend: vitals.physicalActivity.trend,
      critical: vitals.physicalActivity.value < 60,
      warning: vitals.physicalActivity.value >= 60 && vitals.physicalActivity.value < 150,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Clinical Vitals</h3>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-lg p-3.5 border",
                card.critical
                  ? "bg-risk-critical/5 border-risk-critical/20"
                  : card.warning
                  ? "bg-risk-warning/5 border-risk-warning/20"
                  : "bg-muted/50 border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "p-1.5 rounded-md",
                  card.critical ? "bg-risk-critical/10" : card.warning ? "bg-risk-warning/10" : "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "w-3.5 h-3.5",
                    card.critical ? "text-risk-critical" : card.warning ? "text-risk-warning" : "text-primary"
                  )} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <TrendIcon trend={card.trend} />
                  {trendText(card.trend)}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
              <p className={cn(
                "text-lg font-bold tabular-nums mt-0.5",
                card.critical ? "text-risk-critical" : card.warning ? "text-risk-warning" : "text-foreground"
              )}>
                {card.value}
                <span className="text-xs font-normal text-muted-foreground ml-1">{card.unit}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
