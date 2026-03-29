"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
    Plus, Search, Filter, MoreHorizontal,
    Eye, Edit, Trash2, ArrowUpDown, Package,
    CheckCircle, AlertCircle, XCircle, RefreshCw
} from "lucide-react"
import { useToast } from "@/store/use-toast"

interface Product {
    id: string
    name: string
    sku: string
    base_price: number
    discount_price: number | null
    featured_image: string | null
    stock_quantity: number
    is_active: boolean
    is_featured: boolean
    categories: { name: string; slug: string } | null
}

function StatusBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Out of Stock</span>
    if (stock <= 10) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">Low Stock</span>
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">In Stock</span>
}

export default function AdminProductsPage() {
    const { addToast } = useToast()
    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(0)
    const limit = 20

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ limit: limit.toString(), offset: (page * limit).toString() })
            if (search) params.set("q", search)
            const res = await fetch(`/api/products?${params}`)
            const data = await res.json()
            setProducts(data.products || [])
            setTotal(data.total || 0)
        } finally {
            setLoading(false)
        }
    }, [search, page])

    useEffect(() => {
        const t = setTimeout(fetchProducts, 300)
        return () => clearTimeout(t)
    }, [fetchProducts])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
        if (res.ok) {
            setProducts(p => p.filter(x => x.id !== id))
            setTotal(t => t - 1)
            addToast("Product deleted successfully", "success")
        } else {
            const data = await res.json().catch(() => ({}))
            addToast(data.error || "Failed to delete product", "error")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">{total} products in your catalog</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchProducts} className="h-12 w-12 rounded-xl border flex items-center justify-center bg-card hover:bg-muted transition-all">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <Link href="/admin/products/new" className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm">
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="bg-card border rounded-3xl p-4 flex items-center gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0) }}
                        placeholder="Search products by name..."
                        className="h-11 w-full bg-muted/50 rounded-2xl pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Package className="h-12 w-12 mb-4 opacity-30" />
                        <p className="font-bold">No products found</p>
                        <p className="text-sm mt-1">Add your first product to get started</p>
                        <Link href="/admin/products/new" className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90">
                            + Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SKU</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-10 rounded-lg overflow-hidden border bg-muted shrink-0">
                                                    {p.featured_image ? (
                                                        <img src={p.featured_image} className="h-full w-full object-cover" alt={p.name} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{p.name}</span>
                                                    {p.is_featured && <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">Featured</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{p.sku || "—"}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                                                {p.categories?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="text-sm font-bold">${p.base_price.toFixed(2)}</span>
                                                {p.discount_price && <span className="ml-2 text-xs text-muted-foreground line-through">${p.discount_price.toFixed(2)}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold">{p.stock_quantity}</td>
                                        <td className="px-6 py-4"><StatusBadge stock={p.stock_quantity} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link href={`/product/${p.id}`} target="_blank" className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Eye className="h-4 w-4" /></Link>
                                                <Link href={`/admin/products/${p.id}/edit`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Edit className="h-4 w-4" /></Link>
                                                <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div className="px-6 py-4 bg-muted/10 border-t flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{page * limit + 1}–{Math.min((page + 1) * limit, total)}</span> of <span className="font-bold text-foreground">{total}</span>
                        </p>
                        <div className="flex items-center space-x-2">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-9 px-4 rounded-xl border text-xs font-bold bg-card disabled:opacity-40">Previous</button>
                            <button disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)} className="h-9 px-4 rounded-xl border text-xs font-bold bg-card disabled:opacity-40">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
