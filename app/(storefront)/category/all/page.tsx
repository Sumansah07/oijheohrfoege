import { createClient } from "@/lib/supabase/server";
import { ChevronRight, FolderTree } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

export default async function AllCategoriesPage() {
    const supabase = createClient();

    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, description")
        .eq("is_active", true)
        .order("name");

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-xs text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-medium">All Categories</span>
            </nav>

            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold font-lufga">All Categories</h1>
                    <p className="text-muted-foreground mt-2">Explore our entire collection by category.</p>
                </div>

                {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                href={`/category/${category.slug}`}
                                key={category.id}
                                className="group relative overflow-hidden rounded-2xl bg-muted aspect-square block"
                            >
                                {category.image_url ? (
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <FolderTree className="h-12 w-12 mb-2" />
                                        <span className="text-sm font-medium">No Image</span>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    {category.description && (
                                        <p className="text-sm text-white/80 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border rounded-3xl bg-muted/30">
                        <FolderTree className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Categories Found</h2>
                        <p className="text-muted-foreground">Check back later for new arrivals.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
