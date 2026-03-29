const fetch = require('node-fetch');

async function test() {
    const tokenRes = await fetch('https://apis-sandbox.fedex.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: 'l7b301d56ba07f42c6aeeab3a3e9d75453',
            client_secret: '905af770bcd54c5f9af05d7c483e4dca'
        })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    
    // Check if token valid
    if(!token) {
        console.error("Token failed");
        return;
    }

    const payload = {
        labelResponseOptions: "URL_ONLY",
        requestedShipment: {
            shipper: {
                contact: { personName: "Shipper Name", phoneNumber: "1234567890", companyName: "My Store" },
                address: { streetLines: ["1202 Chalet Ln"], city: "Harrison", stateOrProvinceCode: "AR", postalCode: "72601", countryCode: "US" }
            },
            recipients: [{
                contact: { personName: "Alok Verma", phoneNumber: "9803135134" },
                address: { streetLines: ["Kholagal Marg"], city: "Lalitpur", stateOrProvinceCode: "BA", postalCode: "00000", countryCode: "NP", residential: true }
            }],
            pickupType: "USE_SCHEDULED_PICKUP",
            serviceType: "INTERNATIONAL_ECONOMY",
            packagingType: "YOUR_PACKAGING",
            shippingChargesPayment: {
                paymentType: "SENDER",
                payor: { responsibleParty: { accountNumber: { value: "510087020" } } }
            },
            customsClearanceDetail: {
                dutiesPayment: {
                    paymentType: "SENDER",
                    payor: { responsibleParty: { accountNumber: { value: "510087020" } } }
                },
                customsValue: { amount: 100.0, currency: "USD" },
                commodities: [{
                    description: "Ecommerce Goods",
                    countryOfManufacture: "US",
                    quantity: 1,
                    quantityUnits: "EA",
                    unitPrice: { amount: 100.0, currency: "USD" },
                    customsValue: { amount: 100.0, currency: "USD" },
                    weight: { units: "LB", value: 0.2 }
                }]
            },
            labelSpecification: { imageType: "PDF", labelStockType: "PAPER_85X11_TOP_HALF_LABEL" },
            requestedPackageLineItems: [{
                weight: { units: "LB", value: 0.2 },
                dimensions: { length: 8, width: 6, height: 4, units: "IN" }
            }]
        },
        accountNumber: { value: "510087020" }
    };

    const shipRes = await fetch('https://apis-sandbox.fedex.com/ship/v1/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    
    console.log(JSON.stringify(await shipRes.json(), null, 2));
}
test();
