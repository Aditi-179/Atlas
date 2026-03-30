"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { PopulationAggregateResponse } from "@/lib/types"

export function useRegionalData(phc?: string) {
  const [data, setData] = useState<PopulationAggregateResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getResourceAllocation("csv", "phc", phc)
      .then(setData)
      .catch((err) => setError(err.message ?? "Failed to load regional data"))
      .finally(() => setLoading(false))
  }, [phc])

  return { data, loading, error }
}
