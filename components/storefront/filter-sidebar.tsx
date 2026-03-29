"use client"

import { Search, X } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface FilterSidebarProps {
    categories: any[]
    colors: string[]
    sizes: string[]
}

export function FilterSidebar({ categories, colors, sizes }: FilterSidebarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

    // Update URL helper
    const createQueryString = useCallback(
        (params: Record<string, string | string[] | null>) => {
            const newParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newParams.delete(key)
                } else if (Array.isArray(value)) {
                    newParams.delete(key)
                    value.forEach(v => newParams.append(key, v))
                } else {
                    newParams.set(key, value)
                }
            })

            return newParams.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string | string[] | null) => {
        const queryString = createQueryString({ [key]: value })
        router.push(`${pathname}?${queryString}`, { scroll: false })
    }

    const selectedColors = searchParams.getAll("color")
    const selectedSizes = searchParams.getAll("size")
    const minPrice = searchParams.get("min") || "0"
    const maxPrice = searchParams.get("max") || "1000"

    const toggleColor = (color: string) => {
        const newColors = selectedColors.includes(color)
            ? selectedColors.filter(c => c !== color)
            : [...selectedColors, color]
        handleFilterChange("color", newColors)
    }

    const toggleSize = (size: string) => {
        const newSizes = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size]
        handleFilterChange("size", newSizes)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        handleFilterChange("q", searchQuery || null)
    }

    return (
        <aside className="w-full lg:w-80 space-y-10 pr-0 lg:pr-10 border-r border-gray-100 h-fit sticky top-24">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <X className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-bold font-lufga uppercase tracking-widest">Filter</h3>
                </div>
                {(selectedColors.length > 0 || selectedSizes.length > 0 || searchQuery || minPrice !== "0" || maxPrice !== "1000") && (
                    <button
                        onClick={() => router.push(pathname)}
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Product"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-6 pr-12 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-black font-medium"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Search className="w-5 h-5 text-gray-400 hover:text-black transition-colors" />
                    </button>
                </div>
            </form>

            {/* Price Range */}
            <div className="space-y-6">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Price</h4>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={maxPrice}
                        onChange={(e) => handleFilterChange("max", e.target.value)}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span>Min Price: ${minPrice}</span>
                        <span>Max Price: ${maxPrice}</span>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Color</h4>
                <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColors.includes(color) ? 'border-black' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Size</h4>
                <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`w-12 h-12 rounded-full border-2 text-xs font-bold transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-black'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4 pb-10">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Categories</h4>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => router.push(`/category/${cat.slug}`)}
                            className={`flex items-center space-x-3 w-full text-left group ${pathname.includes(cat.slug) ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${pathname.includes(cat.slug) ? 'bg-black scale-100' : 'bg-transparent scale-0 group-hover:bg-gray-200 group-hover:scale-100'}`} />
                            <span className="text-sm font-medium transition-colors">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}
