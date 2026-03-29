[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-light.009264f2.svg)](https://razorpay.com/docs/)

![US](https://flagcdn.com/us.svg)

[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-dark.6f09b030.svg)](https://razorpay.com/docs/)

/

[Pricing](https://razorpay.com/us/pricing/)

[API Reference](https://razorpay.com/docs/api)

[Support](https://razorpay.com/us/support/)

![US](https://flagcdn.com/us.svg)

[Log In](https://dashboard.razorpay.com/?next=%2Fapi%2Forders%2Fcreate%2F#/access/signin)

[Sign Up](https://dashboard.razorpay.com/signup)

Introduction

[API Reference Guide](https://razorpay.com/docs/api/)

[API Changelog](https://razorpay.com/docs/api/changelog)

[Understand Razorpay APIs](https://razorpay.com/docs/api/understand)

[Authentication](https://razorpay.com/docs/api/authentication)

[Sandbox Setup](https://razorpay.com/docs/api/sandbox-setup)

[Best Practices](https://razorpay.com/docs/api/best-practices)

[Glossary](https://razorpay.com/docs/api/glossary)

Payments

[Orders](https://razorpay.com/docs/api/orders)

[Orders Entity](https://razorpay.com/docs/api/orders/entity)

[Create an Order](https://razorpay.com/docs/api/orders/create)

[Fetch All Orders](https://razorpay.com/docs/api/orders/fetch-all)

[Fetch All Orders (With Expanded Payments)](https://razorpay.com/docs/api/orders/fetch-all-expanded-payments)

[Fetch All Orders (With Expanded Card Payments)](https://razorpay.com/docs/api/orders/fetch-all-expanded-card-payments)

[Fetch an Order With ID](https://razorpay.com/docs/api/orders/fetch-with-id)

[Fetch Payments for an Order](https://razorpay.com/docs/api/orders/fetch-payments)

[Update an Order](https://razorpay.com/docs/api/orders/update)

[Payments](https://razorpay.com/docs/api/payments)

[Downtime](https://razorpay.com/docs/api/payments/downtime)

[Settlements](https://razorpay.com/docs/api/settlements)

[Refunds](https://razorpay.com/docs/api/refunds)

[Payment Links](https://razorpay.com/docs/api/payments/payment-links)

[Subscriptions](https://razorpay.com/docs/api/payments/subscriptions)

[Api](https://razorpay.com/docs/api)

[Orders](https://razorpay.com/docs/api/orders)

Create

API Test Keys

# Create an Order

`POST`

`/v1/orders`

Click to copy

Available in

![IN](https://flagcdn.com/in.svg)

India

![MY](https://flagcdn.com/my.svg)

Malaysia

![SG](https://flagcdn.com/sg.svg)

Singapore

![US](https://flagcdn.com/us.svg)

United States

Use this endpoint to create an order with basic details such as amount and currency.

Is this page helpful?

Sample Code

Request Parameters

6

Response Parameters

11

Errors

3

Curl

change language

change language

```bash
1curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \

2-X POST https://api.razorpay.com/v1/orders \

3-H "content-type: application/json" \

4-d '{

5  "amount": 5000,

6  "currency": "USD",

7  "receipt": "receipt#1",

8  "notes": {

9    "key1": "value3",

10    "key2": "value2"

11  }

12}'
```

Success

Failure

```json
1{

2  "amount": 5000,

3  "amount_due": 5000,

4  "amount_paid": 0,

5  "attempts": 0,

6  "created_at": 1756455561,

7  "currency": "INR",

8  "entity": "order",

9  "id": "order_RB58MiP5SPFYyM",

10  "notes": {

11      "key1": "value3",

12      "key2": "value2"

13  },

14  "offer_id": null,

15  "receipt": "receipt#1",

16  "status": "created"

17}
```

###### Request Parameters

`amount`

\*

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`. Payment can only be made for this amount against the Order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment. Possible values:

- `true` : The customer can make partial payments.
- `false` (default) : The customer cannot make partial payments.

`first_payment_min_amount`

`integer`

Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of $700 is to be received from the customer in two installments of #1 - $500, #2 - $200, then you can set this value as `50000`. This parameter should be passed only if `partial_payment` is `true`.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

`status`

`string`

The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

`attempts`

`integer`

The number of payment attempts, successful and failed, that have been made against this order.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Indicates the Unix timestamp when this order was created.

###### Errors

Authentication failed.

Error Status: 400

The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:

- Different keys for test mode and live modes.
- Expired API key.

Solution

Order amount less than minimum amount allowed.

Error Status: 400

The amount specified is less than the minimum amount, that is `10`.

Solution

The field name is required.

Error Status: 400

A mandatory field is missing.

Solution

# Create an Order

`POST`

`/v1/orders`

Click to copy

Available in

![IN](https://flagcdn.com/in.svg)

India

![MY](https://flagcdn.com/my.svg)

Malaysia

![SG](https://flagcdn.com/sg.svg)

Singapore

![US](https://flagcdn.com/us.svg)

United States

Use this endpoint to create an order with basic details such as amount and currency.

Is this page helpful?

Request Parameters

6

Response Parameters

11

Errors

3

###### Request Parameters

`amount`

\*

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`. Payment can only be made for this amount against the Order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment. Possible values:

- `true` : The customer can make partial payments.
- `false` (default) : The customer cannot make partial payments.

`first_payment_min_amount`

`integer`

Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of $700 is to be received from the customer in two installments of #1 - $500, #2 - $200, then you can set this value as `50000`. This parameter should be passed only if `partial_payment` is `true`.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of $295, enter `29500`.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

`status`

`string`

The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

`attempts`

`integer`

The number of payment attempts, successful and failed, that have been made against this order.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Indicates the Unix timestamp when this order was created.

###### Errors

Authentication failed.

Error Status: 400

The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:

- Different keys for test mode and live modes.
- Expired API key.

Solution

Order amount less than minimum amount allowed.

Error Status: 400

The amount specified is less than the minimum amount, that is `10`.

Solution

The field name is required.

Error Status: 400

A mandatory field is missing.

Solution

Curl

change language

change language

```bash
1curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \

2-X POST https://api.razorpay.com/v1/orders \

3-H "content-type: application/json" \

4-d '{

5  "amount": 5000,

6  "currency": "USD",

7  "receipt": "receipt#1",

8  "notes": {

9    "key1": "value3",

10    "key2": "value2"

11  }

12}'
```

Success

Failure

```json
1{

2  "amount": 5000,

3  "amount_due": 5000,

4  "amount_paid": 0,

5  "attempts": 0,

6  "created_at": 1756455561,

7  "currency": "INR",

8  "entity": "order",

9  "id": "order_RB58MiP5SPFYyM",

10  "notes": {

11      "key1": "value3",

12      "key2": "value2"

13  },

14  "offer_id": null,

15  "receipt": "receipt#1",

16  "status": "created"

17}
```