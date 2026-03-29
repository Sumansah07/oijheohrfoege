import { PaymentProvider, PaymentSession, WebhookEvent, RefundResult } from "../types";

export class KhaltiAdapter implements PaymentProvider {
    slug = "khalti";
    name = "Khalti";

    private secretKey: string;
    private baseUrl: string;

    constructor() {
        this.secretKey = process.env.KHALTI_SECRET_KEY || "";
        // Use live URL if not in development, but for now we might want to toggle based on env
        this.baseUrl = process.env.NODE_ENV === 'production' 
            ? "https://khalti.com/api/v2" 
            : "https://dev.khalti.com/api/v2";
    }

    async createSession(orderId: string, amount: number, currency: string, metadata?: any): Promise<PaymentSession> {
        console.log(`[KhaltiAdapter] Creating session for order ${orderId}, amount ${amount} ${currency}`);

        const appUrl = metadata?.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        const payload = {
            return_url: `${appUrl}/api/checkout/khalti/callback`,
            website_url: appUrl,
            amount: Math.round(amount * 100), // Khalti expects paisa
            purchase_order_id: orderId,
            purchase_order_name: `Order #${orderId}`,
            customer_info: metadata?.customer_info || {
                name: "Customer",
                email: "customer@example.com",
                phone: "9800000000"
            }
        };

        const response = await fetch(`${this.baseUrl}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[KhaltiAdapter] Initiation Error:", data);
            throw new Error(data.detail || "Failed to initiate Khalti payment");
        }

        return {
            id: data.pidx,
            url: data.payment_url,
            provider_id: "khalti"
        };
    }

    async verifyWebhook(body: any, signature: string): Promise<WebhookEvent> {
        // Khalti returns data in URL params for callback, or POST for webhooks
        // This method might be used for actual webhooks if Khalti supports them
        console.log(`[KhaltiAdapter] Verifying webhook/callback`);

        // For Khalti, we should probably use the lookup API to verify the status
        const lookupResponse = await fetch(`${this.baseUrl}/epayment/lookup/`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pidx: body.pidx })
        });

        const data = await lookupResponse.json();

        if (!lookupResponse.ok) {
            throw new Error("Failed to verify Khalti payment status");
        }

        return {
            type: "payment.status",
            transactionId: data.transaction_id || data.pidx,
            status: data.status === "Completed" ? "succeeded" : "failed",
            amount: data.total_amount / 100,
            raw: data
        };
    }

    async refund(transactionId: string, amount: number): Promise<RefundResult> {
        console.log(`[KhaltiAdapter] Refund not implemented for Khalti in this version`);
        return {
            success: false,
            transactionId,
            amount,
            error: "Refund not implemented for Khalti"
        };
    }
}
