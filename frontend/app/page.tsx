"use client"

import { LandingPage } from "@/components/careflow/landing-page"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <LandingPage 
      onEnterDashboard={() => router.push("/dashboard")} 
    />
  )
}
