"use client"

import { MacroRadar } from "@/components/careflow/macro-radar"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  return (
    <MacroRadar
      selectedPatientId={null}
      onSelectPatient={(patient) => router.push(`/patients/${patient.id}`)}
    />
  )
}
