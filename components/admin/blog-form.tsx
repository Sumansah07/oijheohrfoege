"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X, Loader2, Save, ImageIcon, Type, Layout, Image as ImageIcon2 } from "lucide-react"
import { uploadToCloudinary } from "@/lib/actions/upload"

interface BlogFormProps {
    blogId?: string
    initialData?: any
}

export function BlogForm({ blogId, initialData }: BlogFormProps) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        author: initialData?.author || "Admin",
        featured_image: initialData?.featured_image || "",
        is_active: initialData?.is_active ?? true,
        tags: initialData?.tags || [] as string[],
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")
        try {
            const url = blogId ? `/api/blogs/${blogId}` : "/api/blogs"
            const method = blogId ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || "Something went wrong")
                return
            }

            router.push("/admin/blogs")
            router.refresh()
        } finally {
            setSaving(false)
        }
    }

    const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }))

    const labelClass = "block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
    const inputClass = "w-full h-12 rounded-2xl border bg-muted/30 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/blogs" className="p-3 rounded-2xl border hover:bg-muted transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold font-lufga tracking-tight">{blogId ? "Edit Article" : "New Article"}</h1>
                        <p className="text-muted-foreground mt-1">Compose your blog post</p>
                    </div>
                </div>
                <button type="submit" disabled={saving} className="h-12 px-8 rounded-2xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 disabled:opacity-60 transition-all shadow-xl shadow-primary/20 font-bold text-sm tracking-widest uppercase">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? "Saving..." : "Publish Post"}</span>
                </button>
            </div>

            {error && <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                        <div>
                            <label className={labelClass}>Article Title *</label>
                            <input
                                required
                                value={form.title}
                                onChange={f("title")}
                                className="w-full text-3xl font-bold font-lufga bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/30"
                                placeholder="Enter a catchy title..."
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Excerpt (Short Summary)</label>
                            <textarea
                                value={form.excerpt}
                                onChange={f("excerpt")}
                                rows={3}
                                className="w-full rounded-2xl border bg-muted/20 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none italic"
                                placeholder="A brief summary for card previews..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className={labelClass}>Content</label>
                                <div className="flex gap-2">
                                    <button type="button" className="p-2 rounded-lg bg-muted/50 hover:bg-muted"><Type className="h-4 w-4" /></button>
                                    <button type="button" className="p-2 rounded-lg bg-muted/50 hover:bg-muted"><Layout className="h-4 w-4" /></button>
                                    <button type="button" className="p-2 rounded-lg bg-muted/50 hover:bg-muted"><ImageIcon2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <textarea
                                required
                                value={form.content}
                                onChange={f("content")}
                                rows={20}
                                className="w-full rounded-[2rem] border bg-muted/10 px-8 py-8 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-serif"
                                placeholder="Write your story here..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Featured Image */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Featured Image</h3>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        />

                        {form.featured_image ? (
                            <div className="relative rounded-2xl overflow-hidden border aspect-video bg-muted group">
                                <img src={form.featured_image} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, featured_image: "" }))}
                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center space-y-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
                            >
                                {uploading ? (
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                ) : (
                                    <>
                                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upload Header</p>
                                    </>
                                )}
                            </button>
                        )}
                        <input
                            value={form.featured_image}
                            onChange={f("featured_image")}
                            className={inputClass}
                            placeholder="Or paste URL..."
                        />
                    </div>

                    {/* Metadata */}
                    <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg">Publishing</h3>
                        <div>
                            <label className={labelClass}>Author Name</label>
                            <input value={form.author} onChange={f("author")} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Slug (Custom URL)</label>
                            <input value={form.slug} onChange={f("slug")} className={inputClass} placeholder="my-awesome-post" />
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-semibold">Active / Published</span>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : ""}`} />
                                </button>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
