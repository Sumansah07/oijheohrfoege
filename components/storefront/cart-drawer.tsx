"use client"

import * as React from "react"
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/store/use-cart"
import { cn } from "@/lib/utils"

export function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems, isOpen, closeCart } = useCart()

    // Prevent scrolling when drawer is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [isOpen])

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closeCart}
            />

            {/* Drawer */}
            <aside
                className={cn(
                    "fixed right-0 top-0 z-[60] h-full w-full max-w-md bg-background shadow-2xl transition-transform duration-500 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-5">
                        <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-5 w-5" />
                            <h2 className="text-xl font-bold font-lufga">Your Cart ({totalItems()})</h2>
                        </div>
                        <button onClick={closeCart} className="rounded-full p-2 hover:bg-muted transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {items.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Your cart is empty</h3>
                                    <p className="text-sm text-muted-foreground">Start shopping to add items to your cart.</p>
                                </div>
                                <button
                                    onClick={closeCart}
                                    className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all"
                                >
                                    Browse Products
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex space-x-4">
                                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h4 className="text-sm font-bold leading-tight">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeItem(item.id, item.color, item.size)}
                                                        className="text-muted-foreground hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {(item.color || item.size) && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {item.color} {item.size && ` / ${item.size}`}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-sm font-bold">${item.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center border rounded-full px-2 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                                                        className="p-1 hover:text-primary"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                                                        className="p-1 hover:text-primary"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Subtotal</span>
                                <span className="text-xl font-bold font-lufga">${totalPrice().toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest text-center">
                                Taxes and shipping calculated at checkout
                            </p>
                            <div className="grid gap-3 pt-2">
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="flex h-14 items-center justify-center space-x-2 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary/90 active:scale-[0.98]"
                                >
                                    <span>Checkout</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={closeCart}
                                    className="flex h-14 items-center justify-center rounded-full border font-bold hover:bg-muted transition-all"
                                >
                                    View Full Cart
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
