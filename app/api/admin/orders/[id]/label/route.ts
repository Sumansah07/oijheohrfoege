import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
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
        .select("*, order_items(*, products(name))")
        .eq("id", params.id)
        .single();

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate simple HTML label (in production, this would be a proper PDF from DHL)
    const labelHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 0;
            size: A4 portrait;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .label {
            max-width: 700px;
            margin: 0 auto;
            border: 4px solid black;
            padding: 25px;
            box-sizing: border-box;
            page-break-inside: avoid;
        }
        
        .header {
            text-align: center;
            border-bottom: 4px solid black;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        
        .logo {
            font-size: 42px;
            font-weight: bold;
            color: #D40511;
            line-height: 1;
            margin-bottom: 6px;
        }
        
        .subtitle {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .section {
            margin: 15px 0;
            padding: 12px;
            border: 2px solid #ccc;
            background: #f9f9f9;
            border-radius: 6px;
        }
        
        .section-title {
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 6px;
            color: #333;
            letter-spacing: 1px;
        }
        
        .barcode-section {
            margin: 20px 0;
            text-align: center;
        }
        
        .barcode {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 12px 0;
            padding: 18px;
            border: 4px solid black;
            background: white;
            word-wrap: break-word;
            display: inline-block;
            min-width: 80%;
        }
        
        .info {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .tracking-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 12px 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 2px solid #eee;
        }
        
        @media print {
            body {
                padding: 10px;
            }
            .label {
                border: 4px solid black;
                page-break-after: avoid;
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <div class="logo">DHL EXPRESS</div>
            <div class="subtitle">Shipping Label</div>
        </div>

        <div class="section">
            <div class="section-title">From (Shipper)</div>
            <div class="info">
                <strong>${process.env.WAREHOUSE_NAME || 'Your Store'}</strong><br>
                ${process.env.WAREHOUSE_ADDRESS || '123 Warehouse St'}<br>
                ${process.env.WAREHOUSE_CITY || 'New York'}, ${process.env.WAREHOUSE_STATE || 'NY'} ${process.env.WAREHOUSE_ZIP || '10001'}<br>
                ${process.env.WAREHOUSE_COUNTRY || 'US'}<br>
                Phone: ${process.env.WAREHOUSE_PHONE || '+1-555-0000'}
            </div>
        </div>

        <div class="section">
            <div class="section-title">To (Recipient)</div>
            <div class="info">
                <strong>${(order.shipping_address as any)?.name || 'Customer'}</strong><br>
                ${(order.shipping_address as any)?.line1 || 'Address'}<br>
                ${(order.shipping_address as any)?.city || 'City'}, ${(order.shipping_address as any)?.state || 'State'} ${(order.shipping_address as any)?.postal_code || 'ZIP'}<br>
                ${(order.shipping_address as any)?.country || 'Country'}<br>
                ${(order.shipping_address as any)?.email ? `Email: ${(order.shipping_address as any).email}` : ''}
            </div>
        </div>

        <div class="barcode-section">
            <div class="tracking-title">Tracking Number</div>
            <div class="barcode">
                ${order.tracking_number || 'NO-TRACKING'}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Service Details</div>
            <div class="info">
                <strong>Service:</strong> ${order.shipping_method || 'DHL Express Worldwide'}<br>
                <strong>Weight:</strong> 0.5 kg<br>
                <strong>Packages:</strong> 1<br>
                <strong>Order ID:</strong> #${order.id.split('-')[0].toUpperCase()}
            </div>
        </div>

        <div class="footer">
            Order Date: ${new Date(order.created_at).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}<br>
            Generated: ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        // Auto-print when opened
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
    `;

    return new NextResponse(labelHTML, {
        headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="shipping-label-${order.tracking_number}.html"`
        }
    });
}
