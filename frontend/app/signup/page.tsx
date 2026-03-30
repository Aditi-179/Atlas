"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/dashboard")
    }, 500)
    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="w-full rounded-3xl bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-12"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/55">CareFlow AI</p>
          <h1 className="font-[var(--font-playfair)] text-4xl leading-tight md:text-5xl">Temporary access bypass</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-foreground/70">
            Sign-up is temporarily bypassed for demo. Redirecting you to the NGO dashboard.
          </p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 180 }}
            transition={SPRING}
            className="mx-auto mt-6 h-[3px] rounded-full bg-primary"
          />
          <div className="mt-6 text-sm text-foreground/65">
            <Link href="/" className="text-primary hover:underline">
              Back to landing page
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
