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
}

export function computeStats(records: PatientRecord[]): PopulationStats {
  if (!records.length) return {
    totalScreened: 0, highRiskCount: 0, highBPCount: 0,
    highCholCount: 0, obeseCount: 0, normalVitalsCount: 0,
    averageAge: 0, maleCount: 0, femaleCount: 0, averageNcdRisk: 0,
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
