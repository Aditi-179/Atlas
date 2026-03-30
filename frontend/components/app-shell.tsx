"use client"

import { motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { Inter, Playfair_Display } from "next/font/google"
import { Sidebar } from "@/components/Sidebar"
import { RoleProvider, useRole } from "@/components/role-context"

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

function ShellContent({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const { role, setRole } = useRole()
  const router = useRouter()
  const pathname = usePathname()

  const switchToAdmin = () => {
    setRole("admin")
    if (pathname.startsWith("/field")) {
      router.push("/dashboard")
    }
  }

  const switchToField = () => {
    setRole("field")
    if (!pathname.startsWith("/field")) {
      router.push("/field/dashboard")
    }
  }

  return (
    <div className={`${inter.variable} ${playfair.variable} min-h-screen bg-[#f8f9f8] text-[#0f172a]`}>
      <Sidebar />
      <div className="lg:ml-[280px]">
        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between border-b border-[#0f172a]/10 bg-[#f8f9f8]/90 px-8 py-4 backdrop-blur">
          <div>
            <h1 className="font-[var(--font-playfair)] text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#0f172a]/65">{subtitle}</p> : null}
          </div>
          <div className="rounded-full bg-white/90 p-1 border border-[#0f172a]/10">
            <button
              onClick={switchToAdmin}
              className={`rounded-full px-3 py-1.5 text-sm ${
                role === "admin" ? "bg-[#0d9488] text-white" : "text-[#0f172a]/75"
              }`}
            >
              Admin Mode
            </button>
            <button
              onClick={switchToField}
              className={`rounded-full px-3 py-1.5 text-sm ${
                role === "field" ? "bg-[#0d9488] text-white" : "text-[#0f172a]/75"
              }`}
            >
              Field Worker Mode
            </button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="px-4 pb-24 pt-4 md:px-8 lg:pb-8"
        >
          <div className="mb-4 lg:hidden">
            <h1 className="font-[var(--font-playfair)] text-2xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#0f172a]/65">{subtitle}</p> : null}
            <div className="mt-3 rounded-full bg-white/90 p-1 border border-[#0f172a]/10 inline-flex">
              <button
                onClick={switchToAdmin}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  role === "admin" ? "bg-[#0d9488] text-white" : "text-[#0f172a]/75"
                }`}
              >
                Admin
              </button>
              <button
                onClick={switchToField}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  role === "field" ? "bg-[#0d9488] text-white" : "text-[#0f172a]/75"
                }`}
              >
                Field
              </button>
            </div>
          </div>
          {children}
        </motion.main>
      </div>
    </div>
  )
}

export function AppShell(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <RoleProvider>
      <ShellContent {...props} />
    </RoleProvider>
  )
}
