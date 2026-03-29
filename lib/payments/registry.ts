import { PaymentProvider } from "./types";
import { StripeAdapter } from "./adapters/stripe";
import { KhaltiAdapter } from "./adapters/khalti";
import { eSewaAdapter } from "./adapters/esewa";
import { RazorpayAdapter } from "./adapters/razorpay";

class PaymentRegistry {
    private providers: Map<string, PaymentProvider> = new Map();

    constructor() {
        // Register default providers
        this.register(new StripeAdapter());
        this.register(new KhaltiAdapter());
        this.register(new eSewaAdapter());
        this.register(new RazorpayAdapter());
    }

    register(provider: PaymentProvider) {
        this.providers.set(provider.slug, provider);
    }

    get(slug: string): PaymentProvider {
        const provider = this.providers.get(slug);
        if (!provider) {
            throw new Error(`Payment provider '${slug}' not found in registry.`);
        }
        return provider;
    }

    getAllActive(): PaymentProvider[] {
        return Array.from(this.providers.values());
    }
}

export const paymentRegistry = new PaymentRegistry();
