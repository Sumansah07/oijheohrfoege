[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-light.009264f2.svg)](https://razorpay.com/docs/)

![IN](https://flagcdn.com/in.svg)

[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-dark.6f09b030.svg)](https://razorpay.com/docs/)

/

![Docs AI persona](https://razorpay.com/docs/build/browser/static/ray-logo.a298be61.svg)

R.A.Y.

Beta

Beta

Instant answers at your fingertips. Try our all new **Razorpay Assist for You**

Yes

Not Now

[Pricing](https://razorpay.com/pricing/)

[API Reference](https://razorpay.com/docs/api)

[Support](https://razorpay.com/support/)

![IN](https://flagcdn.com/in.svg)

[Log In](https://dashboard.razorpay.com/?next=%2Fpayments%2Fpayment-gateway%2Fweb-integration%2Fstandard%2Fintegration-steps%2F#/access/signin)

[Sign Up](https://dashboard.razorpay.com/signup)

[Home](https://razorpay.com/docs/)

[Payments](https://razorpay.com/docs/payments/)

[Engage](https://razorpay.com/docs/engage/)

[POS](https://razorpay.com/docs/pos/)

[Banking Plus](https://razorpay.com/docs/x/)

[Payroll](https://razorpay.com/docs/payroll/)

[Partners](https://razorpay.com/docs/partners/)

[API Reference](https://razorpay.com/docs/api/)

[Developer Tools](https://razorpay.com/docs/developer-tools/)

[Razorpay Payments Suite](https://razorpay.com/docs/payments/)

[Quickstart Guide](https://razorpay.com/docs/payments/quickstart/)

Solutions by Industry

Sign Up

Dashboard

Customers

Orders

Payments

International Payments

Payment Methods

Settlements

Refunds

Disputes

Payment Gateway

[About Payment Gateway](https://razorpay.com/docs/payments/payment-gateway/)

[How Payment Gateway Works](https://razorpay.com/docs/payments/payment-gateway/how-it-works/)

Features

Web Integration

[Prerequisites](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

[Integration Steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)

Configure Payment Methods

[Best Practices](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/best-practices/)

[Troubleshooting & FAQs](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/troubleshooting-faqs/)

Android Integration

iOS Integration

React Native

Cordova & Ionic

Flutter Plugin

Capacitor Integration

Quick Integration

Server Integration

Ecommerce Plugins

Widgets

Magic Checkout

Razorpay - Payments on WhatsApp

Payment Links

Payment Button

Payment Pages

Webstore

Invoices

QR Codes

Offers

EMI²

Subscriptions

Smart Collect

Optimizer

Route

Third-Party Validation

Payments Mobile App

[Payments Changelog](https://razorpay.com/docs/payments/changelog/)

[Glossary](https://razorpay.com/docs/payments/glossary/)

[Payments](https://razorpay.com/docs/payments)

[Payment Gateway](https://razorpay.com/docs/payments/payment-gateway)

Web Integration

[Standard](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard)

Integration Steps

# Integration Steps

Steps to integrate the Standard Checkout form on your website.

Available in

![IN](https://flagcdn.com/in.svg)

India

![MY](https://flagcdn.com/my.svg)

Malaysia

![SG](https://flagcdn.com/sg.svg)

Singapore

![US](https://flagcdn.com/us.svg)

United States

* * *

Follow these steps to integrate the Standard Checkout form on your website:

#### [1\. Build Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#1.%20Build%20Integration)

Integrate Web Standard Checkout.

#### [2\. Test Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#2.%20Test%20Integration)

Test the integration by making a test payment.

#### [3\. Go-live Checklist](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#3.%20Go-live%20Checklist)

Check the go-live checklist.

Razorpay Payment Gateway Integration in HTML & JS Websites - YouTube

[Photo image of Razorpay](https://www.youtube.com/channel/UCddN5MDa_yirLO8fKVMVnhw?embeds_referring_euri=https%3A%2F%2Frazorpay.com%2F)

Razorpay

33.7K subscribers

[Razorpay Payment Gateway Integration in HTML & JS Websites](https://www.youtube.com/watch?v=SFHbcs-lSio)

Razorpay

Search

Watch later

Share

Copy link

Info

Shopping

Tap to unmute

If playback doesn't begin shortly, try restarting your device.

Full screen is unavailable. [Learn More](https://support.google.com/youtube/answer/6276924)

You're signed out

Videos you watch may be added to the TV's watch history and influence TV recommendations. To avoid this, cancel and sign in to YouTube on your computer.

CancelConfirm

More videos

## More videos

Share

Include playlist

An error occurred while retrieving sharing information. Please try again later.

[Watch on](https://www.youtube.com/watch?v=SFHbcs-lSio&embeds_referring_euri=https%3A%2F%2Frazorpay.com%2F)

0:00

0:00 / 8:24

•Live

•

## [1\. Build Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#1-build-integration)

Follow the steps given below:

### 1.1 Create an Order in Server

Given below are the order states and the corresponding payment states:

| Payment Stages | Order State | Payment State | Description |
| --- | --- | --- | --- |
| Stage I | created | created | The customer submits the payment information, which is sent to Razorpay . The payment is **not processed** at this stage. |
| Stage II | attempted | authorized/failed | An order moves from **created** to **attempted** state when payment is first attempted. It remains in this state until a payment associated with the order is captured. |
| Stage III | paid | captured | After the payment moves to the **captured** state, the order moves to the **paid** state. <br>- No more payment requests are allowed after an order moves to the **paid** state. <br>- The order continues to be in this state even if the payment for this order is **refunded**. |

**Capture Payments Automatically**

You can capture payments automatically with the one-time

[Payment Capture setting configuration](https://razorpay.com/docs/payments/payments/capture-settings/)

on the Dashboard.

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the
[Orders API](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#api-sample-code)
. It is a server-side API call. Know how to
[authenticate](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/#generate-api-keys)
Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

You can create an order using:

API Sample Code

Razorpay Postman Public Workspace

Use this endpoint to create an order using the Orders API.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders

-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]

-H 'content-type:application/json'

-d '{

    "amount": 50000,

    "currency": "INR",

    "receipt": "qwsaq1",

    "partial_payment": true,

    "first_payment_min_amount": 230

}'
```

Success ResponseFailure Response

copy

```json
{

    "id": "order_IluGWxBm9U8zJ8",

    "entity": "order",

    "amount": 50000,

    "amount_paid": 0,

    "amount_due": 50000,

    "currency": "INR",

    "receipt": "rcptid_11",

    "offer_id": null,

    "status": "created",

    "attempts": 0,

    "notes": [],

    "created_at": 1642662092

}
```

#### Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹222.25, the value of this field should be `22225`.

currency

mandatory

`string` The currency in which the transaction should be made. See the

[list of supported currencies](https://razorpay.com/docs/payments/international-payments/#supported-currencies)

. Length must be of 3 characters.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

#### Response Parameters

Descriptions for the response parameters are present in the

[Orders Entity](https://razorpay.com/docs/api/orders/entity/)

parameters table.

#### Error Response Parameters

The error response parameters are available in the

[API Reference Guide](https://razorpay.com/docs/api/orders/create/)

.

### 1.2 Integrate with Checkout on Client-Side

Add the Pay button on your web page using the checkout code. You can use the handler function or callback URL.

#### 1.2.1 Handler Function or Callback URL

| **Handler Function** | **Callback URL** |
| --- | --- |
| When you use this: <br>- On successful payment, the customer is shown your web page. <br>- On failure, the customer is notified of the failure and asked to retry the payment. | When you use this: <br>- On successful payment, the customer is redirected to the specified URL, for example, a payment success page. <br>- On failure, the customer is asked to retry the payment. |

#### 1.2.2 Code to Add Pay Button

Copy-paste the parameters as `options` in your code:

Callback URL (JS) Checkout CodeHandler Functions (JS) Checkout Code

copy

```html
<button id="rzp-button1">Pay</button>

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>

var options = {

    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard

    "amount": "50000", // Amount is in currency subunits.

    "currency": "INR",

    "name": "Acme Corp", //your business name

    "description": "Test Transaction",

    "image": "https://example.com/your_logo",

    "order_id": "order_9A33XWu170gUtm", // This is a sample Order ID. Pass the `id` obtained in the response of Step 1

    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",

    "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number

        "name": "Gaurav Kumar", //your customer's name

        "email": "gaurav.kumar@example.com",

        "contact": "+919876543210" //Provide the customer's phone number for better conversion rates

    },

    "notes": {

        "address": "Razorpay Corporate Office"

    },

    "theme": {

        "color": "#3399cc"

    }

};

var rzp1 = new Razorpay(options);

document.getElementById('rzp-button1').onclick = function(e){

    rzp1.open();

    e.preventDefault();

}

</script>
```

**Handy Tips**

Test your integration using these

[test cards](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#2-test-integration)

.

#### 1.2.3 Checkout Options

key

mandatory

`string` API Key ID generated from the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹2,222.50, enter `222250` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. See the list of

[supported currencies](https://razorpay.com/docs/payments/international-payments/#supported-currencies)

.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about

[Currency Conversion](https://razorpay.com/docs/payments/international-payments/currency-conversion/)

(May 2024).

name

mandatory

`string` Your Business/Enterprise name shown on the Checkout form. For example, **Acme Corp**.

description

optional

`string` Description of the purchase item shown on the Checkout form. It should start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown on the Checkout form. Can also be a **base64** string if you are not loading the image from a network.

order\_id

mandatory

`string` Order ID generated via

[Orders API](https://razorpay.com/docs/api/orders/)

.

prefill

`object` You can prefill the following details at Checkout.

**Boost Conversions and Minimise Drop-offs**

- Autofill customer contact details, especially phone number to ease form completion. Include customer’s phone number in the `contact` parameter of the JSON request's `prefill` object. Format: +(country code)(phone number). Example: "contact": "+919000090000".
- This is not applicable if you do not collect customer contact details on your website before checkout, have Shopify stores or use any of the no-code apps.

name

optional

`string` Cardholder's name to be prefilled if customer is to make card payments on Checkout. For example, **Gaurav Kumar**.

email

optional

`string` Email address of the customer.

contact

optional

`string` Phone number of the customer. The expected format of the phone number is `+ {country code}{phone number}`. If the country code is not specified, `91` will be used as the default value. This is particularly important while prefilling `contact` of customers with phone numbers issued outside India. **Examples**:

- +14155552671 (a valid non-Indian number)
- +919977665544 (a valid Indian number).

If 9977665544 is entered, `+91` is added to it as +919977665544.

method

optional

`string` Pre-selection of the payment method for the customer. Will only work if `contact` and `email` are also prefilled. Possible values:

- `card`
- `netbanking`
- `wallet`
- `upi`
- `emi`

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

theme

`object` Thematic options to modify the appearance of Checkout.

color

optional

`string` Enter your brand colour's HEX code to alter the text, payment method icons and CTA (call-to-action) button colour of the Checkout form.

backdrop\_color

optional

`string` Enter a HEX code to change the Checkout's backdrop colour.

modal

`object` Options to handle the Checkout modal.

backdropclose

optional

`boolean` Indicates whether clicking the translucent blank space outside the Checkout form should close the form. Possible values:

- `true`: Closes the form when your customer clicks outside the checkout form.
- `false` (default): Does not close the form when customer clicks outside the checkout form.

escape

optional

`boolean` Indicates whether pressing the **escape** key should close the Checkout form. Possible values:

- `true` (default): Closes the form when the customer presses the **escape** key.
- `false`: Does not close the form when the customer presses the **escape** key.

handleback

optional

`boolean` Determines whether Checkout must behave similar to the browser when back button is pressed. Possible values:

- `true` (default): Checkout behaves similarly to the browser. That is, when the browser's back button is pressed, the Checkout also simulates a back press. This happens as long as the Checkout modal is open.
- `false`: Checkout does not simulate a back press when browser's back button is pressed.

confirm\_close

optional

`boolean` Determines whether a confirmation dialog box should be shown if customers attempts to close Checkout. Possible values:

- `true`: Confirmation dialog box is shown.
- `false` (default): Confirmation dialog box is not shown.

ondismiss

optional

`function` Used to track the status of Checkout. You can pass a modal object with `ondismiss: function()\{\}` as options. This function is called when the modal is closed by the user. If `retry` is `false`, the `ondismiss` function is triggered when checkout closes, even after a failure.

animation

optional

`boolean` Shows an animation before loading of Checkout. Possible values:

- `true`(default): Animation appears.
- `false`: Animation does not appear.

subscription\_id

optional

`string` If you are accepting recurring payments using Razorpay Checkout, you should pass the relevant `subscription_id` to the Checkout. Know more about

[Subscriptions on Checkout](https://razorpay.com/docs/api/payments/subscriptions/#checkout-integration)

.

subscription\_card\_change

optional

`boolean` Permit or restrict customer from changing the card linked to the subscription. You can also do this from the

[hosted page](https://razorpay.com/docs/payments/subscriptions/payment-retries/#update-the-payment-method-via-our-hosted-page)

. Possible values:

- `true`: Allow the customer to change the card from Checkout.
- `false` (default): Do not allow the customer to change the card from Checkout.

recurring

optional

`boolean` Determines if you are accepting

[recurring (charge-at-will) payments on Checkout](https://razorpay.com/docs/api/payments/recurring-payments/)

via instruments such as emandate, paper NACH and so on. Possible values:

- `true`: You are accepting recurring payments.
- `false` (default): You are not accepting recurring payments.

callback\_url

optional

`string` Customers will be redirected to this URL on successful payment. Ensure that the domain of the Callback URL is allowlisted.

redirect

optional

`boolean` Determines whether to post a response to the event handler post payment completion or redirect to Callback URL. `callback_url` must be passed while using this parameter. Possible values:

- `true`: Customer is redirected to the specified callback URL in case of payment failure.
- `false` (default): Customer is shown the Checkout popup to retry the payment with the suggested next best option.

customer\_id

optional

`string` Unique identifier of customer. Used for:

- [Local saved cards feature](https://razorpay.com/docs/payments/payment-methods/cards/features/saved-cards/#manage-saved-cards)
.
- Static bank account details on Checkout in case of
[Bank Transfer payment method](https://razorpay.com/docs/payments/payment-methods/bank-transfer/)
.

remember\_customer

optional

`boolean` Determines whether to allow saving of cards. Can also be configured via the

[Dashboard](https://razorpay.com/docs/payments/dashboard/account-settings/checkout-features/#flash-checkout)

. Possible values:

- `true`: Enables card saving feature.
- `false` (default): Disables card saving feature.

timeout

optional

`integer` Sets a timeout on Checkout, in seconds. After the specified time limit, the customer will not be able to use Checkout.

**Watch Out!**

Some browsers may pause `JavaScript` timers when the user switches tabs, especially in power saver mode. This can cause the checkout session to stay active beyond the set timeout duration.

readonly

`object` Marks fields as read-only.

contact

optional

`boolean` Used to set the `contact` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

email

optional

`boolean` Used to set the `email` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

name

optional

`boolean` Used to set the `name` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

hidden

`object` Hides the contact details.

contact

optional

`boolean` Used to set the `contact` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

email

optional

`boolean` Used to set the `email` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

send\_sms\_hash

optional

`boolean` Used to auto-read OTP for cards and netbanking pages. Applicable from Android SDK version 1.5.9 and above. Possible values:

- `true`: OTP is auto-read.
- `false` (default): OTP is not auto-read.

allow\_rotation

optional

`boolean` Used to rotate payment page as per screen orientation. Applicable from Android SDK version 1.6.4 and above. Possible values:

- `true`: Payment page can be rotated.
- `false` (default): Payment page cannot be rotated.

retry

optional

`object` Parameters that enable retry of payment on the checkout.

enabled

`boolean` Determines whether the customers can retry payments on the checkout. Possible values:

- `true` (default): Enables customers to retry payments.
- `false`: Disables customers from retrying the payment.

max\_count

`integer` The number of times the customer can retry the payment. We recommend you to set this to 4. Having a larger number here can cause loops to occur.

**Watch Out!**

Web Integration does not support the `max_count` parameter. It is applicable only in Android and iOS SDKs.

config

optional

`object` Parameters that enable checkout configuration. Know more about how to

[configure payment methods on Razorpay standard checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/)

.

display

`object` Child parameter that enables configuration of checkout display language.

language

`string` The language in which checkout should be displayed. Possible values:

- `en`: English
- `ben`: Bengali
- `hi`: Hindi
- `mar`: Marathi
- `guj`: Gujarati
- `tam`: Tamil
- `tel`: Telugu

**Handy Tips**

The open method of Razorpay object (`rzp1.open()`) must be invoked by your site's JavaScript, which may or may not be a user-driven action such as a click.

#### 1.2.4 Errors

Given below is a list of errors you may face while integrating with checkout on the client-side.

| Error | Cause | Solution |
| --- | --- | --- |
| The id provided does not exist. | Occurs when there is a mismatch between the API keys used while creating the `order_id` / `customer_id` and the API key passed in the checkout. | Make sure that the API keys passed in the checkout are the same as the API keys used while creating the `order_id` / `customer_id` . |
| Blocked by CORS policy. | Occurs when the server-to-server request is hit from the front end instead. | Make sure that the API calls are made from the server side and not the client side. |

#### 1.2.5 Configure Payment Methods _(Optional)_

Multiple payment methods are available on the Razorpay Web Standard Checkout.

- The payment methods are **fixed** and cannot be changed.
- You can configure the order or make certain payment methods prominent. Know more about
[configuring payment methods](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/)
.

### 1.3 Handle Payment Success and Failure

The way the Payment Success and Failure scenarios are handled depends on the

[Checkout Sample Code](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#122-code-to-add-pay-button)

you used in the last step.

### [Checkout with Handler Function](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#Checkout%20with%20Handler%20Function)

If you used the sample code with the handler function:

Payment Success

Payment Failure

#### [On Payment Success](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#On%20Payment%20Success)

The customer sees your website page. The checkout returns the response object of the successful payment ( **razorpay\_payment\_id**, **razorpay\_order\_id** and **razorpay\_signature**). Collect these and send them to your server.

### [Checkout with Callback URL](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#Checkout%20with%20Callback%20URL)

If you used the sample code with the callback URL:

Payment Success

Payment Failure

#### [On Payment Success](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#On%20Payment%20Success)

Razorpay makes a POST call to the callback URL with the **razorpay\_payment\_id**, **razorpay\_order\_id** and **razorpay\_signature** in the response object of the successful payment. Only successful authorisations are auto-submitted.

### 1.4 Store Fields in Your Server

A successful payment returns the following fields to the Checkout form.

#### Success Callback

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

Success Callback

copy

```json
{

  "razorpay_payment_id": "pay_29QQoUBi66xm2f",

  "razorpay_order_id": "order_9A33XWu170gUtm",

  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"

}
```

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

### 1.5 Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

#### To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:
   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the
     [Dashboard](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/#generate-api-keys)
     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:





HMAC Hex Digest


copy










```html
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);




     if (generated_signature == razorpay_signature) {

       payment is successful

     }
```

3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.


#### Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
RazorpayClient razorpay = new RazorpayClient("[YOUR_KEY_ID]", "[YOUR_KEY_SECRET]");

String secret = "EnLs21M47BllR3X8PSFtjtbd";

JSONObject options = new JSONObject();

options.put("razorpay_order_id", "order_IEIaMR65cu6nz3");

options.put("razorpay_payment_id", "pay_IH4NVgf4Dreq1l");

options.put("razorpay_signature", "0d4e745a1838664ad6c9c9902212a32d627d68e917290b0ad5f08ff4561bc50f");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

#### Post Signature Verification

After you have completed the integration, you can

[set up webhooks](https://razorpay.com/docs/webhooks/setup-edit-payments/)

, make test payments, replace the test key with the live key and integrate with other

[APIs](https://razorpay.com/docs/api/)

.

Here are the links to our

[SDKs](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/#client-libraries)

for the supported platforms.

### 1.6 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to

[capture payments automatically](https://razorpay.com/docs/payments/payments/capture-settings/)

.

#### You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/build/browser/assets/images/testpayment.jpg)

## [2\. Test Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#2-test-integration)

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your
[Test Mode API keys](https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/#generate-api-keys)
in the Checkout code.
- Test mode may include OTP verification for certain payment methods to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

| Payment Method | Code | Availability |
| --- | --- | --- |
| [Debit Card](https://razorpay.com/docs/payments/payment-methods/cards/) | `debit` | ✓ |
| [Credit Card](https://razorpay.com/docs/payments/payment-methods/cards/) | `credit` | ✓ |
| [Netbanking](https://razorpay.com/docs/payments/payment-methods/netbanking/) | `netbanking` | ✓ |
| [UPI](https://razorpay.com/docs/payments/payment-methods/upi/) | `upi` | ✓ |
| EMI - <br>[Credit Card EMI](https://razorpay.com/docs/payments/payment-methods/emi/credit-card-emi/)<br> , <br>[Debit Card EMI](https://razorpay.com/docs/payments/payment-methods/emi/debit-card-emi/)<br> and <br>[No Cost EMI](https://razorpay.com/docs/payments/payment-methods/emi/no-cost-emi/) | `emi` | ✓ |
| [Wallet](https://razorpay.com/docs/payments/payment-methods/wallets/) | `wallet` | ✓ |
| [Cardless EMI](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/) | `cardless_emi` | Requires <br>[Approval](https://razorpay.com/support)<br> . |
| [Bank Transfer](https://razorpay.com/docs/payments/payment-methods/bank-transfer/) | `bank_transfer` | Requires <br>[Approval](https://razorpay.com/support)<br> and Integration. |
| [Emandate](https://razorpay.com/docs/payments/recurring-payments/emandate/integrate/) | `emandate` | Requires <br>[Approval](https://razorpay.com/support)<br> and Integration. |
| [Pay Later](https://razorpay.com/docs/payments/payment-methods/pay-later/) | `paylater` | Requires <br>[Approval](https://razorpay.com/support)<br> . |

You can make test payments using one of the payment methods configured at the Checkout.

#### Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of

[supported banks](https://razorpay.com/docs/payments/payment-methods/netbanking/#supported-banks)

.

#### UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the list of

[supported UPI flows](https://razorpay.com/docs/payments/payment-methods/upi/)

.

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

#### Cards

You can use the following test cards to test transactions for your integration in Test Mode.

### [Domestic Cards](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#Domestic%20Cards)

Use the following test cards for Indian payments:

| Network | Card Number | CVV & Expiry Date |
| --- | --- | --- |
| Visa | 4100 2800 0000 1007 | Use a random CVV and any future date |
| Mastercard | 5500 6700 0000 1002 |
| RuPay | 6527 6589 0000 1005 |
| Diners | 3608 280009 1007 |
| Amex | 3402 560004 01007 |

#### [Error Scenarios](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#Error%20Scenarios)

Use these test cards to simulate payment errors. See the

[complete list](https://razorpay.com/docs/payments/payments/test-card-details/#error-scenario-test-cards)

of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](https://razorpay.com/docs/payments/payment-methods/cards/)
.
- [Cards Error Codes](https://razorpay.com/docs/errors/payments/cards/)
.

### [International Cards](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#International%20Cards)

Use the following test cards to test international payments. Use any valid expiration date in the future in the MM/YY format and any random CVV to create a successful payment.

| Card Network | Card Number | CVV & Expiry Date |
| --- | --- | --- |
| Mastercard | 5555 5555 5555 4444 <br> 5105 1051 0510 5100 <br> 5104 0600 0000 0008 | Use a random CVV and any future date |
| Visa | 4012 8888 8888 1881 |

Check the list of

[supported card networks](https://razorpay.com/docs/payments/payment-methods/cards/)

.

#### Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of

[supported wallets](https://razorpay.com/docs/payments/payment-methods/wallets/#supported-wallets)

.

## [3\. Go-live Checklist](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/\#3-go-live-checklist)

Check the go-live checklist for Razorpay Web Standard Checkout integration. Consider these steps before taking the integration live.

### 3.1 Accept Live Payments

Perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

**Watch Out!**

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and switch to **Live Mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate the API Key for Live Mode.
3. Download the keys and save them securely.
4. Replace the Test API Key with the Live Key in the Checkout code and start accepting actual payments.

### 3.2 Payment Capture

After payment is `authorized`, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

**Watch Out**

- You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
- You can track the payment status using our
[Fetch a Payment API](https://razorpay.com/docs/api/payments/#fetch-a-payment)
or webhooks.

Auto-capture Payments (Recommended)

Manually Capture Payments

Authorized payments can be automatically captured. You can auto-capture all payments

[using global settings](https://razorpay.com/docs/payments/payments/capture-settings/#auto-capture-all-payments)

on the Razorpay Dashboard. Know more about

[capture settings for payments](https://razorpay.com/docs/payments/payments/capture-settings/)

.

**Watch Out!**

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the

[Orders API](https://razorpay.com/docs/api/orders/create/)

.

### 3.3 Set Up Webhooks

Ensure you have

[set up webhooks](https://razorpay.com/docs/webhooks/setup-edit-payments/)

in the live mode and configured the events for which you want to receive notifications.

**Implementation Considerations**

Webhooks are the primary and most efficient method for event notifications. They are delivered asynchronously in near real-time. For critical user-facing flows that need instant confirmation (like showing "Payment Successful" immediately), supplement webhooks with API verification.

**Recommended approach**

- Rely on webhooks for all automation, which can be asynchronous.
- If a critical user-facing flow requires instant status, but the webhook notification has not arrived within the time mandated by your business needs, perform an immediate API Fetch call (
[Payments](https://razorpay.com/docs/api/payments/fetch-with-id/)
,
[Orders](https://razorpay.com/docs/api/orders/fetch-with-id/)
and
[Refunds](https://razorpay.com/docs/api/refunds/fetch-specific-refund-payment/)
) to verify the status.

* * *

Is this integration guide useful?

Yes

No

* * *

integrate web standard

checkout

payment gateway

integration steps

* * *

SUBSCRIBE TO DEVELOPER UPDATES

Subscribe

[API Reference Guide](https://razorpay.com/docs/api)

[Integrations](https://razorpay.com/integrations)

[Support](https://razorpay.com/support)

ON THIS PAGE

- [1\. Build Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#1-build-integration)

- [2\. Test Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#2-test-integration)

- [3\. Go-live Checklist](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#3-go-live-checklist)


Back To Top