"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Loader2, Calendar, User as UserIcon, Tag } from "lucide-react"

export default function BlogsAdminPage() {
    const [blogs, setBlogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")

    useEffect(() => {
        fetch("/api/blogs")
            .then(r => r.json())
            .then(data => {
                setBlogs(data || [])
                setLoading(false)
            })
    }, [])

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author?.toLowerCase().includes(query.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return

        const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" })
        if (res.ok) {
            setBlogs(blogs.filter(b => b.id !== id))
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Blog Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your storefront articles and news</p>
                </div>
                <Link href="/admin/blogs/new" className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm">
                    <Plus className="h-4 w-4" />
                    <span>Create Post</span>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border rounded-3xl p-4 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search articles by title or author..."
                        className="w-full h-12 rounded-2xl bg-muted/30 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card border rounded-[2.5rem] shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground font-medium">Loading articles...</p>
                </div>
            ) : filteredBlogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card border rounded-[2.5rem] shadow-sm">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Tag className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold">No articles found</h3>
                    <p className="text-muted-foreground max-w-xs mt-2">Try adjusting your search or create a new blog post.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="group bg-card border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="relative aspect-video bg-muted">
                                {blog.featured_image ? (
                                    <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Plus className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <Link href={`/admin/blogs/edit/${blog.id}`} className="p-2 rounded-full bg-white text-gray-900 shadow-lg hover:bg-primary hover:text-white transition-all">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(blog.id)} className="p-2 rounded-full bg-white text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(blog.published_at || blog.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {blog.author}</span>
                                </div>
                                <h3 className="text-lg font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{blog.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
