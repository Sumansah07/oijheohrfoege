// 🚚 DHL API Integration Example
// This file shows how to integrate real DHL APIs
// Replace mock functions in /api/shipping/* with these implementations

/**
 * DHL Express API Documentation:
 * https://developer.dhl.com/api-reference/dhl-express-mydhl-api
 * 
 * Required Environment Variables:
 * - DHL_API_KEY
 * - DHL_API_SECRET
 * - DHL_ACCOUNT_NUMBER
 */

interface DHLRateRequest {
    accountNumber: string;
    originAddress: {
        cityName: string;
        countryCode: string;
        postalCode: string;
    };
    destinationAddress: {
        cityName: string;
        countryCode: string;
        postalCode: string;
    };
    packages: Array<{
        weight: number;
        dimensions: {
            length: number;
            width: number;
            height: number;
        };
    }>;
}

interface DHLShipmentRequest {
    accountNumber: string;
    shipmentDetails: {
        shipper: {
            name: string;
            address: any;
            contact: any;
        };
        recipient: {
            name: string;
            address: any;
            contact: any;
        };
        packages: any[];
    };
    labelFormat: 'PDF' | 'ZPL';
}

/**
 * Get real-time shipping rates from DHL
 */
export async function getDHLRates(request: DHLRateRequest) {
    const auth = Buffer.from(
        `${process.env.DHL_API_KEY}:${process.env.DHL_API_SECRET}`
    ).toString('base64');

    const response = await fetch('https://express.api.dhl.com/mydhlapi/rates', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customerDetails: {
                shipperDetails: {
                    postalCode: request.originAddress.postalCode,
                    cityName: request.originAddress.cityName,
                    countryCode: request.originAddress.countryCode
                },
                receiverDetails: {
                    postalCode: request.destinationAddress.postalCode,
                    cityName: request.destinationAddress.cityName,
                    countryCode: request.destinationAddress.countryCode
                }
            },
            accounts: [{ number: request.accountNumber, typeCode: 'shipper' }],
            productCode: '', // Leave empty to get all available services
            packages: request.packages.map(pkg => ({
                weight: pkg.weight,
                dimensions: pkg.dimensions
            }))
        })
    });

    if (!response.ok) {
        throw new Error(`DHL API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform DHL response to our format
    return data.products?.map((product: any) => ({
        service_code: product.productCode,
        service_name: product.productName,
        rate: parseFloat(product.totalPrice[0].price),
        currency: product.totalPrice[0].priceCurrency,
        estimated_days: product.deliveryCapabilities?.deliveryTypeCode || '2-3',
        provider: 'dhl'
    })) || [];
}

/**
 * Create a shipping label with DHL
 */
export async function createDHLLabel(request: DHLShipmentRequest) {
    const auth = Buffer.from(
        `${process.env.DHL_API_KEY}:${process.env.DHL_API_SECRET}`
    ).toString('base64');

    const response = await fetch('https://express.api.dhl.com/mydhlapi/shipments', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            plannedShippingDateAndTime: new Date().toISOString(),
            pickup: {
                isRequested: false
            },
            productCode: 'P', // DHL Express Worldwide
            accounts: [{ number: request.accountNumber, typeCode: 'shipper' }],
            customerDetails: {
                shipperDetails: request.shipmentDetails.shipper,
                receiverDetails: request.shipmentDetails.recipient
            },
            content: {
                packages: request.shipmentDetails.packages,
                isCustomsDeclarable: false,
                description: 'Ecommerce Order'
            },
            outputImageProperties: {
                imageOptions: [{
                    typeCode: request.labelFormat === 'PDF' ? 'label' : 'waybillDoc',
                    templateName: 'ECOM26_84_001'
                }]
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`DHL Label Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    return {
        tracking_number: data.shipmentTrackingNumber,
        label_url: data.documents?.[0]?.content, // Base64 encoded PDF
        label_format: request.labelFormat,
        shipment_id: data.shipmentTrackingNumber
    };
}

/**
 * Track a DHL shipment
 */
export async function trackDHLShipment(trackingNumber: string) {
    const auth = Buffer.from(
        `${process.env.DHL_API_KEY}:${process.env.DHL_API_SECRET}`
    ).toString('base64');

    const response = await fetch(
        `https://express.api.dhl.com/mydhlapi/shipments/${trackingNumber}/tracking`,
        {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`DHL Tracking Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
        tracking_number: trackingNumber,
        status: data.shipments?.[0]?.status?.statusCode,
        events: data.shipments?.[0]?.events || [],
        estimated_delivery: data.shipments?.[0]?.estimatedDeliveryDate
    };
}

/**
 * Example: How to use in your API routes
 */
export async function exampleUsage() {
    // 1. Get Rates
    const rates = await getDHLRates({
        accountNumber: process.env.DHL_ACCOUNT_NUMBER!,
        originAddress: {
            cityName: 'New York',
            countryCode: 'US',
            postalCode: '10001'
        },
        destinationAddress: {
            cityName: 'Los Angeles',
            countryCode: 'US',
            postalCode: '90001'
        },
        packages: [{
            weight: 2.5,
            dimensions: { length: 30, width: 20, height: 15 }
        }]
    });

    // 2. Create Label
    const label = await createDHLLabel({
        accountNumber: process.env.DHL_ACCOUNT_NUMBER!,
        shipmentDetails: {
            shipper: {
                name: 'Your Store',
                address: { /* ... */ },
                contact: { /* ... */ }
            },
            recipient: {
                name: 'Customer Name',
                address: { /* ... */ },
                contact: { /* ... */ }
            },
            packages: [{ /* ... */ }]
        },
        labelFormat: 'PDF'
    });

    // 3. Track Shipment
    const tracking = await trackDHLShipment(label.tracking_number);

    return { rates, label, tracking };
}

/**
 * Integration Steps:
 * 
 * 1. Replace getMockCarrierRates() in /api/shipping/calculate-rates/route.ts
 *    with getDHLRates() from this file
 * 
 * 2. Replace mock tracking generation in /api/shipping/create-label/route.ts
 *    with createDHLLabel() from this file
 * 
 * 3. Add tracking endpoint that calls trackDHLShipment()
 * 
 * 4. Add environment variables to .env.local
 * 
 * 5. Test with DHL sandbox environment first (test_mode: true)
 */
