import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This is the platform-level API that will eventually call DHL/FedEx/UPS APIs
// For now, it returns mock rates based on provider configuration

export async function POST(request: Request) {
    const supabase = createClient();
    const body = await request.json();
    const { items, destination, weight } = body;

    // Get active shipping providers
    const { data: providers, error } = await supabase
        .from("shipping_providers")
        .select("*")
        .eq("is_active", true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get shipping config from site settings
    const { data: settings } = await supabase
        .from("site_settings")
        .select("shipping_config")
        .single();

    const shippingConfig = settings?.shipping_config || { free_shipping_threshold: 0, default_rate: 10 };

    // Calculate total order value
    const orderTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Calculate rates for each provider
    const rates = [];

    for (const provider of providers || []) {
        if (provider.provider_type === 'free') {
            const minOrder = provider.config?.minimum_order || 100;
            if (orderTotal >= minOrder) {
                rates.push({
                    provider_id: provider.id,
                    provider_name: provider.name,
                    provider_slug: provider.slug,
                    provider_type: provider.provider_type,
                    rate: 0,
                    currency: 'USD',
                    estimated_days: '3-5',
                    service_name: 'Free Shipping'
                });
            }
        } else if (provider.provider_type === 'flat_rate') {
            rates.push({
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: provider.config?.rate || 10,
                currency: 'USD',
                estimated_days: provider.config?.estimated_days || '3-5',
                service_name: 'Standard Shipping'
            });
        } else if (provider.provider_type === 'carrier') {
            // TODO: Call actual carrier API (DHL, FedEx, UPS)
            // For now, return mock rates
            const mockRates = getMockCarrierRates(provider, orderTotal, weight, destination);
            rates.push(...mockRates);
        }
    }

    // Apply free shipping threshold from site settings
    if (shippingConfig.free_shipping_threshold > 0 && orderTotal >= shippingConfig.free_shipping_threshold) {
        rates.unshift({
            provider_id: 'free-threshold',
            provider_name: 'Free Shipping',
            provider_slug: 'free-shipping',
            provider_type: 'free',
            rate: 0,
            currency: 'USD',
            estimated_days: '3-5',
            service_name: `Free Shipping (Orders over $${shippingConfig.free_shipping_threshold})`
        });
    }

    return NextResponse.json({ rates });
}

// Mock function - replace with actual API calls
function getMockCarrierRates(provider: any, orderTotal: number, weight: number, destination: any) {
    const baseRate = 15;
    const rates = [];

    if (provider.slug === 'dhl') {
        rates.push(
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate,
                currency: 'USD',
                estimated_days: '2-3',
                service_name: 'DHL Express Worldwide'
            },
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate * 0.7,
                currency: 'USD',
                estimated_days: '4-6',
                service_name: 'DHL Economy Select'
            }
        );
    } else if (provider.slug === 'fedex') {
        rates.push(
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate * 1.2,
                currency: 'USD',
                estimated_days: '1-2',
                service_name: 'FedEx Priority Overnight'
            },
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate * 0.8,
                currency: 'USD',
                estimated_days: '3-5',
                service_name: 'FedEx Ground'
            }
        );
    } else if (provider.slug === 'ups') {
        rates.push(
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate * 1.1,
                currency: 'USD',
                estimated_days: '1-2',
                service_name: 'UPS Next Day Air'
            },
            {
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: baseRate * 0.75,
                currency: 'USD',
                estimated_days: '3-5',
                service_name: 'UPS Ground'
            }
        );
    }

    return rates;
}
