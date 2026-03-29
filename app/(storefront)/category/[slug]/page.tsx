import { Metadata } from "next"
import { FilterSidebar } from "@/components/storefront/filter-sidebar"
import { ProductListing } from "@/components/storefront/product-listing"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { cn } from "@/lib/utils"

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = createClient()
    const { data: category } = await supabase.from("categories").select("name, description").eq("slug", params.slug).single()
    const name = category?.name || (params.slug === "all" ? "All Products" : params.slug.charAt(0).toUpperCase() + params.slug.slice(1))
    return {
        title: `${name} | Store`,
        description: category?.description || `Explore our ${name} collection`,
    }
}

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: { slug: string }
    searchParams: { sort?: string; min?: string; max?: string; q?: string; color?: string | string[]; size?: string | string[] }
}) {
    const supabase = createClient()
    const isAll = params.slug === "all"

    // Fetch initial data in parallel
    const [
        { data: allCategories },
        { data: filterData },
        categoryResult
    ] = await Promise.all([
        supabase.from("categories").select("id, name, slug").eq("is_active", true),
        supabase.from("products").select("metadata").eq("is_active", true),
        !isAll 
            ? supabase.from("categories").select("id, name, description").eq("slug", params.slug).single() 
            : Promise.resolve({ data: null, error: null } as any)
    ]);

    let currentCategoryName = "All Products"
    let currentCategoryId: string | null = null
    
    if (!isAll) {
        const cat = categoryResult.data
        if (!cat) notFound()
        currentCategoryName = cat.name
        currentCategoryId = cat.id
    }

    const allColors = Array.from(new Set((filterData || [])
        .flatMap(p => p.metadata?.colors || [])))
        .sort() as string[];

    const allSizes = Array.from(new Set((filterData || [])
        .flatMap(p => p.metadata?.sizes || [])))
        .sort() as string[];

    // Build products query
    let query = supabase
        .from("products")
        .select("id, slug, name, base_price, discount_price, featured_image, categories(name), metadata", { count: "exact" })
        .eq("is_active", true)

    if (currentCategoryId) query = query.eq("category_id", currentCategoryId)
    if (searchParams.min) query = query.gte("base_price", parseFloat(searchParams.min))
    if (searchParams.max) query = query.lte("base_price", parseFloat(searchParams.max))
    if (searchParams.q) query = query.ilike("name", `%${searchParams.q}%`)

    // Color/Size filtering
    if (searchParams.color) {
        const colors = Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color]
        query = query.filter('metadata->>colors', 'cs', JSON.stringify(colors))
    }
    if (searchParams.size) {
        const sizes = Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size]
        query = query.filter('metadata->>sizes', 'cs', JSON.stringify(sizes))
    }

    const sort = searchParams.sort || "newest"
    if (sort === "newest") query = query.order("created_at", { ascending: false })
    else if (sort === "price_asc") query = query.order("base_price", { ascending: true })
    else if (sort === "price_desc") query = query.order("base_price", { ascending: false })

    // Fetch products and banner in parallel
    const [
        { data, count },
        bannerResult
    ] = await Promise.all([
        query.limit(24),
        currentCategoryId 
            ? supabase.from("banners").select("*").eq("category_id", currentCategoryId).eq("is_active", true).order("sort_order").limit(1).single()
            : Promise.resolve({ data: null, error: null } as any)
    ]);

    const categoryBanner = bannerResult.data

    const mappedProducts = (data || []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.base_price,
        discountPrice: p.discount_price || undefined,
        image: p.featured_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        category: p.categories?.name || currentCategoryName,
        isNew: false,
        metadata: p.metadata
    }))

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <div className={cn(
                "relative py-20 mb-12 overflow-hidden min-h-[400px] flex flex-col justify-center",
                !categoryBanner && "bg-[#F9F9F9]"
            )}>
                {categoryBanner && (
                    <>
                        <div className="absolute inset-0 z-0">
                            <img src={categoryBanner.image_url} alt={categoryBanner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    </>
                )}

                <div className="container mx-auto px-4 relative z-10">
                    <nav className={cn(
                        "flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] mb-6",
                        categoryBanner ? "text-white/60" : "text-gray-400"
                    )}>
                        <Link href="/" className="hover:text-black transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className={categoryBanner ? "text-white" : "text-black"}>{currentCategoryName}</span>
                    </nav>

                    {categoryBanner ? (
                        <div className="max-w-2xl">
                            <h1 className="text-6xl font-bold font-lufga text-white uppercase tracking-tight mb-4 leading-tight">
                                {categoryBanner.title}
                            </h1>
                            {categoryBanner.subtitle && (
                                <p className="text-xl text-white/80 font-medium mb-8">
                                    {categoryBanner.subtitle}
                                </p>
                            )}
                            {categoryBanner.cta_text && (
                                <Link
                                    href={categoryBanner.cta_link || "#"}
                                    className="inline-flex h-14 px-10 rounded-full bg-primary text-white font-bold items-center justify-center hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                >
                                    {categoryBanner.cta_text}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <h1 className="text-6xl font-bold font-lufga text-gray-900 uppercase tracking-tight">
                            {currentCategoryName}
                        </h1>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 pb-24">
                <div className="flex flex-col lg:flex-row gap-0">
                    <FilterSidebar
                        categories={allCategories || []}
                        colors={allColors}
                        sizes={allSizes}
                    />
                    <div className="flex-1 lg:pl-10 mt-10 lg:mt-0">
                        <ProductListing products={mappedProducts} count={count || 0} />
                    </div>
                </div>
            </div>
        </div>
    )
}
