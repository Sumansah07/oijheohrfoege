import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get order details
    const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // TODO: In production, call actual DHL API here
    // For now, generate mock tracking number and label
    const trackingNumber = `DHL${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Mock label URL - in production, this would be from DHL API
    const labelUrl = `/api/admin/orders/${params.id}/label.pdf`;

    // Update order with tracking info
    const { error } = await supabaseAdmin
        .from("orders")
        .update({
            tracking_number: trackingNumber,
            shipping_label_url: labelUrl,
            status: order.status === 'pending' ? 'processing' : order.status,
            updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        tracking_number: trackingNumber,
        label_url: labelUrl
    });
}
