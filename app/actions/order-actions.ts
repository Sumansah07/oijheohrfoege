"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function cancelOrder(orderId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not authenticated" }

    // 1. Fetch order to verify eligibility
    const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("id, status, created_at, user_id")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single()

    if (fetchError || !order) {
        return { success: false, error: "Order not found" }
    }

    // 2. Check status (can only cancel if pending or processing)
    if (!["pending", "processing"].includes(order.status)) {
        return { success: false, error: `Cannot cancel an order that is already ${order.status}` }
    }

    // 3. Check time (1 hour = 3600000 ms)
    const orderDate = new Date(order.created_at)
    const now = new Date()
    const diff = now.getTime() - orderDate.getTime()

    if (diff > 3600000) {
        return { success: false, error: "Orders can only be cancelled within 1 hour of being placed" }
    }

    // 4. Update order status
    const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("user_id", user.id)

    if (updateError) {
        console.error("Error cancelling order:", updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath(`/account/orders/${orderId}`)
    revalidatePath("/account/orders")

    return { success: true }
}
