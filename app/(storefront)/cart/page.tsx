"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/store/use-cart"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react"

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 lg:py-32">
                <div className="flex flex-col items-center justify-center space-y-8 text-center">
                    <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold font-lufga">Your cart is empty</h1>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto">
                            Looks like you haven't added anything to your cart yet. Explore our latest arrivals to find something you love.
                        </p>
                    </div>
                    <Link
                        href="/category/all"
                        className="rounded-full bg-primary px-10 py-4 text-base font-bold text-white hover:bg-primary/90 transition-all shadow-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Cart Items */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between border-b pb-8">
                        <h1 className="text-4xl font-bold font-lufga">Shopping Cart</h1>
                        <span className="text-lg text-muted-foreground font-medium">{totalItems()} items</span>
                    </div>

                    <div className="space-y-0 divide-y">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.color}-${item.size}`} className="py-8 first:pt-0 last:pb-0">
                                <div className="flex space-x-6">
                                    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold">{item.name}</h3>
                                                {(item.color || item.size) && (
                                                    <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                                                        {item.color} {item.size && ` / Size ${item.size}`}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.color, item.size)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-6 mt-4">
                                            <div className="flex items-center border-2 border-muted rounded-full px-3 py-1.5 bg-muted/20">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                                                    className="p-1 hover:text-primary transition-colors"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                                                    className="p-1 hover:text-primary transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <span className="text-sm font-bold">Total: ${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Trust Badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 mt-12 border-t font-lufga">
                        <div className="flex items-center space-x-4 p-6 rounded-2xl bg-muted/30">
                            <Truck className="h-8 w-8 text-primary" />
                            <div>
                                <h4 className="font-bold">Free Shipping</h4>
                                <p className="text-xs text-muted-foreground">On all orders over $150</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-6 rounded-2xl bg-muted/30">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                            <div>
                                <h4 className="font-bold">Secure Payment</h4>
                                <p className="text-xs text-muted-foreground">SSL Encrypted protection</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-6 rounded-2xl bg-muted/30">
                            <RotateCcw className="h-8 w-8 text-primary" />
                            <div>
                                <h4 className="font-bold">Easy Returns</h4>
                                <p className="text-xs text-muted-foreground">30-day money back guarantee</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-96">
                    <div className="rounded-3xl border bg-card p-10 shadow-xl space-y-8 sticky top-32">
                        <h2 className="text-2xl font-bold font-lufga">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-muted-foreground font-medium">
                                <span>Subtotal</span>
                                <span className="text-foreground">${totalPrice().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground font-medium">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold uppercase text-xs tracking-widest flex items-center">
                                    Calculated at next step
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground font-medium">
                                <span>Estimated Tax</span>
                                <span className="text-foreground">$0.00</span>
                            </div>
                            <div className="border-t pt-6 flex justify-between items-end">
                                <span className="text-lg font-bold">Total</span>
                                <div className="text-right">
                                    <span className="block text-3xl font-bold font-lufga">${totalPrice().toFixed(2)}</span>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1">USD (Included Tax)</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/checkout"
                                className="flex h-16 w-full items-center justify-center space-x-3 rounded-full bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02]"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRight className="h-6 w-6" />
                            </Link>
                            <Link
                                href="/category/all"
                                className="flex h-14 w-full items-center justify-center rounded-full border-2 font-bold transition-all hover:bg-muted"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        <div className="pt-4 flex flex-col items-center space-y-4">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">We Accept</p>
                            <div className="flex items-center space-x-4 grayscale opacity-60">
                                <img src="https://www.svgrepo.com/show/508728/visa.svg" className="h-6" alt="Visa" />
                                <img src="https://www.svgrepo.com/show/508696/mastercard.svg" className="h-8" alt="Mastercard" />
                                <img src="https://www.svgrepo.com/show/362018/paypal.svg" className="h-6" alt="PayPal" />
                                <img src="https://www.svgrepo.com/show/362021/stripe.svg" className="h-8" alt="Stripe" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
