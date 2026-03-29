"use client"

import * as React from "react"
import { Star, MessageSquare, ThumbsUp, CheckCircle2, ShieldCheck, Loader2, ChevronRight, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { getProductReviews, submitReview } from "@/app/actions/review-actions"
import { useToast } from "@/store/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Review {
    id: string
    user_id: string
    product_id: string
    rating: number
    title: string | null
    comment: string | null
    status: string
    created_at: string
    profiles: {
        full_name: string | null
        avatar_url: string | null
    } | null
}

export function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = React.useState<Review[]>([])
    const [loading, setLoading] = React.useState(true)
    const [issubmitting, setIsSubmitting] = React.useState(false)
    const [rating, setRating] = React.useState(0)
    const [hoverRating, setHoverRating] = React.useState(0)
    const [comment, setComment] = React.useState("")
    const [filter, setFilter] = React.useState<"all" | "good" | "bad">("all")
    const { addToast } = useToast()

    const fetchReviews = React.useCallback(async () => {
        try {
            const data = await getProductReviews(productId)
            setReviews(data as any)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [productId])

    React.useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return

        setIsSubmitting(true)
        try {
            await submitReview({
                productId,
                rating,
                comment,
            })

            addToast("Review submitted successfully!", "success")
            setRating(0)
            setComment("")
            // Refresh reviews
            fetchReviews()
        } catch (error: any) {
            addToast(error.message || "Failed to submit review", "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredReviews = reviews.filter(r => {
        if (filter === "good") return r.rating >= 4
        if (filter === "bad") return r.rating <= 2
        return true
    })

    const stats = {
        total: reviews.length,
        average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0",
        percentages: [5, 4, 3, 2, 1].map(s => ({
            stars: s,
            count: reviews.filter(r => r.rating === s).length,
            percent: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0
        }))
    }

    return (
        <div className="space-y-16 py-20 border-t mt-20" id="reviews">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
                {/* Summary */}
                <div className="w-full md:w-80 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold font-lufga tracking-tight">Customer Reviews</h2>
                        <div className="flex items-center space-x-4 mt-4">
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("h-5 w-5", i < Math.round(Number(stats.average)) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                                ))}
                            </div>
                            <span className="text-lg font-bold">{stats.average} out of 5</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 italic font-medium">Based on {stats.total} verified reviews</p>
                    </div>

                    <div className="space-y-3">
                        {stats.percentages.map((item) => (
                            <div key={item.stars} className="flex items-center space-x-3 text-sm">
                                <span className="w-4 font-bold">{item.stars}</span>
                                <Star className="h-3 w-3 fill-muted-foreground text-muted-foreground" />
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${item.percent}%` }} />
                                </div>
                                <span className="w-8 text-right font-medium text-muted-foreground">{item.percent}%</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-muted/30 rounded-3xl p-8 space-y-4">
                        <h4 className="font-bold flex items-center space-x-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span>Verified Purchases Only</span>
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">We only allow reviews from customers who have actually purchased this specific item to ensure maximum authenticity.</p>
                    </div>
                </div>

                {/* Form & List */}
                <div className="flex-1 space-y-16">
                    {/* Review Form */}
                    <div className="bg-card border rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold font-lufga">Share your experience</h3>
                                <p className="text-sm text-muted-foreground mt-1">What did you love? Let us know your thoughts.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rate this product</label>
                                    <div className="flex items-center space-x-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(s)}
                                                className="transition-transform active:scale-95"
                                            >
                                                <Star className={cn(
                                                    "h-8 w-8 transition-all shrink-0",
                                                    (hoverRating || rating) >= s ? "fill-primary text-primary" : "text-muted-foreground/20"
                                                )} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Feedback</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Describe your experience with the fit, quality, and style..."
                                        className="w-full h-32 rounded-3xl border bg-muted/20 p-6 text-sm focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={issubmitting || rating === 0}
                                    className="h-14 px-10 rounded-full bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {issubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <>
                                            <MessageSquare className="h-5 w-5" />
                                            <span>Submit Review</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-20 -right-20 h-48 w-48 bg-primary/5 rounded-full blur-3xl" />
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between border-b pb-6">
                            <h3 className="text-xl font-bold font-lufga">Real Experiences</h3>
                            <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-2xl">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "all" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter("good")}
                                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "good" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
                                >
                                    Good (4+)
                                </button>
                                <button
                                    onClick={() => setFilter("bad")}
                                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "bad" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
                                >
                                    Bad (2-)
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p className="font-bold">Loading reviews...</p>
                            </div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-bold">No reviews found for this filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {filteredReviews.map((review) => (
                                    <div key={review.id} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-bold border overflow-hidden">
                                                    {review.profiles?.avatar_url ? (
                                                        <img src={review.profiles.avatar_url} alt="" className="object-cover w-full h-full" />
                                                    ) : (
                                                        <span>{review.profiles?.full_name?.[0] || "?"}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold">{review.profiles?.full_name || "Anonymous"}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 text-primary">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-primary" : "opacity-20")} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pl-16 space-y-4">
                                            <div className="flex items-center space-x-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-fit uppercase tracking-wider italic border border-green-100">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Verified Reviewer</span>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed italic text-balance">
                                                "{review.comment}"
                                            </p>
                                            <button className="flex items-center space-x-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
                                                <ThumbsUp className="h-4 w-4 group-active:scale-125 transition-transform" />
                                                <span>Helpful</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="w-full h-14 rounded-2xl border text-sm font-bold hover:bg-muted transition-all flex items-center justify-center space-x-2 group">
                            <span>Load More Reviews</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
