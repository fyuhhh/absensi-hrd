"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

type TransitionContextType = {
    triggerTransition: (callback: () => void) => void
}

const TransitionContext = createContext<TransitionContextType | null>(null)

export function useTransition() {
    const context = useContext(TransitionContext)
    if (!context) {
        throw new Error("useTransition must be used within a TransitionProvider")
    }
    return context
}

export function TransitionProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)
    const isTransitioning = useRef(false)

    const triggerTransition = (callback: () => void) => {
        if (isTransitioning.current) return
        isTransitioning.current = true
        setIsVisible(true)

        // Show welcome message after curtain starts closing
        setTimeout(() => setShowWelcome(true), 300)

        // Execute navigation after curtain fully closes
        setTimeout(() => {
            callback()
        }, 850)
    }

    // After pathname changes, wait for render then undercover
    useEffect(() => {
        if (isTransitioning.current) {
            // Tiny delay to ensure the new page has started mounting
            const timer = setTimeout(() => {
                setShowWelcome(false)
                // Use Another timeout to wait for welcome to exit if needed
                // or just close curtains
                setTimeout(() => {
                    setIsVisible(false)
                    isTransitioning.current = false
                }, 200)
            }, 600)
            return () => clearTimeout(timer)
        }
    }, [pathname])

    return (
        <TransitionContext.Provider value={{ triggerTransition }}>
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 1 }}
                        className="fixed inset-0 z-[9999] pointer-events-all flex flex-col"
                    >
                        {/* Top Curtain */}
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: "55%" }}
                            exit={{ height: "0%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="absolute top-0 w-full bg-slate-950 border-b border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)] z-20"
                        />

                        {/* Welcome Message */}
                        <AnimatePresence mode="wait">
                            {showWelcome && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-white z-30"
                                >
                                    <div className="p-4 bg-blue-500/20 rounded-full mb-6 ring-2 ring-blue-500/50 animate-pulse">
                                        <CheckCircle2 className="size-12 text-blue-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-2 italic uppercase italic">Welcome <span className="text-blue-500">Back</span></h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing data systems...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Curtain */}
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: "55%" }}
                            exit={{ height: "0%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="absolute bottom-0 w-full bg-slate-950 border-t border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)] z-20"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </TransitionContext.Provider>
    )
}
