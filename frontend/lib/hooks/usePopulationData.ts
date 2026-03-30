"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { PatientRecord } from "@/lib/types"

export interface PopulationStats {
  totalScreened: number
  highRiskCount: number
  highBPCount: number
  highCholCount: number
  obeseCount: number       // BMI >= 30
  normalVitalsCount: number
  averageAge: number
  maleCount: number
  femaleCount: number
  averageNcdRisk: number
  avgClinicalBurden: number
  avgHealthyHabits: number
  avgBMI: number
  riskTiers: {
    red: number
    yellow: number
    green: number
  }
  determinants: { name: string; value: number; color: string }[]
  ageMetabolicData: { name: string; value: number }[]
  incomeMobilityData: { name: string; value: number }[]
  lifestyleProfile: { subject: string; A: number; fullMark: number }[]
  topHighRiskPatients: PatientRecord[]
}

export function computeStats(records: PatientRecord[]): PopulationStats {
  if (!records.length) return {
    totalScreened: 0, highRiskCount: 0, highBPCount: 0,
    highCholCount: 0, obeseCount: 0, normalVitalsCount: 0,
    averageAge: 0, maleCount: 0, femaleCount: 0, averageNcdRisk: 0,
    avgClinicalBurden: 0, avgHealthyHabits: 0, avgBMI: 0,
    riskTiers: { red: 0, yellow: 0, green: 0 },
    determinants: [], ageMetabolicData: [], incomeMobilityData: [],
    lifestyleProfile: [], topHighRiskPatients: [],
  }

  const total = records.length
  const highRiskCount = records.filter(r => r.NCD_Risk === 1).length
  const highBPCount = records.filter(r => r.HighBP === 1).length
  const highCholCount = records.filter(r => r.HighChol === 1).length
  const obeseCount = records.filter(r => r.BMI >= 30).length
  const normalVitalsCount = records.filter(r => r.HighBP === 0 && r.HighChol === 0 && r.BMI < 30).length
  const averageAge = Math.round(records.reduce((s, r) => s + (r.Age || 0), 0) / total)
  const maleCount = records.filter(r => r.Sex === 1).length
  const femaleCount = records.filter(r => r.Sex === 0).length
  const averageNcdRisk = parseFloat((records.reduce((s, r) => s + (r.Overall_NCD_Risk || 0), 0) / total).toFixed(1))

  // New Analytical Fields
  const avgClinicalBurden = parseFloat((records.reduce((a, c) => a + c.Clinical_Burden, 0) / total).toFixed(2))
  const avgHealthyHabits = parseFloat((records.reduce((a, c) => a + c.Healthy_Habits_Score, 0) / total).toFixed(2))
  const avgBMI = parseFloat((records.reduce((a, c) => a + c.BMI, 0) / total).toFixed(1))

  const red = records.filter(d => d.Metabolic_Risk_Index > 250).length
  const yellow = records.filter(d => d.Metabolic_Risk_Index > 150 && d.Metabolic_Risk_Index <= 250).length
  const green = total - red - yellow

  const determinants = [
    { name: 'Smoking', value: Math.round((records.filter(d => d.Smoker === 1).length / total) * 100), color: 'var(--risk-critical)' },
    { name: 'High BMI (>25)', value: Math.round((records.filter(d => d.BMI > 25).length / total) * 100), color: 'var(--risk-warning)' },
    { name: 'Hypertension', value: Math.round((records.filter(d => d.HighBP === 1).length / total) * 100), color: 'var(--chart-2)' },
    { name: 'Low Activity', value: Math.round((records.filter(d => d.PhysActivity === 0).length / total) * 100), color: 'var(--chart-3)' },
    { name: 'Poor Diet', value: Math.round((records.filter(d => d.Veggies === 0 && d.Fruits === 0).length / total) * 100), color: 'var(--chart-5)' }
  ].sort((a, b) => b.value - a.value)

  const ageBuckets = Array.from({ length: 13 }, (_, i) => i + 1)
  const ageMetabolicData = ageBuckets.map(a => {
    const s = records.filter(d => d.Age === a)
    return {
      name: `Cd ${a}`,
      value: s.length ? Math.round(s.reduce((acc, c) => acc + c.Metabolic_Risk_Index, 0) / s.length) : 0
    }
  })

  const incomeBuckets = Array.from({ length: 8 }, (_, i) => i + 1)
  const incomeMobilityData = incomeBuckets.map(i => {
    const s = records.filter(d => d.Income === i)
    return {
      name: `Lvl ${i}`,
      value: s.length ? parseFloat((s.reduce((acc, c) => acc + c.Physical_Mobility_Risk, 0) / s.length).toFixed(2)) : 0
    }
  })

  const lifestyleProfile = [
    { subject: 'High BP', A: (records.filter(d => d.HighBP).length / total) * 100, fullMark: 100 },
    { subject: 'High Chol', A: (records.filter(d => d.HighChol).length / total) * 100, fullMark: 100 },
    { subject: 'Smoker', A: (records.filter(d => d.Smoker).length / total) * 100, fullMark: 100 },
    { subject: 'Activity', A: (records.filter(d => d.PhysActivity).length / total) * 100, fullMark: 100 },
    { subject: 'Veggies', A: (records.filter(d => d.Veggies).length / total) * 100, fullMark: 100 },
  ]

  const topHighRiskPatients = [...records]
    .sort((a, b) => b.Metabolic_Risk_Index - a.Metabolic_Risk_Index)
    .slice(0, 10)

  return {
    totalScreened: total,
    highRiskCount,
    highBPCount,
    highCholCount,
    obeseCount,
    normalVitalsCount,
    averageAge,
    maleCount,
    femaleCount,
    averageNcdRisk,
    avgClinicalBurden,
    avgHealthyHabits,
    avgBMI,
    riskTiers: { red, yellow, green },
    determinants,
    ageMetabolicData,
    incomeMobilityData,
    lifestyleProfile,
    topHighRiskPatients,
  }
}

export function usePopulationData() {
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [stats, setStats] = useState<PopulationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getPopulationStats()
      .then((data) => {
        setRecords(data)
        setStats(computeStats(data))
      })
      .catch((err) => setError(err.message ?? "Failed to load population data"))
      .finally(() => setLoading(false))
  }, [])

  return { records, stats, loading, error }
}
