"use client"

import { useState, useEffect } from "react"
import {
    Plus, GripVertical, Trash2, Save, Loader2, Link as LinkIcon,
    Eye, EyeOff, ChevronRight, ChevronDown, ListTree, MoveUp, MoveDown
} from "lucide-react"

interface NavLink {
    id: string
    label: string
    url: string
    order_index: number
    parent_id: string | null
    is_active: boolean
}

export default function NavigationAdminPage() {
    const [links, setLinks] = useState<NavLink[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [navRes, catRes] = await Promise.all([
                    fetch("/api/navigation"),
                    fetch("/api/categories")
                ])
                const navData = await navRes.json()
                const catData = await catRes.json()
                setLinks(navData || [])
                setCategories(catData.categories || [])
            } catch (err) {
                console.error("Failed to fetch data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const addLink = (parentId: string | null = null) => {
        const sortedOrder = links.filter(l => l.parent_id === parentId).length
        const newLink: NavLink = {
            id: crypto.randomUUID(),
            label: "New Link",
            url: "/",
            order_index: sortedOrder,
            parent_id: parentId,
            is_active: true
        }
        setLinks([...links, newLink])
        if (parentId) setExpanded(prev => ({ ...prev, [parentId]: true }))
    }

    const updateLink = (id: string, field: keyof NavLink, value: any) => {
        setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l))
    }

    const handleCategorySelect = (id: string, categorySlug: string) => {
        if (!categorySlug) return
        const category = categories.find(c => c.slug === categorySlug)
        if (category) {
            setLinks(links.map(l => l.id === id ? {
                ...l,
                label: category.name,
                url: `/category/${category.slug}`
            } : l))
        }
    }

    const removeLink = (id: string) => {
        // Also remove children
        const toRemove = [id, ...links.filter(l => l.parent_id === id).map(l => l.id)]
        setLinks(links.filter(l => !toRemove.includes(l.id)))
    }

    const moveLink = (id: string, direction: 'up' | 'down') => {
        const link = links.find(l => l.id === id)
        if (!link) return

        const siblings = links
            .filter(l => l.parent_id === link.parent_id)
            .sort((a, b) => a.order_index - b.order_index)

        const currentIndex = siblings.findIndex(l => l.id === id)
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= siblings.length) return

        const targetLink = siblings[targetIndex]

        setLinks(links.map(l => {
            if (l.id === id) return { ...l, order_index: targetLink.order_index }
            if (l.id === targetLink.id) return { ...l, order_index: link.order_index }
            return l
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/navigation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ links })
            })
            if (res.ok) {
                const updated = await res.json()
                setLinks(updated)
            }
        } finally {
            setSaving(false)
        }
    }

    const renderLinkRow = (link: NavLink, depth = 0) => {
        const children = links
            .filter(l => l.parent_id === link.id)
            .sort((a, b) => a.order_index - b.order_index)
        const isExpanded = expanded[link.id]

        return (
            <div key={link.id} className="space-y-2">
                <div className={`flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-transparent hover:border-muted-foreground/20 transition-all group ${depth > 0 ? "ml-8 bg-muted/10" : ""}`}>
                    <div className="flex items-center gap-2">
                        {children.length > 0 ? (
                            <button onClick={() => setExpanded(prev => ({ ...prev, [link.id]: !prev[link.id] }))}>
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                        ) : <div className="w-4" />}
                        <div className="text-muted-foreground/30">
                            <GripVertical className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <input
                            value={link.label}
                            onChange={e => updateLink(link.id, "label", e.target.value)}
                            className="bg-white border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Label"
                        />
                        <input
                            value={link.url}
                            onChange={e => updateLink(link.id, "url", e.target.value)}
                            className="bg-white border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="/url"
                        />
                        <select
                            onChange={e => handleCategorySelect(link.id, e.target.value)}
                            className="bg-white border rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 text-muted-foreground"
                            value=""
                        >
                            <option value="">Quick Select Category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateLink(link.id, "is_active", !link.is_active)} className={`p-2 rounded-lg ${link.is_active ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}>
                            {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => moveLink(link.id, 'up')} className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
                            <MoveUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => moveLink(link.id, 'down')} className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
                            <MoveDown className="h-4 w-4" />
                        </button>
                        {depth === 0 && (
                            <button onClick={() => addLink(link.id)} className="p-2 text-primary hover:bg-primary/10 rounded-lg" title="Add Sub-menu">
                                <Plus className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => removeLink(link.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {isExpanded && children.map(child => renderLinkRow(child, depth + 1))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Navigation Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your menu structure and visibility</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-6 rounded-xl bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 font-bold text-sm"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-lg">Menu Structure</h3>
                            <button onClick={() => addLink(null)} className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:opacity-70 transition-all">
                                <Plus className="h-4 w-4" />
                                <span>Add Root Link</span>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">Loading navigation...</p>
                            </div>
                        ) : links.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                                <LinkIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">No links configured.</p>
                                <button onClick={() => addLink(null)} className="mt-4 text-xs font-bold text-primary px-4 py-2 border border-primary rounded-lg hover:bg-primary hover:text-white transition-all">Add First Link</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {links
                                    .filter(l => !l.parent_id)
                                    .sort((a, b) => a.order_index - b.order_index)
                                    .map(link => renderLinkRow(link))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ListTree className="h-5 w-5 text-primary" />
                            Structure Guide
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary-foreground/80 text-sm space-y-2">
                                <p className="font-bold uppercase text-[10px] tracking-widest text-primary">Nested Menus</p>
                                <p className="text-muted-foreground">Click the <Plus className="h-3 w-3 inline" /> icon on any root link to add a sub-menu items (dropdowns).</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-orange-50/50 text-orange-700 text-sm space-y-2">
                                <p className="font-bold uppercase text-[10px] tracking-widest text-orange-600">Visibility</p>
                                <p className="opacity-80">Use the <Eye className="h-3 w-3 inline" /> toggle to hide links from the storefront without deleting them.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50/50 text-blue-700 text-sm space-y-2">
                                <p className="font-bold uppercase text-[10px] tracking-widest text-blue-600">Ordering</p>
                                <p className="opacity-80">Use the up/down arrows to reorder links within their respective levels.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
