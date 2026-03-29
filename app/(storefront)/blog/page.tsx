import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BlogListPage() {
    const supabase = createClient();
    const { data: blogPosts } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false });

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Insights & Stories</p>
                <h1 className="text-5xl font-bold font-lufga">Our Journal</h1>
            </div>

            {!blogPosts || blogPosts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No blog posts found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {blogPosts.map((post) => (
                        <article key={post.id} className="group cursor-pointer space-y-4">
                            <Link href={`/blog/${post.slug}`}>
                                <div className="aspect-[16/10] overflow-hidden rounded-2xl relative shadow-md bg-muted">
                                    {post.featured_image && (
                                        <img
                                            src={post.featured_image}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            alt={post.title}
                                        />
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        Post
                                    </div>
                                </div>
                            </Link>
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-medium">
                                    {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <h2 className="text-2xl font-bold hover:text-primary transition-colors leading-tight">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h2>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="pt-2">
                                    <Link href={`/blog/${post.slug}`} className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-primary transition-colors">
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
