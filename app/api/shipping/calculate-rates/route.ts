import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper function to get carrier credentials (Database first, then ENV fallback)
function getCarrierCredentials(provider: any) {
    const config = provider.config || {};
    
    // Try database first
    if (config.api_key && config.api_secret && config.account_number) {
        return {
            api_key: config.api_key,
            api_secret: config.api_secret,
            account_number: config.account_number,
            test_mode: config.test_mode ?? true,
            shipper: config.shipper || {}
        };
    }
    
    // Fallback to environment variables (useful for development/single-store)
    if (provider.slug === 'dhl') {
        return {
            api_key: process.env.DHL_API_KEY || '',
            api_secret: process.env.DHL_API_SECRET || '',
            account_number: process.env.DHL_ACCOUNT_NUMBER || '',
            test_mode: process.env.DHL_TEST_MODE === 'true',
            shipper: {
                company_name: process.env.WAREHOUSE_NAME || '',
                phone: process.env.WAREHOUSE_PHONE || '',
                address: {
                    street: process.env.WAREHOUSE_ADDRESS || '',
                    city: process.env.WAREHOUSE_CITY || '',
                    state: process.env.WAREHOUSE_STATE || '',
                    postal_code: process.env.WAREHOUSE_ZIP || '',
                    country_code: process.env.WAREHOUSE_COUNTRY || ''
                }
            }
        };
    }
    
    // Add similar fallbacks for FedEx, UPS if needed
    return { api_key: '', api_secret: '', account_number: '', test_mode: true, shipper: {} };
}

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
            // Get credentials from database config or fallback to ENV
            const credentials = getCarrierCredentials(provider);
            
            if (credentials.api_key && credentials.api_secret && credentials.account_number) {
                // TODO: Call actual carrier API (DHL, FedEx, UPS)
                // For now, return mock rates
                const mockRates = getMockCarrierRates(provider, orderTotal, weight, destination);
                rates.push(...mockRates);
            } else {
                // Skip provider if credentials not configured
                console.warn(`Skipping ${provider.name} - credentials not configured`);
            }
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

// Get carrier rates from configured services
function getMockCarrierRates(provider: any, orderTotal: number, weight: number, destination: any) {
    const rates = [];
    const services = provider.config?.services || {};
    const currency = provider.config?.defaults?.currency || 'INR';

    // Build rates from configured services
    Object.entries(services).forEach(([serviceKey, serviceConfig]: [string, any]) => {
        if (serviceConfig.enabled !== false) {
            rates.push({
                provider_id: provider.id,
                provider_name: provider.name,
                provider_slug: provider.slug,
                provider_type: provider.provider_type,
                rate: serviceConfig.rate || 0,
                currency: currency,
                estimated_days: serviceConfig.estimated_days || '3-5',
                service_name: serviceConfig.name || 'Standard Shipping',
                service_description: serviceConfig.description || ''
            });
        }
    });

    // Fallback to base_rate if no services configured
    if (rates.length === 0 && provider.config?.base_rate) {
        const baseRate = provider.config.base_rate;
        
        if (provider.slug === 'dhl') {
            rates.push(
                {
                    provider_id: provider.id,
                    provider_name: provider.name,
                    provider_slug: provider.slug,
                    provider_type: provider.provider_type,
                    rate: baseRate,
                    currency: currency,
                    estimated_days: '2-3',
                    service_name: 'DHL Express Worldwide'
                },
                {
                    provider_id: provider.id,
                    provider_name: provider.name,
                    provider_slug: provider.slug,
                    provider_type: provider.provider_type,
                    rate: baseRate * 0.7,
                    currency: currency,
                    estimated_days: '4-6',
                    service_name: 'DHL Economy Select'
                }
            );
        }
    }

    return rates;
}
