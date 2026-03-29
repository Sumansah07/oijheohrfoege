import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "24");
    const offset = parseInt(searchParams.get("offset") || "0");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sort = searchParams.get("sort") || "created_at:desc";

    const supabase = createClient();

    let dbQuery = supabase
        .from("products")
        .select("*, categories(id, name, slug)", { count: "exact" })
        .eq("is_active", true);

    if (category) {
        // Join through category slug
        const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
        if (cat) dbQuery = dbQuery.eq("category_id", cat.id);
    }

    if (featured === "true") dbQuery = dbQuery.eq("is_featured", true);
    if (query) dbQuery = dbQuery.ilike("name", `%${query}%`);
    if (minPrice) dbQuery = dbQuery.gte("base_price", parseFloat(minPrice));
    if (maxPrice) dbQuery = dbQuery.lte("base_price", parseFloat(maxPrice));

    const [sortField, sortDir] = sort.split(":");
    dbQuery = dbQuery.order(sortField || "created_at", { ascending: sortDir === "asc" });

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ products: data || [], total: count || 0 });
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();

    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
        const base = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        body.slug = `${base}-${Date.now()}`;
    }

    const { data, error } = await supabase.from("products").insert([body]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
