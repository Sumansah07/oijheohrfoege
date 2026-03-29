import { ShoppingBag, Heart, MapPin, ChevronRight, Package, Shield, Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AccountDashboardPage() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile
    let profile = null
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single()
        profile = data
    }

    const firstName = profile?.full_name?.split(" ")[0] || "User"

    const recentOrders = [
        { id: "ORD-2081", date: "24 May, 2024", total: "$129.00", status: "Processing" },
        { id: "ORD-2059", date: "12 May, 2024", total: "$340.50", status: "Delivered" },
    ]

    const stats = [
        { label: "Total Orders", value: "14", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Wishlist Items", value: "8", icon: Heart, color: "text-red-600", bg: "bg-red-50" },
        { label: "Saved Addresses", value: "2", icon: MapPin, color: "text-green-600", bg: "bg-green-50" },
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Hello, {firstName}! Welcome back to your portal.</p>
                </div>

                {profile?.role === "admin" && (
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-6 py-3 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all font-bold group"
                    >
                        <Shield className="h-5 w-5" />
                        <span>Go to Admin Panel</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-card border rounded-3xl p-8 shadow-sm group hover:border-primary/30 transition-all">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold font-lufga">Recent Orders</h3>
                        <Link href="/account/orders" className="text-sm font-bold text-primary flex items-center hover:underline">
                            <span>View All</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="p-4 rounded-2xl border bg-muted/20 flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-tight">{order.id}</p>
                                        <p className="text-xs text-muted-foreground">{order.date} • {order.total}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                    order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {order.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conditional Account Settings or Admin Quick Link */}
                {profile?.role === "admin" ? (
                    <div className="bg-black text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold font-lufga">Admin Access</h3>
                                <p className="text-sm text-white/60 mt-2 leading-relaxed">
                                    You have administrative privileges. You can manage products, orders, and site settings from the admin panel.
                                </p>
                            </div>
                            <Link href="/admin/dashboard" className="h-14 w-full rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center group-hover:scale-[1.02] transition-transform shadow-lg">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Launch Admin Dashboard</span>
                            </Link>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute top-10 right-10 h-20 w-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    </div>
                ) : (
                    /* Account Settings Shortcut */
                    <div className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-4 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-lufga">Join the Inner Circle</h3>
                                <p className="text-sm text-white/80 mt-2 leading-relaxed">
                                    Earn points on every purchase and unlock exclusive rewards, early access to drops, and free shipping.
                                </p>
                            </div>
                            <button className="h-12 w-full rounded-2xl bg-white text-primary font-bold text-sm flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                                <span>View Rewards Portal</span>
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-10 right-10 h-20 w-20 bg-white/5 rounded-full blur-xl" />
                    </div>
                )}
            </div>
        </div>
    )
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(" ")
}
