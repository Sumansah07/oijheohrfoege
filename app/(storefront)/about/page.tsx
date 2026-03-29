import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
    const supabase = createClient();
    const { data: settings } = await supabase.from("site_settings").select("*").single();
    const storeName = settings?.store_name || "Modern Store";

    return (
        <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-3xl mx-auto space-y-12 text-center">
                <div className="space-y-4">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Our Story</p>
                    <h1 className="text-5xl font-bold font-lufga">Crafting Excellence Since 2024</h1>
                </div>

                <div className="aspect-video relative rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2074&auto=format&fit=crop" className="h-full w-full object-cover" alt="Our Workspace" />
                </div>

                <div className="space-y-6 text-left text-lg text-muted-foreground leading-relaxed">
                    <p>
                        Welcome to {storeName}, where we believe that style should be accessible, sustainable, and timeless. Founded in 2024, our mission has always been to bridge the gap between high-end luxury and everyday essentials.
                    </p>
                    <p>
                        We partner with independent artisans and ethical manufacturers across the globe to bring you a curated selection of products that don't just look good, but feel good to wear and own. Every piece in our collection is a testament to our commitment to quality.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold font-lufga text-primary">10k+</h3>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Happy Customers</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold font-lufga text-primary">500+</h3>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Products Curated</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold font-lufga text-primary">24/7</h3>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Customer Support</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
