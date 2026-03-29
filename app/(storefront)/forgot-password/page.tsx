import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 py-12">
            <Link href="/login" className="fixed left-8 top-8 hidden items-center text-sm font-bold uppercase tracking-wider hover:text-primary md:flex focus-visible:outline-none">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>

            <div className="w-full max-w-md space-y-8 rounded-3xl bg-background p-10 shadow-2xl text-center border">
                <div className="mx-auto h-16 w-16 bg-muted/50 rounded-2xl border flex items-center justify-center mb-6">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-lufga tracking-tight">Forgot Password?</h1>
                    <p className="text-sm text-muted-foreground">Enter your email and we'll send you a new password to access your account.</p>
                </div>

                <ForgotPasswordForm />

                <p className="text-sm text-muted-foreground pt-4 border-t">
                    Remembered your password?{" "}
                    <Link href="/login" title="Login" className="font-bold text-primary underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}

