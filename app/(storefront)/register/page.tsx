import { RegisterForm } from "@/components/auth/auth-forms";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4 py-12">
            <Link href="/" className="fixed left-8 top-8 hidden items-center text-sm font-bold uppercase tracking-wider hover:text-primary md:flex">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Link>

            <div className="w-full max-w-lg space-y-8 rounded-3xl bg-background p-10 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold font-lufga">Join Us</h1>
                    <p className="text-sm text-muted-foreground">Create an account to track orders and save your favorites</p>
                </div>

                <RegisterForm />


                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" title="Login" className="font-bold text-primary underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
