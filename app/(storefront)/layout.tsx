import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { QuickViewModal } from "@/components/shared/quick-view-modal";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    // Fetch essential layout data in parallel
    const [
        { data: settings },
        { data: navigation }
    ] = await Promise.all([
        supabase.from("site_settings").select("*").single(),
        supabase.from("navigation_links").select("*").order("order_index", { ascending: true })
    ]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar initialSettings={settings} initialLinks={navigation || []} />
            <main className="flex-1">{children}</main>
            <Footer initialSettings={settings} />
            <CartDrawer />
            <QuickViewModal />
        </div>
    );
}
