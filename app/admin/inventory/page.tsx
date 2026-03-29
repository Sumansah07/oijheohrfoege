import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    RefreshCcw,
    ChevronRight,
    ArrowDown,
    ArrowUp,
    History
} from "lucide-react"

export default function AdminInventoryPage() {
    const stockItems = [
        { id: 1, product: "Premium Leather Jacket", sku: "JKT-001", variant: "Black / L", current: 45, incoming: 0, status: "healthy" },
        { id: 2, product: "Minimalist Watch", sku: "WTC-009", variant: "Silver", current: 2, incoming: 25, status: "low" },
        { id: 3, product: "Canvas Totebag", sku: "BAG-023", variant: "Beige", current: 120, incoming: 0, status: "healthy" },
        { id: 4, product: "Silk Floral Dress", sku: "DRS-045", variant: "Floral / M", current: 0, incoming: 15, status: "out" },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Real-time stock tracking and replenishment management.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="h-12 px-6 rounded-xl border flex items-center space-x-2 bg-card hover:bg-muted transition-all font-bold text-sm">
                        <History className="h-4 w-4" />
                        <span>Audit Log</span>
                    </button>
                    <button className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg font-bold text-sm">
                        <RefreshCcw className="h-4 w-4" />
                        <span>Bulk Update</span>
                    </button>
                </div>
            </div>

            {/* Inventory Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border rounded-3xl p-6 shadow-sm border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Low Stock Alerts</p>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="text-3xl font-bold mt-2">12 Items</h3>
                    <p className="text-xs text-orange-600 font-bold mt-1 tracking-tight italic">Replenishment recommended</p>
                </div>
                <div className="bg-card border rounded-3xl p-6 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Out of Stock</p>
                        <Package className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-3xl font-bold mt-2">4 Items</h3>
                    <p className="text-xs text-red-600 font-bold mt-1 tracking-tight italic">Loss of revenue detected</p>
                </div>
                <div className="bg-card border rounded-3xl p-6 shadow-sm border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Incoming Stock</p>
                        <ArrowUp className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold mt-2">156 Units</h3>
                    <p className="text-xs text-green-600 font-bold mt-1 tracking-tight italic">Arriving in <span className="underline">3 days</span></p>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter inventory by SKU, product..."
                            className="h-11 w-full bg-white rounded-2xl pl-10 pr-4 text-sm focus:outline-none border"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Detail</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">On Hand</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Incoming</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {stockItems.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{item.product}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{item.variant}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{item.sku}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center space-x-2">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                item.current === 0 ? "text-red-500" : item.current < 10 ? "text-orange-500" : "text-foreground"
                                            )}>{item.current}</span>
                                            <span className="text-xs text-muted-foreground font-medium italic">Units</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-muted-foreground">+{item.incoming}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                            item.status === "healthy" ? "bg-green-100 text-green-700" :
                                                item.status === "low" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {item.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="h-10 px-4 rounded-xl border text-xs font-bold hover:bg-muted transition-all">Update Stock</button>
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
