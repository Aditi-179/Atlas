"use client"

import { motion } from "framer-motion"
import { Inter, Playfair_Display } from "next/font/google"
import { Sidebar } from "@/components/Sidebar"

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
  return (
    <div className={`${inter.variable} ${playfair.variable} min-h-screen bg-[#f8f9f8] text-[#0f172a]`}>
      <Sidebar />
      <div className="lg:ml-[280px]">
        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between border-b border-[#0f172a]/10 bg-[#f8f9f8]/90 px-8 py-4 backdrop-blur">
          <div>
            <h1 className="font-[var(--font-playfair)] text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#0f172a]/65">{subtitle}</p> : null}
          </div>
          <p className="text-sm text-[#0f172a]/65">NGO Admin View</p>
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
            <p className="mt-2 text-xs text-[#0f172a]/60">NGO Admin View</p>
          </div>
          {children}
        </motion.main>
      </div>
    </div>
  )
}

export function AppShell(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <ShellContent {...props} />
}
