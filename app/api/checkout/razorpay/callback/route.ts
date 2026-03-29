import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentRegistry } from "@/lib/payments/registry";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

        const razorpay = paymentRegistry.get("razorpay");
        const webhookEvent = await razorpay.verifyWebhook(body, razorpay_signature);

        const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (webhookEvent.status === "succeeded") {
            // Fetch order to get amount
            const { data: order } = await supabaseAdmin
                .from("orders")
                .select("total_amount")
                .eq("id", orderId)
                .single();

            // Update order status
            const { error: updateError } = await supabaseAdmin
                .from("orders")
                .update({ 
                    status: "processing", 
                    payment_status: "succeeded"
                })
                .eq("id", orderId);

            if (updateError) throw updateError;

            // Log transaction with correct column names
            await supabaseAdmin.from("payment_transactions").insert({
                order_id: orderId,
                provider_slug: "razorpay",
                status: "succeeded",
                amount: order?.total_amount || 0,
                external_id: razorpay_payment_id,
                raw_response: body
            });

            return NextResponse.json({ success: true });
        } else {
             // Update order status to failed
             await supabaseAdmin
                .from("orders")
                .update({ 
                    status: "cancelled", 
                    payment_status: "failed" 
                })
                .eq("id", orderId);

            return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
        }
    } catch (err: any) {
        console.error("[Razorpay Callback Error]:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
