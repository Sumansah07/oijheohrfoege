# 🛒 Single-Vendor Ecommerce Platform — Project Roadmap

> **Tech Stack:** Next.js (App Router) · Supabase · Cloudinary · Stripe · PayPal · Swiper.js  
> **Total Duration:** 22 Weeks · 5 Phases · 50+ Routes · 8 Third-Party Integrations  
> **Design Principle:** Payment and delivery integrations are built on a provider-agnostic adapter pattern — adding a new gateway or courier requires only a new adapter file, zero changes to core checkout or order logic.

---

## 📊 Phase Overview

| Phase | Name | Timeline | Duration | Focus |
|---|---|---|---|---|
| 1 | Foundation & Setup | Weeks 1–3 | 3 weeks | Infra, DB, Auth, CI/CD |
| 2 | Core Storefront | Weeks 4–8 | 5 weeks | Homepage, PLP, PDP, Blog |
| 3 | Cart, Checkout & Payments | Weeks 9–12 | 4 weeks | Cart, Stripe, PayPal, Orders |
| 4 | Admin Dashboard | Weeks 13–18 | 6 weeks | Full admin panel & CMS |
| 5 | Polish, SEO & Launch | Weeks 19–22 | 4 weeks | Perf, QA, Go-live |

---

## Phase 1 — Foundation & Setup
**Timeline:** Weeks 1–3 | **Goal:** Lay the groundwork before a single feature is built.

### Tasks

| Task Area | Key Activities | Deliverable | Priority |
|---|---|---|---|
| Project Init | Create Next.js App Router project, configure ESLint, Prettier, Husky, TypeScript strict mode | Working repo | 🔴 Critical |
| Environment Config | Set up `.env.local`, configure Vercel project, connect staging & production environments | `.env` template | 🔴 Critical |
| Supabase Setup | Create Supabase project, define all core tables, configure RLS policies | DB schema live | 🔴 Critical |
| Auth Integration | Implement Supabase Auth: email/password, Google OAuth, session management | Auth working | 🔴 Critical |
| Next.js Middleware | Protect `/account/*` and `/admin/*` routes with role-based middleware redirects | Route guards | 🟠 High |
| Cloudinary Setup | Create Cloudinary account, configure upload presets, build reusable upload utility | Image uploads | 🟠 High |
| UI Library Setup | Install Tailwind CSS, Swiper.js, shadcn/ui; define design tokens (Poppins & Lufga fonts) | Design system | 🟠 High |
| CI/CD Pipeline | Configure GitHub Actions: lint, type-check, build check on every PR; auto-deploy to Vercel | Pipeline live | 🟡 Medium |

### Database Tables to Define
- `users` — roles: `customer` / `admin`
- `products`, `product_variants`, `categories`
- `orders`, `order_items`, `cart`
- `reviews`, `coupons`, `addresses`
- `blog_posts`, `returns`, `cancellations`, `wishlists`

### Extensibility-Critical Tables (define in Phase 1, not later)
These must be schema-designed upfront so the adapter layer can be built correctly in Phase 3.

| Table | Purpose | Key Columns |
|---|---|---|
| `payment_providers` | Registry of all payment gateways | `id`, `name`, `slug`, `is_active`, `config_json` |
| `payment_transactions` | Provider-agnostic transaction log | `id`, `order_id`, `provider_slug`, `external_id`, `status`, `amount`, `raw_response` |
| `delivery_providers` | Registry of all courier/delivery partners | `id`, `name`, `slug`, `is_active`, `config_json` |
| `shipments` | Provider-agnostic shipment records | `id`, `order_id`, `provider_slug`, `tracking_number`, `status`, `raw_response` |
| `shipping_rates` | Rate results per provider per order | `id`, `order_id`, `provider_slug`, `service_name`, `rate`, `estimated_days` |

> **Why in Phase 1?** If `orders` references `payment_transactions` and `shipments` from day one, you avoid painful schema migrations later. The foreign keys are set up correctly before any checkout code is written.

### Milestone ✅
> Supabase schema finalized, auth working end-to-end, all third-party accounts created, CI/CD deploying to Vercel staging.

---

## Phase 2 — Core Storefront
**Timeline:** Weeks 4–8 | **Goal:** Complete customer-facing storefront with all browsing and discovery pages.

### Tasks

| Task Area | Key Activities | Deliverable | Priority |
|---|---|---|---|
| Layout & Nav | `<Navbar />` with search, cart icon, user menu; `<Footer />` with newsletter | Global layout | 🔴 Critical |
| Homepage | Hero slider (Swiper.js), category grid, featured products, flash sale countdown timer | `/` live | 🔴 Critical |
| Product Listing Pages | Category/subcategory/search/collection/brand pages with `<FilterSidebar />`: price range, color, size, tags, sorting, pagination | PLP pages | 🔴 Critical |
| Product Detail Page | Image gallery (Swiper.js), variant selector, qty selector, Add to Cart, Wishlist, reviews section, related products | `/product/[slug]` | 🔴 Critical |
| Product & Search APIs | `/api/products/` CRUD, `/api/categories/` CRUD, `/api/search/` full-text search | Product APIs | 🔴 Critical |
| Auth Pages | Login, Register, Forgot Password, Reset Password with Supabase Auth forms | Auth pages | 🟠 High |
| SEO Foundations | `generateMetadata()` per page, Open Graph tags, dynamic `sitemap.xml`, `robots.txt`, `next/image` optimization | SEO setup | 🟠 High |
| Informational Pages | About, Contact, FAQ, Privacy Policy, Terms & Conditions, Refund Policy | CMS pages | 🟡 Medium |
| Blog | Blog list and blog post pages with Supabase-backed `blog_posts` table | Blog live | 🟡 Medium |

### Routes Delivered
```
/                           Homepage
/category/[slug]            Category listing
/category/[parent]/[child]  Subcategory listing
/search?q=...               Search results
/collection/[slug]          Collection page
/brand/[slug]               Brand page
/product/[slug]             Product detail
/about  /contact  /faq      Info pages
/blog   /blog/[slug]        Blog
/login  /register           Auth
/forgot-password  /reset-password
```

### Milestone ✅
> Full storefront browsable end-to-end — homepage, PLPs, PDPs, auth, blog, and info pages live on staging.

---

## Phase 3 — Cart, Checkout & Payments
**Timeline:** Weeks 9–12 | **Goal:** Complete purchase funnel built on an extensible adapter architecture — adding any future payment gateway or delivery partner must require zero changes to core checkout logic.

### 🏛️ Adapter Architecture (build this first in Phase 3)

Before writing a single Stripe or shipping line, establish the interfaces everything else implements.

**Payment Provider Interface** — `/lib/payments/types.ts`
```ts
interface PaymentProvider {
  slug: string                          // e.g. "stripe", "paypal", "razorpay"
  createSession(order: Order): Promise<PaymentSession>
  verifyWebhook(req: Request): Promise<WebhookEvent>
  refund(transactionId: string, amount: number): Promise<RefundResult>
}
```

**Delivery Provider Interface** — `/lib/delivery/types.ts`
```ts
interface DeliveryProvider {
  slug: string                          // e.g. "fedex", "dhl", "shiprocket"
  getRates(shipment: ShipmentRequest): Promise<DeliveryRate[]>
  createShipment(order: Order, rateId: string): Promise<ShipmentResult>
  trackShipment(trackingNumber: string): Promise<TrackingStatus>
  cancelShipment(shipmentId: string): Promise<void>
}
```

**Provider Registry** — `/lib/payments/registry.ts` & `/lib/delivery/registry.ts`
```ts
// Checkout code calls the registry — never imports Stripe/FedEx directly
const provider = PaymentRegistry.get(order.payment_provider_slug)
await provider.createSession(order)
```

**Folder Structure**
```
/lib
├── payments/
│   ├── types.ts               ← PaymentProvider interface
│   ├── registry.ts            ← maps slug → provider instance
│   ├── adapters/
│   │   ├── stripe.ts          ← implements PaymentProvider
│   │   ├── paypal.ts          ← implements PaymentProvider
│   │   └── [future].ts        ← drop a file here to add a new gateway
└── delivery/
    ├── types.ts               ← DeliveryProvider interface
    ├── registry.ts            ← maps slug → provider instance
    ├── adapters/
    │   ├── fedex.ts           ← implements DeliveryProvider  (future)
    │   ├── dhl.ts             ← implements DeliveryProvider  (future)
    │   └── shiprocket.ts      ← implements DeliveryProvider  (future)
```

> **The rule:** Checkout, order creation, and shipment tracking code **only ever calls the interface**. It has no knowledge of Stripe, PayPal, FedEx, or DHL. Adding a new provider = adding one adapter file + one row in `payment_providers` or `delivery_providers` table.

---

### Tasks

| Task Area | Key Activities | Deliverable | Priority |
|---|---|---|---|
| **Payment Adapter Layer** | Define `PaymentProvider` interface, build `PaymentRegistry`, establish `payment_transactions` logging pattern | `PaymentProvider` interface | 🔴 Critical |
| **Delivery Adapter Layer** | Define `DeliveryProvider` interface, build `DeliveryRegistry`, establish `shipments` + `shipping_rates` logging pattern | `DeliveryProvider` interface | 🔴 Critical |
| Cart Logic | Zustand/Context cart state, `<CartDrawer />`, add/remove/update qty, guest + auth cart sync | `/cart` page | 🔴 Critical |
| Checkout Stepper | `<CheckoutStepper />`: shipping address → delivery method (rates from registry) → payment (from registry) → order summary | `/checkout` | 🔴 Critical |
| Stripe Adapter | Implement `PaymentProvider` for Stripe: Payment Intents, `/api/checkout/stripe`, webhook handler | Stripe live | 🔴 Critical |
| Order Management | `/api/orders/` — create order on payment success, link `order_items`, log to `payment_transactions`, update stock | Order API | 🔴 Critical |
| Manual/Flat-rate Delivery | Implement first `DeliveryProvider` as a flat-rate/manual adapter — used by checkout until real couriers are added | Delivery scaffold | 🔴 Critical |
| Success / Failure Pages | `/order/success` and `/order/failure` with order summary and next-step CTAs | Post-order UX | 🟠 High |
| PayPal Adapter | Implement `PaymentProvider` for PayPal: JS SDK, `/api/checkout/paypal`, webhook handler | PayPal live | 🟠 High |
| Coupon System | `/api/coupons/` — validate & apply codes at checkout, discount calculation logic | Coupons | 🟠 High |
| Transactional Emails | Resend/SendGrid SMTP: order confirmation, shipping update, password reset templates | Emails live | 🟠 High |
| Webhook Router | Single `/api/webhooks/[provider]` dynamic route that dispatches to the correct adapter's `verifyWebhook()` | Webhook router | 🟠 High |
| Returns & Cancellations | `/api/returns/` and `/api/cancellations/` endpoints; customer-facing request forms | Returns flow | 🟡 Medium |

### Checkout Flow
```
1. Shipping Address
2. Shipping Method Selection
3. Payment  (Stripe / PayPal / Local Gateway)
4. Order Summary & Confirmation
```

### Webhook Handlers
```
/api/webhooks/[provider]    — dynamic route, dispatches to PaymentRegistry.get(provider).verifyWebhook()

Examples:
/api/webhooks/stripe        — payment_intent.succeeded, payment_intent.failed, charge.refunded
/api/webhooks/paypal        — PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED
/api/webhooks/razorpay      — (future) payment.captured, payment.failed
/api/webhooks/fedex         — (future) shipment tracking events
/api/webhooks/dhl           — (future) shipment tracking events
```

> Adding a new provider's webhook = implement `verifyWebhook()` in its adapter. The router file never changes.

### Milestone ✅
> End-to-end purchase flow working in Stripe/PayPal test mode; order records created in Supabase; confirmation emails delivered. **Payment and delivery adapter interfaces finalized and documented — any future provider can be added without touching checkout logic.**

---

## Phase 4 — Admin Dashboard
**Timeline:** Weeks 13–18 | **Goal:** Full-featured admin panel for managing every aspect of the store.

### Tasks

| Task Area | Key Activities | Deliverable | Priority |
|---|---|---|---|
| Admin Layout | `<AdminSidebar />` navigation, protected layout wrapper, admin role enforcement | Admin shell | 🔴 Critical |
| Product Management | `<DataTable />` product list, `<ProductForm />` add/edit, variant manager, `<ImageUploader />` (Cloudinary) | Product CRUD | 🔴 Critical |
| Category Management | Category tree with parent/child hierarchy, add/edit forms, slug auto-generation | Category CRUD | 🔴 Critical |
| Order Management | Orders list with status filters, detail view, status transitions: `pending → processing → shipped → delivered / cancelled` | Order admin | 🔴 Critical |
| Dashboard Overview | Revenue charts, orders summary, top products, recent activity (`<AnalyticsChart />`) | `/admin/dashboard` | 🟠 High |
| Customer Management | Customer list with search/filter, customer detail with order history and address book | Customer admin | 🟠 High |
| Inventory | Stock levels table, low-stock alerts, bulk stock update tool | `/admin/inventory` | 🟠 High |
| Shipping & Taxes | Shipping zones, cost rules, delivery methods config; tax rate management by region | Shipping admin | 🟠 High |
| **Payment Provider Manager** | UI to enable/disable payment providers, configure credentials per provider (`payment_providers` table), display live/test mode toggle | Payments admin | 🟠 High |
| **Delivery Provider Manager** | UI to enable/disable delivery partners, configure API credentials per courier (`delivery_providers` table), set default provider | Delivery admin | 🟠 High |
| Blog & CMS Admin | `<RichTextEditor />` for blog posts, authors, blog categories; CMS pages editor | Blog admin | 🟡 Medium |
| Coupons & Discounts | Coupon list, add/edit coupon (type, value, expiry, usage limits), discount rules | Coupons admin | 🟡 Medium |
| Media Manager | Cloudinary-backed media library: upload, browse, organize, delete images/videos | Media admin | 🟡 Medium |
| Settings | Store settings, email/SMTP, SEO, header, hero banner/slider, countdown timer config | Settings pages | 🟡 Medium |
| Analytics | Revenue over time, conversion rates, top products & categories charts | `/admin/analytics` | 🟡 Medium |

### Admin Routes Delivered
```
/admin/dashboard
/admin/products          /admin/products/new      /admin/products/[id]
/admin/categories        /admin/categories/new    /admin/categories/[id]
/admin/orders            /admin/orders/[id]
/admin/customers         /admin/customers/[id]
/admin/reviews
/admin/coupons           /admin/discounts
/admin/inventory
/admin/shipping          /admin/taxes
/admin/payments          /admin/payments/[provider]
/admin/delivery          /admin/delivery/[provider]
/admin/blog/posts        /admin/blog/authors      /admin/blog/categories
/admin/media
/admin/analytics
/admin/notifications
/admin/settings/account  /admin/settings/store    /admin/settings/email
/admin/settings/seo      /admin/settings/api-keys /admin/settings/hero-banner
/admin/settings/hero-slider  /admin/settings/countdown
```

### Milestone ✅
> All admin CRUD operations functional; orders manageable end-to-end; media uploads working via Cloudinary; settings persisting to Supabase.

---

## Phase 5 — Polish, SEO & Launch
**Timeline:** Weeks 19–22 | **Goal:** Performance hardening, final QA, and production go-live.

### Tasks

| Task Area | Key Activities | Deliverable | Priority |
|---|---|---|---|
| Customer Account Pages | Complete all `/account/*` pages: dashboard, orders, returns, profile, addresses, wishlist, reviews, notifications | Account portal | 🔴 Critical |
| Security Audit | Review all Supabase RLS policies, API auth, rate limiting on auth endpoints, input sanitization | Security sign-off | 🔴 Critical |
| QA & Bug Fixes | Full E2E test: storefront, checkout, admin CRUD, webhooks, email delivery | QA sign-off | 🔴 Critical |
| Production Deploy | Vercel production deploy, custom domain, SSL, env variables verification, Supabase prod DB | Live site | 🔴 Critical |
| ISR & Caching | Implement Incremental Static Regeneration for product & category pages; configure revalidation | ISR live | 🔴 Critical |
| Core Web Vitals | Audit LCP, CLS, FID; optimize images, reduce bundle size, lazy-load components, code-split admin | CWV pass | 🔴 Critical |
| Reviews System | `<ReviewForm />` with star rating, `/api/reviews/` endpoint, display on PDP, admin moderation | Reviews live | 🟠 High |
| Wishlist | `/api/wishlists/` endpoint, wishlist UI in account dashboard and product pages | Wishlist | 🟠 High |
| Google Analytics | Integrate GA4, configure ecommerce tracking (add to cart, checkout, purchase events) | Analytics live | 🟠 High |
| Notifications | In-app notification center for account and admin, read/unread state | Notifications | 🟡 Medium |
| Documentation | Developer README, environment setup guide, admin user guide, API route docs | Docs | 🟡 Medium |

### Customer Account Routes Delivered
```
/account/dashboard
/account/orders              /account/orders/[id]
/account/downloads
/account/returns             /account/returns/[id]
/account/cancellations
/account/profile
/account/addresses/billing   /account/addresses/shipping
/account/payments
/account/wishlist
/account/reviews
/account/notifications
/account/change-password
```

### Core Web Vitals Targets
| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID (First Input Delay) | < 100ms |

### Milestone ✅
> Site live on production domain with SSL; all CWV passing; GA4 ecommerce events firing; full QA regression complete.

---

## 🔌 Extensibility Guide — Adding Future Providers

This section documents exactly what a developer needs to do to add a new payment gateway or delivery partner after launch. The architecture built in Phase 3 makes each of these a self-contained task.

### Adding a New Payment Gateway (e.g. Razorpay, Cashfree, Mollie)

| Step | Action |
|---|---|
| 1 | Create `/lib/payments/adapters/[provider].ts` implementing the `PaymentProvider` interface |
| 2 | Implement `createSession()`, `verifyWebhook()`, and `refund()` methods |
| 3 | Register it in `/lib/payments/registry.ts` — one line: `registry.set('razorpay', new RazorpayAdapter())` |
| 4 | Add a row to the `payment_providers` table with `slug`, `name`, `is_active: false` |
| 5 | Add its env vars to `.env.local` and Vercel project settings |
| 6 | Enable it via the Admin → Payments → Provider Manager UI |
| 7 | Webhook events auto-route via the existing `/api/webhooks/[provider]` dynamic handler |

**Files touched:** 1 new adapter file + 1 registry line + 1 DB row. Core checkout unchanged.

---

### Adding a New Delivery Partner (e.g. FedEx, DHL, Shiprocket, EasyPost)

| Step | Action |
|---|---|
| 1 | Create `/lib/delivery/adapters/[courier].ts` implementing the `DeliveryProvider` interface |
| 2 | Implement `getRates()`, `createShipment()`, `trackShipment()`, and `cancelShipment()` |
| 3 | Register it in `/lib/delivery/registry.ts` — one line: `registry.set('fedex', new FedExAdapter())` |
| 4 | Add a row to the `delivery_providers` table with `slug`, `name`, `is_active: false` |
| 5 | Add its env vars to `.env.local` and Vercel project settings |
| 6 | Enable it via the Admin → Delivery → Provider Manager UI |
| 7 | Checkout's shipping-method step automatically shows rates from all active providers |

**Files touched:** 1 new adapter file + 1 registry line + 1 DB row. Checkout stepper unchanged.

---

### Provider Capability Matrix

Use this to track what each provider supports over time.

| Provider | Type | Rates | Checkout | Webhooks | Refunds | Tracking | Status |
|---|---|---|---|---|---|---|---|
| Stripe | Payment | — | ✅ | ✅ | ✅ | — | 🟢 Phase 3 |
| PayPal | Payment | — | ✅ | ✅ | ✅ | — | 🟢 Phase 3 |
| Razorpay | Payment | — | 🔲 Future | 🔲 Future | 🔲 Future | — | ⚪ Planned |
| Cashfree | Payment | — | 🔲 Future | 🔲 Future | 🔲 Future | — | ⚪ Planned |
| Flat Rate | Delivery | ✅ | ✅ | — | — | — | 🟢 Phase 3 |
| Shiprocket | Delivery | 🔲 Future | 🔲 Future | 🔲 Future | — | 🔲 Future | ⚪ Planned |
| FedEx | Delivery | 🔲 Future | 🔲 Future | 🔲 Future | — | 🔲 Future | ⚪ Planned |
| DHL | Delivery | 🔲 Future | 🔲 Future | 🔲 Future | — | 🔲 Future | ⚪ Planned |
| EasyPost | Delivery | 🔲 Future | 🔲 Future | 🔲 Future | — | 🔲 Future | ⚪ Planned |

---

| Dependency | Risk if Delayed | Mitigation |
|---|---|---|
| Supabase schema finalized in Phase 1 | All API routes in Phase 2+ are blocked | Finalize all tables before any API work begins |
| `payment_providers` & `delivery_providers` tables created in Phase 1 | Retrofit migrations break existing orders data | Design these tables alongside core schema in Phase 1 |
| Adapter interfaces locked before first provider is built | Stripe/PayPal code written without a contract, hard to generalize later | Define and review `PaymentProvider` + `DeliveryProvider` interfaces before writing any provider code |
| Stripe/PayPal credentials obtained | Checkout cannot be tested in Phase 3 | Obtain test API keys in Week 1 during setup |
| Cloudinary configuration | Product images and admin uploads broken | Set up and test uploads in Phase 1 |
| Next.js middleware (auth guards) | Unprotected admin/account routes in staging | Implement and test guards in Phase 1 |
| ISR strategy decided early | Cache invalidation issues at launch | Define revalidation rules alongside API design |
| Email provider configured | Order confirmations not sent to customers | Configure SMTP in Phase 3 alongside order flow |

---

## ✅ Launch Criteria — Definition of Done

The platform is production-ready when **all** of the following are met:

- [ ] All 50+ storefront and admin routes live and functional
- [ ] Stripe and PayPal payment flows tested end-to-end in production mode
- [ ] `PaymentProvider` and `DeliveryProvider` adapter interfaces finalized and documented in `AGENTS.md`
- [ ] `/api/webhooks/[provider]` dynamic router tested with Stripe and PayPal; confirmed extensible
- [ ] `payment_providers` and `delivery_providers` tables seeded; Admin provider manager UI working
- [ ] Flat-rate delivery adapter live; at least one real courier adapter scaffolded as a reference implementation
- [ ] Supabase RLS policies enforced; no unauthorized data access possible
- [ ] Core Web Vitals passing on mobile and desktop (LCP, CLS, FID targets met)
- [ ] Transactional emails delivered for order confirmation, shipping, and password reset
- [ ] GA4 ecommerce tracking firing correctly on purchase events
- [ ] Admin dashboard fully operational: products, orders, customers, inventory, blog, settings
- [ ] Custom domain live on Vercel with SSL; all environment variables verified
- [ ] Full QA regression completed with no critical or high-severity open bugs
- [ ] Developer README and admin user guide published in the repository

---

*Last updated: March 2026 — includes extensibility architecture for payment gateways and delivery partners*
