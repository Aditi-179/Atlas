"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { type Patient } from "@/lib/mock-data"
import { type SimulationResponse, type RiskPredictionInput } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Cigarette, Utensils, TrendingDown, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface BehavioralSimViewProps {
  patient: Patient
}

export function BehavioralSimView({ patient }: BehavioralSimViewProps) {
  const [habits, setHabits] = useState({
    Smoker: patient.shapFeatures.some(f => f.feature.includes("Smoking") && f.value > 0) ? 1 : 0,
    PhysActivity: patient.vitals.physicalActivity.value >= 90 ? 1 : 0,
    Veggies: patient.veggies || 0,
    HvyAlcoholConsump: patient.hvyAlcohol || 0,
  })
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSim = async () => {
    const input: RiskPredictionInput = {
      HighBP: patient.vitals.bloodPressure.systolic >= 140 ? 1 : 0,
      HighChol: patient.shapFeatures.some(f => f.feature.includes("Cholesterol") && f.value > 0) ? 1 : 0,
      BMI: patient.vitals.bmi.value,
      DiffWalk: 0,
      Age: Math.floor((patient.age - 15) / 5),
      Sex: patient.gender === "M" ? 1 : 0,
      Smoker: patient.hvyAlcohol !== undefined ? (patient.shapFeatures.some(f => f.feature.includes("Smoking") && f.value > 0) ? 1 : 0) : 1, // Fallback logic
      PhysActivity: patient.vitals.physicalActivity.value >= 90 ? 1 : 0,
      Veggies: patient.veggies || 0,
      HvyAlcoholConsump: patient.hvyAlcohol || 0,
      Income: 5,
      Education: 4
    }

    setLoading(true)
    setError(null)
    try {
      const res = await api.runBehavioralSim({
        current_state: input,
        modified_habits: habits
      })
      setResult(res)
    } catch (err: any) {
      setError(err.message ?? "Simulation failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSim()
  }, [habits])

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Lifestyle Simulation</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Predictive Intervention Impact</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-[10px] uppercase font-bold tracking-widest"
          onClick={runSim}
          disabled={loading}
        >
          <RefreshCcw className={cn("w-3 h-3 mr-2", loading && "animate-spin")} />
          Re-Simulate
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Cigarette className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-semibold">Quit Smoking</Label>
          </div>
          <Switch 
            checked={habits.Smoker === 0} 
            onCheckedChange={(c) => setHabits(prev => ({ ...prev, Smoker: c ? 0 : 1 }))} 
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-semibold">Exercise Regularly</Label>
          </div>
          <Switch 
            checked={habits.PhysActivity === 1} 
            onCheckedChange={(c) => setHabits(prev => ({ ...prev, PhysActivity: c ? 1 : 0 }))} 
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Utensils className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-semibold">Eat Vegetables Daily</Label>
          </div>
          <Switch 
            checked={habits.Veggies === 1} 
            onCheckedChange={(c) => setHabits(prev => ({ ...prev, Veggies: c ? 1 : 0 }))} 
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <Label className="text-xs font-semibold">Reduce Alcohol</Label>
          </div>
          <Switch 
            checked={habits.HvyAlcoholConsump === 0} 
            onCheckedChange={(c) => setHabits(prev => ({ ...prev, HvyAlcoholConsump: c ? 0 : 1 }))} 
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-risk-critical/30 bg-risk-critical/10 flex flex-col items-center justify-center space-y-1 animate-fade-in-up">
           <span className="text-xs text-risk-critical font-bold uppercase tracking-widest text-center">Simulation Error</span>
           <span className="text-[10px] text-muted-foreground text-center">Could not reach the AI simulation engine.</span>
        </div>
      )}

      {result && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center space-y-1">
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Simulated Risk Score</span>
             <div className="flex items-center gap-3">
               <span className="text-lg line-through text-muted-foreground opacity-50">{Math.round(result.current_risk * 100)}</span>
               <span className="text-3xl font-black text-primary">{Math.round(result.simulated_risk * 100)}%</span>
             </div>
          </div>
          <div className="p-4 rounded-xl border border-risk-stable/20 bg-risk-stable/5 flex flex-col items-center justify-center space-y-1">
             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Improvement</span>
             <div className="flex items-center gap-2 text-risk-stable">
               <TrendingDown className="w-5 h-5" />
               <span className="text-3xl font-black">{Math.round(result.risk_reduction * 100)} Points</span>
             </div>
          </div>
        </div>
      )}

      {result && !error && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-foreground leading-relaxed italic opacity-90 text-center">
           "{result.impact_message}"
        </div>
      )}
    </div>
  )
}
