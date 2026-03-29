# FedEx REST API — Complete Ecommerce Delivery Integration Guide

> **Agent Briefing:** This document is a complete, self-contained guide for implementing FedEx shipping into an ecommerce platform. Follow sections in order: Account Setup → Authentication → Ship API → Tracking → Best Practices → Sandbox Testing.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Account & Project Setup](#2-account--project-setup)
3. [Authentication (OAuth 2.0)](#3-authentication-oauth-20)
4. [Core APIs for Ecommerce](#4-core-apis-for-ecommerce)
5. [Ship API — Creating Shipments](#5-ship-api--creating-shipments)
6. [Tracking API](#6-tracking-api)
7. [Rate API](#7-rate-api)
8. [Address Validation API](#8-address-validation-api)
9. [Webhooks & Advanced Integrated Visibility](#9-webhooks--advanced-integrated-visibility)
10. [Sandbox & Testing](#10-sandbox--testing)
11. [Rate Limits & Quotas](#11-rate-limits--quotas)
12. [Best Practices](#12-best-practices)
13. [Error Handling Reference](#13-error-handling-reference)
14. [Migration Note (SOAP → REST)](#14-migration-note-soap--rest)

---

## 1. Overview & Architecture

### What FedEx REST APIs Do for Ecommerce

FedEx RESTful APIs allow your ecommerce application to:

- **Generate shipping labels** (PDF, PNG, ZPL) at order fulfillment
- **Get real-time rate quotes** to show customers at checkout
- **Validate customer addresses** to avoid failed deliveries
- **Track packages** and surface delivery status in your storefront
- **Process returns** with return label generation
- **Cancel shipments** before pickup
- **Receive push notifications** (webhooks) for shipment status changes

### API Architecture

```
Your Ecommerce App
        │
        ▼
[OAuth 2.0 Token Request]  ──▶  https://apis.fedex.com/oauth/token
        │
        ▼
[API Calls with Bearer Token]
        │
        ├──▶  /ship/v1/shipments          (Create labels)
        ├──▶  /rate/v1/rates/quotes       (Get rate quotes)
        ├──▶  /track/v1/trackingnumbers   (Track packages)
        ├──▶  /address/v1/addresses/resolve (Validate addresses)
        └──▶  /pickup/v1/pickups          (Schedule pickups)
```

### Base URLs

| Environment | Base URL |
|-------------|----------|
| **Sandbox (Testing)** | `https://apis-sandbox.fedex.com` |
| **Production** | `https://apis.fedex.com` |

> **Important:** Always develop and test against the sandbox URL. Never test against production.

### Key Platform Facts

- All APIs use **REST + JSON** (the old SOAP/WSDL Web Services are retired June 1, 2026)
- Authentication uses **OAuth 2.0 Bearer Tokens**
- Tokens expire every **60 minutes** and must be refreshed
- Rate limit: **1,400 transactions per 10-second window** per project
- Batch tracking supports up to **30 tracking numbers** per request

---

## 2. Account & Project Setup

### Step 1: Create a FedEx Developer Portal Account

1. Go to [developer.fedex.com](https://developer.fedex.com)
2. Click **"Create an Organization"**
3. Choose your business type:
   - **"Ships with FedEx"** — if you are integrating for your own ecommerce store
   - **"FedEx Integrator Provider"** — if you build shipping software sold to others (requires validation but no certification requirements for your end customers)

### Step 2: Set Up Your Organization

After creating your organization, you can:
- Invite team members (up to 20 at a time via email)
- Add FedEx shipping accounts (your account number is required for production label generation)
- Add billing accounts for paid products

### Step 3: Create a Project

1. From the dashboard, go to **My Projects → Create Project**
2. Recommended naming: `ProjectName_ApplicationName` (e.g., `MyStore_ShipmentService`)
3. Select the APIs you need:
   - **Ship API** — required for label generation
   - **Rate API** — for checkout rate display
   - **Track API** — for order status tracking
   - **Address Validation API** — recommended for checkout
   - **Pickup Request API** — if scheduling pickups
4. A billing account is only required if you select paid products (e.g., Advanced Integrated Visibility webhooks)

### Step 4: Get API Credentials

After creating a project, you receive:

| Credential | Also Called | Used For |
|------------|-------------|----------|
| **Client ID** | API Key | Identifying your project |
| **Client Secret** | Secret Key | Authenticating your OAuth request |

> **Security:** Never expose the Client Secret in frontend code. Store it in environment variables or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).

**Sandbox vs Production Keys:**
- Your project starts with **Test Keys** (Sandbox)
- After validation, go to the **Production Key** tab to get production credentials
- Both sets live in your project dashboard

### Step 5: Validation Before Going Live

FedEx requires validation before production use. Requirements vary by API:

- **Ship API** requires **Label Validation** — you must submit sample labels (PDF, PNG, ZPL) printed at minimum 600 DPI
- Some APIs require only **Basic Validation**
- Integrator Providers have a simplified validation path (no customer-level certification required)

---

## 3. Authentication (OAuth 2.0)

Every API call requires a valid Bearer token in the `Authorization` header.

### Token Endpoint

```
POST https://apis-sandbox.fedex.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

### Request Body (Standard Customer)

```
grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
```

### Request Body (Integrator/Compatible Provider)

For FedEx Integrator Providers and Compatible Solution Providers, you must also send child credentials:

```
grant_type=csp_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&child_key=CHILD_KEY
&child_secret=CHILD_SECRET
```

> Child Key and Child Secret are obtained through the Account Registration API or from your FedEx representative.

### Token Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "CXS"
}
```

- `expires_in` is **3600 seconds (1 hour)**
- Refresh the token **before** it expires — do not wait for API calls to fail

### Using the Token

Include the token in every subsequent API request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Token Management Code (JavaScript/Node.js)

```javascript
class FedExAuth {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    // Refresh if expired or expiring within 5 minutes
    if (!this.token || Date.now() >= this.tokenExpiry - 300000) {
      await this.refreshToken();
    }
    return this.token;
  }

  async refreshToken() {
    const baseUrl = process.env.FEDEX_SANDBOX === 'true'
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000;
  }
}

// Singleton — reuse across your application
const fedexAuth = new FedExAuth(
  process.env.FEDEX_CLIENT_ID,
  process.env.FEDEX_CLIENT_SECRET
);
```

### Auth Rate Limits (Important)

The OAuth token endpoint has **IP-level throttling**:

| Threshold | Trigger | Penalty |
|-----------|---------|---------|
| Burst | 3 requests/second for 5 consecutive seconds | 403 Forbidden for 10 minutes |
| Average | 1 request/second for 2 consecutive minutes | 403 Forbidden for 10 minutes |

**Mitigation:** Cache your token and reuse it across all requests until near expiry. Never request a new token per API call.

---

## 4. Core APIs for Ecommerce

| API | Endpoint Prefix | Primary Use in Ecommerce |
|-----|----------------|--------------------------|
| Ship API | `/ship/v1/` | Generate labels at order fulfillment |
| Rate API | `/rate/v1/` | Show shipping costs at checkout |
| Track API | `/track/v1/` | Order status page, customer notifications |
| Address Validation | `/address/v1/` | Validate address at checkout |
| Pickup Request | `/pickup/v1/` | Schedule FedEx pickup from your warehouse |
| Service Availability | `/availability/v1/` | Determine available services for a route |

---

## 5. Ship API — Creating Shipments

**Base endpoint:** `POST /ship/v1/shipments`

This is the most critical API for ecommerce. It creates the shipment in FedEx's system and returns a shipping label.

### Supported Services

| Service | Code | Use Case |
|---------|------|----------|
| FedEx Priority Overnight | `PRIORITY_OVERNIGHT` | Next business day by 10:30am |
| FedEx Standard Overnight | `STANDARD_OVERNIGHT` | Next business day by 3pm |
| FedEx 2Day | `FEDEX_2_DAY` | 2 business days |
| FedEx Ground | `FEDEX_GROUND` | 1–5 business days, domestic |
| FedEx Home Delivery | `GROUND_HOME_DELIVERY` | Residential delivery, 7 days/week |
| FedEx Ground Economy | `SMART_POST` | Economy residential, formerly SmartPost |
| FedEx International Priority | `INTERNATIONAL_PRIORITY` | International, 1–3 business days |
| FedEx International Economy | `INTERNATIONAL_ECONOMY` | International, lower cost |

> Use the Service Availability API to determine which services are valid for a given origin-destination pair before calling Ship API.

### Minimal Create Shipment Request

```http
POST https://apis-sandbox.fedex.com/ship/v1/shipments
Authorization: Bearer {access_token}
Content-Type: application/json
x-customer-transaction-id: {your-unique-transaction-id}
```

```json
{
  "labelResponseOptions": "URL_ONLY",
  "requestedShipment": {
    "shipper": {
      "contact": {
        "personName": "Warehouse Manager",
        "phoneNumber": "1234567890",
        "companyName": "My Ecommerce Store"
      },
      "address": {
        "streetLines": ["123 Warehouse Blvd"],
        "city": "Memphis",
        "stateOrProvinceCode": "TN",
        "postalCode": "38118",
        "countryCode": "US"
      }
    },
    "recipients": [
      {
        "contact": {
          "personName": "John Customer",
          "phoneNumber": "9876543210"
        },
        "address": {
          "streetLines": ["456 Customer Ave", "Apt 2B"],
          "city": "Austin",
          "stateOrProvinceCode": "TX",
          "postalCode": "78701",
          "countryCode": "US",
          "residential": true
        }
      }
    ],
    "pickupType": "USE_SCHEDULED_PICKUP",
    "serviceType": "FEDEX_GROUND",
    "packagingType": "YOUR_PACKAGING",
    "shippingChargesPayment": {
      "paymentType": "SENDER",
      "payor": {
        "responsibleParty": {
          "accountNumber": {
            "value": "YOUR_ACCOUNT_NUMBER"
          }
        }
      }
    },
    "labelSpecification": {
      "imageType": "PDF",
      "labelStockType": "PAPER_85X11_TOP_HALF_LABEL"
    },
    "requestedPackageLineItems": [
      {
        "weight": {
          "units": "LB",
          "value": 2.5
        },
        "dimensions": {
          "length": 12,
          "width": 8,
          "height": 4,
          "units": "IN"
        },
        "customerReferences": [
          {
            "customerReferenceType": "CUSTOMER_REFERENCE",
            "value": "ORDER-12345"
          }
        ]
      }
    ]
  },
  "accountNumber": {
    "value": "YOUR_ACCOUNT_NUMBER"
  }
}
```

### Key Request Fields Explained

| Field | Required | Notes |
|-------|----------|-------|
| `pickupType` | Yes | `USE_SCHEDULED_PICKUP` (regular pickup), `DROPOFF_AT_FEDEX_LOCATION`, `CONTACT_FEDEX_TO_SCHEDULE` |
| `serviceType` | Yes | See service codes above |
| `packagingType` | Yes | `YOUR_PACKAGING` (your own box), `FEDEX_BOX`, `FEDEX_ENVELOPE`, etc. |
| `shippingChargesPayment.paymentType` | Yes | `SENDER`, `RECIPIENT`, `THIRD_PARTY` |
| `labelSpecification.imageType` | Yes | `PDF`, `PNG`, `ZPLII` (thermal printers) |
| `labelResponseOptions` | Yes | `URL_ONLY` (recommended) or `LABEL` (base64 encoded) |
| `customerReferences` | No | Your internal order ID — appears on the label |

### Label Format Options

| Format | Code | Best For |
|--------|------|----------|
| PDF | `PDF` | Desktop/office printers |
| PNG | `PNG` | Image-based label workflows |
| ZPL II | `ZPLII` | Zebra thermal printers (warehouse) |
| EPL2 | `EPL2` | Eltron thermal printers |

> **Label stock for thermal:** Request the image type that matches your printer. For Zebra printers, use `ZPLII`. Print at minimum 600 DPI.

### Successful Response

```json
{
  "transactionId": "abc123",
  "output": {
    "transactionShipments": [
      {
        "masterTrackingNumber": "794699999999",
        "serviceType": "FEDEX_GROUND",
        "shipDatestamp": "2026-03-20",
        "serviceName": "FedEx Ground®",
        "pieceResponses": [
          {
            "trackingNumber": "794699999999",
            "packageDocuments": [
              {
                "url": "https://apis.fedex.com/document/v2/document/retrieve/...",
                "contentType": "LABEL",
                "docType": "PDF",
                "copiesToPrint": 1
              }
            ],
            "netChargeAmount": 17.40,
            "currency": "USD"
          }
        ]
      }
    ]
  }
}
```

Extract the label URL from `output.transactionShipments[0].pieceResponses[0].packageDocuments[0].url`.

Store the `masterTrackingNumber` — you'll need it for tracking and cancellation.

### Validate Shipment (Before Creating)

Use this endpoint to validate data **before** generating a real label. Useful for catching errors during checkout:

```http
POST https://apis-sandbox.fedex.com/ship/v1/shipments/packages/validate
```

The request body is identical to the Create Shipment request. Response returns errors, warnings, and notes — no label is generated.

### Cancel a Shipment

```http
PUT https://apis-sandbox.fedex.com/ship/v1/shipments/cancel
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "accountNumber": { "value": "YOUR_ACCOUNT_NUMBER" },
  "trackingNumber": "794699999999"
}
```

> Can only cancel shipments that have not been picked up by FedEx. Once in transit, contact FedEx customer service.

### Return Labels

FedEx supports multiple return label types:

| Type | Description |
|------|-------------|
| **Print Return Label** | Generate label and include in outbound box |
| **Email Return Label** | Email label directly to customer |
| **FedEx Tag** | FedEx driver picks up return at customer location |

For an email return label, add to the ship request:

```json
"specialServicesRequested": {
  "specialServiceTypes": ["RETURN_SHIPMENT"],
  "returnShipmentDetail": {
    "returnType": "PRINT_RETURN_LABEL"
  }
}
```

### Asynchronous Shipment Processing

For high-volume operations, shipments can be processed asynchronously:

1. Submit the shipment request — receives a `jobId` immediately
2. Poll `GET /ship/v1/shipments/packages/results?jobId={jobId}` to retrieve labels

---

## 6. Tracking API

**Base endpoint:** `POST /track/v1/trackingnumbers`

### Track by Tracking Number (Single)

```http
POST https://apis-sandbox.fedex.com/track/v1/trackingnumbers
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "includeDetailedScans": true,
  "trackingInfo": [
    {
      "trackingNumberInfo": {
        "trackingNumber": "794699999999"
      }
    }
  ]
}
```

### Track Multiple Packages (Batch — up to 30)

```json
{
  "includeDetailedScans": false,
  "trackingInfo": [
    { "trackingNumberInfo": { "trackingNumber": "794699999999" } },
    { "trackingNumberInfo": { "trackingNumber": "794699999998" } },
    { "trackingNumberInfo": { "trackingNumber": "794699999997" } }
  ]
}
```

> **Ecommerce tip:** Limit to 30 per request. Do not poll tracking more than necessary — use webhooks for real-time updates instead.

### Tracking Response Key Fields

```json
{
  "output": {
    "completeTrackResults": [
      {
        "trackingNumber": "794699999999",
        "trackResults": [
          {
            "trackingNumberInfo": { "trackingNumber": "794699999999" },
            "shipperInformation": { "address": { "city": "Memphis", "stateOrProvinceCode": "TN" } },
            "recipientInformation": { "address": { "city": "Austin", "stateOrProvinceCode": "TX" } },
            "latestStatusDetail": {
              "code": "OD",
              "derivedCode": "OD",
              "statusByLocale": "On FedEx vehicle for delivery",
              "description": "On FedEx vehicle for delivery"
            },
            "dateAndTimes": [
              { "type": "ACTUAL_DELIVERY", "dateTime": "2026-03-21T14:32:00-06:00" },
              { "type": "ESTIMATED_DELIVERY", "dateTime": "2026-03-21T20:00:00-06:00" }
            ],
            "scanEvents": [
              {
                "date": "2026-03-21T09:00:00-06:00",
                "eventType": "OD",
                "eventDescription": "On FedEx vehicle for delivery",
                "scanLocation": { "city": "Austin", "stateOrProvinceCode": "TX", "countryCode": "US" }
              }
            ],
            "deliveryDetails": {
              "deliveryAttempts": "0",
              "deliveryOptionEligibilityDetails": []
            }
          }
        ]
      }
    ]
  }
}
```

### Common Tracking Status Codes

| Code | Meaning |
|------|---------|
| `PU` | Picked up |
| `OC` | In transit |
| `IT` | In transit |
| `OD` | Out for delivery |
| `DL` | Delivered |
| `DE` | Delivery exception |
| `RS` | Return to shipper |

---

## 7. Rate API

**Base endpoint:** `POST /rate/v1/rates/quotes`

Use at checkout to display shipping options and costs.

### Rate Quote Request

```http
POST https://apis-sandbox.fedex.com/rate/v1/rates/quotes
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "accountNumber": { "value": "YOUR_ACCOUNT_NUMBER" },
  "requestedShipment": {
    "shipper": {
      "address": {
        "postalCode": "38118",
        "countryCode": "US"
      }
    },
    "recipient": {
      "address": {
        "postalCode": "78701",
        "countryCode": "US",
        "residential": true
      }
    },
    "pickupType": "USE_SCHEDULED_PICKUP",
    "packagingType": "YOUR_PACKAGING",
    "requestedPackageLineItems": [
      {
        "weight": { "units": "LB", "value": 2.5 },
        "dimensions": { "length": 12, "width": 8, "height": 4, "units": "IN" }
      }
    ],
    "rateRequestType": ["ACCOUNT", "LIST"]
  }
}
```

`rateRequestType`:
- `ACCOUNT` — your negotiated rates
- `LIST` — FedEx standard list rates
- Request both to show discounted pricing

### Rate Response (Key Fields)

```json
{
  "output": {
    "rateReplyDetails": [
      {
        "serviceType": "FEDEX_GROUND",
        "serviceName": "FedEx Ground®",
        "packagingType": "YOUR_PACKAGING",
        "ratedShipmentDetails": [
          {
            "rateType": "ACCOUNT",
            "totalNetCharge": 12.45,
            "totalBaseCharge": 11.00,
            "shipmentRateDetail": {
              "currency": "USD",
              "totalSurcharges": 1.45
            }
          }
        ],
        "operationalDetail": {
          "transitDays": "3",
          "deliveryDay": "WEDNESDAY",
          "deliveryDate": "2026-03-25"
        }
      }
    ]
  }
}
```

> **Best practice:** Do not hard-code service type enumerations. Handle new or unexpected service types dynamically, as FedEx may add new services.

---

## 8. Address Validation API

**Base endpoint:** `POST /address/v1/addresses/resolve`

### Request

```http
POST https://apis-sandbox.fedex.com/address/v1/addresses/resolve
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "addressesToValidate": [
    {
      "address": {
        "streetLines": ["456 Customer Ave", "Apt 2B"],
        "city": "Austin",
        "stateOrProvinceCode": "TX",
        "postalCode": "78701",
        "countryCode": "US"
      }
    }
  ]
}
```

### Response

```json
{
  "output": {
    "resolvedAddresses": [
      {
        "streetLinesToken": ["456 CUSTOMER AVE", "APT 2B"],
        "city": "AUSTIN",
        "stateOrProvinceCode": "TX",
        "postalCode": "78701-2345",
        "countryCode": "US",
        "classification": "RESIDENTIAL",
        "attributes": {
          "Resolved": "true",
          "DPV": "true"
        }
      }
    ]
  }
}
```

### Important Usage Rules

- FedEx Address Validation is a **suggestion, not a final determination**. Always let the customer confirm or override the result.
- **Do not make shipping dependent on address validation.** If the API is unavailable, allow the shipment to proceed anyway.
- Classification values: `RESIDENTIAL`, `BUSINESS`, `MIXED`, `UNKNOWN`
- Always handle unvalidatable addresses gracefully — orders must still be processable.

---

## 9. Webhooks & Advanced Integrated Visibility

For real-time push notifications on shipment status (instead of polling the Track API).

### How It Works

1. FedEx sends HTTP POST requests to your registered endpoint when tracking events occur
2. Events include: label created, picked up, in transit, out for delivery, delivered, exception
3. Payload format matches the Track API response
4. Authentication: FedEx sends an HMAC-based base64 encoded `fdx-signature` header — validate it against your security token

### Setup

1. Go to your project in the FedEx Developer Portal
2. Create a **Webhooks project** (separate from your API project)
3. Register your callback URL (must be HTTPS)
4. Subscribe to event types you need

### Webhook Payload Validation

```javascript
const crypto = require('crypto');

function validateFedExWebhook(payload, signature, secretToken) {
  const expectedSignature = crypto
    .createHmac('sha256', secretToken)
    .update(payload)
    .digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler:
app.post('/webhooks/fedex', (req, res) => {
  const signature = req.headers['fdx-signature'];
  const rawBody = req.rawBody; // Use raw body, not parsed JSON

  if (!validateFedExWebhook(rawBody, signature, process.env.FEDEX_WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }

  const event = JSON.parse(rawBody);
  // Process tracking event...
  res.status(200).send('OK');
});
```

### Availability Notes

- Advanced Integrated Visibility webhooks are currently available for **US-based billing and shipping accounts** only
- Pricing is based on the number of tracking numbers processed per month
- Basic Integrated Visibility (pull-based tracking) is free and available globally

---

## 10. Sandbox & Testing

### Sandbox Virtualization

FedEx offers **Sandbox Virtualization** — a simulated sandbox that returns predefined responses without hitting live backend systems.

**Why Use It:**
- Faster response times than live sandbox
- No explicit account-level access required for testing special services
- Protected from backend outages and downtime
- Consistent, predictable responses for integration testing

**How It Works:**
The virtualized sandbox returns the **same predefined response** regardless of most input variations. The response structure mirrors real production responses. Do not expect the response values to reflect your specific input.

**How to Access:**
1. Download the **JSON API Collection** from the API documentation page (Download JSON schema button)
2. Use those exact request payloads — they are tuned to trigger virtualized responses
3. Authenticate normally (same OAuth flow applies)
4. Look for the `X-Fedex-Source: VIRTUALIZED` response header to confirm virtualized service

### Testing Checklist

```
□ OAuth token is correctly requested and stored
□ Token refresh logic works before expiry
□ Create Shipment returns a label URL
□ Label can be downloaded and renders at 600 DPI
□ Multiple label formats tested: PDF, PNG, ZPL
□ Shipment cancellation works
□ Tracking by tracking number returns events
□ Batch tracking (multiple numbers) works
□ Rate quote returns service options with pricing
□ Address validation handles valid, invalid, and residential addresses
□ Error responses are parsed and logged correctly
□ 429 Too Many Requests is handled with retry logic
□ Token expiry is handled gracefully mid-session
```

### Sandbox Account Numbers

Use these test account numbers provided in the JSON API Collection for sandbox transactions. Complete registration transactions using test account numbers before running full test cases.

### Moving to Production

1. Go to your project → **Production Key** tab
2. Supply your real FedEx Account Number
3. Complete required validation (label validation for Ship API)
4. Update your environment variable:
   - `FEDEX_BASE_URL=https://apis.fedex.com`
   - Replace sandbox Client ID/Secret with production credentials

---

## 11. Rate Limits & Quotas

### Transaction Rate Limit (Per Project)

| Limit | Value | Behavior When Exceeded |
|-------|-------|------------------------|
| Rate limit | 1,400 transactions / 10 seconds | HTTP 429 until 10-second window resets |
| Daily quota | 500,000 requests/day (org-level) | HTTP 429 for remainder of day |
| Track capability | 100,000 requests/day (per project) | HTTP 429 for track endpoints only |

> Quota is at the **organization level** — all projects under one org share the daily quota.

### OAuth Token Endpoint Thresholds (IP Level)

| Type | Trigger | Penalty Duration |
|------|---------|-----------------|
| Burst | 3 req/sec for 5 continuous seconds | 10 minutes (403 Forbidden) |
| Average | 1 req/sec for 2 continuous minutes | 10 minutes (403 Forbidden) |

Violating during penalty period **extends the penalty**.

### Handling 429 Errors

```javascript
async function fedexApiCall(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
      console.warn(`Rate limited. Waiting ${retryAfter}s before retry ${attempt + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new FedExApiError(response.status, error);
    }

    return response.json();
  }
  throw new Error('Max retries exceeded after rate limiting');
}
```

---

## 12. Best Practices

### Security

- Store `Client ID` and `Client Secret` in environment variables, never in code
- Use `x-customer-transaction-id` header with a unique UUID per request — helps correlate requests in logs and support tickets
- In concurrent/multi-threaded applications, ensure the cached OAuth token is **thread-safe** (use mutex/locks around token refresh)
- Keep API keys private — do not log them or expose in client-side code

### Reliability

- **Never hard-code service types, package types, or weight limits** — they are subject to change. Implement dynamic logic to handle new enumeration values
- **Do not hard-depend on optional services** (e.g., address validation, rating). If those APIs are unavailable, your shipping flow must still work
- Implement **exponential backoff with jitter** for retries
- Log all API requests and responses for debugging — use the `x-customer-transaction-id` to correlate
- Do not run performance/load testing against FedEx sandbox or production environments

### Shipping

- Use the **Validate Shipment endpoint** before creating labels for customer-facing orders
- Use the **Service Availability API** to determine valid services for origin-destination pairs
- For US domestic shipments, do not include international-only fields (commercial invoice, commodity data)
- Validate required fields locally before sending: recipient postal code, package weight, account number
- Use only ASCII characters in shipment data — non-ASCII characters cause label errors
- Perform **FedEx Ground end-of-day close** before pickup each day

### Tracking

- Limit tracking requests to business necessity — don't poll continuously
- Use webhooks (Advanced Integrated Visibility) for real-time updates instead of polling
- Batch up to 30 tracking numbers per request when bulk-tracking is needed
- Evaluate tracking responses for missing elements before using data

### Address Validation

- Always have a fallback path if address validation is unavailable
- Present corrected addresses as suggestions, not forced replacements — let customers confirm
- Handle the four address classifications: `RESIDENTIAL`, `BUSINESS`, `MIXED`, `UNKNOWN`

### Rate API

- Omit `carrierCodes` to get results from all FedEx operating companies (Express, Ground, Freight, Ground Economy)
- If you must specify carrier codes, send separate requests per carrier — multiple carrier codes in one request are not supported
- Cache rate quotes when possible to reduce API calls during browsing

---

## 13. Error Handling Reference

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| `200 OK` | Success | Process response |
| `400 Bad Request` | Invalid input | Log error, fix request data |
| `401 Unauthorized` | Invalid/expired token | Refresh OAuth token and retry |
| `403 Forbidden` | Auth threshold exceeded | Wait 10 minutes, check token logic |
| `404 Not Found` | Resource not found | Verify tracking number, endpoint |
| `429 Too Many Requests` | Rate/quota exceeded | Back off and retry with delay |
| `500 Internal Server Error` | FedEx server error | Do NOT immediately resubmit; check if label was created first |

### Error Response Structure

```json
{
  "errors": [
    {
      "code": "SHIP.SHIPPER.ACCOUNT.REQUIRED",
      "message": "Account number is required.",
      "parameterList": [
        { "key": "accountNumber", "value": "" }
      ]
    }
  ]
}
```

> Warnings and notes in responses are **not failures** — but log and review them. They may indicate data that was corrected or services that were unavailable.

### FedEx API Error Codes (Common)

| Code | Cause |
|------|-------|
| `SHIP.SHIPPER.ACCOUNT.REQUIRED` | Missing account number |
| `SHIP.RECIPIENT.POSTALCODE.REQUIRED` | Missing postal code |
| `SHIP.PACKAGE.WEIGHT.REQUIRED` | Missing package weight |
| `SYSTEM.UNEXPECTED.ERROR` | Retry; if persistent, contact FedEx support |
| `TOKEN.VALIDATION.EXCEPTION` | OAuth token invalid or expired |

### Error Handling Code Pattern

```javascript
class FedExApiError extends Error {
  constructor(status, errorBody) {
    super(`FedEx API Error ${status}`);
    this.status = status;
    this.errors = errorBody.errors || [];
  }

  isRateLimited() { return this.status === 429; }
  isAuthError() { return this.status === 401; }
  isClientError() { return this.status >= 400 && this.status < 500; }
}

async function createShipment(shipmentData) {
  try {
    const token = await fedexAuth.getToken();
    const result = await fedexApiCall(
      `${FEDEX_BASE_URL}/ship/v1/shipments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-customer-transaction-id': crypto.randomUUID(),
        },
        body: JSON.stringify(shipmentData),
      }
    );

    // Log warnings even on success
    if (result.output?.alerts) {
      result.output.alerts.forEach(alert => {
        console.warn('FedEx Alert:', alert.code, alert.message);
      });
    }

    return result;
  } catch (err) {
    if (err instanceof FedExApiError) {
      err.errors.forEach(e => console.error('FedEx Error:', e.code, e.message));
    }
    throw err;
  }
}
```

---

## 14. Migration Note (SOAP → REST)

> **Critical Deadline:** FedEx Web Services (SOAP/WSDL) are being retired:
> - **Integrator/Compatible Providers:** March 31, 2026
> - **All other customers:** June 1, 2026

If you are migrating from the old SOAP-based Web Services:

| Old (SOAP) | New (REST) |
|-----------|------------|
| WSDL/XML | JSON |
| SOAP headers for auth | OAuth 2.0 Bearer Token |
| `ShipService.wsdl` | `POST /ship/v1/shipments` |
| `TrackService.wsdl` | `POST /track/v1/trackingnumbers` |
| `RateService.wsdl` | `POST /rate/v1/rates/quotes` |
| Polling for status | Webhooks (push) available |

Key differences to be aware of:
- Some options available in SOAP are not yet in REST — review the specific capabilities before assuming parity
- The REST API is actively developed; new features are only added to REST, not SOAP
- REST APIs have built-in versioning (v1, v2, etc.) — include the version in your endpoint paths

---

## Quick Reference: Environment Variables

```bash
# .env file (never commit to version control)
FEDEX_CLIENT_ID=your_client_id_here
FEDEX_CLIENT_SECRET=your_client_secret_here
FEDEX_ACCOUNT_NUMBER=your_fedex_account_number
FEDEX_SANDBOX=true   # Set to false for production
FEDEX_BASE_URL=https://apis-sandbox.fedex.com  # Change for production
```

## Quick Reference: Endpoint Summary

```
# Auth
POST   /oauth/token                              → Get Bearer token

# Ship
POST   /ship/v1/shipments                        → Create shipment + label
POST   /ship/v1/shipments/packages/validate      → Validate before creating
GET    /ship/v1/shipments/packages/results       → Get async results by jobId
PUT    /ship/v1/shipments/cancel                 → Cancel shipment

# Track
POST   /track/v1/trackingnumbers                 → Track by tracking number
POST   /track/v1/associated-shipments            → Track associated shipments

# Rate
POST   /rate/v1/rates/quotes                     → Get rate quotes
POST   /rate/v1/rates/quotes (shopping)          → Compare all services

# Address
POST   /address/v1/addresses/resolve             → Validate address

# Service Availability
POST   /availability/v1/transittimes             → Get transit times
POST   /availability/v1/packageandserviceoptions → Get available services

# Pickup
POST   /pickup/v1/pickups                        → Schedule pickup
PUT    /pickup/v1/pickups/cancel                 → Cancel pickup
GET    /pickup/v1/pickup-availability            → Check pickup availability
```

---

*Document compiled from FedEx Developer Portal official sources: developer.fedex.com — March 2026*
*FedEx, FedEx Ground, FedEx Express, and FedEx Home Delivery are registered trademarks of Federal Express Corporation.*