import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");
    const purchase_order_id = searchParams.get("purchase_order_id");

    if (!pidx || !purchase_order_id) {
        return NextResponse.redirect(new URL("/order/failure?error=Missing+parameters", request.url));
    }

    const khalti = paymentRegistry.get("khalti");

    // Use Admin client to bypass RLS for order updates
    const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 1. Verify payment with Khalti Lookup API
        const verification = await khalti.verifyWebhook({ pidx }, "");

        if (verification.status === "succeeded") {
            // 2. Update Order Status
            const { error: updateError } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "processing",
                    payment_status: "succeeded",
                    updated_at: new Date().toISOString()
                })
                .eq("id", purchase_order_id);

            if (updateError) throw updateError;

            // 3. Log Transaction
            await supabaseAdmin.from("payment_transactions").insert([{
                order_id: purchase_order_id,
                provider_slug: "khalti",
                external_id: verification.transactionId,
                status: "succeeded",
                amount: verification.amount,
                raw_response: verification.raw
            }]);

            return NextResponse.redirect(new URL(`/order/success?session_id=${purchase_order_id}`, request.url));
        } else {
            // 4. Update Order Status to failed
            await supabaseAdmin
                .from("orders")
                .update({ status: "cancelled", payment_status: "failed" })
                .eq("id", purchase_order_id);

            return NextResponse.redirect(new URL(`/order/failure?error=Payment+${verification.status}`, request.url));
        }
    } catch (err: any) {
        console.error("[Khalti Callback Error]:", err);
        return NextResponse.redirect(new URL(`/order/failure?error=${encodeURIComponent(err.message)}`, request.url));
    }
}
