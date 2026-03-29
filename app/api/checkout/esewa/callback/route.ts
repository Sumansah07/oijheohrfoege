import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";
import { eSewaAdapter } from "@/lib/payments/adapters/esewa";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dataEncoded = searchParams.get("data");

    if (!dataEncoded) {
        console.error("[eSewa Callback] No data provided");
        return NextResponse.redirect(new URL("/order/failure", request.url));
    }

    console.log(`[eSewa Callback] Received data: ${dataEncoded}`);

    try {
        const esewa = paymentRegistry.get("esewa") as eSewaAdapter;
        
        // Use verifyWebhook which handles decoding and signature check
        const event = await esewa.verifyWebhook({ data: dataEncoded }, "");

        // Use Admin client to update order status
        const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const orderId = event.raw.transaction_uuid;
        const status = event.status;

        if (status === "succeeded") {
            // Update order status
            await supabaseAdmin
                .from("orders")
                .update({ 
                    payment_status: "succeeded",
                    status: "processing",
                    updated_at: new Date().toISOString()
                })
                .eq("id", orderId);

            // Log Transaction in payment_transactions table
            await supabaseAdmin.from("payment_transactions").insert([{
                order_id: orderId,
                provider_slug: "esewa",
                external_id: event.transactionId,
                status: "succeeded",
                amount: event.amount,
                raw_response: event.raw
            }]);

            console.log(`[eSewa Callback] Order ${orderId} marked as succeeded and transaction logged`);
            return NextResponse.redirect(new URL(`/order/success?session_id=${orderId}`, request.url));
        } else {
            console.warn(`[eSewa Callback] Payment failed for order ${orderId}`);
            return NextResponse.redirect(new URL("/order/failure", request.url));
        }
    } catch (err: any) {
        console.error("[eSewa Callback Error]:", err);
        return NextResponse.redirect(new URL("/order/failure", request.url));
    }
}
