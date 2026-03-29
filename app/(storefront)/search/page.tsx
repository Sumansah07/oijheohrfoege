import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { ProductListing } from "@/components/storefront/product-listing";
import { ChevronRight, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; sort?: string; min?: string; max?: string; color?: string | string[]; size?: string | string[] }
}) {
    const supabase = createClient();
    const queryTerm = searchParams.q || "";

    // Fetch categories for sidebar
    const { data: allCategories } = await supabase.from("categories").select("id, name, slug").eq("is_active", true);

    // Build search query
    let query = supabase
        .from("products")
        .select("id, slug, name, base_price, discount_price, featured_image, categories(name), metadata", { count: "exact" })
        .eq("is_active", true);

    if (queryTerm) {
        query = query.or(`name.ilike.%${queryTerm}%,description.ilike.%${queryTerm}%`);
    }

    if (searchParams.min) query = query.gte("base_price", parseFloat(searchParams.min));
    if (searchParams.max) query = query.lte("base_price", parseFloat(searchParams.max));

    // Color/Size filtering
    if (searchParams.color) {
        const colors = Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color]
        query = query.filter('metadata->>colors', 'cs', JSON.stringify(colors))
    }
    if (searchParams.size) {
        const sizes = Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size]
        query = query.filter('metadata->>sizes', 'cs', JSON.stringify(sizes))
    }

    const sort = searchParams.sort || "newest";
    if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "price_asc") query = query.order("base_price", { ascending: true });
    else if (sort === "price_desc") query = query.order("base_price", { ascending: false });

    const { data: products, count } = await query.limit(24);

    const mappedProducts = (products || []).map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.base_price,
        discountPrice: p.discount_price || undefined,
        image: p.featured_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        category: (p.categories as any)?.name || "General",
        isNew: false,
        metadata: p.metadata
    }));

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <div className="bg-[#F9F9F9] py-16 mb-12">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">
                        <Link href="/" className="hover:text-black transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-black">Search Results</span>
                    </nav>
                    <h1 className="text-5xl font-bold font-lufga text-gray-900 uppercase tracking-tight">
                        Results for "{queryTerm}"
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-24">
                <div className="flex flex-col lg:flex-row gap-0">
                    <FilterSidebar
                        categories={allCategories || []}
                        colors={["Black", "Navy", "Beige", "White", "Blue", "Grey", "Khaki", "Olive", "Camel", "Cream", "Burgundy"]}
                        sizes={["S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "XS", "One Size"]}
                    />

                    <div className="flex-1 lg:pl-10 mt-10 lg:mt-0">
                        {mappedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                                    <SearchIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-2xl font-bold font-lufga mb-4 uppercase">No products found</p>
                                <p className="text-gray-400 max-w-sm mb-10">We couldn't find any products matching your search query. Try different keywords.</p>
                                <Link href="/category/all" className="bg-black text-white px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform uppercase tracking-widest text-xs">
                                    Browse All Products
                                </Link>
                            </div>
                        ) : (
                            <ProductListing products={mappedProducts} count={count || 0} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
