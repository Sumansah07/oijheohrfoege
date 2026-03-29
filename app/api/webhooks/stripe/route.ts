import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// We need a server-role client to insert orders, bypassing user RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("stripe-signature") as string;

    let event;

    try {
        if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        try {
            console.log("Processing Checkout Session:", session.id);
            const orderId = session.metadata.order_id;
            const userId = session.metadata.user_id && session.metadata.user_id !== "null" ? session.metadata.user_id : null;

            if (!orderId) {
                console.error("No order_id in session metadata");
                return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
            }

            // 1. Update Order Status
            const { data: order, error: orderError } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "processing"
                })
                .eq("id", orderId)
                .select()
                .single();

            if (orderError) {
                console.error("Supabase Order Update Error:", orderError);
                // Maybe the order doesn't exist? Check if we should fall back to old logic?
                // No, we should stick to the new pattern for consistency.
                return NextResponse.json({ error: `Order update failed: ${orderError.message}` }, { status: 500 });
            }

            console.log("Updated Order Status to Processing:", order.id);

            // 3. Log Payment Transaction
            const { error: transError } = await supabaseAdmin.from("payment_transactions").insert({
                order_id: order.id,
                provider_slug: "stripe",
                external_id: session.id,
                status: "succeeded",
                amount: session.amount_total / 100,
                raw_response: session
            });

            if (transError) {
                console.error("Supabase Transaction Log Error:", transError);
                // Don't fail the whole request if just the log fails, but good to know
            }

            console.log("Order processing complete for session:", session.id);

        } catch (error: any) {
            console.error("Webhook Order Processing Failed:", error);
            return NextResponse.json({ error: `Order processing failed: ${error.message}` }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
