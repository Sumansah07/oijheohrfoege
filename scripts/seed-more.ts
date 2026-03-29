import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env file
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '')
    }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('🚀 Starting seeding process...')

    // 1. Get Category IDs
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug')
    if (catError) {
        console.error('Error fetching categories:', catError)
        return
    }
    const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]))

    // 2. Add Banners
    console.log('Adding Banners...')
    const banners = [
        { title: 'Summer Collection 2026', subtitle: 'Discover our latest breezy styles for the sunny days ahead.', cta_text: 'Explore Summer', cta_link: '/category/all', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070', banner_type: 'hero', sort_order: 1 },
        { title: 'Premium Tech Essentials', subtitle: 'Elevate your daily carry with our curated accessory line.', cta_text: 'Shop Now', cta_link: '/category/accessories', image_url: 'https://images.unsplash.com/photo-1548036691-03291888b64e?q=80&w=2070', banner_type: 'hero', sort_order: 2 },
        { title: 'Limited Edition Footwear', subtitle: 'Crafted for comfort, designed for the bold.', cta_text: 'View Sneakers', cta_link: '/category/all', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070', banner_type: 'hero', sort_order: 3 }
    ]
    await supabase.from('banners').upsert(banners, { onConflict: 'title' })

    // 3. Add Products
    console.log('Adding Products...')
    const products = [
        // Men
        { name: 'Vintage Denim Jacket', slug: 'vintage-denim-jacket', description: 'A rugged, classic denim jacket with a slightly oversized fit and faded wash.', base_price: 120.00, discount_price: 150.00, featured_image: 'https://images.unsplash.com/photo-1576905341935-4ef2443449c0?q=80&w=800', images: ['https://images.unsplash.com/photo-1576905341935-4ef2443449c0?q=80&w=1200'], category_id: catMap['men'], is_active: true, is_featured: true, stock_quantity: 30, sku: 'DEN-001', metadata: { colors: ["Indigo", "Black"], sizes: ["M", "L", "XL"] } },
        { name: 'Graphic Streetwear Tee', slug: 'graphic-streetwear-tee', description: '100% heavyweight cotton tee with a custom artist print on the back.', base_price: 45.00, discount_price: null, featured_image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200'], category_id: catMap['men'], is_active: true, is_featured: false, stock_quantity: 100, sku: 'TEE-005', metadata: { colors: ["White", "Black"], sizes: ["S", "M", "L"] } },
        { name: 'Wool Blend Overcoat', slug: 'wool-blend-overcoat', description: 'Double-breasted overcoat crafted from a warm wool blend. Perfect for winter layering.', base_price: 299.00, discount_price: 350.00, featured_image: 'https://images.unsplash.com/photo-1539533377285-b824246a29f8?q=80&w=800', images: ['https://images.unsplash.com/photo-1539533377285-b824246a29f8?q=80&w=1200'], category_id: catMap['men'], is_active: true, is_featured: true, stock_quantity: 20, sku: 'COT-001', metadata: { colors: ["Camel", "Navy"], sizes: ["L", "XL"] } },
        { name: 'Suede Urban Sneakers', slug: 'suede-urban-sneakers', description: 'Premium suede sneakers with a cushioned sole for all-day comfort.', base_price: 115.00, discount_price: null, featured_image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800', images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200'], category_id: catMap['men'], is_active: true, is_featured: true, stock_quantity: 55, sku: 'SNK-002', metadata: { colors: ["Tan", "Grey"], sizes: ["40", "41", "42", "43"] } },
        // Women
        { name: 'Summer Floral Dress', slug: 'summer-floral-dress', description: 'Lightweight chiffon dress with a vibrant floral print and ruffled hem.', base_price: 79.00, discount_price: 95.00, featured_image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800', images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200'], category_id: catMap['women'], is_active: true, is_featured: true, stock_quantity: 40, sku: 'DRS-005', metadata: { colors: ["Floral", "Blue"], sizes: ["S", "M", "L"] } },
        { name: 'Suede Ankle Boots', slug: 'suede-ankle-boots', description: 'Elegant ankle boots with a manageable block heel and side zip.', base_price: 135.00, discount_price: 160.00, featured_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800', images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200'], category_id: catMap['women'], is_active: true, is_featured: false, stock_quantity: 25, sku: 'BT-002', metadata: { colors: ["Black", "Taupe"], sizes: ["37", "38", "39"] } },
        { name: 'Boho Maxi Skirt', slug: 'boho-maxi-skirt', description: 'Flowy maxi skirt with an ethnic print and elasticated waist.', base_price: 55.00, discount_price: null, featured_image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=800', images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=1200'], category_id: catMap['women'], is_active: true, is_featured: true, stock_quantity: 45, sku: 'SKR-003', metadata: { colors: ["Red Pattern", "Cream"], sizes: ["S", "M", "L"] } },
        // Accessories
        { name: 'Wireless PureSound Buds', slug: 'wireless-puresound-buds', description: 'Active noise cancelling wireless earbuds with 30-hour battery life.', base_price: 129.00, discount_price: 159.00, featured_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200'], category_id: catMap['accessories'], is_active: true, is_featured: true, stock_quantity: 70, sku: 'AUD-001', metadata: { colors: ["White", "Gunmetal"], sizes: ["One Size"] } },
        { name: 'Full-Grain Leather Belt', slug: 'full-grain-leather-belt', description: 'Classic leather belt with a solid brass buckle. Designed to age beautifully.', base_price: 49.00, discount_price: null, featured_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200'], category_id: catMap['accessories'], is_active: true, is_featured: false, stock_quantity: 85, sku: 'BLT-001', metadata: { colors: ["Brown", "Black"], sizes: ["32", "34", "36"] } },
        { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', description: 'Timeless aviator style with polarized lenses and gold frames.', base_price: 85.00, discount_price: 110.00, featured_image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1200'], category_id: catMap['accessories'], is_active: true, is_featured: true, stock_quantity: 40, sku: 'SUN-003', metadata: { colors: ["Gold", "Silver"], sizes: ["One Size"] } }
    ]
    await supabase.from('products').upsert(products, { onConflict: 'slug' })

    // 4. Add Blogs
    console.log('Adding Blogs...')
    const blogs = [
        { title: 'How to Style Oversized Jackets', slug: 'how-to-style-oversized-jackets', excerpt: 'Master the art of proportions with our guide to wearing oversized denim and leather.', content: '## Proportions are everything...\nWhen wearing an oversized jacket, try to keep the bottom half more fitted. Think slim jeans or tailored trousers.', featured_image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070', is_active: true },
        { title: 'Top 5 Accessories for 2026', slug: 'top-accessories-2026', excerpt: 'From tech-infused jewelry to the return of classic aviators, here is what is trending.', content: '## Accessories make the outfit...\nThis year, we are seeing a massive resurgence in functional tech that looks like high jewelry.', featured_image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080', is_active: true },
        { title: 'The Perfect Wardrobe: A Guide', slug: 'perfect-wardrobe-guide', excerpt: 'Building a wardrobe that works for you every day without the morning stress.', content: '## Start with the basics...\nEvery perfect wardrobe begins with high-quality basics. White tees, perfect denim, and a versatile blazer.', featured_image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071', is_active: true }
    ]
    await supabase.from('blogs').upsert(blogs, { onConflict: 'slug' })

    console.log('✅ Seeding completed successfully!')
}

seed().catch(console.error)
