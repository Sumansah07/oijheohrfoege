import { Star, MessageSquare, ShieldCheck, ChevronRight, PenTool } from "lucide-react"
import Link from "next/link"

export default function AccountReviewsPage() {
    const reviews = [
        {
            id: 1,
            product: "Premium Leather Jacket",
            rating: 5,
            date: "26 May, 2024",
            comment: "Absolutely stunning quality. The fit is perfect and the leather feels incredibly premium. Worth every penny!",
            status: "Approved",
            image: "https://images.unsplash.com/photo-1591047139829-d91aec16adbb?q=80&w=100"
        },
        {
            id: 2,
            product: "Minimalist Watch",
            rating: 4,
            date: "14 May, 2024",
            comment: "Great minimal design. Only wish the strap was slightly longer, but otherwise excellent.",
            status: "Approved",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100"
        }
    ]

    const pendingReviews = [
        {
            id: 3,
            product: "Canvas Totebag",
            date: "Yesterday",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=100"
        }
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-bold font-lufga tracking-tight">Your Reviews</h1>
                <p className="text-muted-foreground mt-1 italic">Sharing your experience helps the community.</p>
            </div>

            <div className="space-y-12">
                {/* Pending Reviews Section */}
                {pendingReviews.length > 0 && (
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
                            <PenTool className="h-4 w-4" />
                            <span>Pending Feedback</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingReviews.map((review) => (
                                <div key={review.id} className="bg-primary/[0.03] border border-dashed border-primary/30 rounded-3xl p-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-12 rounded-2xl overflow-hidden bg-muted border">
                                            <img src={review.image} className="h-full w-full object-cover" alt={review.product} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold">{review.product}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5 italic">Order delivered {review.date}</p>
                                        </div>
                                    </div>
                                    <button className="h-10 px-4 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                                        Review Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Published Reviews */}
                <section className="space-y-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Published Experience ({reviews.length})</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-8">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-card border rounded-[2rem] p-8 shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="h-28 w-24 rounded-2xl overflow-hidden border bg-muted shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                        <img src={review.image} className="h-full w-full object-cover" alt={review.product} />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center space-x-1 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                                                    ))}
                                                </div>
                                                <h4 className="text-xl font-bold font-lufga">{review.product}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider italic">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    <span>Verified Purchase</span>
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">{review.date}</p>
                                            </div>
                                        </div>

                                        <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                                            "{review.comment}"
                                        </p>

                                        <div className="flex items-center space-x-4 pt-4">
                                            <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1 underline underline-offset-4">
                                                <span>Edit Review</span>
                                            </button>
                                            <button className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors underline underline-offset-4">
                                                <span>Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="p-8 bg-muted/20 border border-dashed rounded-3xl text-center space-y-3">
                <p className="text-sm text-muted-foreground font-medium italic">"Quality is remembered long after price is forgotten."</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">— Aldo Gucci</p>
            </div>
        </div>
    )
}

function cn(...args: any[]) {
    return args.filter(Boolean).join(" ")
}
