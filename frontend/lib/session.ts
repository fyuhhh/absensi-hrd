"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const KEY_USERINFO = "attendance-user-info"

export function useSession() {
  const [session, setSession] = useState<{nik: string, role: "admin" | "user" | "admin_tj"} | null>(null);
  
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

export function useRequireRole(allowedRoles: ("admin" | "user" | "admin_tj") | ("admin" | "user" | "admin_tj")[]) {
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
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!rolesArray.includes(currentSession.role)) {
        // Redirect to their own dashboard if they have a session but wrong role
        if (currentSession.role === 'admin' || currentSession.role === 'admin_tj') {
            router.replace('/admin')
        } else {
            router.replace('/user')
        }
        return
      }
      setIsReady(true)
    } catch (e) {
      router.replace('/')
    }
  }, [])

  return { isReady }
}
