"use client"

import { useQuickView } from "@/store/use-quick-view"
import { useCart } from "@/store/use-cart"
import { useWishlist } from "@/store/use-wishlist"
import { toggleWishlistAction } from "@/app/actions/wishlist-actions"
import { X, Minus, Plus, ShoppingCart, Heart, Star, Twitter, Facebook, MessageSquare, Mail } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export function QuickViewModal() {
    const { isOpen, product, closeQuickView } = useQuickView()
    const { addItem, openCart } = useCart()
    const { itemIds, toggleItem } = useWishlist()
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)

    if (!isOpen || !product) return null

    const images = product.metadata?.images || [product.image]
    const rating = product.metadata?.rating || 4.5
    const reviewCount = product.metadata?.reviewCount || 10
    const sku = product.metadata?.sku || "PRT584E63A"
    const tags = product.metadata?.tags || ["Casual", "Athletic", "Workwear", "Accessories"]
    const colors = product.metadata?.colors || ["#000000", "#79B4B7", "#008080"]
    const sizes = product.metadata?.sizes || ["S", "M", "L", "XL"]

    const isWishlisted = itemIds.includes(product.id)

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: product.image,
            quantity: quantity,
            color: colors[0],
            size: sizes[0]
        })
        closeQuickView()
        openCart()
    }

    const handleWishlist = async () => {
        toggleItem(product.id)
        const res = await toggleWishlistAction(product.id)
        if (!res.success) {
            toggleItem(product.id)
        }
    }

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug || product.id}` : ''
    const shareText = `Check out this ${product.name} on our store!`

    const socialPlatforms = [
        { Icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, color: "hover:text-sky-400" },
        { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, color: "hover:text-blue-600" },
        { Icon: MessageSquare, href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, color: "hover:text-green-500" },
        { Icon: Mail, href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`, color: "hover:text-red-500" },
    ]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col md:flex-row">
                {/* Close Button */}
                <button
                    onClick={closeQuickView}
                    className="absolute right-6 top-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all border border-gray-100"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Left: Image Gallery */}
                <div className="w-full md:w-1/2 flex bg-gray-50 p-6 md:p-10 space-x-4">
                    {/* Thumbnails */}
                    <div className="flex flex-col space-y-3">
                        {images.slice(0, 4).map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent'}`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                    {/* Main Image */}
                    <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden">
                        <Image
                            src={images[activeImage] || product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                        {product.discountPrice && (
                            <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                SALE {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center overflow-y-auto">
                    <div className="space-y-6">
                        {/* Title & Rating */}
                        <div>
                            <h2 className="text-3xl font-bold font-lufga mb-2">{product.name}</h2>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 fill-current ${i >= Math.floor(rating) ? 'text-gray-200' : ''}`} />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-gray-600">{rating} Rating</span>
                                <span className="text-sm text-gray-400">({reviewCount} customer reviews)</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Experience premium quality with our "{product.name}". Carefully crafted for comfort and style, this piece represents the pinnacle of modern design. Perfect for any occasion.
                        </p>

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between py-6 border-y border-gray-100">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl font-bold">${(product.discountPrice || product.price).toFixed(2)}</span>
                                {product.discountPrice && (
                                    <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 space-x-4 border border-gray-100">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-1 hover:text-black transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-bold w-4 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-1 hover:text-black transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 h-14 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-black/10 font-lufga uppercase tracking-widest text-xs"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                <span>ADD TO CART</span>
                            </button>
                            <button
                                onClick={handleWishlist}
                                className={`w-14 h-14 flex items-center justify-center rounded-xl border transition-all ${isWishlisted ? 'bg-black border-black text-white' : 'border-gray-200 hover:border-black'}`}
                            >
                                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Meta */}
                        <div className="space-y-2 pt-6">
                            <div className="flex text-sm">
                                <span className="w-24 font-bold text-gray-800 uppercase text-[10px] tracking-widest">SKU:</span>
                                <span className="text-gray-500 font-medium">{sku}</span>
                            </div>
                            <div className="flex text-sm">
                                <span className="w-24 font-bold text-gray-800 uppercase text-[10px] tracking-widest">Category:</span>
                                <span className="text-gray-500 font-medium">{product.category}</span>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="flex space-x-5 pt-6 border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-center">Share:</span>
                            {socialPlatforms.map((platform, i) => (
                                <a
                                    key={i}
                                    href={platform.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-gray-400 transition-colors ${platform.color}`}
                                >
                                    <platform.Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
