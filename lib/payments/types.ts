export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentSession {
    id: string;
    url: string;
    provider_id: string;
}

export interface WebhookEvent {
    type: string;
    transactionId: string;
    status: PaymentStatus;
    amount: number;
    raw: any;
}

export interface RefundResult {
    success: boolean;
    transactionId: string;
    amount: number;
    error?: string;
}

export interface PaymentProvider {
    slug: string;
    name: string;

    /**
     * Create a checkout session or payment intent
     */
    createSession(orderId: string, amount: number, currency: string, metadata?: any): Promise<PaymentSession>;

    /**
     * Verify and process incoming webhooks from the provider
     */
    verifyWebhook(body: any, signature: string): Promise<WebhookEvent>;

    /**
     * Refund a transaction
     */
    refund(transactionId: string, amount: number): Promise<RefundResult>;
}
