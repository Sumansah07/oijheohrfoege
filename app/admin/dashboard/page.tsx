import { createClient } from "@/lib/supabase/server"
import {
    DollarSign, ShoppingCart, Users, TrendingUp,
    ArrowUpRight, Package, Clock, ChevronRight
} from "lucide-react"
import Link from "next/link"

function cn(...args: any[]) { return args.filter(Boolean).join(" ") }

export default async function AdminDashboard() {
    const supabase = createClient()

    // Fetch all stats in parallel
    const [
        { count: totalOrders },
        { count: totalProducts },
        { count: totalCustomers },
        { data: revenueData },
        { data: recentOrders },
        { data: topProducts }
    ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("total_amount"),
        supabase.from("orders")
            .select("id, total_amount, status, created_at, profiles(full_name)")
            .order("created_at", { ascending: false })
            .limit(5),
        supabase.from("products")
            .select("id, name, base_price, featured_image, stock_quantity")
            .eq("is_featured", true)
            .limit(5)
    ])

    const totalRevenue = (revenueData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const avgOrder = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

    const stats = [
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
        { label: "Total Orders", value: (totalOrders || 0).toLocaleString(), icon: ShoppingCart, color: "text-blue-600" },
        { label: "Total Customers", value: (totalCustomers || 0).toLocaleString(), icon: Users, color: "text-purple-600" },
        { label: "Avg. Order Value", value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, color: "text-orange-600" },
    ]

    const statusColor: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700",
        processing: "bg-blue-100 text-blue-700",
        shipped: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-lufga tracking-tight">Overview</h1>
                    <p className="text-sm text-muted-foreground mt-1">Real-time store performance</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 border border-primary/20">
                    <Clock className="h-4 w-4" />
                    <span>Live Data</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-muted group-hover:bg-primary transition-colors">
                                <stat.icon className="h-6 w-6 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                            <ArrowUpRight className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-bold mt-1 font-lufga">{stat.value}</h3>
                        </div>
                        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold font-lufga">Recent Orders</h3>
                        <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline">View All</Link>
                    </div>
                    {!recentOrders || recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <ShoppingCart className="h-10 w-10 mb-3 opacity-30" />
                            <p className="font-semibold">No orders yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="py-4 flex items-center justify-between group cursor-pointer hover:bg-muted/30 px-2 rounded-xl transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(order.profiles as any)?.full_name || "Guest"} • ${order.total_amount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", statusColor[order.status] || "bg-muted text-muted-foreground")}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Featured Products */}
                <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold font-lufga">Featured Products</h3>
                        <Link href="/admin/products" className="text-xs font-bold text-primary hover:underline">Manage</Link>
                    </div>
                    {!topProducts || topProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Package className="h-10 w-10 mb-3 opacity-30" />
                            <p className="font-semibold text-sm">No featured products</p>
                            <Link href="/admin/products/new" className="mt-4 text-sm font-bold text-primary">+ Add Product</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.id} className="flex items-center space-x-4">
                                    <div className="h-14 w-12 rounded-xl bg-muted overflow-hidden border shadow-sm shrink-0">
                                        {product.featured_image ? (
                                            <img src={product.featured_image} className="object-cover h-full w-full" alt={product.name} />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">${product.base_price?.toFixed(2)} • {product.stock_quantity} in stock</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/products/new" className="block w-full py-4 rounded-2xl border-2 border-dashed border-muted text-muted-foreground font-bold text-sm text-center hover:border-primary/50 hover:text-primary transition-all">
                        + Add Product
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Manage Products", href: "/admin/products", icon: Package },
                    { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
                    { label: "Edit Banners", href: "/admin/banners", icon: TrendingUp },
                    { label: "View Customers", href: "/admin/customers", icon: Users },
                ].map(action => (
                    <Link key={action.href} href={action.href} className="bg-card border rounded-2xl p-4 flex items-center space-x-3 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        <span className="text-sm font-bold">{action.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
