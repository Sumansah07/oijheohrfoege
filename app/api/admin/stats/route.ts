import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Parallel queries for dashboard stats
    const [
        { count: totalOrders },
        { count: totalProducts },
        { count: totalCustomers },
        { data: revenueData },
        { data: recentOrders },
        { data: topProducts }
    ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("total_amount"),
        supabase.from("orders")
            .select("id, total_amount, status, created_at, profiles(full_name)")
            .order("created_at", { ascending: false })
            .limit(5),
        supabase.from("products")
            .select("id, name, base_price, featured_image, stock_quantity")
            .eq("is_featured", true)
            .limit(5)
    ]);

    const totalRevenue = (revenueData || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
    const avgOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
        stats: {
            totalOrders: totalOrders || 0,
            totalProducts: totalProducts || 0,
            totalCustomers: totalCustomers || 0,
            totalRevenue: totalRevenue.toFixed(2),
            avgOrderValue: avgOrderValue.toFixed(2),
        },
        recentOrders: recentOrders || [],
        topProducts: topProducts || [],
    });
}
