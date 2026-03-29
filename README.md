# 🛒 Modern E-commerce Store — Development Guide

This is a premium, single-vendor e-commerce platform built with **Next.js 14 (App Router)**, **Supabase**, and **Tailwind CSS**.

## 🚀 Getting Started

Follow these steps to get the project running locally:

### 1. Install Dependencies
Run the following command in the project root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to a new file named `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the following credentials:
- **Supabase**: URL and Anon Key (from your Supabase project settings).
- **Cloudinary**: Cloud Name and Upload Preset (for image uploads).

### 3. Setup Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy the contents of [`supabase/setup.sql`](./supabase/setup.sql) and run it. This will create all necessary tables and RLS policies.

### 4. Run Development Server
```bash
npm run dev
```
The store will be available at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing the Storefront

Once the server is running, you can verify the implementation of Phases 1 & 2:

### 1. Storefront Discovery
- **Homepage**: Check the Hero Slider and Featured Arrivals.
- **Categories**: Visit `/category/men` or `/category/women` to see the product grid and filters.
- **Search**: Click the search icon or go to `/search?q=watch` to test the search results page.

### 2. Product Details
- Click on any product to see the **Product Detail Page (PDP)**.
- Test the interactive image gallery (Swiper.js) and variant selectors.

### 3. Authentication
- Visit `/login` and `/register` to see the auth forms.
- *Note: Auth logic is connected to Supabase; ensure your credentials are correct.*

### 4. Technical Checks
- **Sitemap**: Visit `/sitemap.xml` to see the dynamically generated SEO sitemap.
- **Middleware**: Try accessing `/admin` or `/account` without logging in to verify the redirects.

---

## 🛠️ Project Structure

- `/app`: Next.js App Router (Storefront, Account, Admin, APIs).
- `/components`: UI library and shared components.
- `/lib`: Supabase and Cloudinary client utilities.
- `/supabase`: Database migrations and setup scripts.
