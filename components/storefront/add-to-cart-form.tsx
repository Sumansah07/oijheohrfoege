"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/store/use-cart"

export function AddToCartForm({ product }: { product: any }) {
    const { addItem, openCart } = useCart()
    const metadata = product.metadata || {}
    const colors: string[] = metadata.colors || []
    const sizes: string[] = metadata.sizes || []

    const [selectedColor, setSelectedColor] = useState(colors[0] || "")
    const [selectedSize, setSelectedSize] = useState(sizes[0] || "")
    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.discount_price || product.base_price,
            image: product.featured_image || product.images?.[0] || "",
            quantity,
            color: selectedColor,
            size: selectedSize
        })
        openCart()
    }

    return (
        <div className="space-y-6">
            {/* Color Selector */}
            {colors.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-bold uppercase tracking-widest">
                        Color: <span className="text-muted-foreground font-medium">{selectedColor}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 border rounded-md text-sm font-bold transition-all ${selectedColor === color ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/50 text-muted-foreground'}`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest">Size</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`h-12 min-w-[4rem] px-3 border rounded-md font-bold text-sm transition-all ${selectedSize === size ? 'border-primary bg-primary text-white' : 'hover:border-primary hover:text-primary text-muted-foreground'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Qty & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center border rounded-full px-4 h-14 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full px-3 text-xl hover:text-primary">-</button>
                    <input type="number" readOnly value={quantity} className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold" />
                    <button onClick={() => setQuantity(quantity + 1)} className="h-full px-3 text-xl hover:text-primary">+</button>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="flex-1 rounded-full bg-primary text-white font-bold h-14 flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Bag</span>
                </button>
            </div>
        </div>
    )
}
