import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

    if (error) {
        // If no settings found, return default
        return NextResponse.json({
            logo_type: 'text',
            logo_text: 'MODERNSTORE',
            store_name: 'Modern Store'
        });
    }
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();

    // Define allowed fields to avoid schema mismatch errors
    const allowedFields = [
        'logo_type',
        'logo_text',
        'logo_image_url',
        'store_name',
        'store_url',
        'store_description',
        'contact_email',
        'contact_phone',
        'address',
        'social_links',
        'footer_config',
        'navigation_config',
        'marquee_config'
    ];

    const filteredBody = Object.keys(body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
            obj[key] = body[key];
            return obj;
        }, {});

    // Get existing settings to see if we need to update or insert
    const { data: existing } = await supabase.from("site_settings").select("id").single();

    let result;
    if (existing) {
        result = await supabase
            .from("site_settings")
            .update({
                ...filteredBody,
                updated_at: new Date().toISOString()
            })
            .eq("id", existing.id)
            .select()
            .single();
    } else {
        result = await supabase
            .from("site_settings")
            .insert(filteredBody)
            .select()
            .single();
    }

    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
}
