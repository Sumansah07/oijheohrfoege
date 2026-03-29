"use client"

import { Truck, ShieldCheck, Clock, Zap, Star, Heart, Package, CreditCard, RotateCcw, Headphones, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const IconMap: Record<string, LucideIcon> = {
    Truck,
    ShieldCheck,
    Clock,
    Zap,
    Star,
    Heart,
    Package,
    CreditCard,
    RotateCcw,
    Headphones
}

const defaultFeatures = [
    {
        icon: "Truck",
        title: "Fast Delivery",
        desc: "Standard & Express options"
    },
    {
        icon: "ShieldCheck",
        title: "Secure Payment",
        desc: "Stripe & PayPal integrated"
    },
    {
        icon: "Clock",
        title: "24/7 Support",
        desc: "Always here to help you"
    },
    {
        icon: "Zap",
        title: "Easy Returns",
        desc: "14-day return policy"
    }
]

export function FeatureMarquee({ features }: { features?: any }) {
    // Handle both old array format and new object format
    const isObject = features && !Array.isArray(features)
    const displayFeatures = isObject ? (features.items || []) : (features || defaultFeatures)
    const style = isObject ? (features.style || {}) : { speed: 40, height: 100, bg_type: 'solid', bg_color: '#000000', text_color: '#ffffff' }

    const bgStyle = style.bg_type === 'gradient'
        ? { background: style.bg_gradient || 'linear-gradient(to right, #000, #111)' }
        : style.bg_type === 'glass'
            ? { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }
            : { backgroundColor: style.bg_color || '#000000' }

    return (
        <section
            style={{
                ...bgStyle,
                height: `${style.height || 100}px`
            }}
            className={cn(
                "w-full flex items-center overflow-hidden border-y border-white/5",
                style.bg_type === 'glass' ? "border-white/10 shadow-2xl" : ""
            )}
        >
            <motion.div
                animate={{ x: [0, -2000] }}
                transition={{
                    duration: style.speed || 40,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="flex whitespace-nowrap items-center h-full"
            >
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-24 px-12 items-center h-full">
                        {displayFeatures.map((item: any, idx: number) => {
                            const Icon = IconMap[item.icon as keyof typeof IconMap] || Zap
                            return (
                                <div key={idx} className="flex items-center space-x-8 group shrink-0">
                                    {item.icon && (
                                        <div
                                            style={{
                                                backgroundColor: `${style.accent_color || '#ff3366'}15`,
                                                borderColor: `${style.accent_color || '#ff3366'}30`
                                            }}
                                            className="w-16 h-16 rounded-3xl flex items-center justify-center text-white border transition-all duration-500 group-hover:bg-primary group-hover:border-primary group-hover:scale-110 group-hover:rotate-6 shadow-sm"
                                        >
                                            <Icon
                                                className="w-8 h-8"
                                                style={{ color: style.accent_color || '#ff3366' }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col justify-center">
                                        <h4
                                            style={{
                                                color: style.text_color || '#ffffff',
                                                fontSize: `${style.font_size || 14}px`
                                            }}
                                            className="font-black uppercase tracking-widest group-hover:text-primary transition-colors duration-500 leading-tight"
                                        >
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </motion.div>
        </section>
    )
}
