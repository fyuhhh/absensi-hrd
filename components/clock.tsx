"use client"

import { useEffect, useState } from "react"

export function ClockDisplay() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!now) return null

  const d = now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const timeStr = now.toLocaleTimeString("id-ID", { hour12: false })

  return (
    <div className="flex flex-col items-end justify-center">
      <div className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-0.5">
        {d}
      </div>
      <div className="text-3xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent tabular-nums leading-none tracking-tight filter drop-shadow-[0_0_10px_rgba(217,70,239,0.3)]">
        {timeStr}
      </div>
    </div>
  )
}
