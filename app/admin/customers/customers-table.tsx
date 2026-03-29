"use client"

import { useState } from "react"
import {
    Users,
    Search,
    Mail,
    Trash2,
    ShieldAlert,
    ShieldCheck,
    RefreshCw,
    ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/store/use-toast"

interface Customer {
    id: string
    name: string
    email: string
    joined: string
    spending: number
    orders: number
    status: string
    avatar: string | null
    is_active: boolean
}

export default function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
    const { addToast } = useToast()
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !currentStatus })
            })
            if (res.ok) {
                setCustomers(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
                addToast(`Customer ${currentStatus ? "frozen" : "unfrozen"} successfully`, "success")
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                addToast(data.error || "Failed to update status", "error")
            }
        } catch (error: any) {
            addToast(error.message || "An error occurred", "error")
            console.error("Failed to toggle status:", error)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to PERMANENTLY delete this customer? This action cannot be undone.")) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" })
            if (res.ok) {
                setCustomers(prev => prev.filter(c => c.id !== id))
                addToast("Customer deleted successfully", "success")
                router.refresh()
            } else {
                const data = await res.json().catch(() => ({}))
                addToast(data.error || "Failed to delete customer", "error")
            }
        } catch (error: any) {
            addToast(error.message || "An error occurred", "error")
            console.error("Failed to delete customer:", error)
        }
        setLoading(false)
    }

    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

    return (
        <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                            <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</th>
                            <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orders & Spending</th>
                            <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Segment & Status</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                        <Users className="h-12 w-12" />
                                        <p className="font-bold">No customers found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id} className={cn("group hover:bg-muted/10 transition-colors", !customer.is_active && "bg-red-50/30")}>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center space-x-4">
                                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-primary/5 overflow-hidden shadow-sm group-hover:scale-105 transition-all text-sm font-bold", customer.is_active ? "bg-primary/10 text-primary" : "bg-red-50 text-red-400")}>
                                                {customer.avatar ? (
                                                    <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="italic">{customer.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-foreground truncate group-hover:text-primary transition-colors">{customer.name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Joined {customer.joined}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-2 font-medium text-muted-foreground">
                                            <Mail className="h-3 w-3 opacity-50" />
                                            <span>{customer.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="h-6 px-3 rounded-lg bg-muted flex items-center font-bold text-[10px]">{customer.orders} Orders</span>
                                            </div>
                                            <p className="text-xs font-black text-foreground">
                                                {currencyFormatter.format(customer.spending)} total
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center space-x-2">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm inline-block",
                                                customer.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                    "bg-green-50 text-green-700 border-green-100"
                                            )}>
                                                {customer.status}
                                            </span>
                                            {!customer.is_active && (
                                                <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border-red-200 border shadow-sm">
                                                    Frozen
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(customer.id, customer.is_active)}
                                                className={cn(
                                                    "h-10 px-4 rounded-xl border flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                                                    customer.is_active
                                                        ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                                        : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                                )}
                                            >
                                                {customer.is_active ? (
                                                    <><ShieldAlert className="h-4 w-4" /> <span>Freeze</span></>
                                                ) : (
                                                    <><ShieldCheck className="h-4 w-4" /> <span>Unfreeze</span></>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="h-10 w-10 rounded-xl border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm group/del"
                                            >
                                                <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
