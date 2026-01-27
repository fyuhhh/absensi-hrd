"use client"

import useSWR from "swr"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { DB } from "./types"

const KEY = "attendance-db"

export function useSession() {
  const { data } = useSWR<DB>(KEY, {
    fallbackData: undefined,
    revalidateOnFocus: false,
    fetcher: () => JSON.parse(localStorage.getItem(KEY) || "{}"),
  })
  return { session: data?.session ?? null }
}

export function useRequireRole(role: "admin" | "user") {
  const { session } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (!session) router.replace("/")
    else if (session.role !== role) router.replace("/")
  }, [session, role, router])
}
