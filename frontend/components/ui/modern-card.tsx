import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface ModernCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
}

export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
    ({ children, className, gradient = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    "relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300",
                    "hover:border-white/10 hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-blue-500/10",
                    gradient && "bg-gradient-to-br from-slate-900/50 to-slate-900/30",
                    className
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                {...props}
            >
                {/* Subtle noise texture or gradient overlay could go here */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {children}
            </motion.div>
        );
    }
);

ModernCard.displayName = "ModernCard";
