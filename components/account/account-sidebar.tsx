"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    User,
    ShoppingBag,
    MapPin,
    Heart,
    Bell,
    LogOut,
    ChevronRight,
    LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/account/dashboard" },
    { icon: ShoppingBag, label: "My Orders", href: "/account/orders" },
    { icon: Heart, label: "Wishlist", href: "/account/wishlist" },
    { icon: MapPin, label: "Addresses", href: "/account/addresses" },
    { icon: User, label: "Profile Info", href: "/account/profile" },
]

interface AccountSidebarProps {
    profile: {
        full_name: string | null
        avatar_url: string | null
        role: string | null
    } | null
}

export function AccountSidebar({ profile }: AccountSidebarProps) {
    const pathname = usePathname()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = "/"
    }

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map(n => n[0]).join("")
        : "U"

    // Only show "Admin Panel" if user is an admin
    const items = [...sidebarItems]
    if (profile?.role === "admin") {
        items.push({ icon: LayoutDashboard, label: "Admin Panel", href: "/admin/dashboard" })
    }

    return (
        <aside className="w-full md:w-80 shrink-0 space-y-8">
            <div className="bg-card border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border text-2xl font-bold text-primary overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-lufga">{profile?.full_name || "User"}</h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px] mt-1">
                            {profile?.role === "admin" ? "Admin Member" : "Account Member"}
                        </p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.label + item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                </div>
                                {!isActive && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-8 pt-8 border-t">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center space-x-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden hidden md:block">
                <h4 className="text-lg font-bold">Need Help?</h4>
                <p className="text-sm text-muted-foreground mt-2">Our support team is available 24/7 for your fashion needs.</p>
                <Link href="/contact" className="inline-block mt-4 text-sm font-bold text-primary underline">Contact Support</Link>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/10 rounded-full blur-2xl" />
            </div>
        </aside>
    )
}
