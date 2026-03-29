"use client"

import { useState, useEffect, useRef } from "react"
import {
    Plus,
    Trash2,
    Upload,
    X,
    Loader2,
    Image as ImageIcon,
    RefreshCw,
    Edit,
    Layout,
    FolderTree,
    Info,
    CheckCircle2,
    Clock
} from "lucide-react"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { cn } from "@/lib/utils"

interface Banner {
    id: string
    title: string
    subtitle: string | null
    cta_text: string | null
    cta_link: string | null
    image_url: string
    is_active: boolean
    sort_order: number
    banner_type: "hero" | "secondary"
    category_id: string | null
}

function BannerModal({ banner, type, onClose, onSaved }: { banner?: Banner | null; type: "home" | "category"; onClose: () => void; onSaved: () => void }) {
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [form, setForm] = useState({
        title: banner?.title || "",
        subtitle: banner?.subtitle || "",
        cta_text: banner?.cta_text || "Shop Now",
        cta_link: banner?.cta_link || "/",
        image_url: banner?.image_url || "",
        is_active: banner?.is_active ?? true,
        sort_order: banner?.sort_order || 0,
        banner_type: banner?.banner_type || (type === "home" ? "hero" : "secondary"),
        category_id: (banner?.category_id as string | null) || null
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch("/api/categories")
            if (res.ok) {
                const data = await res.json()
                setCategories(data.categories || [])
            }
        }
        fetchCategories()
    }, [])

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
        const url = banner ? `/api/banners/${banner.id}` : "/api/banners"
        const method = banner ? "PUT" : "POST"
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        setSaving(false)
        if (res.ok) { onSaved(); onClose() }
        else {
            const d = await res.json();
            setError(d.error || "Failed to save banner. Please ensure you have run the latest SQL migration in Supabase.")
        }
    }

    const inputClass = "w-full h-11 rounded-xl border bg-muted/30 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-card rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 space-y-6 my-auto border border-white/10 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold font-lufga uppercase tracking-tight">
                            {banner ? "Edit Banner" : `Create ${type === "home" ? "Home" : "Category"} Banner`}
                        </h2>
                        <p className="text-xs text-muted-foreground font-semibold mt-1">
                            {type === "home" ? "This banner will appear on the homepage." : "This banner will appear at the top of a specific category page."}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-2xl hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
                </div>

                {error && (
                    <div className="text-xs font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start space-x-3">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center space-x-2">
                            <span>Banner Image</span>
                            <span className="text-red-500">*</span>
                        </label>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        {form.image_url ? (
                            <div className="relative h-44 rounded-[2rem] overflow-hidden border group">
                                <img src={form.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="h-10 px-4 rounded-full bg-red-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg">
                                        <X className="h-4 w-4" /><span>Remove Image</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-44 rounded-[2rem] border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center space-y-3 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-foreground">Click to upload image</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-60">High resolution recommended</p>
                                </div>
                            </button>
                        )}
                        <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className={`${inputClass} mt-2`} placeholder="Or enter direct image URL" required />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Main Headline *</label>
                            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} placeholder="e.g., Summer Collection 2024" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Subtitle / Description</label>
                            <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className={inputClass} placeholder="e.g., Discover our newest arrivals..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Button Label</label>
                            <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} className={inputClass} placeholder="Shop Now" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Button Link</label>
                            <input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} className={inputClass} placeholder="/category/all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {type === "category" ? (
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Assign to Category *</label>
                                <select
                                    required
                                    value={form.category_id || ""}
                                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value || null }))}
                                    className={`${inputClass} font-bold`}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Banner Style</label>
                                <select
                                    value={form.banner_type}
                                    onChange={e => setForm(f => ({ ...f, banner_type: e.target.value as any }))}
                                    className={`${inputClass} font-bold`}
                                >
                                    <option value="hero">Hero (Main Slider)</option>
                                    <option value="secondary">Secondary (Grid Banner)</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground block mb-1.5">Display Order</label>
                            <div className="flex space-x-3">
                                <input type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className={`${inputClass} flex-1`} />
                                <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                    className={cn(
                                        "h-11 px-4 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                                        form.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground"
                                    )}>
                                    {form.is_active ? "Active" : "Draft"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center space-x-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:scale-100 mt-4">
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        <span>{saving ? "Processing..." : banner ? "Save Changes" : "Publish Banner"}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"home" | "category">("home")
    const [showModal, setShowModal] = useState(false)
    const [editBanner, setEditBanner] = useState<Banner | null>(null)

    const fetchBanners = async () => {
        setLoading(true)
        const res = await fetch("/api/banners")
        const data = await res.json()
        setBanners(data.banners || [])
        setLoading(false)
    }

    useEffect(() => { fetchBanners() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this banner forever?")) return
        await fetch(`/api/banners/${id}`, { method: "DELETE" })
        fetchBanners()
    }

    const homeBanners = banners.filter(b => !b.category_id)
    const categoryBanners = banners.filter(b => b.category_id)

    const displayedBanners = activeTab === "home" ? homeBanners : categoryBanners

    return (
        <div className="space-y-10 pb-20">
            {(showModal || editBanner) && (
                <BannerModal
                    type={activeTab}
                    banner={editBanner}
                    onClose={() => { setShowModal(false); setEditBanner(null) }}
                    onSaved={fetchBanners}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-bold font-lufga tracking-tight">Marketplace <span className="text-primary italic">Media</span></h1>
                    <p className="text-muted-foreground font-semibold mt-2">Design and manage your global promotional assets.</p>
                </div>
                <div className="flex items-center space-x-3 bg-card border p-1.5 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveTab("home")}
                        className={cn(
                            "h-11 px-6 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all",
                            activeTab === "home" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Layout className="h-4 w-4" /><span>Homepage</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("category")}
                        className={cn(
                            "h-11 px-6 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all",
                            activeTab === "category" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <FolderTree className="h-4 w-4" /><span>Categories</span>
                    </button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <button onClick={() => setShowModal(true)} className="h-11 px-5 rounded-xl bg-zinc-900 text-white flex items-center space-x-2 hover:bg-black transition-all font-bold text-xs uppercase tracking-widest">
                        <Plus className="h-4 w-4" /><span>New Banner</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-primary/40" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing assets...</p>
                </div>
            ) : displayedBanners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card border rounded-[3rem] border-dashed">
                    <div className="h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center mb-6">
                        <ImageIcon className="h-10 w-10 opacity-20" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No {activeTab} banners found</h3>
                    <p className="text-sm font-medium mt-1">Start by creating a new promotional asset for this section.</p>
                    <button onClick={() => setShowModal(true)} className="mt-8 px-8 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">+ Create Your First {activeTab === "home" ? "Hero" : "Category"} Banner</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {displayedBanners.map(banner => (
                        <div key={banner.id} className="group bg-card border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-500 relative">
                            <div className="aspect-[2/1] relative overflow-hidden">
                                <img src={banner.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={banner.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md",
                                            banner.is_active ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/10 text-white/60 border border-white/20"
                                        )}>
                                            {banner.is_active ? "Live" : "Draft"}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                                            {banner.banner_type}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white font-lufga leading-tight">{banner.title}</h3>
                                    {banner.subtitle && <p className="text-white/70 text-sm mt-1 font-medium truncate">{banner.subtitle}</p>}
                                </div>
                                <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                    <button onClick={() => setEditBanner(banner)} className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-zinc-900 shadow-xl hover:bg-white transition-all"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(banner.id)} className="h-10 w-10 rounded-2xl bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white shadow-xl hover:bg-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="p-8 flex items-center justify-between border-t border-dashed">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Order</p>
                                        <p className="text-sm font-bold">Position #{banner.sort_order}</p>
                                    </div>
                                </div>
                                {banner.cta_text && (
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CTA Action</p>
                                        <p className="text-sm font-bold text-primary">{banner.cta_text}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
