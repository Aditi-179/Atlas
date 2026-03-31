"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PatientDeepDive } from "@/components/careflow/patient-deep-dive"
import { usePopulationData } from "@/lib/hooks/usePopulationData"
import { mapRecordToPatient } from "@/components/careflow/triage-table"
import { useAppContext } from "@/lib/context"
import { ArrowLeft } from "lucide-react"

export default function PatientPage() {
  const params = useParams()
  const router = useRouter()
  const { setSelectedPatient, askCopilot } = useAppContext()
  const [patient, setPatient] = useState<any | null>(null)
  const { records, loading } = usePopulationData()

  useEffect(() => {
    if (records.length === 0 || !params.id) return

    const idx = parseInt((params.id as string).replace('p-', ''))
    if (!isNaN(idx) && records[idx]) {
      const p = mapRecordToPatient(records[idx], idx)
      setPatient(p)
      setSelectedPatient(p) // Sync with Copilot Sidebar
    }
  }, [params.id, records, setSelectedPatient])

  // Clear selected patient from context when unmounting
  useEffect(() => {
    return () => setSelectedPatient(null)
  }, [setSelectedPatient])

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold animate-pulse">
          Retrieving Patient Record...
        </p>
      </div>
    )
  }

  return (
    <PatientDeepDive
      patient={patient}
      onBack={() => router.push("/dashboard")}
      onAskCopilot={askCopilot}
    />
  )
}
