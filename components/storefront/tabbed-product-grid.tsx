"use client"

import { useState } from "react"
import { ProductCard } from "@/components/shared/product-card"
import { motion, AnimatePresence } from "framer-motion"

interface TabbedProductGridProps {
    categories: any[]
    products: any[]
}

export function TabbedProductGrid({ categories, products }: TabbedProductGridProps) {
    const [activeTab, setActiveTab] = useState("ALL")

    const filteredProducts = activeTab === "ALL"
        ? products
        : products.filter(p => p.category.toUpperCase() === activeTab)

    const tabs = ["ALL", ...categories.map(c => c.name.toUpperCase())]

    return (
        <section className="container mx-auto px-4 py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-lufga text-gray-900 mb-2">Most Popular Products</h2>
                    <div className="h-1 w-20 bg-black rounded-full" />
                </div>

                <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <ProductCard {...product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </section>
    )
}
