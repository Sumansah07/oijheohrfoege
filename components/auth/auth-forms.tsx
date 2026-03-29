"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function ForgotPasswordForm() {
    const supabase = createClient()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        const { forgotPasswordAction } = await import("@/app/actions/auth-actions")
        const result = await forgotPasswordAction(email)

        if (!result.success) {
            setError(result.error || "An unexpected error occurred")
            setIsLoading(false)
            return
        }

        setMessage(result.message || "Check your email for the new password")
        setIsLoading(false)
    }

    return (
        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center space-x-3 text-sm text-destructive font-bold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            {message && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3 text-sm text-green-700 font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                <input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Send Reset Link</span>}
            </button>
        </form>
    )
}

export function ResetPasswordForm() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const password = (formData.get("password") as string).trim()
        const confirmPassword = (formData.get("confirmPassword") as string).trim()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        })

        if (updateError) {
            setError(updateError.message)
            setIsLoading(false)
            return
        }

        router.push("/login?message=Password updated successfully. Please sign in.")
    }

    return (
        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center space-x-3 text-sm text-destructive font-bold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Update Password</span>}
            </button>
        </form>
    )
}

export function LoginForm() {
    const router = useRouter()
    const supabase = createClient()
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = (formData.get("password")?.toString() || "").trim()

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) {
            setError(signInError.message)
            setIsLoading(false)
            return
        }

        window.location.href = "/"
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center space-x-3 text-sm text-destructive font-bold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest">Email Address</label>
                <input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                />
            </div>
            <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-widest">Password</label>
                    <Link href="/forgot-password" title="Forgot Password" className="text-xs font-bold underline hover:text-primary transition-colors">Forgot?</Link>
                </div>
                <div className="relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full h-12 rounded-lg border bg-muted/50 px-4 pr-12 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Sign In</span>}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                        }
                    })
                }}
                className="w-full h-14 rounded-full border bg-background font-bold flex items-center justify-center space-x-2 hover:bg-muted/50 transition-all"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span>Continue with Google</span>
            </button>
        </form>
    )
}

export function RegisterForm() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = (formData.get("password")?.toString() || "").trim()
        const firstName = formData.get("firstName") as string
        const lastName = formData.get("lastName") as string

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${firstName} ${lastName}`,
                },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setIsLoading(false)
            return
        }

        if (data.user) {
            // Attempt to create a profile - usually this should be a DB trigger,
            // but for this template we'll do an explicit upsert to be safe.
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: data.user.id,
                    full_name: `${firstName} ${lastName}`,
                    role: "customer"
                })

            if (profileError) {
                console.error("Error creating profile:", profileError)
            }
        }

        router.push("/login?message=Check your email to confirm your account")
        setIsLoading(false)
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center space-x-3 text-sm text-destructive font-bold">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest">First Name</label>
                    <input
                        name="firstName"
                        type="text"
                        placeholder="John"
                        className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest">Last Name</label>
                    <input
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest">Email Address</label>
                <input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest">Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    className="w-full h-12 rounded-lg border bg-muted/50 px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
                    required
                />
            </div>
            <label className="flex items-start space-x-3 cursor-pointer py-2">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" required />
                <span className="text-xs text-muted-foreground">
                    I agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                </span>
            </label>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all disabled:opacity-70"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Create Account</span>}
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                onClick={async () => {
                    await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                        }
                    })
                }}
                className="w-full h-14 rounded-full border bg-background font-bold flex items-center justify-center space-x-2 hover:bg-muted/50 transition-all"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                <span>Continue with Google</span>
            </button>
        </form>
    )
}
