"use client"

import type React from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole } from "@/lib/session"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  useRequireRole("user")
  return (
    <div className="min-h-dvh grid md:grid-cols-[240px_1fr] bg-[#0B1120] text-slate-100">
      <Sidebar role="user" />
      <div className="p-4 md:p-6">{children}</div>
    </div>
  )
}
