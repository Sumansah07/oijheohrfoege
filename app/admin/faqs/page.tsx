"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Save,
    X,
    GripVertical,
    CheckCircle,
    XCircle,
    Loader2,
    HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/store/use-toast"

export default function AdminFAQsPage() {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [faqs, setFaqs] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        is_active: true,
        sort_order: 0
    })

    useEffect(() => {
        fetchFaqs()
    }, [])

    const fetchFaqs = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/faqs")
            const data = await res.json()
            if (data && !data.error) {
                setFaqs(data)
            } else {
                addToast(data.error || "Failed to fetch FAQs", "error")
            }
        } catch (error) {
            addToast("An error occurred while fetching FAQs", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (id?: string) => {
        const method = id ? "PATCH" : "POST"
        try {
            const res = await fetch("/api/faqs", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id ? { id, ...formData } : formData),
            })
            if (res.ok) {
                const savedFaq = await res.json()
                if (id) {
                    setFaqs(faqs.map(f => f.id === id ? savedFaq : f))
                    setEditingId(null)
                } else {
                    setFaqs([...faqs, savedFaq])
                    setIsAdding(false)
                }
                addToast(`FAQ ${id ? "updated" : "added"} successfully`, "success")
                setFormData({ question: "", answer: "", is_active: true, sort_order: 0 })
            } else {
                const data = await res.json()
                addToast(data.error || "Failed to save FAQ", "error")
            }
        } catch (error) {
            addToast("An error occurred while saving", "error")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return
        try {
            const res = await fetch(`/api/faqs?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setFaqs(faqs.filter(f => f.id !== id))
                addToast("FAQ deleted successfully", "success")
            } else {
                const data = await res.json()
                addToast(data.error || "Failed to delete FAQ", "error")
            }
        } catch (error) {
            addToast("An error occurred while deleting", "error")
        }
    }

    const startEditing = (faq: any) => {
        setEditingId(faq.id)
        setFormData({
            question: faq.question,
            answer: faq.answer,
            is_active: faq.is_active,
            sort_order: faq.sort_order
        })
    }

    const filteredFaqs = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between border-b pb-8">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Help & FAQs</h1>
                    <p className="text-muted-foreground mt-1">Manage common questions and answers for your customers.</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(true)
                        setEditingId(null)
                        setFormData({ question: "", answer: "", is_active: true, sort_order: faqs.length + 1 })
                    }}
                    className="h-12 px-8 rounded-full bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg font-bold"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add New FAQ</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-16 pl-14 pr-8 w-full rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                    />
                </div>

                {isAdding && (
                    <div className="bg-white border-2 border-primary/20 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold font-lufga">New FAQ Entry</h3>
                            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Question</label>
                                <input
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="Enter question..."
                                    className="w-full h-14 rounded-xl border bg-muted/30 px-6 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Answer</label>
                                <textarea
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Enter answer details..."
                                    rows={4}
                                    className="w-full rounded-2xl border bg-muted/30 p-6 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">Status:</label>
                                        <button
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={cn(
                                                "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                                                formData.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                            )}
                                        >
                                            {formData.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {formData.is_active ? "Active" : "Inactive"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-muted-foreground">Sort Order:</label>
                                        <input
                                            type="number"
                                            value={formData.sort_order}
                                            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                            className="w-16 h-8 rounded-lg border text-center text-xs font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-xl hover:bg-muted font-bold transition-all">Cancel</button>
                                    <button onClick={() => handleSave()} className="px-10 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg">Save FAQ</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? filteredFaqs.map((faq) => (
                        <div key={faq.id} className={cn(
                            "bg-white border rounded-3xl overflow-hidden transition-all duration-300",
                            editingId === faq.id ? "ring-2 ring-primary bg-white shadow-2xl scale-[1.02]" : "hover:shadow-lg hover:border-primary/10 shadow-sm"
                        )}>
                            {editingId === faq.id ? (
                                <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={formData.question}
                                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                            className="w-full h-12 rounded-xl border bg-muted/30 px-6 font-bold text-lg"
                                        />
                                        <textarea
                                            value={formData.answer}
                                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                            rows={4}
                                            className="w-full rounded-2xl border bg-muted/30 p-6 font-medium"
                                        />
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                    className={cn(
                                                        "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all",
                                                        formData.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                                    )}
                                                >
                                                    {formData.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                    {formData.is_active ? "Active" : "Inactive"}
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order:</span>
                                                    <input
                                                        type="number"
                                                        value={formData.sort_order}
                                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                                        className="w-16 h-8 rounded-lg border text-center text-xs font-bold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setEditingId(null)} className="p-3 bg-muted rounded-xl hover:bg-muted/80 transition-all"><X className="h-5 w-5" /></button>
                                                <button onClick={() => handleSave(faq.id)} className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"><Save className="h-4 w-4" /> Save</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 flex items-start gap-6 group">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <HelpCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold font-lufga truncate pr-10">{faq.question}</h3>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(faq)} className="p-2.5 rounded-xl border hover:bg-primary/5 hover:border-primary/20 transition-all text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(faq.id)} className="p-2.5 rounded-xl border hover:bg-red-50 hover:border-red-200 transition-all text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed line-clamp-2 italic">"{faq.answer}"</p>
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                faq.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                                            )}>
                                                {faq.is_active ? "Active" : "Disabled"}
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                                Position: {faq.sort_order}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-32 bg-muted/20 rounded-[40px] border-4 border-dashed border-muted flex flex-col items-center justify-center space-y-4">
                            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border shadow-xl text-muted-foreground/20">
                                <HelpCircle className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-muted-foreground">No FAQs matched your search</h3>
                                <p className="text-muted-foreground opacity-60">Try different keywords or create a new entry.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
