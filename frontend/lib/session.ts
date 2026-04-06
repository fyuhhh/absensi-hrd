"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const KEY_USERINFO = "attendance-user-info"

export function useSession() {
  const [session, setSession] = useState<{nik: string, role: "admin"|"user"} | null>(null);
  
  useEffect(() => {
    const raw = localStorage.getItem(KEY_USERINFO);
    if (raw) {
        try {
            setSession(JSON.parse(raw));
        } catch (e) {
            setSession(null);
        }
    }
  }, []);

  return { session }
}

export function useRequireRole(role: "admin" | "user") {
  const router = useRouter()
  // null = not checked yet, true = authorized, false = not authorized
  const [isReady, setIsReady] = useState<boolean | null>(null)

  useEffect(() => {
    // Read session synchronously from localStorage on client mount
    const raw = localStorage.getItem(KEY_USERINFO);
    if (!raw) {
      router.replace('/')
      return
    }
    
    try {
      const currentSession = JSON.parse(raw);
      if (currentSession.role !== role) {
        router.replace(currentSession.role === 'admin' ? '/admin' : '/user')
        return
      }
      setIsReady(true)
    } catch (e) {
      router.replace('/')
    }
  }, []) // Only run once on mount — localStorage doesn't change during session

  return { isReady }
}
