"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function placeCODOrder(items: any[], totalAmount: number, shipping: number, tax: number, shippingAddress: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Must be logged in to place an order" }

    try {
        // Ensure COD exists in payment providers to prevent foreign key errors
        const { data: provider } = await supabase
            .from("payment_providers")
            .select("slug")
            .eq("slug", "cod")
            .maybeSingle()

        if (!provider) {
            await supabaseAdmin.from("payment_providers").insert({
                name: "Cash on Delivery",
                slug: "cod",
                is_active: true
            })
        }

        // 1. Create order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user.id,
                status: "pending",
                total_amount: totalAmount,
                shipping_amount: shipping,
                tax_amount: tax,
                currency: "USD",
                shipping_address: shippingAddress,
                payment_provider_slug: "cod"
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
        }))

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItems)

        if (itemsError) throw itemsError

        // 3. Log Payment Transaction for COD
        await supabaseAdmin.from("payment_transactions").insert({
            order_id: order.id,
            provider_slug: "cod",
            status: "pending",
            amount: totalAmount,
        })

        return { success: true, orderId: order.id }
    } catch (e: any) {
        console.error("COD Checkout Error:", e)
        return { success: false, error: e.message || "Failed to process COD order" }
    }
}
