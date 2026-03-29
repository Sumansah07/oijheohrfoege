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

    try {
        const { is_active } = await request.json();
        const { data, error } = await supabase
            .from("profiles")
            .update({ is_active })
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient();
    if (!await requireAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        // Note: profiles has ON DELETE CASCADE from auth.users, 
        // but we might want to delete from auth.users directly if using admin API.
        // For now, we only delete the profile metadata if that's what's intended,
        // but usually "delete user" means deleting from auth.users.
        // Since we don't have service_role here easily, we delete the profile.
        const { error } = await supabase.from("profiles").delete().eq("id", params.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
