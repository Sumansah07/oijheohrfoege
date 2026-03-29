import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modernstore.com";

    const { data: products } = await supabase.from("products").select("slug, updated_at");
    const { data: categories } = await supabase.from("categories").select("slug, updated_at");

    const staticPages = ["", "/about", "/contact", "/blog", "/faq", "/login", "/register"];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages.map(page => `
        <url>
          <loc>${baseUrl}${page}</loc>
          <changefreq>daily</changefreq>
          <priority>${page === "" ? "1.0" : "0.8"}</priority>
        </url>
      `).join("")}
      ${products?.map(p => `
        <url>
          <loc>${baseUrl}/product/${p.slug}</loc>
          <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join("") || ""}
      ${categories?.map(c => `
        <url>
          <loc>${baseUrl}/category/${c.slug}</loc>
          <lastmod>${new Date(c.updated_at).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `).join("") || ""}
    </urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
