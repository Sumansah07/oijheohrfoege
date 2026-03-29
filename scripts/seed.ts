import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
    console.log("Seeding categories...");
    const { data: cats, error: ce } = await supabase.from("categories").upsert([
        { name: "Men", slug: "men", description: "Menswear collection", image_url: "https://images.unsplash.com/photo-1488161628813-244aa2f87739?w=800", is_active: true },
        { name: "Women", slug: "women", description: "Womenswear collection", image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", is_active: true },
        { name: "Accessories", slug: "accessories", description: "Bags, watches & more", image_url: "https://images.unsplash.com/photo-1548036691-03291888b64e?w=800", is_active: true }
    ], { onConflict: "slug" }).select();

    if (ce) { console.error("Categories err:", ce); return; }

    const categoryMap = cats.reduce((acc, c) => ({ ...acc, [c.slug]: c.id }), {});

    console.log("Seeding products...");
    const products = [
        {
            name: "Classic Linen Blazer", slug: "classic-linen-blazer", description: "Premium linen blazer for warm weather. Natural horn buttons.",
            base_price: 249.00, discount_price: 320.00, category_id: categoryMap["men"],
            featured_image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e91?w=800",
            images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4e91?w=1200", "https://images.unsplash.com/photo-1507679799987-c73774586bd9?w=1200"],
            stock_quantity: 45, sku: "BLZ-001", is_featured: true, is_active: true,
            metadata: { colors: ["Beige", "Navy", "Charcoal"], sizes: ["S", "M", "L", "XL", "XXL"] }
        },
        {
            name: "Oxford Button-Down Shirt", slug: "oxford-button-down-shirt", description: "100% cotton Oxford cloth wardrobe staple.",
            base_price: 89.00, discount_price: null, category_id: categoryMap["men"],
            featured_image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
            images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200"],
            stock_quantity: 120, sku: "SHT-002", is_featured: true, is_active: true,
            metadata: { colors: ["White", "Blue", "Grey"], sizes: ["S", "M", "L", "XL"] }
        },
        {
            name: "Silk Wrap Dress", slug: "silk-wrap-dress", description: "A flowing wrap dress in pure silk.",
            base_price: 189.00, discount_price: 229.00, category_id: categoryMap["women"],
            featured_image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
            images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200"],
            stock_quantity: 35, sku: "DRS-001", is_featured: true, is_active: true,
            metadata: { colors: ["Ivory", "Dusty Rose", "Forest Green"], sizes: ["XS", "S", "M", "L"] }
        },
        {
            name: "Minimalist Leather Watch", slug: "minimalist-leather-watch", description: "Swiss movement with slim stainless steel case.",
            base_price: 159.00, discount_price: 199.00, category_id: categoryMap["accessories"],
            featured_image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
            images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200"],
            stock_quantity: 25, sku: "WTC-001", is_featured: true, is_active: true,
            metadata: { colors: ["Black Strap", "Brown Strap"], sizes: ["One Size"] }
        }
    ];

    const { error: pe } = await supabase.from("products").upsert(products, { onConflict: "slug" });
    if (pe) console.error("Products err:", pe);
    else console.log("Seeding complete!");
}

seed();
