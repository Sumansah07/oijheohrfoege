"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X, Loader2, ImageIcon, Save, Trash2 } from "lucide-react"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { cn } from "@/lib/utils"
import { useToast } from "@/store/use-toast"

interface Category { id: string; name: string; slug: string }

interface ProductFormProps {
    productId?: string
    initialData?: any
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        base_price: initialData?.base_price || "",
        discount_price: initialData?.discount_price || "",
        sku: initialData?.sku || "",
        stock_quantity: initialData?.stock_quantity || 0,
        category_id: initialData?.category_id || "",
        featured_image: initialData?.featured_image || "",
        images: initialData?.images || [] as string[],
        is_featured: initialData?.is_featured || false,
        is_active: initialData?.is_active ?? true,
        colors: initialData?.metadata?.colors || [] as string[],
        sizes: initialData?.metadata?.sizes || [] as string[],
        initial_rating: initialData?.metadata?.initial_rating || "5.0",
        initial_reviews_count: initialData?.metadata?.initial_reviews_count || "0",
        attributes: initialData?.metadata?.attributes || [] as { key: string; value: string }[],
    })

    useEffect(() => {
        fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []))
    }, [])

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        setError("")
        try {
            const fd = new FormData()
            fd.append("file", file)
            const result = await uploadToCloudinary(fd)
            if (result.error) setError(result.error)
            else setForm(f => ({ ...f, featured_image: result.url }))
        } finally {
            setUploading(false)
        }
    }

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        setError("");
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append("file", file);
                const result = await uploadToCloudinary(fd);
                if (result.url) {
                    setForm(f => ({ ...f, images: [...f.images, result.url] }));
                } else if (result.error) {
                    setError(`Upload failed: ${result.error}`);
                }
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        try {
            const { colors, sizes, initial_rating, initial_reviews_count, attributes, ...rest } = form
            const payload = {
                ...rest,
                base_price: parseFloat(form.base_price) || 0,
                discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
                stock_quantity: parseInt(form.stock_quantity.toString()) || 0,
                category_id: form.category_id || null,
                metadata: {
                    ...initialData?.metadata,
                    colors,
                    sizes,
                    initial_rating: form.initial_rating,
                    initial_reviews_count: form.initial_reviews_count,
                    attributes: form.attributes
                }
            }

            const url = productId ? `/api/products/${productId}` : "/api/products"
            const method = productId ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const data = await res.json()
                const errorMessage = data.error || "Something went wrong"
                setError(errorMessage)
                addToast(errorMessage, "error")
                return
            }

            addToast(productId ? "Product updated successfully!" : "Product created successfully!", "success")
            router.push("/admin/products")
            router.refresh()
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected error occurred"
            setError(errorMessage)
            addToast(errorMessage, "error")
        } finally {
            setSaving(false)
        }
    }

    const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }))

    const inputClass = "w-full h-11 rounded-xl border bg-muted/30 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    const labelClass = "block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/products" className="p-2 rounded-xl border hover:bg-muted transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold font-lufga tracking-tight">{productId ? "Edit Product" : "New Product"}</h1>
                        <p className="text-muted-foreground mt-1">Fill in the details below</p>
                    </div>
                </div>
                <button type="submit" disabled={saving} className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 font-bold text-sm">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? "Saving..." : "Save Product"}</span>
                </button>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Product Details</h3>

                        <div>
                            <label className={labelClass}>Product Name *</label>
                            <input required value={form.name} onChange={f("name")} className={inputClass} placeholder="e.g. Premium Leather Jacket" />
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea value={form.description} onChange={f("description")} rows={5}
                                className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                placeholder="Describe this product..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Price ($) *</label>
                                <input required type="number" step="0.01" min="0" value={form.base_price} onChange={f("base_price")} className={inputClass} placeholder="0.00" />
                            </div>
                            <div>
                                <label className={labelClass}>Original Price ($)</label>
                                <input type="number" step="0.01" min="0" value={form.discount_price} onChange={f("discount_price")} className={inputClass} placeholder="0.00 (for strike-through)" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>SKU</label>
                                <input value={form.sku} onChange={f("sku")} className={inputClass} placeholder="e.g. JKT-001" />
                            </div>
                            <div>
                                <label className={labelClass}>Stock Quantity</label>
                                <input type="number" min="0" value={form.stock_quantity} onChange={f("stock_quantity")} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Featured Image</h3>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                                Change Image
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                        }} />

                        {form.featured_image ? (
                            <div className="relative rounded-2xl overflow-hidden border aspect-[4/3] bg-muted group">
                                <img src={form.featured_image} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, featured_image: "" }))}
                                        className="w-full py-2 rounded-lg bg-red-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors flex items-center justify-center space-x-2">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Remove Image</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-[4/3] max-h-64 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center space-y-3 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                                {uploading ? (
                                    <><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-sm text-muted-foreground font-semibold">Uploading...</p></>
                                ) : (
                                    <><Upload className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm font-bold text-muted-foreground">Click to upload image</p><p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p></>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Product Gallery */}
                    <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Product Gallery</h3>
                            <label className="cursor-pointer">
                                <span className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Add Images</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {form.images.map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border group bg-muted">
                                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, images: f.images.filter((_: string, idx: number) => idx !== i) }))}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center space-y-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                                <Upload className="h-6 w-6 text-muted-foreground/40" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Organization</h3>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select value={form.category_id} onChange={f("category_id")} className={inputClass}>
                                <option value="">Uncategorized</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Store Trust (Initial Ratings)</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Set initial social proof for new products.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Initial Rating (1-5)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="5"
                                    value={form.initial_rating}
                                    onChange={f("initial_rating")}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Initial Review Count</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.initial_reviews_count}
                                    onChange={f("initial_reviews_count")}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Filters (Metadata)</h3>

                        {/* Dynamic Colors */}
                        <div>
                            <label className={labelClass}>Available Colors</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.colors.map((color: string) => (
                                    <span key={color} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-bold uppercase">
                                        {color}
                                        <button type="button" onClick={() => setForm(f => ({ ...f, colors: f.colors.filter((c: string) => c !== color) }))}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add color..."
                                    className={cn(inputClass, "h-9 text-xs")}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !form.colors.includes(val)) {
                                                setForm(f => ({ ...f, colors: [...f.colors, val] }));
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Dynamic Sizes */}
                        <div>
                            <label className={labelClass}>Available Sizes</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.sizes.map((size: string) => (
                                    <span key={size} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-bold uppercase">
                                        {size}
                                        <button type="button" onClick={() => setForm(f => ({ ...f, sizes: f.sizes.filter((s: string) => s !== size) }))}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add size..."
                                    className={cn(inputClass, "h-9 text-xs")}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.currentTarget.value.trim();
                                            if (val && !form.sizes.includes(val)) {
                                                setForm(f => ({ ...f, sizes: [...f.sizes, val] }));
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Custom Attributes</h3>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, attributes: [...f.attributes, { key: "", value: "" }] }))}
                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            >
                                Add Field
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Add arbitrary fields like Material, Fit, or Care Instructions.</p>

                        <div className="space-y-3">
                            {form.attributes.map((attr: { key: string; value: string }, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        placeholder="Key (e.g. Material)"
                                        value={attr.key}
                                        onChange={(e) => {
                                            const newAttrs = [...form.attributes];
                                            newAttrs[idx].key = e.target.value;
                                            setForm(f => ({ ...f, attributes: newAttrs }));
                                        }}
                                        className={cn(inputClass, "h-9 text-[10px] flex-1 font-bold")}
                                    />
                                    <input
                                        placeholder="Value (e.g. Cotton)"
                                        value={attr.value}
                                        onChange={(e) => {
                                            const newAttrs = [...form.attributes];
                                            newAttrs[idx].value = e.target.value;
                                            setForm(f => ({ ...f, attributes: newAttrs }));
                                        }}
                                        className={cn(inputClass, "h-9 text-[10px] flex-1")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, attributes: f.attributes.filter((_: any, i: number) => i !== idx) }))}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg">Settings</h3>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-semibold">Active</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : ""}`} />
                            </button>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-semibold">Featured</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${form.is_featured ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_featured ? "translate-x-6" : ""}`} />
                            </button>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    )
}
