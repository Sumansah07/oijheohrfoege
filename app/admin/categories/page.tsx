"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Edit, Trash2, ImageIcon, Loader2, Upload, X, RefreshCw, FolderTree, ExternalLink } from "lucide-react"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { useToast } from "@/store/use-toast"

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_active: boolean
    is_featured_on_homepage: boolean
    products: { count: number }[]
}

function CategoryModal({ onClose, onSaved, categoryToEdit }: { onClose: () => void; onSaved: () => void; categoryToEdit?: Category | null }) {
    const { addToast } = useToast()
    const isEdit = !!categoryToEdit
    const [form, setForm] = useState({
        name: categoryToEdit?.name || "",
        slug: categoryToEdit?.slug || "",
        description: categoryToEdit?.description || "",
        image_url: categoryToEdit?.image_url || "",
        is_active: categoryToEdit?.is_active ?? true,
        is_featured_on_homepage: categoryToEdit?.is_featured_on_homepage ?? false
    })
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const fileRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        const fd = new FormData(); fd.append("file", file)
        const result = await uploadToCloudinary(fd)
        setUploading(false)
        if (result.error) setError(result.error)
        else setForm(f => ({ ...f, image_url: result.url }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

        const endpoint = isEdit ? `/api/categories/${categoryToEdit.id}` : "/api/categories"
        const method = isEdit ? "PUT" : "POST"

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, slug })
        })
        setSaving(false)
        if (res.ok) {
            addToast(`Category ${isEdit ? "updated" : "created"} successfully!`, "success")
            onSaved();
            onClose()
        }
        else {
            const d = await res.json();
            const msg = d.error || "Failed to save category"
            setError(msg)
            addToast(msg, "error")
        }
    }

    const inputClass = "w-full h-11 rounded-xl border bg-muted/30 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-lufga">{isEdit ? "Edit Category" : "New Category"}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted"><X className="h-5 w-5" /></button>
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Name *</label>
                        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="e.g. Men" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Slug (auto-generated)</label>
                        <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputClass} placeholder="men (leave blank to auto-generate)" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Description</label>
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} placeholder="Short description" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Category Image</label>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        {form.image_url ? (
                            <div className="relative h-32 rounded-xl overflow-hidden border">
                                <img src={form.image_url} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-red-500"><X className="h-3 w-3" /></button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center space-x-2 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all">
                                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="h-5 w-5" /><span className="text-sm font-semibold">Upload Image</span></>}
                            </button>
                        )}
                        <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className={`${inputClass} mt-2`} placeholder="Or paste image URL" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <label className="flex items-center justify-between cursor-pointer h-12 px-5 rounded-2xl border bg-muted/20">
                            <span className="text-sm font-semibold">Active</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
                            </button>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer h-12 px-5 rounded-2xl border bg-muted/20">
                            <span className="text-sm font-semibold">Home Featured</span>
                            <button type="button" onClick={() => setForm(f => ({ ...f, is_featured_on_homepage: !f.is_featured_on_homepage }))}
                                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_featured_on_homepage ? "bg-primary" : "bg-muted-foreground/30"}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_featured_on_homepage ? "translate-x-5" : ""}`} />
                            </button>
                        </label>
                    </div>
                    <button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 disabled:opacity-60 transition-all">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                        <span>{saving ? "Saving..." : (isEdit ? "Update Category" : "Create Category")}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function AdminCategoriesPage() {
    const { addToast } = useToast()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; categoryToEdit: Category | null }>({ isOpen: false, categoryToEdit: null })
    const [total, setTotal] = useState(0)

    const fetchCategories = async () => {
        setLoading(true)
        const res = await fetch("/api/categories")
        const data = await res.json()
        setCategories(data.categories || [])
        setTotal(data.total || 0)
        setLoading(false)
    }

    useEffect(() => { fetchCategories() }, [])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"? Products will become uncategorized.`)) return
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
        if (res.ok) {
            addToast("Category deleted successfully", "success")
            fetchCategories()
        }
        else {
            const d = await res.json()
            addToast(d.error || "Failed to delete category", "error")
        }
    }

    return (
        <div className="space-y-8">
            {modalConfig.isOpen && (
                <CategoryModal
                    categoryToEdit={modalConfig.categoryToEdit}
                    onClose={() => setModalConfig({ isOpen: false, categoryToEdit: null })}
                    onSaved={fetchCategories}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-1">{total} categories in your store</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchCategories} className="h-12 w-12 rounded-xl border flex items-center justify-center bg-card hover:bg-muted transition-all">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setModalConfig({ isOpen: true, categoryToEdit: null })} className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm">
                        <Plus className="h-4 w-4" />
                        <span>New Category</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-24"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card border rounded-3xl">
                            <FolderTree className="h-12 w-12 mb-4 opacity-30" />
                            <p className="font-bold">No categories yet</p>
                            <button onClick={() => setModalConfig({ isOpen: true, categoryToEdit: null })} className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm">+ Add Category</button>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-14 w-14 rounded-2xl overflow-hidden border bg-muted shrink-0">
                                            {cat.image_url ? <img src={cat.image_url} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground m-auto mt-4" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{cat.name}</h3>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">/{cat.slug}</p>
                                            {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm font-bold">{(cat.products?.[0] as any)?.count ?? 0} products</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cat.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                                {cat.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setModalConfig({ isOpen: true, categoryToEdit: cat })}
                                                className="p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 hover:bg-primary/10 rounded-lg"
                                                title="Edit Category"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-muted/50 hover:bg-red-50 rounded-lg"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 space-y-4 relative overflow-hidden">
                        <FolderTree className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-bold">Category Tips</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Categories with high-quality images get higher click-through rates. Use landscape (16:9) images for best display.
                        </p>
                        <div className="p-4 bg-white rounded-2xl border shadow-sm flex items-center justify-between">
                            <span className="text-sm font-bold">Total Categories</span>
                            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
