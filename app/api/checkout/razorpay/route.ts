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
                payment_provider_slug: "razorpay",
                payment_status: "pending",
                currency: "USD" // Razorpay docs show USD/INR
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

        // 4. Initiate Razorpay Payment
        const razorpay = paymentRegistry.get("razorpay");
        const session = await razorpay.createSession(order.id, totalAmount, "USD", {
            notes: {
                user_email: user?.email || "customer@example.com"
            }
        });

        // 5. Update order with payment status (if needed, though already pending)
        await supabaseAdmin
            .from("orders")
            .update({ payment_status: "pending" })
            .eq("id", order.id);

        // For Razorpay, we return the session ID and other options for the frontend modal
        return NextResponse.json({ 
            order_id: session.id,
            amount: Math.round(totalAmount * 100),
            currency: "USD",
            key: process.env.RAZORPAY_KEY_ID,
            name: "Modern Store",
            description: `Order #${order.id}`,
            prefill: {
                name: user?.user_metadata?.full_name || "",
                email: user?.email || "",
                contact: ""
            }
        });
    } catch (err: any) {
        console.error("[Razorpay Checkout Error]:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
