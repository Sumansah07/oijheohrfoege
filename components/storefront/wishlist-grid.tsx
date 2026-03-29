"use client"

import { useState } from "react"
import { ShoppingCart, Trash2, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/store/use-cart"
import { useWishlist } from "@/store/use-wishlist"
import { toggleWishlistAction } from "@/app/actions/wishlist-actions"

interface WishlistGridProps {
    items: any[]
}

export function WishlistGrid({ items: initialItems }: WishlistGridProps) {
    const [items, setItems] = useState(initialItems)
    const { addItem, openCart } = useCart()
    const { toggleItem } = useWishlist()

    const handleRemove = async (productId: string) => {
        // Optimistic UI updates
        setItems(items.filter(i => i.productId !== productId))
        toggleItem(productId)

        // Backend sync
        await toggleWishlistAction(productId)
    }

    const handleMoveToCart = async (item: any) => {
        addItem({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
        })
        openCart()
        await handleRemove(item.productId)
    }

    function cn(...args: any[]) {
        return args.filter(Boolean).join(" ")
    }

    if (items.length === 0) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold font-lufga">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground mt-2">Explore our collection and save items you love!</p>
                </div>
                <Link href="/" className="h-14 px-10 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                    <span>Start Shopping</span>
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
                <div key={item.productId} className="bg-card border rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                        <img src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                        <button
                            onClick={() => handleRemove(item.productId)}
                            className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        {!item.inStock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="px-4 py-2 bg-muted text-foreground font-bold text-[10px] uppercase tracking-widest rounded-full border shadow-sm">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <Link href={`/product/${item.slug}`}>
                                <h3 className="text-lg font-bold font-lufga group-hover:text-primary transition-colors">{item.name}</h3>
                            </Link>
                            <p className="text-sm font-bold text-muted-foreground mt-1 italic">${Number(item.price).toFixed(2)}</p>
                        </div>

                        <button
                            disabled={!item.inStock}
                            onClick={() => handleMoveToCart(item)}
                            className={cn(
                                "w-full h-12 rounded-xl border flex items-center justify-center space-x-2 font-bold text-sm transition-all",
                                item.inStock
                                    ? "border-primary text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5"
                                    : "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Move to Cart</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
