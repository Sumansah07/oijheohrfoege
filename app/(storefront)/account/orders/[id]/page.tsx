'use client';

import { useEffect, useState } from "react"
import { ArrowLeft, Package, Truck, Calendar, CreditCard, User, Mail, MapPin, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cancelOrder } from "@/app/actions/order-actions"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const fetchOrder = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push(`/login?next=/account/orders/${params.id}`)
            return
        }
        setUser(user)

        const { data: orderData } = await supabase
            .from("orders")
            .select(`
                *,
                order_items (
                    quantity,
                    unit_price,
                    total_price,
                    products ( name, featured_image, description )
                )
            `)
            .eq("id", params.id)
            .eq("user_id", user.id)
            .single()

        if (!orderData) {
            setLoading(false)
            return
        }

        setOrder(orderData)
        setLoading(false)
    }

    useEffect(() => {
        fetchOrder()
    }, [params.id])

    useEffect(() => {
        if (!order || order.status !== "pending" && order.status !== "processing") {
            setTimeLeft(null)
            return
        }

        const calculateTimeLeft = () => {
            const orderDate = new Date(order.created_at)
            const now = new Date()
            const diff = 3600000 - (now.getTime() - orderDate.getTime())
            return diff > 0 ? diff : 0
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            const left = calculateTimeLeft()
            setTimeLeft(left)
            if (left <= 0) clearInterval(timer)
        }, 1000)

        return () => clearInterval(timer)
    }, [order])

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this order? It will be permanently cancelled.")) return

        setCancelling(true)
        try {
            const result = await cancelOrder(order.id)
            if (result.success) {
                // Fetch fresh data immediately
                await fetchOrder()
                alert("Order successfully cancelled.")
            } else {
                alert(`Cancellation Failed: ${result.error}`)
            }
        } catch (err: any) {
            alert(`An unexpected error occurred: ${err.message}`)
        } finally {
            setCancelling(false)
        }
    }

    if (loading) return (
        <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded-xl" />
            <div className="flex justify-between">
                <div className="space-y-4">
                    <div className="h-10 w-64 bg-muted rounded-xl" />
                    <div className="h-4 w-32 bg-muted rounded-xl" />
                </div>
                <div className="h-10 w-32 bg-muted rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-muted rounded-3xl" />
                <div className="space-y-6">
                    <div className="h-48 bg-muted rounded-3xl" />
                    <div className="h-48 bg-muted rounded-3xl" />
                </div>
            </div>
        </div>
    )

    if (!order) return notFound()

    const statusColors = {
        pending: "bg-orange-100 text-orange-700 border-orange-200",
        processing: "bg-blue-100 text-blue-700 border-blue-200",
        shipped: "bg-purple-100 text-purple-700 border-purple-200",
        delivered: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
    }

    const formatTimeLeft = (ms: number) => {
        const minutes = Math.floor(ms / 60000)
        const seconds = Math.floor((ms % 60000) / 1000)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
            <Link href="/account/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight text-foreground">Order Details</h1>
                    <p className="text-muted-foreground mt-1">Order # {order.id.split("-")[0].toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-4">
                    {timeLeft !== null && timeLeft > 0 && (order.status === "pending" || order.status === "processing") && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Cancellable for</span>
                            <span className="text-sm font-mono font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                {formatTimeLeft(timeLeft)}
                            </span>
                        </div>
                    )}
                    <div className={`px-5 py-2.5 rounded-2xl border font-bold text-xs uppercase tracking-widest ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b bg-muted/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-lufga">Order Items</h3>
                            <span className="text-sm font-bold text-muted-foreground">{order.order_items.length} Items</span>
                        </div>
                        <div className="p-8 space-y-8">
                            {order.order_items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-6 pb-8 border-b last:border-0 last:pb-0 group">
                                    <div className="relative h-28 w-24 bg-muted rounded-[1.5rem] overflow-hidden shrink-0 border group-hover:shadow-lg transition-all duration-500">
                                        {item.products?.featured_image ? (
                                            <img src={item.products.featured_image} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" alt={item.products?.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="h-10 w-10" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">{item.products?.name}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.products?.description}</p>
                                        <div className="flex items-center space-x-6 pt-2">
                                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg">Qty: {item.quantity}</div>
                                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price: ${Number(item.unit_price).toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-foreground font-lufga">${Number(item.total_price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-muted/5 space-y-4">
                            <div className="flex justify-between text-base font-medium">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold text-foreground font-lufga">${(Number(order.total_amount) - Number(order.shipping_amount)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-medium">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-bold text-foreground font-lufga">${Number(order.shipping_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-6 border-t">
                                <span className="font-bold text-xl text-foreground font-lufga">Total Amount</span>
                                <span className="font-bold text-3xl text-primary font-lufga">${Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Section */}
                    {timeLeft !== null && timeLeft > 0 && order.status !== "cancelled" && (
                        <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm text-red-500">
                                    <XCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h5 className="text-lg font-bold text-red-900">Changed your mind?</h5>
                                    <p className="text-sm text-red-700/70 mt-0.5">You can cancel this order within the next <b>{formatTimeLeft(timeLeft)}</b> minutes.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="h-14 px-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center space-x-2 hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
                            >
                                {cancelling ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                <span>Cancel Order</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm space-y-8">
                        <h3 className="text-lg font-bold font-lufga border-b pb-4">Customer Details</h3>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Name</p>
                                    <p className="text-sm font-bold">{user?.user_metadata?.full_name || "Guest User"}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm font-bold">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-[2rem] p-8 shadow-sm space-y-8">
                        <h3 className="text-lg font-bold font-lufga border-b pb-4">Shipping Info</h3>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                                    <div className="text-sm font-bold leading-relaxed">
                                        {typeof order.shipping_address === 'string' ? order.shipping_address : (
                                            <>
                                                {(order.shipping_address as any)?.name && <span className="block mb-1 opacity-70">{(order.shipping_address as any).name}</span>}
                                                {(order.shipping_address as any)?.house_number && `${(order.shipping_address as any).house_number}, `}
                                                {(order.shipping_address as any)?.street || (order.shipping_address as any)?.line1 || "No address details"}<br />
                                                {(order.shipping_address as any)?.city && `${(order.shipping_address as any).city}, `}
                                                {(order.shipping_address as any)?.state && `${(order.shipping_address as any).state} `}
                                                {(order.shipping_address as any)?.postal_code || (order.shipping_address as any)?.zip_code}<br />
                                                {(order.shipping_address as any)?.country}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="text-sm font-bold uppercase tracking-wider">{order.payment_provider_slug || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CheckCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
