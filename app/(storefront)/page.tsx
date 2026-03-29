import { HeroSlider } from "@/components/storefront/hero-slider"
import { TabbedProductGrid } from "@/components/storefront/tabbed-product-grid"
import { FeatureMarquee } from "@/components/storefront/feature-marquee"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { proxyImageUrl } from "@/lib/image-proxy"

export default async function StorefrontHome() {
    const supabase = createClient()

    // Fetch all live data in parallel
    let [
        { data: heroBanners },
        { data: secondaryBanners },
        { data: categories },
        { data: featuredProducts }
    ] = await Promise.all([
        supabase.from("banners").select("*").eq("is_active", true).eq("banner_type", "hero").order("sort_order"),
        supabase.from("banners").select("*").eq("is_active", true).eq("banner_type", "secondary").order("sort_order").limit(1).maybeSingle(),
        supabase.from("categories").select("id, name, slug, image_url").eq("is_active", true).eq("is_featured_on_homepage", true).limit(3),
        supabase.from("products").select("id, slug, name, base_price, discount_price, featured_image, categories(name), metadata").eq("is_active", true).eq("is_featured", true).limit(12)
    ])

    // Fallback for categories: if none featured, take any 3 active ones
    if (!categories || categories.length === 0) {
        const { data: fallbackCategories } = await supabase
            .from("categories")
            .select("id, name, slug, image_url")
            .eq("is_active", true)
            .limit(3)
        categories = fallbackCategories
    }

    // Fallback for products: if none featured, take any 12 active ones
    if (!featuredProducts || featuredProducts.length === 0) {
        const { data: fallbackProducts } = await supabase
            .from("products")
            .select("id, slug, name, base_price, discount_price, featured_image, categories(name), metadata")
            .eq("is_active", true)
            .limit(12)
        featuredProducts = fallbackProducts
    }

    const displayCategories = categories || [];
    const mappedProducts = (featuredProducts || []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.base_price,
        discountPrice: p.discount_price || undefined,
        image: p.featured_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        category: p.categories?.name || "General",
        isNew: false,
        metadata: p.metadata
    }));

    // Fetch site settings for marquee
    const { data: siteSettings } = await supabase.from("site_settings").select("marquee_config").single()

    return (
        <div className="flex flex-col">
            {/* Hero Slider */}
            <HeroSlider banners={heroBanners || []} />

            {/* Stylish Feature Marquee */}
            <FeatureMarquee features={siteSettings?.marquee_config} />

            {/* Categories Collection */}
            <section className="container mx-auto px-4 py-24">
                <div className="flex flex-col items-center text-center mb-16">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Discover More</span>
                    <h2 className="text-5xl font-bold font-lufga text-gray-900 mb-6 uppercase">The Collections</h2>
                    <div className="h-1.5 w-24 bg-black rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayCategories.map((cat, idx) => (
                        <Link
                            key={cat.slug}
                            href={`/category/${cat.slug}`}
                            className={`group relative h-[600px] overflow-hidden rounded-[40px] shadow-2xl ${idx === 1 ? 'md:-translate-y-8' : ''}`}
                        >
                            <img
                                src={proxyImageUrl(cat.image_url)}
                                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                alt={cat.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-12 text-center">
                                <h3 className="text-white text-3xl font-bold font-lufga uppercase tracking-widest mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{cat.name}</h3>
                                <div className="h-0.5 w-0 group-hover:w-16 bg-white transition-all duration-500 mb-6" />
                                <span className="bg-white text-black text-[10px] font-bold px-6 py-3 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:bg-gray-100">
                                    Explore Now
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="mt-20 flex justify-center">
                    <Link
                        href="/category/all"
                        className="group flex items-center space-x-4 h-16 px-12 rounded-full border-2 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-500"
                    >
                        <span>View All Collections</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
                    </Link>
                </div>
            </section>

            {/* Popular Products with Tabs */}
            <TabbedProductGrid categories={displayCategories} products={mappedProducts} />

            {/* Dynamic Secondary Banner */}
            {secondaryBanners && (
                <section className="container mx-auto px-4 py-12">
                    <div className="relative h-[500px] overflow-hidden rounded-[50px] group shadow-2xl">
                        <img
                            src={proxyImageUrl(secondaryBanners.image_url)}
                            className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                            alt={secondaryBanners.title}
                        />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white p-12">
                            <span className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-8">Special Offer</span>
                            <h2 className="text-6xl md:text-8xl font-bold font-lufga mb-8 uppercase tracking-tighter shadow-sm">{secondaryBanners.title}</h2>
                            <p className="max-w-2xl text-lg md:text-xl font-medium mb-12 opacity-90 leading-relaxed">{secondaryBanners.subtitle}</p>
                            <div className="flex gap-4">
                                <Link href={secondaryBanners.cta_link || "/category/all"} className="bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform uppercase tracking-widest text-sm shadow-xl">{secondaryBanners.cta_text || "Shop Now"}</Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
