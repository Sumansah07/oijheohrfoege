import Link from "next/link";
import { XCircle, RefreshCcw, HelpCircle, ArrowLeft } from "lucide-react";

export default function OrderFailurePage() {
    return (
        <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
                    <XCircle className="h-12 w-12 text-red-600" />
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">Payment Failed</p>
                    <h1 className="text-5xl font-bold font-lufga">Oops! Something went wrong</h1>
                    <p className="text-lg text-muted-foreground">
                        We couldn't process your payment. Don't worry, no funds were deducted from your account.
                    </p>
                </div>

                <div className="bg-muted/30 rounded-3xl p-10 border space-y-6 text-left">
                    <h3 className="text-xl font-bold">Suggested Actions</h3>
                    <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground">
                        <li>Verify your payment details and card balance.</li>
                        <li>Try a different payment method (PayPal/Different Card).</li>
                        <li>Contact your bank if the issue persists.</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Link
                        href="/checkout"
                        className="h-14 px-8 bg-primary text-white rounded-full font-bold flex items-center justify-center transition-all hover:scale-105"
                    >
                        <RefreshCcw className="mr-2 h-5 w-5" /> Retry Payment
                    </Link>
                    <Link
                        href="/contact"
                        className="h-14 px-8 border rounded-full font-bold flex items-center justify-center transition-all hover:bg-muted"
                    >
                        <HelpCircle className="mr-2 h-5 w-5" /> Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
}
