import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Calendar, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
    const supabase = createClient()
    const { data: post } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single()

    if (!post) notFound()

    return (
        <article className="min-h-screen">
            {/* Hero Image */}
            {post.featured_image && (
                <div className="h-[60vh] w-full relative">
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            )}

            <div className="container mx-auto px-4 -mt-32 relative z-10">
                <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-8">
                    <Link href="/blog" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Journal
                    </Link>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold font-lufga leading-tight">{post.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium pt-4 border-t border-gray-100">
                            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><User className="h-4 w-4" /> {post.author}</span>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none prose-headings:font-lufga prose-p:leading-relaxed prose-img:rounded-3xl">
                        {/* We use dangerouslySetInnerHTML for HTML content from the editor */}
                        <div className="whitespace-pre-wrap font-serif text-lg leading-loose text-gray-700">
                            {post.content}
                        </div>
                    </div>
                </div>
            </div>

            {/* Read More Section logic could go here */}
            <div className="py-24" />
        </article>
    )
}
