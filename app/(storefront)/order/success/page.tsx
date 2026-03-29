"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/store/use-cart"

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const paymentIntent = searchParams.get("payment_intent")
    const sessionId = searchParams.get("session_id")
    const { clearCart } = useCart()
    const [cleared, setCleared] = useState(false)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    console.log("Order Success Page Loaded. Session:", sessionId, "PaymentIntent:", paymentIntent)

    useEffect(() => {
        if ((paymentIntent || sessionId) && !cleared) {
            clearCart()
            setCleared(true)
        }
    }, [paymentIntent, sessionId, clearCart, cleared])

    useEffect(() => {
        async function getOrderId() {
            if (!sessionId) {
                setLoading(false)
                return
            }

            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()

            const { data, error } = await supabase
                .from("payment_transactions")
                .select("order_id")
                .eq("external_id", sessionId)
                .maybeSingle()

            if (data?.order_id) {
                setOrderId(data.order_id)
            }
            setLoading(false)
        }

        getOrderId()
    }, [sessionId])

    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center max-w-2xl min-h-[70vh]">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-lufga tracking-tight mb-4">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-8">
                Thank you for your order. We are processing it and will send you a confirmation email shortly.
            </p>

            <div className="bg-muted/30 border rounded-3xl p-8 w-full space-y-6 mb-8">
                <div className="flex justify-between items-center pb-6 border-b">
                    <span className="text-muted-foreground font-medium">Order Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">Processing</span>
                </div>

                {(paymentIntent || sessionId) && (
                    <div className="flex justify-between items-center text-left">
                        <span className="text-muted-foreground font-medium">Transaction Ref</span>
                        <span className="font-mono text-sm max-w-[200px] truncate" title={paymentIntent || sessionId || ""}>
                            ...{(paymentIntent || sessionId || "").slice(-10)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link
                    href={orderId ? `/account/orders/${orderId}` : "/account/orders"}
                    className={`h-14 px-8 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 ${loading && sessionId ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {loading && sessionId ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                    <span>{orderId ? "View Order Details" : loading && sessionId ? "Locating Order..." : "View My Orders"}</span>
                </Link>
                <Link
                    href="/"
                    className="h-14 px-8 rounded-full border border-input bg-background font-bold flex items-center justify-center space-x-2 hover:bg-muted transition-all"
                >
                    <span>Continue Shopping</span>
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-20 flex justify-center text-muted-foreground">Loading order details...</div>}>
            <OrderSuccessContent />
        </Suspense>
    )
}
