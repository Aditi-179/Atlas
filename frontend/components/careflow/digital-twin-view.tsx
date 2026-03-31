"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { type Patient } from "@/lib/mock-data"
import { type DigitalTwinResponse, type RiskPredictionInput } from "@/lib/types"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts"
import { Brain, Activity, TrendingDown, Info } from "lucide-react"

interface DigitalTwinViewProps {
  patient: Patient
}

export function DigitalTwinView({ patient }: DigitalTwinViewProps) {
  const [data, setData] = useState<DigitalTwinResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Map mock patient to RiskPredictionInput
    const input: RiskPredictionInput = {
      HighBP: patient.vitals.bloodPressure.systolic >= 140 ? 1 : 0,
      HighChol: patient.shapFeatures.some(f => f.feature.includes("Cholesterol") && f.value > 0) ? 1 : 0,
      BMI: patient.vitals.bmi.value,
      DiffWalk: 0,
      Age: Math.floor((patient.age - 15) / 5),
      Sex: patient.gender === "M" ? 1 : 0,
      Smoker: patient.shapFeatures.some(f => f.feature.includes("Smoking") && f.value > 0) ? 1 : 0,
      PhysActivity: patient.vitals.physicalActivity.value >= 90 ? 1 : 0,
      Veggies: 1,
      HvyAlcoholConsump: 0,
      Income: 5,
      Education: 4
    }

    setLoading(true)
    api.projectDigitalTwin(input)
      .then(setData)
      .catch(err => setError(err.message ?? "Failed to project digital twin"))
      .finally(() => setLoading(false))
  }, [patient])

  if (loading) return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Computing Trajectories...</div>
  if (error || !data) return (
    <div className="h-64 flex items-center justify-center">
      <div className="p-4 rounded-xl border border-risk-critical/30 bg-risk-critical/10 flex flex-col items-center justify-center space-y-1 animate-fade-in-up w-full max-w-sm">
        <span className="text-xs text-risk-critical font-bold uppercase tracking-widest text-center">Projection Failed</span>
        <span className="text-[10px] text-muted-foreground text-center">Could not generate digital twin trajectory.</span>
      </div>
    </div>
  )

  const chartData = data.baseline_trajectory.map((base, i) => ({
    month: `M${base.month}`,
    baseline: base.risk_score,
    optimized: data.optimized_trajectory[i].risk_score
  }))

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Digital Twin Projection</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">12-Month Health Trajectory</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-risk-stable/10 text-risk-stable border border-risk-stable/20">
          <TrendingDown className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Potential Reduction</span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '10px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="baseline" 
              name="Current Path" 
              stroke="var(--risk-warning)" 
              strokeWidth={2} 
              dot={false} 
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="optimized" 
              name="Clinical Optimized" 
              stroke="var(--risk-stable)" 
              strokeWidth={3} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Info className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Clinical Narrative</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed italic opacity-90">
          "{data.clinical_narrative}"
        </p>
      </div>
    </div>
  )
}
