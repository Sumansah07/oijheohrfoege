import crypto from "crypto";
import { PaymentProvider, PaymentSession, WebhookEvent, RefundResult } from "../types";

export class eSewaAdapter implements PaymentProvider {
    readonly slug = "esewa";
    readonly name = "eSewa";
    private secretKey: string;
    private productCode: string;
    private baseUrl: string;
    private statusCheckUrl: string;

    constructor() {
        this.secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
        this.productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
        this.baseUrl = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        this.statusCheckUrl = process.env.ESEWA_STATUS_CHECK_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
    }

    async createSession(orderId: string, amount: number, currency: string, metadata?: any): Promise<PaymentSession> {
        console.log(`[eSewaAdapter] Creating session for order ${orderId}, amount ${amount} ${currency}`);

        // eSewa requires amounts as strings or numbers, but total_amount must match exactly for signature
        // We'll use a local redirect endpoint to handle the form submission
        const appUrl = metadata?.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
        const sessionUrl = `${appUrl}/api/checkout/esewa/initiate?orderId=${orderId}`;
        
        console.log(`[eSewaAdapter] Session URL: ${sessionUrl}`);

        return {
            id: orderId,
            url: sessionUrl,
            provider_id: "esewa"
        };
    }

    /**
     * Internal method to generate signature for eSewa
     */
    generateSignature(params: Record<string, string>): string {
        const { total_amount, transaction_uuid, product_code } = params;
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        console.log(`[eSewaAdapter] Signing message: ${message}`);

        const hash = crypto
            .createHmac("sha256", this.secretKey)
            .update(message)
            .digest("base64");
            
        console.log(`[eSewaAdapter] Generated signature: ${hash}`);
        return hash;
    }

    /**
     * Verify the signature from eSewa response
     */
    verifyResponseSignature(data: any): boolean {
        const { signed_field_names, signature } = data;
        
        if (!signed_field_names || !signature) {
            console.error(`[eSewaAdapter] Missing signature or signed_field_names in response`);
            return false;
        }

        const fields = signed_field_names.split(',');
        const message = fields.map((field: string) => `${field}=${data[field]}`).join(',');
        
        console.log(`[eSewaAdapter] Verifying response message: ${message}`);

        const expectedSignature = crypto
            .createHmac("sha256", this.secretKey)
            .update(message)
            .digest("base64");
            
        const isValid = expectedSignature === signature;
        console.log(`[eSewaAdapter] Signature check: ${isValid ? 'PASSED' : 'FAILED'}`);
        if (!isValid) {
            console.log(`[eSewaAdapter] Expected: ${expectedSignature}`);
            console.log(`[eSewaAdapter] Received: ${signature}`);
        }
        return isValid;
    }

    async verifyWebhook(body: any, signature: string): Promise<WebhookEvent> {
        console.log(`[eSewaAdapter] Verifying callback body`);
        
        // body is the base64 encoded data from eSewa redirect
        try {
            const decodedBody = JSON.parse(Buffer.from(body.data, 'base64').toString('utf-8'));
            console.log(`[eSewaAdapter] Decoded body:`, decodedBody);
            
            const isValid = this.verifyResponseSignature(decodedBody);
            
            return {
                type: "payment.status",
                transactionId: decodedBody.transaction_code || decodedBody.transaction_uuid,
                status: (isValid && decodedBody.status === "COMPLETE") ? "succeeded" : "failed",
                amount: parseFloat(decodedBody.total_amount),
                raw: decodedBody
            };
        } catch (err) {
            console.error(`[eSewaAdapter] Error parsing callback data:`, err);
            return {
                type: "payment.error",
                transactionId: "unknown",
                status: "failed",
                amount: 0,
                raw: body
            };
        }
    }

    async refund(transactionId: string, amount: number): Promise<RefundResult> {
        // Refund not implemented for eSewa v2 in this adapter
        console.warn("[eSewaAdapter] Refund not implemented");
        return {
            success: false,
            transactionId,
            amount,
            error: "Refund not implemented for eSewa"
        };
    }

    /**
     * Helper to get form fields for initiation
     */
    getFormFields(orderId: string, amount: number, customAppUrl?: string) {
        const totalAmount = amount.toString();
        const transactionUuid = orderId;
        const appUrl = customAppUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

        const params = {
            amount: amount.toString(),
            tax_amount: "0",
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: this.productCode,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${appUrl}/api/checkout/esewa/callback`,
            failure_url: `${appUrl}/order/failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
        };

        const signature = this.generateSignature({
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: this.productCode
        });

        console.log(`[eSewaAdapter] Form fields prepared:`, { ...params, signature: 'HIDDEN' });

        return {
            ...params,
            signature,
            action: this.baseUrl
        };
    }
}
