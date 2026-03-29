"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export function SortSelect() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get("sort") || "newest"

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set("sort", e.target.value)
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    }

    return (
        <div className="hidden md:flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sort By:</label>
            <select
                value={currentSort}
                onChange={handleSortChange}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer p-0"
            >
                <option value="newest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
            </select>
        </div>
    )
}
