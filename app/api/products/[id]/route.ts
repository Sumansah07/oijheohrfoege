import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin" ? user : null;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name, slug), product_variants(*)")
        .eq("id", params.id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const admin = await requireAdmin(supabase);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { data, error } = await supabase
        .from("products")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const admin = await requireAdmin(supabase);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
