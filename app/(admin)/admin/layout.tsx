"use client"

import type React from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole } from "@/lib/session"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireRole("admin")
  return (
    <div className="min-h-dvh grid md:grid-cols-[280px_1fr] bg-[#0B1120] text-slate-100">
      <Sidebar role="admin" />
      <div className="p-8">{children}</div>
    </div>
  )
}
