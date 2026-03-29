import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function requireAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin" ? user : null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { status } = await request.json();
    const { data, error } = await supabase.from("reviews").update({ status }).eq("id", params.id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { error } = await supabase.from("reviews").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
