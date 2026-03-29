"use client"

import * as React from "react"
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/store/use-toast"
import Link from "next/link"

export function PasswordChangeForm() {
    const supabase = createClient()
    const { addToast } = useToast()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showPasswords, setShowPasswords] = React.useState({
        current: false,
        new: false,
        confirm: false
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const currentPassword = formData.get("currentPassword")?.toString() || ""
        const newPassword = (formData.get("newPassword")?.toString() || "").trim()
        const confirmPassword = (formData.get("confirmPassword")?.toString() || "").trim()

        if (!newPassword || !confirmPassword) {
            addToast("Please enter both password fields", "error")
            setIsLoading(false)
            return
        }

        if (newPassword !== confirmPassword) {
            console.error("Password Mismatch Debug:", {
                newLen: newPassword.length,
                confLen: confirmPassword.length,
                match: newPassword === confirmPassword
            });
            addToast(`Mismatch: New password (${newPassword.length} chars) and confirm field (${confirmPassword.length} chars) are different. Please re-type carefully.`, "error")
            setIsLoading(false)
            return
        }

        if (newPassword.length < 6) {
            addToast("Password must be at least 6 characters", "error")
            setIsLoading(false)
            return
        }

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user?.email) {
                addToast("User not found", "error")
                setIsLoading(false)
                return
            }

            // 2. Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                addToast("Incorrect current password", "error")
                setIsLoading(false)
                return
            }

            // 3. Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                addToast(updateError.message, "error")
                setIsLoading(false)
                return
            }

            addToast("Password updated successfully", "success")
            e.currentTarget.reset()
        } catch (error) {
            addToast("An unexpected error occurred", "error")
        } finally {
            setIsLoading(false)
        }
    }

    const togglePassword = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                        <Link href="/forgot-password" className="text-[10px] font-bold underline hover:text-primary transition-colors uppercase tracking-widest">Forgot?</Link>
                    </div>
                    <div className="relative">
                        <input
                            name="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="h-12 w-full rounded-2xl border bg-muted/20 pl-4 pr-11 text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            onClick={() => togglePassword('current')}
                        >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                    <div className="relative">
                        <input
                            name="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-2xl border bg-muted/20 pl-4 pr-11 text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            onClick={() => togglePassword('new')}
                        >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            data-lpignore="true" // Ignore LastPass etc if it interferes
                            className="h-12 w-full rounded-2xl border bg-muted/20 pl-4 pr-11 text-sm focus:ring-1 focus:ring-primary outline-none"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            onClick={() => togglePassword('confirm')}
                        >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="h-14 px-10 rounded-2xl bg-black text-white font-bold flex items-center justify-center space-x-2 hover:bg-black/90 transition-all shadow-xl shadow-black/10 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <KeyRound className="h-5 w-5" />
                        <span>Update Password</span>
                    </>
                )}
            </button>
        </form>
    )
}
