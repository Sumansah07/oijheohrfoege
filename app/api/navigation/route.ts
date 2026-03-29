import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("navigation_links")
        .select("*")
        .order("order_index", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { links } = await request.json();

    // 1. Get all current IDs in DB to determine what to delete
    const { data: currentLinks } = await supabase.from("navigation_links").select("id");
    const incomingIds = links.map((l: any) => l.id);
    const idsToDelete = currentLinks?.map((cl: any) => cl.id).filter(id => !incomingIds.includes(id)) || [];

    if (idsToDelete.length > 0) {
        await supabase.from("navigation_links").delete().in("id", idsToDelete);
    }

    // 2. Prepare links for upsert
    const cleanLinks = links.map((l: any) => ({
        id: l.id,
        label: l.label,
        url: l.url,
        order_index: l.order_index,
        is_active: l.is_active,
        parent_id: l.parent_id
    }));

    const { data, error } = await supabase.from("navigation_links").upsert(cleanLinks).select();

    if (error) {
        console.error("Navigation Upsert Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}
