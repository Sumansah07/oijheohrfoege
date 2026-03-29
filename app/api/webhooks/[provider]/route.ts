import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";

export async function POST(
    request: Request,
    { params }: { params: { provider: string } }
) {
    const providerSlug = params.provider;
    const signature = request.headers.get("stripe-signature") || ""; // Adjust per provider if needed
    const body = await request.text();

    try {
        const adapter = paymentRegistry.get(providerSlug);
        const event = await adapter.verifyWebhook(JSON.parse(body), signature);

        const supabase = createClient();

        // 1. Update Order Status based on webhook event
        if (event.status === "succeeded") {
            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    status: "processing",
                    payment_status: "succeeded",
                    payment_intent_id: event.transactionId
                })
                .eq("id", event.transactionId); // or some other mapping

            if (updateError) throw updateError;

            // 2. Log to payment_transactions (as per roadmap)
            await supabase.from("payment_transactions").insert([{
                order_id: event.transactionId,
                provider_slug: providerSlug,
                external_id: event.transactionId,
                status: "succeeded",
                amount: event.amount,
                raw_response: event.raw
            }]);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`[Webhook Error] ${providerSlug}:`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
