import { Metadata } from "next";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductCard } from "@/components/shared/product-card";
import { ProductReviews } from "@/components/storefront/reviews";
import { Star, Heart, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/storefront/add-to-cart-form";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const supabase = createClient();
    const { data: product } = await supabase.from("products").select("name, description, featured_image").eq("slug", params.slug).single();

    if (!product) return { title: "Product Not Found" };

    return {
        title: `${product.name} | Elaric Store`,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.featured_image ? [{ url: product.featured_image }] : [],
        },
    };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();

    const { data: product } = await supabase
        .from("products")
        .select(`
            *,
            categories (name, slug)
        `)
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();

    if (!product) notFound();

    // Fetch Review Statistics and Related Products in parallel
    const [
        { data: reviewsData },
        { data: relatedProducts }
    ] = await Promise.all([
        supabase.from("reviews").select("rating").eq("product_id", product.id).eq("status", "approved"),
        supabase.from("products")
            .select("id, slug, name, base_price, discount_price, featured_image, categories(name), metadata")
            .eq("category_id", product.category_id)
            .eq("is_active", true)
            .neq("id", product.id)
            .limit(4)
    ]);

    const actualCount = reviewsData?.length || 0;
    const actualSum = reviewsData?.reduce((acc, r) => acc + (r.rating || 0), 0) || 0;

    const initialRating = parseFloat(product.metadata?.initial_rating) || 5.0;
    const initialCount = parseInt(product.metadata?.initial_reviews_count) || 0;

    const totalCount = actualCount + initialCount;
    const averageRating = totalCount > 0
        ? (actualSum + (initialRating * initialCount)) / totalCount
        : initialRating;

    const images = product.images && product.images.length > 0 ? product.images : (product.featured_image ? [product.featured_image] : []);
    const categoryName = (product.categories as any)?.name || "Uncategorized";

    const mappedRelated = (relatedProducts || []).map((p: any) => ({
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
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Gallery */}
                <ProductGallery images={images} />

                {/* Product Details */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Link href={`/category/${(product.categories as any)?.slug || "all"}`} className="text-sm font-bold uppercase tracking-widest text-primary hover:underline">
                            {categoryName}
                        </Link>
                        <h1 className="text-4xl font-bold font-lufga">{product.name}</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-4 w-4",
                                            i < Math.floor(averageRating)
                                                ? "fill-primary text-primary"
                                                : (i < averageRating ? "fill-primary/50 text-primary" : "text-muted")
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{averageRating.toFixed(1)} ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-3xl font-bold font-lufga">${(product.discount_price || product.base_price).toFixed(2)}</span>
                            {product.discount_price && (
                                <span className="text-lg text-muted-foreground line-through">${product.base_price.toFixed(2)}</span>
                            )}
                            {product.discount_price && (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">Sale</span>
                            )}
                        </div>
                    </div>

                    {product.description && (
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {/* Add to Cart Form handles variants and quantity */}
                    <AddToCartForm product={product} />

                    {/* Custom Attributes */}
                    {product.metadata?.attributes && product.metadata.attributes.length > 0 && (
                        <div className="border-t pt-8 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Specifications</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                                {product.metadata.attributes.map((attr: { key: string; value: string }, i: number) => (
                                    <div key={i} className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{attr.key}</span>
                                        <span className="text-xs font-medium text-gray-900">{attr.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-8">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary"><Truck className="h-5 w-5" /></div>
                            <span className="text-xs font-bold uppercase tracking-tight">Free Shipping</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary"><RotateCcw className="h-5 w-5" /></div>
                            <span className="text-xs font-bold uppercase tracking-tight">30 Day Returns</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-primary"><ShieldCheck className="h-5 w-5" /></div>
                            <span className="text-xs font-bold uppercase tracking-tight">Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Related Products */}
            {mappedRelated.length > 0 && (
                <div className="mt-20 space-y-8">
                    <h2 className="text-3xl font-bold font-lufga">You May Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {mappedRelated.map((p) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                </div>
            )}

            <ProductReviews productId={product.id} />
        </div>
    );
}
