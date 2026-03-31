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

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { pickup_date, pickup_time, packages_count } = body;

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

    if (!order.tracking_number) {
        return NextResponse.json({ 
            error: "Please generate shipping label first" 
        }, { status: 400 });
    }

    // TODO: In production, call actual DHL Pickup API here
    // Example: POST https://api.dhl.com/pickups
    /*
    const dhlResponse = await fetch('https://api.dhl.com/pickups', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.DHL_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pickup_date,
            pickup_time,
            location: process.env.WAREHOUSE_ADDRESS,
            packages: packages_count,
            tracking_numbers: [order.tracking_number]
        })
    });
    */

    // Mock pickup confirmation
    const pickupConfirmation = `PKP${Date.now()}`;

    // Update order with pickup info
    const { error } = await supabaseAdmin
        .from("orders")
        .update({
            pickup_scheduled: true,
            pickup_date,
            pickup_time,
            pickup_confirmation: pickupConfirmation,
            status: 'processing',
            updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        pickup_confirmation: pickupConfirmation,
        pickup_date,
        pickup_time,
        message: `Pickup scheduled for ${pickup_date} at ${pickup_time}`
    });
}
