import Razorpay from "razorpay";
import { PaymentProvider, PaymentSession, WebhookEvent, RefundResult } from "../types";

export class RazorpayAdapter implements PaymentProvider {
    readonly slug = "razorpay";
    readonly name = "Razorpay";
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });
    }

    async createSession(orderId: string, amount: number, currency: string, metadata?: any): Promise<PaymentSession> {
        console.log(`[RazorpayAdapter] Creating session for order ${orderId}, amount ${amount} ${currency}`);

        // Razorpay expects amount in subunits (e.g., paise for INR)
        // Check currency and convert accordingly. USD uses cents.
        const subunitAmount = Math.round(amount * 100);

        try {
            const razorpayOrder = await this.razorpay.orders.create({
                amount: subunitAmount,
                currency: currency || "USD",
                receipt: orderId,
                notes: {
                    order_id: orderId,
                    ...metadata?.notes
                }
            });

            return {
                id: razorpayOrder.id,
                url: "", // Razorpay uses a modal, so URL is not used here for redirecting.
                provider_id: "razorpay"
            };
        } catch (error: any) {
            console.error("[RazorpayAdapter] Error creating order:", error);
            throw new Error(`Razorpay order creation failed: ${error.message}`);
        }
    }

    async verifyWebhook(body: any, signature: string): Promise<WebhookEvent> {
        console.log(`[RazorpayAdapter] Verifying webhook signature`);
        
        // Use the native crypto or razorpay's internal verification
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        
        // For Razorpay, we often verify on the client side then send to server, 
        // OR verify directly if it's a webhook.
        // If it's a callback redirect, we verify the signature.
        
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return {
                type: "payment.error",
                transactionId: "unknown",
                status: "failed",
                amount: 0,
                raw: body
            };
        }

        const isValid = Razorpay.validateWebhookSignature(
            `${razorpay_order_id}|${razorpay_payment_id}`,
            razorpay_signature,
            secret
        );

        return {
            type: "payment.status",
            transactionId: razorpay_payment_id,
            status: isValid ? "succeeded" : "failed",
            amount: 0, // Amount needs to be fetched if not provided
            raw: body
        };
    }

    async refund(transactionId: string, amount: number): Promise<RefundResult> {
        try {
            const refund = await this.razorpay.payments.refund(transactionId, {
                amount: Math.round(amount * 100)
            });
            return {
                success: true,
                transactionId: refund.id,
                amount: amount
            };
        } catch (error: any) {
            console.error("[RazorpayAdapter] Refund error:", error);
            return {
                success: false,
                transactionId,
                amount,
                error: error.message
            };
        }
    }
}
