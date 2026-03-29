[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-light.009264f2.svg)](https://razorpay.com/docs/)

![US](https://flagcdn.com/us.svg)

[![Razorpay Docs Logo](https://razorpay.com/docs/build/browser/static/razorpay-docs-dark.6f09b030.svg)](https://razorpay.com/docs/)

/

[Pricing](https://razorpay.com/us/pricing/)

[API Reference](https://razorpay.com/docs/api)

[Support](https://razorpay.com/us/support/)

![US](https://flagcdn.com/us.svg)

[Log In](https://dashboard.razorpay.com/?next=%2Fapi%2Forders%2Fentity%2F#/access/signin)

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

Entity

API Test Keys

# Orders Entity

Available in

![IN](https://flagcdn.com/in.svg)

India

![MY](https://flagcdn.com/my.svg)

Malaysia

![SG](https://flagcdn.com/sg.svg)

Singapore

![US](https://flagcdn.com/us.svg)

United States

The Orders entity has the following parameters:

Is this page helpful?

Entity

```json
1{

2  "id": "order_DaZlswtdcn9UNV",

3  "entity": "order",

4  "amount": 50000,

5  "amount_paid": 0,

6  "amount_due": 50000,

7  "currency": "USD",

8  "receipt": "Receipt #20",

9  "status": "created",

10  "attempts": 0,

11  "notes": {

12    "key1": "value1",

13    "key2": "value2"

14  },

15  "created_at": 1572502745

16}
```

`id`

`string`

The unique identifier of the order.

`amount`

\*

`integer`

Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is $299, then pass `29900` in this field.

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

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

# Orders Entity

Available in

![IN](https://flagcdn.com/in.svg)

India

![MY](https://flagcdn.com/my.svg)

Malaysia

![SG](https://flagcdn.com/sg.svg)

Singapore

![US](https://flagcdn.com/us.svg)

United States

The Orders entity has the following parameters:

Is this page helpful?

`id`

`string`

The unique identifier of the order.

`amount`

\*

`integer`

Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is $299, then pass `29900` in this field.

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

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

Entity

```json
1{

2  "id": "order_DaZlswtdcn9UNV",

3  "entity": "order",

4  "amount": 50000,

5  "amount_paid": 0,

6  "amount_due": 50000,

7  "currency": "USD",

8  "receipt": "Receipt #20",

9  "status": "created",

10  "attempts": 0,

11  "notes": {

12    "key1": "value1",

13    "key2": "value2"

14  },

15  "created_at": 1572502745

16}
```