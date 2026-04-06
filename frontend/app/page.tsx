"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/storage"
import { Shield, UserIcon, CheckCircle2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useTransition } from "@/components/GlobalTransition"

export default function LoginPage() {
  const router = useRouter()
  const { triggerTransition } = useTransition()

  const [nik, setNik] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const res = await signIn(nik.trim(), password)
    if (!res.ok) {
      setError(res.error || "Login gagal")
      setIsLoading(false)
      return
    }

    // Trigger Global Transition
    triggerTransition(() => {
      if (res.user?.role === "admin") router.replace("/admin")
      else router.replace("/user")
    })
  }

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '10s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '12s' }} />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/20 backdrop-blur-sm mb-4 ring-1 ring-blue-400/30">
              <Shield className="size-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent italic uppercase">
              Absenin
            </h1>
            <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-widest">
              Sistem Absensi HR Modern
            </p>
          </motion.div>

          <form onSubmit={onSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="nik" className="text-slate-200">Nomor Induk Karyawan (NIK)</Label>
              <div className="relative group">
                <Input
                  id="nik"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 123456"
                  required
                  disabled={isLoading}
                  className="bg-slate-950/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 pl-10 h-11 transition-all group-hover:border-slate-600 disabled:opacity-50"
                />
                <UserIcon className="absolute left-3 top-3 size-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Kata Sandi</Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="bg-slate-950/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 pl-10 h-11 transition-all group-hover:border-slate-600 disabled:opacity-50"
                />
                <Shield className="absolute left-3 top-3 size-5 text-slate-500 transition-colors group-focus-within:text-blue-400" />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants} className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border-0 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-2"
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  </motion.div>
                ) : (
                  <CheckCircle2 className="size-4 mr-2" />
                )}
                {isLoading ? "Memproses..." : "Masuk Sekarang"}
              </Button>
            </motion.div>
          </form>
        </div>

        <motion.p
          variants={itemVariants}
          className="text-center text-slate-500 text-xs mt-8"
        >
          &copy; {new Date().getFullYear()} Attendance System Secure Login
        </motion.p>
      </motion.div>
    </main>
  )
}
