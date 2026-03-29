import {
    Package,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    Truck,
    XCircle,
    Clock,
    ExternalLink,
    ChevronRight,
    Download
} from "lucide-react"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminOrdersPage() {
    const supabase = createClient()

    const { data: rawOrders, error } = await supabase
        .from("orders")
        .select(`
            id, 
            total_amount, 
            status, 
            created_at, 
            payment_provider_slug,
            shipping_address,
            profiles (full_name)
        `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("ADMIN ORDERS FETCH ERROR:", error)
    } else {
        console.log("ADMIN ORDERS FETCHED:", rawOrders?.length || 0, "orders found")
    }

    const orders = (rawOrders || []).map(o => ({
        id: o.id.split("-")[0].toUpperCase(), // Short visual ID
        fullId: o.id,
        customer: (o.profiles as any)?.full_name || (o.shipping_address as any)?.name || "Guest",
        email: (o.shipping_address as any)?.email || "N/A",
        date: new Date(o.created_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }),
        total: `$${Number(o.total_amount).toFixed(2)}`,
        items: 1, // We could join order_items to get total count
        status: o.status,
        payment: o.payment_provider_slug === "stripe" ? "paid" : "pending"
    }))

    const statusColors = {
        pending: "bg-orange-100 text-orange-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Track and manage customer purchases and fulfillment.</p>
                </div>
                <button className="h-12 px-6 rounded-xl border flex items-center space-x-2 bg-card hover:bg-muted transition-all font-bold text-sm">
                    <Download className="h-4 w-4" />
                    <span>Export Orders</span>
                </button>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "New Orders", count: "14", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "In Fulfillment", count: "8", color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Completed", count: "421", color: "text-green-600", bg: "bg-green-50" },
                    { label: "Cancelled", count: "3", color: "text-red-600", bg: "bg-red-50" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card border rounded-3xl p-6 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <h3 className="text-2xl font-bold mt-1">{stat.count}</h3>
                        </div>
                        <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", stat.bg)}>
                            <Package className={cn("h-5 w-5", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table & Filters */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, customer..."
                            className="h-11 w-full bg-white rounded-2xl pl-10 pr-4 text-sm focus:outline-none border"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="h-11 px-4 rounded-2xl border bg-white flex items-center space-x-2 text-sm font-bold">
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/20 transition-colors cursor-pointer group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold group-hover:text-primary transition-colors">{order.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{order.customer}</span>
                                            <span className="text-xs text-muted-foreground">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{order.date}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{order.total}</span>
                                            <span className="text-[10px] text-muted-foreground">{order.items} items</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                            statusColors[order.status as keyof typeof statusColors]
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-2">
                                            <div className={cn("h-1.5 w-1.5 rounded-full", order.payment === "paid" ? "bg-green-500" : "bg-orange-500")} />
                                            <span className="text-xs font-bold text-muted-foreground uppercase">{order.payment}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/admin/orders/${order.fullId}`} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(" ")
}
