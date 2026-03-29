import { createClient } from "@/lib/supabase/server";
import { paymentRegistry } from "@/lib/payments/registry";
import { eSewaAdapter } from "@/lib/payments/adapters/esewa";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return new Response("Missing Order ID", { status: 400 });
    }

    // Use Admin client to bypass RLS for order fetching (system operation)
    const { createClient: createSupabaseAdmin } = await import("@supabase/supabase-js");
    const supabaseAdmin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        console.error("Initiate Fetch Error:", orderError);
        return new Response("Order not found", { status: 404 });
    }

    const esewa = paymentRegistry.get("esewa") as eSewaAdapter;
    const origin = new URL(request.url).origin;
    const formFields = esewa.getFormFields(order.id, order.total_amount, origin);

    console.log(`[Initiate Route] Rendering eSewa form for order ${order.id}`);

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Redirecting to eSewa...</title>
        </head>
        <body onload="document.forms[0].submit()">
            <div style="text-align: center; margin-top: 50px;">
                <h1>Redirecting to eSewa...</h1>
                <p>Please do not refresh the page.</p>
                <form action="${formFields.action}" method="POST">
                    ${Object.entries(formFields)
                        .filter(([key]) => key !== 'action')
                        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                        .join('\n')}
                    <button type="submit" style="display: none;">Click here if not redirected</button>
                </form>
            </div>
        </body>
        </html>
    `;

    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
        },
    });
}
