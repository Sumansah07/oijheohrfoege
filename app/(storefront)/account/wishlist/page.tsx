import { Grid3X3, List } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WishlistGrid } from "@/components/storefront/wishlist-grid"

export const revalidate = 0; // Ensure fresh data

export default async function AccountWishlistPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?next=/account/wishlist")
    }

    const { data: wishlists } = await supabase
        .from("wishlists")
        .select(`
            id,
            product_id,
            products (
                id,
                name,
                slug,
                base_price,
                discount_price,
                featured_image,
                images,
                stock_quantity,
                is_active
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    const wishlistItems = wishlists?.filter(w => w.products).map(w => {
        const p = w.products as any;
        return {
            wishlistId: w.id,
            productId: p.id,
            slug: p.slug,
            name: p.name,
            price: p.discount_price || p.base_price,
            image: p.featured_image || (p.images && p.images[0]) || "",
            inStock: p.stock_quantity > 0 && p.is_active
        }
    }) || []

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Wishlist</h1>
                    <p className="text-muted-foreground mt-1">Your curated collection of future favorites.</p>
                </div>
                <div className="flex items-center space-x-2 bg-muted/20 p-1.5 rounded-2xl border">
                    <button className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary"><Grid3X3 className="h-4 w-4" /></button>
                    <button className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary transition-colors"><List className="h-4 w-4" /></button>
                </div>
            </div>

            <WishlistGrid items={wishlistItems} />

            {/* Recommended Section Shortcut */}
            <div className="mt-12 p-8 bg-muted/10 border border-dashed rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex -space-x-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-14 w-14 rounded-full border-4 border-white overflow-hidden bg-muted shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=${i}`} className="h-full w-full object-cover" alt="User" />
                        </div>
                    ))}
                    <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm">
                        +420
                    </div>
                </div>
                <div className="text-center md:text-left flex-1 px-4">
                    <h5 className="text-lg font-bold font-lufga">Trending items from your circles</h5>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Most people who liked your collection also added <span className="text-primary italic font-bold underline">Wool Blended Skirts</span> to their wishlist.</p>
                </div>
                <button className="h-12 px-8 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all shrink-0">
                    View Trends
                </button>
            </div>
        </div>
    )
}
