"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/store/use-cart"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, ShieldCheck, CreditCard, Banknote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { placeCODOrder } from "@/app/actions/checkout-actions"
import { CheckoutAddress } from "@/components/storefront/checkout-address"
import Script from "next/script"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

// CheckoutForm is no longer needed as we redirect to Stripe hosted page


export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart()
    const router = useRouter()
    const [selectedAddress, setSelectedAddress] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [paymentMethod, setPaymentMethod] = useState<string>("stripe")
    const [activeProviders, setActiveProviders] = useState<any[]>([])
    const [placingCOD, setPlacingCOD] = useState(false)
    const [codError, setCodError] = useState("")

    const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

    // Calculate totals
    const shipping = 10.00
    const subtotal = totalPrice()
    const finalTotal = subtotal + shipping

    // Simplified checkout logic: we don't need elements anymore
    useEffect(() => {
        if (items.length === 0) {
            router.push("/cart")
        }
        
        // Fetch active payment providers
        const fetchProviders = async () => {
            try {
                const res = await fetch("/api/admin/payment-providers");
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Filter out 'cod' since it's handled separately
                    const active = data.filter((p: any) => p.is_active && p.slug !== 'cod');
                    setActiveProviders(active);
                    if (active.length > 0) {
                        setPaymentMethod(active[0].slug);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch providers", err);
            }
        };

        fetchProviders();
        setLoading(false)
    }, [items, router])

    const handleCheckout = async () => {
        if (!selectedAddress) {
            setCodError("Please select a shipping address.")
            return
        }

        if (paymentMethod === "cod") {
            return handleCODSubmit();
        }

        setPlacingCOD(true)
        try {
            const endpoint = `/api/checkout/${paymentMethod}`;
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, shippingAddress: selectedAddress })
            });
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else if (data.order_id && paymentMethod === "razorpay") {
                handleRazorpayCheckout(data);
            } else {
                setCodError(`Failed to initiate ${paymentMethod} checkout.`);
                setPlacingCOD(false)
            }
    } catch (err) {
        setCodError("An error occurred. Please try again.")
        setPlacingCOD(false)
    }
}

const handleRazorpayCheckout = async (data: any) => {
    const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.order_id,
        handler: async function (response: any) {
            try {
                const res = await fetch("/api/checkout/razorpay/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...response,
                        orderId: data.description.replace("Order #", "")
                    })
                });
                const result = await res.json();
                if (result.success) {
                    router.push(`/order/success?session_id=${response.razorpay_payment_id}`);
                } else {
                    setCodError("Payment verification failed. Please contact support.");
                }
            } catch (err) {
                setCodError("Failed to verify payment.");
            }
        },
        prefill: data.prefill,
        theme: {
            color: "#3399cc"
        }
    };
    const rzp1 = new (window as any).Razorpay(options);
    rzp1.open();
    setPlacingCOD(false);
}

    const handleCODSubmit = async () => {
        if (!selectedAddress) {
            setCodError("Please select a shipping address.")
            return
        }
        setPlacingCOD(true)
        setCodError("")
        const res = await placeCODOrder(items, finalTotal, shipping, 0, selectedAddress)

        if (res.success) {
            router.push(`/order/success?payment_intent=cod_${res.orderId}`)
        } else {
            setCodError(res.error || "Failed to place COD order.")
            setPlacingCOD(false)
        }
    }

    if (items.length === 0) return null

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
            <Link href="/cart" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
            </Link>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Payment Form Area */}
                <div className="lg:col-span-3 space-y-12">
                    <div>
                        <h1 className="text-3xl font-bold font-lufga tracking-tight text-foreground">Checkout</h1>
                        <p className="text-muted-foreground mt-2">Complete your order securely.</p>
                    </div>

                    {/* Step 1: Shipping Address */}
                    <CheckoutAddress
                        apiKey={MAPS_API_KEY}
                        selectedAddressId={selectedAddress?.id}
                        onAddressSelect={(addr) => {
                            setSelectedAddress(addr);
                            setCodError(""); // Clear any "select address" errors
                        }}
                    />

                    {/* Step 2: Payment Method */}
                    <div className={`space-y-6 transition-all duration-500 ${!selectedAddress ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold font-lufga flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Method
                            </h3>
                            {!selectedAddress && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                                    Select address first
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {activeProviders.map((provider) => (
                                <button
                                    key={provider.slug}
                                    onClick={() => setPaymentMethod(provider.slug)}
                                    className={`p-6 border-2 rounded-[2rem] flex flex-col items-center justify-center space-y-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${paymentMethod === provider.slug ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" : "border-muted hover:border-primary/50 text-muted-foreground bg-white"}`}
                                >
                                    {provider.slug === 'stripe' ? (
                                        <div className="h-8 w-16 flex items-center justify-center">
                                            <img src="/fonts/assets/stripe-logo.png" alt="Stripe" className="h-full object-contain" />
                                        </div>
                                    ) : (provider.slug === 'khalti' ? (
                                        <div className="h-8 w-16 flex items-center justify-center">
                                            <img src="/fonts/assets/khalti-logo.jpg" alt="Khalti" className="h-full object-contain" />
                                        </div>
                                    ) : (provider.slug === 'esewa' ? (
                                        <div className="h-8 w-16 flex items-center justify-center">
                                            <img src="/fonts/assets/esewa-logo.jpeg" alt="eSewa" className="h-full object-contain" />
                                        </div>
                                    ) : (provider.slug === 'razorpay' ? (
    <div className="h-8 w-16 flex items-center justify-center">
        <img src="/fonts/assets/razorpay-logo.png" alt="Razorpay" className="h-full object-contain" />
    </div>
) : <CreditCard className="h-6 w-6" />)))}
                                    <span className="font-bold text-xs tracking-tight">{provider.name}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setPaymentMethod("cod")}
                                className={`p-6 border-2 rounded-[2rem] flex flex-col items-center justify-center space-y-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${paymentMethod === "cod" ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" : "border-muted hover:border-primary/50 text-muted-foreground bg-white"}`}
                            >
                                <div className="h-8 w-16 flex items-center justify-center">
                                    <img src="/fonts/assets/cash-on-delivery-logo.jpg" alt="COD" className="h-full object-contain" />
                                </div>
                                <span className="font-bold text-xs tracking-tight">Cash on Delivery</span>
                            </button>
                        </div>
                    </div>

                    <div className={`bg-muted/30 p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${!selectedAddress ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center space-x-2 text-primary font-bold mb-6 pb-6 border-b">
                            <ShieldCheck className="h-5 w-5" />
                            <span>
                                {paymentMethod === "cod" ? "Pay securely upon delivery" : (
                                    paymentMethod === "stripe" ? "Secure Payment Powered by Stripe" : (
                                        paymentMethod === "khalti" ? "Secure Payment via Khalti" : (
    paymentMethod === "razorpay" ? "Secure Payment via Razorpay" : "Secure Payment via eSewa"
)
                                    )
                                )}
                            </span>
                        </div>

                        {paymentMethod !== "cod" ? (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground border-b pb-4">
                                    You will be redirected to {paymentMethod === 'stripe' ? 'Stripe' : (paymentMethod === 'khalti' ? 'Khalti' : (paymentMethod === 'razorpay' ? 'Razorpay' : 'eSewa'))}'s secure checkout page to complete your payment.
                                </p>

                                {codError && (
                                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg">
                                        {codError}
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={placingCOD}
                                    className="w-full h-14 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {placingCOD ? (
                                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Redirecting...</>
                                    ) : (
                                        `Pay with ${paymentMethod === 'stripe' ? 'Card' : (paymentMethod === 'khalti' ? 'Khalti' : (paymentMethod === 'razorpay' ? 'Razorpay' : 'eSewa'))} • $${finalTotal.toFixed(2)}`
                                    )}
                                </button>
                                {paymentMethod === 'stripe' && (
                                    <div className="flex items-center justify-center space-x-4 opacity-50 contrast-0 grayscale">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" className="h-4" alt="Visa" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-muted-foreground border-b pb-4">You will pay for your order when it is delivered to your address. Please ensure you have the exact amount ready.</p>

                                {codError && (
                                    <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg">
                                        {codError}
                                    </div>
                                )}

                                <button
                                    onClick={handleCODSubmit}
                                    disabled={placingCOD}
                                    className="w-full h-14 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {placingCOD ? (
                                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
                                    ) : (
                                        `Place Order • $${finalTotal.toFixed(2)}`
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Area */}
                <div className="lg:col-span-2">
                    <div className="bg-card border rounded-3xl p-6 md:p-8 sticky top-24">
                        <h2 className="text-xl font-bold font-lufga mb-6 pb-6 border-b">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.color}-${item.size}`} className="flex space-x-4">
                                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-muted border">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-semibold leading-tight pr-4">{item.name}</h4>
                                            <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.color} {item.size && `/ ${item.size}`}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 py-6 border-t border-b text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal ({totalItems()} items)</span>
                                <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-semibold">${shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxes</span>
                                <span className="font-semibold">Calculated at payment</span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold font-lufga text-primary">${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
