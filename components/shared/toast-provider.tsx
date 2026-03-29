"use client"

import * as React from "react"
import { useToast, Toast as ToastType } from "@/store/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ToastProvider() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    )
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    }

    const bgColors = {
        success: "bg-emerald-50 border-emerald-100",
        error: "bg-red-50 border-red-100",
        info: "bg-blue-50 border-blue-100",
        warning: "bg-amber-50 border-amber-100",
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg transition-all min-w-[300px] max-w-md",
                bgColors[toast.type]
            )}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-bold text-gray-900 leading-tight">
                {toast.message}
            </p>
            <button
                onClick={onRemove}
                className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Close"
            >
                <X className="h-4 w-4 text-gray-400" />
            </button>
        </motion.div>
    )
}
