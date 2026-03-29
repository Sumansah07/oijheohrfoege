# 🛒 Single-Vendor Ecommerce — Project Outline

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | Next.js API Routes (Serverless Node.js) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Image Storage | Cloudinary |
| Payments | Stripe / PayPal / Local Gateways |
| Carousel/Slider | Swiper.js |
| Fonts | Poppins, Lufga (Cufonfonts) |

---

## Project Structure

```
/
├── app/                        # Next.js App Router
│   ├── (storefront)/           # Public-facing pages
│   ├── account/                # Customer account pages
│   └── admin/                  # Admin dashboard pages
├── components/                 # Shared UI components
├── lib/                        # Utilities, helpers, API clients
├── hooks/                      # Custom React hooks
├── store/                      # State management (Zustand / Context)
├── types/                      # TypeScript types/interfaces
├── supabase/                   # DB schema & migrations
└── public/                     # Static assets
```

---

## 1. Storefront (Customer-Facing Pages)

### 🏠 Homepage — `/`
- Hero banner / Hero slider (Swiper.js)
- Category grid
- Featured products
- Trending products
- Deals / Flash sale with countdown timer
- Newsletter signup

### 🗂️ Product Listing Pages
| Page | Route |
|---|---|
| Category | `/category/[slug]` |
| Subcategory | `/category/[parent]/[child]` |
| Search | `/search?q=...` |
| Collection | `/collection/[slug]` |
| Brand | `/brand/[slug]` *(optional)* |

**Filter Options (sidebar):**
- Search within results
- Price range (Min / Max slider)
- Color
- Size
- Category
- Tags
- Sorting (price, newest, popularity)
- Pagination

### 📦 Product Page — `/product/[slug]`
- Product image gallery (Swiper.js)
- Price & discount badge
- Variant selector (color, size)
- Quantity selector
- Add to Cart / Wishlist
- Product description & specifications
- Customer reviews & ratings
- Related products

### 🛒 Cart & Checkout
| Page | Route |
|---|---|
| Cart | `/cart` |
| Checkout | `/checkout` |
| Order Success | `/order/success` |
| Order Failure | `/order/failure` |

**Checkout Steps:**
1. Shipping address
2. Shipping method selection
3. Payment (Stripe / PayPal / Local)
4. Order summary & confirmation

### ℹ️ Informational Pages
| Page | Route |
|---|---|
| About | `/about` |
| Contact | `/contact` |
| FAQ | `/faq` |
| Blog List | `/blog` |
| Blog Post | `/blog/[slug]` |
| Privacy Policy | `/privacy-policy` |
| Terms & Conditions | `/terms` |
| Refund Policy | `/refund-policy` |

### 🔐 Authentication Pages
| Page | Route |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password` |

---

## 2. Customer Account Pages — `/account/*`

| Page | Route |
|---|---|
| Dashboard | `/account/dashboard` |
| Orders List | `/account/orders` |
| Order Details | `/account/orders/[id]` |
| Order Confirmation | `/account/orders/[id]/confirmation` |
| Downloads | `/account/downloads` |
| Return Request | `/account/returns` |
| Return Request Detail | `/account/returns/[id]` |
| Return Confirmed | `/account/returns/[id]/confirmed` |
| Cancellation Requests | `/account/cancellations` |
| Profile | `/account/profile` |
| Address Book | `/account/addresses` |
| Billing Address | `/account/addresses/billing` |
| Shipping Address | `/account/addresses/shipping` |
| Shipping Methods | `/account/shipping-methods` |
| Payment Methods | `/account/payments` |
| Wishlist | `/account/wishlist` |
| My Reviews | `/account/reviews` |
| Notifications | `/account/notifications` |
| Change Password | `/account/change-password` |

---

## 3. Admin Dashboard Pages — `/admin/*`

### 📊 Dashboard — `/admin/dashboard`
- Revenue overview (charts)
- Orders summary
- Traffic analytics
- Top products
- Recent activity

### 📦 Product Management
| Page | Route |
|---|---|
| All Products | `/admin/products` |
| Add Product | `/admin/products/new` |
| Edit Product | `/admin/products/[id]` |
| Product Variants | `/admin/products/[id]/variants` |
| Product Reviews | `/admin/reviews` |

### 🗂️ Category Management
| Page | Route |
|---|---|
| All Categories | `/admin/categories` |
| Add Category | `/admin/categories/new` |
| Edit Category | `/admin/categories/[id]` |

### 🧾 Orders
| Page | Route |
|---|---|
| Orders List | `/admin/orders` |
| Order Details | `/admin/orders/[id]` |

**Order Statuses:** `pending` → `processing` → `shipped` → `delivered` / `cancelled`

### 👥 Customers
| Page | Route |
|---|---|
| Customers List | `/admin/customers` |
| Customer Details | `/admin/customers/[id]` |

### 🎟️ Coupons & Discounts
| Page | Route |
|---|---|
| Coupons List | `/admin/coupons` |
| Add Coupon | `/admin/coupons/new` |
| Discounts | `/admin/discounts` |

### 🗃️ Inventory — `/admin/inventory`
- Stock levels
- Low stock alerts
- Bulk update

### 🚚 Shipping — `/admin/shipping`
- Shipping zones
- Shipping cost rules
- Delivery methods

### 💳 Payments — `/admin/payments`
- Stripe configuration
- PayPal configuration
- Local gateway management

### 🧾 Taxes — `/admin/taxes`

### 📝 CMS Pages — `/admin/pages`
- Create/Edit: About, Privacy Policy, Terms & Conditions, Refund Policy

### 📰 Blog
| Page | Route |
|---|---|
| Posts | `/admin/blog/posts` |
| Add Post | `/admin/blog/posts/new` |
| Post Authors | `/admin/blog/authors` |
| Post Categories | `/admin/blog/categories` |

### 🖼️ Media Manager — `/admin/media`
- Upload images/videos via Cloudinary
- Media library & organisation

### 📈 Analytics — `/admin/analytics`
- Revenue over time
- Conversion rates
- Top products & categories

### ⚙️ Settings

| Section | Route |
|---|---|
| Account Settings | `/admin/settings/account` |
| User Management | `/admin/settings/users` |
| Store Settings | `/admin/settings/store` |
| Email / SMTP | `/admin/settings/email` |
| SEO Settings | `/admin/settings/seo` |
| Header Settings | `/admin/settings/header` |
| Hero Banner | `/admin/settings/hero-banner` |
| Hero Slider | `/admin/settings/hero-slider` |
| Countdown Timer | `/admin/settings/countdown` |
| Privacy Policy | `/admin/settings/privacy-policy` |
| Terms & Conditions | `/admin/settings/terms` |
| API Keys (Stripe, PayPal, Google) | `/admin/settings/api-keys` |

### 🔔 Notifications — `/admin/notifications`

---

## 4. Database Schema (High-Level)

### Core Tables
- `users` — Auth via Supabase, roles: `customer` / `admin`
- `products` — name, slug, description, price, stock, images (Cloudinary URLs)
- `product_variants` — color, size, SKU, stock per variant
- `categories` — parent/child hierarchy, slug
- `orders` — user_id, status, total, shipping info
- `order_items` — order_id, product_id, variant_id, quantity, price
- `cart` — user_id or session_id, items
- `reviews` — user_id, product_id, rating, body
- `coupons` — code, discount type, value, expiry
- `addresses` — user_id, type (billing/shipping), details
- `blog_posts` — title, slug, content, author_id, category_id
- `returns` — order_id, reason, status
- `cancellations` — order_id, reason, status
- `wishlists` — user_id, product_id

---

## 5. Key Components

### Storefront
- `<Navbar />` — search, cart icon, user menu
- `<HeroSlider />` — Swiper.js hero banner
- `<ProductCard />` — image, name, price, add to cart
- `<ProductGallery />` — Swiper.js image viewer
- `<FilterSidebar />` — price range, color, size, category, tags
- `<CartDrawer />` — slide-out cart
- `<CheckoutStepper />` — multi-step checkout
- `<ReviewForm />` — star rating + text
- `<CountdownTimer />` — for deals/flash sales
- `<Newsletter />` — email capture

### Admin
- `<AdminSidebar />` — navigation
- `<DataTable />` — sortable, filterable tables
- `<ProductForm />` — add/edit product with variant manager
- `<ImageUploader />` — Cloudinary drag & drop
- `<OrderStatusBadge />` — color-coded status
- `<AnalyticsChart />` — revenue & conversion graphs
- `<RichTextEditor />` — for blog & CMS pages

---

## 6. API Routes — `/app/api/`

```
/api/auth/          — Supabase auth helpers
/api/products/      — CRUD products
/api/categories/    — CRUD categories
/api/cart/          — Cart operations
/api/orders/        — Create & manage orders
/api/checkout/      — Stripe / PayPal session
/api/webhooks/      — Stripe & PayPal webhooks
/api/reviews/       — Submit & fetch reviews
/api/coupons/       — Validate & apply coupons
/api/returns/       — Return requests
/api/cancellations/ — Cancellation requests
/api/admin/         — Admin-only protected routes
/api/upload/        — Cloudinary image upload
/api/blog/          — Blog CRUD
/api/search/        — Full-text product search
```

---

## 7. Auth & Access Control

- **Supabase Auth** — email/password, OAuth (Google)
- **Roles:** `customer`, `admin`
- **Middleware** — Next.js middleware to protect `/account/*` and `/admin/*`
- **Row-Level Security (RLS)** — Supabase policies per table

---

## 8. Third-Party Integrations

| Service | Purpose |
|---|---|
| Supabase | Database + Auth |
| Cloudinary | Image/video storage & CDN |
| Stripe | Card payments + webhooks |
| PayPal | Alternative checkout |
| Swiper.js | Carousels & sliders |
| Google Analytics | Traffic & conversion tracking |
| SMTP (Resend / SendGrid) | Transactional emails |

---

## 9. SEO & Performance

- Next.js `generateMetadata()` per page
- Dynamic `sitemap.xml` & `robots.txt`
- Open Graph tags for social sharing
- Image optimization via `next/image` + Cloudinary
- ISR (Incremental Static Regeneration) for product & category pages
- Core Web Vitals optimized

---

## 10. Deployment

- **Hosting:** Vercel (Next.js optimized)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Cloudinary + Vercel Edge Network
- **Environment Variables:** `.env.local` for all API keys
