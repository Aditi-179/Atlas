"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Playfair_Display, Inter } from "next/font/google"
import { motion } from "framer-motion"

type Role = "NGO Admin" | "Field Worker"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("NGO Admin")
  const [error, setError] = useState("")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.")
      return
    }

    const appRole = role === "NGO Admin" ? "admin" : "field"
    window.localStorage.setItem("careflow-role", appRole)
    router.push(role === "NGO Admin" ? "/dashboard" : "/field/dashboard")
  }

  return (
    <div className={`${playfair.variable} ${inter.variable} min-h-screen bg-[#f8f9f8] text-[#0f172a]`}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="grid w-full overflow-hidden rounded-3xl bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:grid-cols-2"
        >
          <section className="border-b border-[#0f172a]/10 p-7 md:border-b-0 md:border-r md:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#0f172a]/55">CareFlow AI</p>
            <h1 className="font-[var(--font-playfair)] text-4xl leading-tight md:text-5xl">Create your account</h1>
            <p className="mt-4 max-w-md text-sm text-[#0f172a]/70">
              Choose your role to continue. Admin opens NGO dashboard, while field workers open the tablet-first daily workflow.
            </p>
            <div className="mt-8 rounded-2xl bg-[#f8f9f8] p-4">
              <p className="text-sm font-medium">Access policy</p>
              <p className="mt-1 text-sm text-[#0f172a]/70">
                NGO Admin opens full command center. Field Worker opens assigned patients workflow.
              </p>
            </div>
          </section>

          <section className="p-7 md:p-10">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aditi Sharma"
                  className="w-full rounded-xl border border-[#0f172a]/15 bg-white px-3 py-2.5 outline-none transition focus:border-[#0d9488]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@careflow.ai"
                  className="w-full rounded-xl border border-[#0f172a]/15 bg-white px-3 py-2.5 outline-none transition focus:border-[#0d9488]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-[#0f172a]/15 bg-white px-3 py-2.5 outline-none transition focus:border-[#0d9488]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-[#0f172a]/15 bg-white px-3 py-2.5 outline-none transition focus:border-[#0d9488]"
                >
                  <option>NGO Admin</option>
                  <option>Field Worker</option>
                </select>
              </div>

              {error ? (
                <p className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm text-[#7f1d1d]">{error}</p>
              ) : null}

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                transition={SPRING}
                type="submit"
                className="w-full rounded-xl bg-[#0d9488] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(13,148,136,0.28)]"
              >
                Continue
              </motion.button>
            </form>

            <div className="mt-5 text-sm text-[#0f172a]/65">
              <Link href="/" className="text-[#0d9488] hover:underline">
                Back to landing page
              </Link>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
