import { LoginForm } from "@/components/auth/auth-forms";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 py-12">
            <Link href="/" className="fixed left-8 top-8 hidden items-center text-sm font-bold uppercase tracking-wider hover:text-primary md:flex">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Link>

            <div className="w-full max-w-md space-y-8 rounded-3xl bg-background p-10 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold font-lufga">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
                </div>

                {searchParams?.message && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3 text-sm text-green-700 font-bold">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{searchParams.message}</span>
                    </div>
                )}

                <LoginForm />


                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/register" title="Sign Up" className="font-bold text-primary underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
