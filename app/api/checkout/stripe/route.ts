import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, shippingAddress } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Security: Calculate total price on the server side
        let totalAmount = 0;
        const lineItems = [];

        for (const item of items) {
            const { data: product } = await supabase
                .from("products")
                .select("base_price, discount_price, name, is_active")
                .eq("id", item.id)
                .single();

            if (!product || !product.is_active) {
                return NextResponse.json({ error: `Product ${item.name} is unavailable.` }, { status: 400 });
            }

            const activePrice = product.discount_price || product.base_price;
            totalAmount += activePrice * item.quantity;

            lineItems.push({
                product_id: item.id,
                name: product.name,
                price: activePrice,
                quantity: item.quantity,
                color: item.color,
                size: item.size
            });
        }

        // Add dummy shipping cost ($10)
        totalAmount += 10;

        // Create Stripe Checkout Session
        // transition to Draft Order Pattern to avoid Stripe Metadata 500-character limit
        const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Create the Order in Supabase
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: user?.id || null,
                status: "pending",
                total_amount: totalAmount,
                shipping_amount: 10,
                tax_amount: 0,
                currency: "USD",
                shipping_address: shippingAddress,
                payment_provider_slug: "stripe"
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const orderItemsInsert = lineItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItemsInsert);

        if (itemsError) throw itemsError;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${request.headers.get("origin")}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get("origin")}/cart`,
            customer_email: user?.email,
            metadata: {
                order_id: order.id,
                user_id: user?.id || null
            }
        });

        return NextResponse.json({
            url: session.url,
        });

    } catch (error: any) {
        console.error("Stripe Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
