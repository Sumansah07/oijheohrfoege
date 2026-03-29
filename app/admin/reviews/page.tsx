"use client"

import { useState, useEffect } from "react"
import {
    Star,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    MessageSquare,
    Search,
    ChevronRight,
    User,
    Package,
    Calendar,
    Filter,
    ArrowUpDown
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Review {
    id: string
    rating: number
    title: string | null
    comment: string | null
    status: "pending" | "approved" | "rejected"
    created_at: string
    user_id: string
    product_id: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
    } | null
    products: {
        name: string
    } | null
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [search, setSearch] = useState("")

    const fetchReviews = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/reviews")
            if (res.ok) {
                const data = await res.json()
                setReviews(data.reviews || [])
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error)
        }
        setLoading(false)
    }

    useEffect(() => { fetchReviews() }, [])

    const handleUpdateStatus = async (id: string, status: string) => {
        const res = await fetch(`/api/admin/reviews/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        })
        if (res.ok) {
            fetchReviews()
        } else {
            const error = await res.json()
            alert(`Error: ${error.error || "Failed to update status"}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return
        const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" })
        if (res.ok) {
            fetchReviews()
        } else {
            const error = await res.json()
            alert(`Error: ${error.error || "Failed to delete review"}`)
        }
    }

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            (review.comment?.toLowerCase().includes(search.toLowerCase()) || false) ||
            (review.products?.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
            (review.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || false)

        if (filter === "all") return matchesSearch
        return review.status === filter && matchesSearch
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Customer Reviews</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and moderate product feedback globally.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchReviews} className="h-12 w-12 rounded-2xl border flex items-center justify-center bg-card hover:bg-muted transition-all shadow-sm group">
                        <RefreshCw className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Navigation & Controls */}
            <div className="bg-card border rounded-[2rem] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by user, product, or comment content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-12 w-full bg-muted/50 rounded-2xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-transparent focus:border-primary/20"
                    />
                </div>
                <div className="flex items-center space-x-2 bg-muted/30 p-1.5 rounded-2xl">
                    {["all", "pending", "approved", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "h-10 px-6 rounded-[1.2rem] text-xs font-bold capitalize transition-all",
                                filter === s
                                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table View */}
            <div className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product & Rating</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-[40%]">Comment</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                                            <MessageSquare className="h-12 w-12" />
                                            <p className="font-bold text-sm">No reviews matching the criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="space-y-1.5">
                                                <p className="text-sm font-bold truncate max-w-[180px] group-hover:text-primary transition-colors">
                                                    {review.products?.name}
                                                </p>
                                                <div className="flex items-center space-x-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                    {review.profiles?.full_name?.charAt(0) || "A"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{review.profiles?.full_name || "Anonymous"}</p>
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                                                        {format(new Date(review.created_at), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="space-y-1">
                                                {review.title && <p className="text-xs font-bold text-foreground">{review.title}</p>}
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                                                review.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                                                    review.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                                                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                                            )}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-end space-x-2">
                                                {review.status !== "approved" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(review.id, "approved")}
                                                        className="h-9 px-4 rounded-xl bg-green-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {review.status !== "rejected" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(review.id, "rejected")}
                                                        className="h-9 px-4 rounded-xl border border-red-200 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="h-9 w-9 rounded-xl border border-muted-foreground/10 flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredReviews.length > 0 && (
                    <div className="bg-muted/30 px-6 py-4 border-t">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Showing {filteredReviews.length} of {reviews.length} total reviews
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
