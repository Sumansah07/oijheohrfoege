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
        </div>
    )
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(" ")
}
