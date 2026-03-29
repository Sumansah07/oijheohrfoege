import { createClient } from "@/lib/supabase/server"
import { AccountSidebar } from "@/components/account/account-sidebar"

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile
    let profile = null
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, role")
            .eq("id", user.id)
            .single()
        profile = data
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-col md:flex-row gap-12">
                <AccountSidebar profile={profile} />

                {/* Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
