"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { ProductCard } from "@/components/shared/product-card"
import { SortSelect } from "@/components/storefront/sort-select"

interface ProductListingProps {
    products: any[]
    count: number
}

export function ProductListing({ products, count }: ProductListingProps) {
    const [view, setView] = useState<"grid" | "list">("grid")

    return (
        <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Showing 1–{products.length} Of {count} Results
                </div>
                <div className="flex items-center gap-6">
                    <SortSelect />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView("list")}
                            className={`p-2 transition-colors ${view === "list" ? "text-black" : "text-gray-300 hover:text-black"}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={`p-2 transition-colors ${view === "grid" ? "text-black" : "text-gray-300 hover:text-black"}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid/List */}
            <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                : "flex flex-col gap-8"
            }>
                {products.map((p) => (
                    <ProductCard
                        key={p.id}
                        {...p}
                        layout={view}
                    />
                ))}
            </div>
        </div>
    )
}
