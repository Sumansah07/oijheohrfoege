import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";

export async function POST(request: Request) {
    const supabase = createClient();
    const { items, shippingAddress } = await request.json();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Calculate total amount
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const shipping = 10.00; // Match checkout page
    const totalAmount = subtotal + shipping;

    // Use Admin client to bypass RLS for order creation (system operation)
    const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 2. Create Order in Pending status
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert([{
                user_id: user?.id || null,
                status: "pending",
                total_amount: totalAmount,
                shipping_amount: shipping,
                shipping_address: shippingAddress,
                payment_provider_slug: "esewa",
                payment_status: "pending",
                currency: "NPR"
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Create Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
        }));

        await supabaseAdmin.from("order_items").insert(orderItems);

        // 4. Initiate eSewa Payment
        const esewa = paymentRegistry.get("esewa");
        const origin = new URL(request.url).origin;
        const session = await esewa.createSession(order.id, totalAmount, "NPR", {
            origin,
            customer_info: {
                name: user?.user_metadata?.full_name || "Customer",
                email: user?.email || "customer@example.com",
                phone: user?.user_metadata?.phone || "9800000000"
            }
        });

        // 5. Update order with payment session id (transaction_uuid for eSewa)
        await supabaseAdmin
            .from("orders")
            .update({ payment_intent_id: session.id })
            .eq("id", order.id);

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("[eSewa Checkout Error]:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
