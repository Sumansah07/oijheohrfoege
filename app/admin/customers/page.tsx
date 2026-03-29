import {
    Users,
    Search
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import CustomersTable from "./customers-table"

export default async function AdminCustomersPage({
    searchParams
}: {
    searchParams: { q?: string; segment?: string }
}) {
    const supabase = createClient()
    const query = searchParams.q || ""
    const segment = searchParams.segment || "all"

    // Fetch customers (profiles with role='customer')
    let customersQuery = supabase
        .from("profiles")
        .select(`
            *,
            orders (
                id,
                total_amount,
                status
            )
        `)
        .eq("role", "customer")
        .order("created_at", { ascending: false })

    if (query) {
        customersQuery = customersQuery.ilike("full_name", `%${query}%`)
    }

    const { data: profiles, error } = await customersQuery

    if (error) {
        console.error("Error fetching customers:", error)
    }

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const customers = (profiles || []).map(profile => {
        const orders = profile.orders || []
        const totalSpending = orders
            .filter((o: any) => o.status !== "cancelled")
            .reduce((acc: number, o: any) => acc + Number(o.total_amount), 0)

        const orderCount = orders.length
        const createdAt = new Date(profile.created_at)

        // New segment: created in last 24 hours
        const isNew = createdAt >= twentyFourHoursAgo
        const status = isNew ? "new" : "active"

        return {
            id: profile.id,
            name: profile.full_name || "Anonymous",
            email: (profile as any).email || (profile as any).metadata?.email || "No email",
            joined: format(createdAt, "MMM d, yyyy"),
            spending: totalSpending,
            orders: orderCount,
            status: status,
            avatar: profile.avatar_url,
            is_active: (profile as any).is_active ?? true
        }
    }).filter(c => {
        if (segment === "new") return c.status === "new"
        return true
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Customer Database</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your relationships, freeze accounts, or remove records.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center space-x-2 shadow-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-primary">{customers.length} Total</span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <form className="bg-card border rounded-[2.5rem] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search by customer name..."
                        className="h-14 w-full bg-muted/50 rounded-2xl pl-13 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-transparent focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-muted/30 p-1.5 rounded-2xl">
                        {["all", "new"].map((s) => (
                            <button
                                key={s}
                                type="submit"
                                name="segment"
                                value={s}
                                className={cn(
                                    "h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    segment === s ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="h-14 px-10 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Search
                    </button>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
            </form>

            <CustomersTable initialCustomers={customers} />
        </div>
    )
}
