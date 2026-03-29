import { createClient } from "@/lib/supabase/server"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const revalidate = 0; // Ensure fresh data on every load for orders

export default async function CostumerOrdersPage() {
    const supabase = createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/account/orders")
    }

    // Fetch user's orders alongside their items and product details
    const { data: orders } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (
                quantity,
                unit_price,
                total_price,
                products ( name, featured_image )
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const statusColors = {
        pending: "bg-orange-100 text-orange-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-lufga tracking-tight">My Orders</h1>
                <p className="text-muted-foreground mt-2">Track, manage, and view your order history.</p>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="bg-card border rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">No orders yet</h2>
                    <p className="text-muted-foreground max-w-sm mb-8">When you purchase items, they will appear here so you can track their status.</p>
                    <Link href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const date = new Date(order.created_at).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        const shortId = order.id.split("-")[0].toUpperCase()
                        const mappedStatus = statusColors[order.status as keyof typeof statusColors] || statusColors.pending

                        return (
                            <div key={order.id} className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:border-primary/20 transition-all group">
                                <div className="p-6 bg-muted/20 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm flex-1">
                                        <div>
                                            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Order Placed</p>
                                            <p className="font-medium text-foreground">{date}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Total</p>
                                            <p className="font-medium text-foreground">${Number(order.total_amount).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Order #</p>
                                            <p className="font-medium text-foreground">{shortId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 shrink-0">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${mappedStatus}`}>
                                            {order.status}
                                        </div>
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="h-10 px-4 rounded-xl border bg-background text-sm font-bold flex items-center space-x-2 group-hover:bg-muted transition-colors hidden md:flex"
                                        >
                                            <span>View Details</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-sm font-bold mb-4">Items in your order</h4>
                                    <div className="space-y-4">
                                        {Array.isArray(order.order_items) && order.order_items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center space-x-4">
                                                <div className="relative h-16 w-16 bg-muted rounded-xl overflow-hidden shrink-0">
                                                    {item.products?.featured_image ? (
                                                        <img src={item.products.featured_image} className="object-cover w-full h-full" alt={item.products?.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="h-5 w-5" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-foreground">{item.products?.name || "Unknown Product"}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="font-medium text-sm">
                                                    ${Number(item.total_price).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
