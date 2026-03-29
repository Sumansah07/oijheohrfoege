"use client"

import * as React from "react"
import { Plus, Minus, Loader2, HelpCircle } from "lucide-react"

export default function FAQPage() {
    const [faqs, setFaqs] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await fetch("/api/faqs")
                const data = await res.json()
                if (data && !data.error) {
                    setFaqs(data)
                }
            } catch (error) {
                console.error("Failed to fetch FAQs", error)
            } finally {
                setLoading(false)
            }
        }
        fetchFaqs()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-16 lg:py-24 max-w-3xl">
            <div className="text-center space-y-4 mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Help Center</p>
                <h1 className="text-5xl font-bold font-lufga">Frequently Asked Questions</h1>
            </div>

            <div className="space-y-4">
                {faqs.length > 0 ? faqs.map((faq, index) => (
                    <details key={faq.id || index} className="group border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:shadow-xl open:border-primary/20">
                        <summary className="flex items-center justify-between p-6 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors group-open:bg-primary/5">
                            <h3 className="text-lg font-bold pr-10">{faq.question}</h3>
                            <div className="h-10 w-10 rounded-full border bg-white flex items-center justify-center shrink-0">
                                <Plus className="h-5 w-5 group-open:hidden text-primary" />
                                <Minus className="h-5 w-5 hidden group-open:block text-primary" />
                            </div>
                        </summary>
                        <div className="p-8 text-muted-foreground leading-relaxed border-t bg-white animate-in slide-in-from-top-2 duration-300">
                            {faq.answer}
                        </div>
                    </details>
                )) : (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
                        <HelpCircle className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-bold text-muted-foreground">No FAQs available at the moment.</p>
                    </div>
                )}
            </div>

            <div className="mt-20 p-12 bg-primary rounded-3xl text-center text-white space-y-6 shadow-2xl shadow-primary/20">
                <h2 className="text-3xl font-bold font-lufga">Still have questions?</h2>
                <p className="opacity-90 max-w-md mx-auto font-medium">Our support team is always here to help. Reach out to us anytime.</p>
                <div className="pt-4">
                    <a href="/contact" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-110 transition-transform shadow-lg">Contact Support</a>
                </div>
            </div>
        </div>
    );
}

