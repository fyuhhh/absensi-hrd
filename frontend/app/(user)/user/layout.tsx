"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole } from "@/lib/session"

import { BottomNav } from "@/components/navigation/bottom-nav"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireRole("user")
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Prevent flash of protected content before auth check
  if (!isReady) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0B1120]">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div
      className="min-h-dvh flex flex-col md:grid bg-[#0B1120] text-slate-100 transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? "80px 1fr" : "240px 1fr",
      }}
    >
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block h-full overflow-hidden">
        <Sidebar
          role="user"
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden min-w-0">
        {children}
      </div>

      {/* Bottom Nav - Mobile Only */}
      <BottomNav />
    </div>
  )
}
