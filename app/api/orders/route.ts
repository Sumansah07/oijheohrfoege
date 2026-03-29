import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";

export async function POST(request: Request) {
    const supabase = createClient();
    const body = await request.json();
    const { customer, items, total, paymentProvider } = body;

    // 1. Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Create Order record in Supabase
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
            {
                user_id: user?.id || null,
                full_name: customer.fullName,
                email: customer.email,
                total_amount: total,
                status: "pending",
                shipping_address: customer.address,
                payment_status: "pending",
                payment_method: paymentProvider
            }
        ])
        .select()
        .single();

    if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 3. Create Order Items
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        variant_details: { color: item.color, size: item.size }
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    try {
        // 4. Initialize Payment Session via Adapter
        const adapter = paymentRegistry.get(paymentProvider);
        const session = await adapter.createSession(order.id, total, "USD");

        // 5. Update Order with Payment Provider Trans ID if needed
        await supabase
            .from("orders")
            .update({ payment_intent_id: session.id })
            .eq("id", order.id);

        return NextResponse.json({ checkoutUrl: session.url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
