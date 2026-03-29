"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Eye, Star } from "lucide-react"
import { useCart } from "@/store/use-cart"
import { useWishlist } from "@/store/use-wishlist"
import { useQuickView } from "@/store/use-quick-view"
import { cn } from "@/lib/utils"
import { toggleWishlistAction } from "@/app/actions/wishlist-actions"

interface ProductCardProps {
    id: string
    slug?: string
    name: string
    price: number
    discountPrice?: number
    image: string
    category: string
    isNew?: boolean
    metadata?: any
    layout?: "grid" | "list"
}

export function ProductCard({ id, slug, name, price, discountPrice, image, category, isNew, metadata, layout = "grid" }: ProductCardProps) {
    const { addItem, openCart } = useCart()
    const { itemIds, toggleItem } = useWishlist()
    const { openQuickView } = useQuickView()

    const isWishlisted = itemIds.includes(id)
    const discountPercentage = discountPrice ? Math.round((1 - discountPrice / price) * 100) : null

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        const colors = metadata?.colors || []
        const sizes = metadata?.sizes || []

        addItem({
            id,
            name,
            price: discountPrice || price,
            image,
            quantity: 1,
            color: colors[0],
            size: sizes[0]
        })
        openCart()
    }

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        toggleItem(id)
        const res = await toggleWishlistAction(id)
        if (!res.success) {
            toggleItem(id)
        }
    }

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault()
        openQuickView({ id, slug, name, price, discountPrice, image, category, metadata })
    }

    if (layout === "list") {
        return (
            <div className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col sm:flex-row h-fit sm:h-64 border border-gray-100">
                <div className="relative w-full sm:w-64 aspect-square sm:aspect-auto overflow-hidden bg-[#F9F9F9] shrink-0">
                    <Link href={`/product/${slug || id}`} className="block h-full w-full">
                        <Image src={image} alt={name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    </Link>
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {discountPercentage && (
                            <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                GET {discountPercentage}% OFF
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-8 flex flex-col justify-center flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{category}</p>
                    <Link href={`/product/${slug || id}`} className="block mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 truncate hover:text-primary transition-colors font-lufga">{name}</h3>
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-2xl font-bold text-gray-900">${(discountPrice || price).toFixed(2)}</span>
                        {discountPrice && (
                            <span className="text-base font-medium text-gray-400 line-through">${price.toFixed(2)}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleQuickAdd} className="bg-black text-white px-8 h-12 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all font-lufga">Add to Cart</button>
                        <button onClick={handleWishlist} className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all ${isWishlisted ? 'bg-black border-black text-white' : 'hover:border-black'}`}><Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} /></button>
                        <button onClick={handleQuickView} className="w-12 h-12 flex items-center justify-center rounded-full border hover:border-black transition-all"><Eye className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9]">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {discountPercentage && (
                        <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            GET {discountPercentage}% OFF
                        </span>
                    )}
                    {isNew && (
                        <span className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gray-100 shadow-sm">
                            NEW
                        </span>
                    )}
                </div>

                {/* Overlay Icons */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    <button
                        onClick={handleWishlist}
                        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${isWishlisted ? 'bg-black text-white' : 'bg-white/80 text-gray-900 hover:bg-black hover:text-white'}`}
                    >
                        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleQuickAdd}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-gray-900 shadow-md backdrop-blur-md hover:bg-black hover:text-white transition-all"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </button>
                </div>

                {/* Main Link/Image */}
                <Link href={`/product/${slug || id}`} className="block h-full w-full">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                </Link>

                {/* Quick View Button (Bottom Slide) */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <button
                        onClick={handleQuickView}
                        className="w-full h-11 bg-black text-white rounded-full text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-xl hover:bg-gray-800 font-lufga"
                    >
                        <Eye className="h-4 w-4" />
                        Quick View
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className="p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{category}</p>
                <Link href={`/product/${slug || id}`} className="block mb-3">
                    <h3 className="text-base font-bold text-gray-900 truncate hover:text-primary transition-colors font-lufga">{name}</h3>
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">${(discountPrice || price).toFixed(2)}</span>
                    {discountPrice && (
                        <span className="text-sm font-medium text-gray-400 line-through">${price.toFixed(2)}</span>
                    )}
                </div>

                {/* Product Rating */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                            const initialRating = parseFloat(metadata?.initial_rating) || 5.0;
                            return (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-3 w-3",
                                        i < Math.floor(initialRating)
                                            ? "fill-primary text-primary"
                                            : (i < initialRating ? "fill-primary/50 text-primary" : "text-gray-200")
                                    )}
                                />
                            )
                        })}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                        {parseFloat(metadata?.initial_rating || "5.0").toFixed(1)}
                        ({metadata?.initial_reviews_count || 0})
                    </span>
                </div>
            </div>
        </div>
    )
}
