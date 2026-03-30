"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, LogOut, Map, Menu, Settings, Users, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { useRole } from "@/components/role-context"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 }

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Risk Map", href: "/dashboard?view=risk-map", icon: Map },
  { label: "Reports & Export", href: "/field/visits", icon: FileText },
  { label: "Settings", href: "/dashboard?view=settings", icon: Settings },
]

const FIELD_NAV: NavItem[] = [
  { label: "Dashboard", href: "/field/dashboard", icon: Home },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Reports", href: "/field/visits", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = role === "admin" ? ADMIN_NAV : FIELD_NAV
  const roleLabel = role === "admin" ? "NGO Admin" : "Frontline Health Worker"
  const person = role === "admin" ? "Aditi Sharma" : "Meena Kumari"

  const NavList = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || (item.href.includes("?") && pathname === item.href.split("?")[0])
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-[#0d9488]/10 text-[#0f172a]" : "text-[#0f172a]/70 hover:bg-[#0f172a]/5 hover:text-[#0f172a]"
            }`}
          >
            {active ? <span className="absolute inset-y-2 left-0 w-[2px] rounded-r-full bg-[#0d9488]" /> : null}
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
      {mobile ? null : <div className="pt-2 border-t border-[#0f172a]/10" />}
    </nav>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[280px] flex-col border-r border-[#0f172a]/10 bg-[#f8f9f8] px-5 py-6">
        <div className="mb-8 flex items-center gap-2">
          <h2 className="font-[var(--font-playfair)] text-2xl leading-none text-[#0f172a]">CareFlow</h2>
          <span className="h-2.5 w-2.5 rounded-full bg-[#0d9488]" />
        </div>
        <NavList />

        <div className="mt-auto border-t border-[#0f172a]/10 pt-4">
          <p className="text-sm font-medium text-[#0f172a]">{person}</p>
          <p className="text-xs text-[#0f172a]/65">{roleLabel}</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 text-xs text-[#0f172a]/70 hover:text-[#0f172a]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Link>
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[#0f172a]/10 bg-[#f8f9f8]/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#0f172a]/5 text-[#0f172a]"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-[var(--font-playfair)] text-xl text-[#0f172a]">CareFlow</h2>
          <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
        </div>
        <div className="h-10 w-10 rounded-full bg-[#0f172a]/6" />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING}
              className="fixed inset-0 z-50 bg-[#0f172a]/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={SPRING}
              className="fixed bottom-0 left-0 top-0 z-50 w-[82%] max-w-[300px] bg-[#f8f9f8] px-4 py-5"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-[var(--font-playfair)] text-xl">CareFlow</h3>
                  <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#0f172a]/5"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList mobile />
              <div className="mt-6 border-t border-[#0f172a]/10 pt-4">
                <p className="text-sm font-medium text-[#0f172a]">{person}</p>
                <p className="text-xs text-[#0f172a]/65">{roleLabel}</p>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#0f172a]/10 bg-[#f8f9f8]/95 px-3 py-2 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {items.slice(0, 3).map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center rounded-lg px-2 py-2 text-[11px] ${
                  active ? "text-[#0d9488]" : "text-[#0f172a]/65"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
