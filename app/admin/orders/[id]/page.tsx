import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { ArrowLeft, Package, Truck, Calendar, CreditCard, User, Mail, MapPin, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const revalidate = 0

async function updateOrderStatus(orderId: string, status: string) {
    "use server"
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
        .from("orders")
        .update({ status })
        .eq("id", orderId)

    if (error) throw error
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
}

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    // We use a service role client here to ensure admins can see the order regardless of RLS
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/login?next=/admin/orders/${params.id}`)
    }

    const { data: order } = await supabaseAdmin
        .from("orders")
        .select(`
            *,
            profiles (full_name),
            order_items (
                quantity,
                unit_price,
                total_price,
                products ( name, featured_image, sku )
            )
        `)
        .eq("id", params.id)
        .single()

    if (!order) {
        notFound()
    }

    const statusOptions = [
        { value: "pending", label: "Pending", icon: Clock, color: "text-orange-600 bg-orange-100" },
        { value: "processing", label: "Processing", icon: Package, color: "text-blue-600 bg-blue-100" },
        { value: "shipped", label: "Shipped", icon: Truck, color: "text-purple-600 bg-purple-100" },
        { value: "delivered", label: "Delivered", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
        { value: "cancelled", label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-100" },
    ]

    return (
        <div className="space-y-8 pb-12">
            <Link href="/admin/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Orders
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold font-lufga tracking-tight">Order #{order.id.split("-")[0].toUpperCase()}</h1>
                        <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stripe</span>
                    </div>
                    <p className="text-muted-foreground mt-2">Manage fulfillment and track details for this order.</p>
                </div>

                <div className="flex items-center gap-3">
                    <form action={async (formData) => {
                        "use server"
                        const status = formData.get("status") as string
                        await updateOrderStatus(params.id, status)
                    }} className="flex items-center gap-2">
                        <select
                            name="status"
                            defaultValue={order.status}
                            className="h-12 pl-4 pr-10 rounded-xl border bg-card text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                            Update Status
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items List */}
                    <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b bg-muted/10 flex items-center justify-between">
                            <h3 className="font-bold font-lufga flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                Order Items
                            </h3>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{order.order_items.length} Products</span>
                        </div>
                        <div className="p-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
                                        <th className="pb-4">Product</th>
                                        <th className="pb-4">SKU</th>
                                        <th className="pb-4 text-center">Qty</th>
                                        <th className="pb-4 text-right">Unit</th>
                                        <th className="pb-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.order_items.map((item: any, idx: number) => (
                                        <tr key={idx} className="group">
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden shrink-0 border group-hover:border-primary/30 transition-colors">
                                                        <img src={item.products.featured_image} className="object-cover w-full h-full" alt="" />
                                                    </div>
                                                    <span className="font-bold text-sm leading-tight max-w-[200px]">{item.products.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-sm font-mono text-muted-foreground uppercase">{item.products.sku || "N/A"}</td>
                                            <td className="py-6 text-sm font-bold text-center">x{item.quantity}</td>
                                            <td className="py-6 text-sm font-medium text-right text-muted-foreground">${Number(item.unit_price).toFixed(2)}</td>
                                            <td className="py-6 text-sm font-bold text-right">${Number(item.total_price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-muted/5 flex flex-col items-end space-y-3">
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">${(Number(order.total_amount) - Number(order.shipping_amount)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-muted-foreground">Shipping (Standard)</span>
                                <span className="font-semibold">${Number(order.shipping_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs pt-4 border-t-2 border-dashed">
                                <span className="font-bold text-lg">Total Amount</span>
                                <span className="font-bold text-3xl text-primary font-lufga">${Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Logs */}
                    <div className="bg-card border rounded-3xl p-8 shadow-sm">
                        <h3 className="font-bold font-lufga mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Activity Log
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1 h-3 w-3 rounded-full bg-green-500 shrink-0 ring-4 ring-green-100" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Order Confirmed</p>
                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-xl border border-dashed text-[10px] uppercase font-bold tracking-widest">Logged: system - automated</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold font-lufga border-b pb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Customer Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Full Name</span>
                                <span className="text-sm font-bold">{order.profiles?.full_name || (order.shipping_address as any)?.name || "Guest Information"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Address</span>
                                <span className="text-sm font-medium text-primary underline">{(order.shipping_address as any)?.email || order.profiles?.email || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Customer Type</span>
                                <span className="inline-flex w-fit px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-tight">{order.user_id ? "Registered User" : "Guest Checkout"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold font-lufga border-b pb-4 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            Shipping Info
                        </h3>
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Carrier</span>
                                <span className="text-sm font-bold italic tracking-tight underline decoration-primary decoration-double underline-offset-4">Domestic Standard Shipping</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</span>
                                <p className="text-sm font-medium leading-relaxed bg-muted/20 p-4 rounded-2xl border border-dashed border-muted-foreground/30">
                                    {(order.shipping_address as any)?.line1 || "No address details"}<br />
                                    {(order.shipping_address as any)?.city && `${(order.shipping_address as any).city}, `}
                                    {(order.shipping_address as any)?.postal_code}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold font-lufga border-b pb-4 flex items-center gap-2 border-primary/20">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            Internal Notes
                        </h3>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Admin notes are private and not visible to customers.</p>
                        <textarea
                            className="w-full h-32 bg-muted/10 rounded-2xl border p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Add a note about this customer..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    )
}
