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
    const [isCovered, setIsCovered] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)
    const [navigationCallback, setNavigationCallback] = useState<(() => void) | null>(null)
    const isTransitioning = useRef(false)

    const triggerTransition = (callback: () => void) => {
        isTransitioning.current = true
        setIsCovered(true)
        setNavigationCallback(() => callback)
        // Show welcome message shortly after start
        setTimeout(() => setShowWelcome(true), 300)
    }

    // When animation finishes closing
    const handleCloseComplete = () => {
        if (isCovered && navigationCallback) {
            // Execute navigation
            navigationCallback()
            setNavigationCallback(null)
        }
    }

    // Effect to open curtain strictly after pathname changes
    useEffect(() => {
        // Only open if we are in a transition and the path has actually changed (or just loaded if we are covering)
        if (isTransitioning.current) {
            // Simply wait a small buffer for the new page to paint
            // The curtain is ALREADY closed from the previous state
            const timer = setTimeout(() => {
                setShowWelcome(false)
                setIsCovered(false)
                isTransitioning.current = false
            }, 800) // Keep closed for 800ms more on the new page to show "Welcome" properly
            return () => clearTimeout(timer)
        }
    }, [pathname])

    return (
        <TransitionContext.Provider value={{ triggerTransition }}>
            {children}
            <AnimatePresence mode="wait">
                {isCovered && (
                    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col">
                        {/* Top Curtain */}
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: "55%" }}
                            exit={{ height: "0%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="absolute top-0 w-full bg-slate-950 border-b border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)] z-20"
                            onAnimationComplete={(definition) => {
                                if (definition === "animate") handleCloseComplete()
                            }}
                        />

                        {/* Welcome Message */}
                        <AnimatePresence>
                            {showWelcome && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-white z-30"
                                >
                                    <div className="p-4 bg-blue-500/20 rounded-full mb-6 ring-2 ring-blue-500/50 animate-pulse">
                                        <CheckCircle2 className="size-12 text-blue-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-2">Selamat Datang</h2>
                                    <p className="text-slate-400">Menyiapkan dashboard anda...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom Curtain - Slight overlap with 55% height to ensure no gap */}
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: "55%" }}
                            exit={{ height: "0%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="absolute bottom-0 w-full bg-slate-950 border-t border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)] z-20"
                        />
                    </div>
                )}
            </AnimatePresence>
        </TransitionContext.Provider>
    )
}
