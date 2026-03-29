"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingCart,
    Users,
    Settings,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    Menu,
    MessageSquare,
    HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: Layers, label: "Categories", href: "/admin/categories" },
    { icon: ImageIcon, label: "Banners", href: "/admin/banners" },
    { icon: FileText, label: "Blogs", href: "/admin/blogs" },
    { icon: Menu, label: "Navigation", href: "/admin/navigation" },
    { icon: Users, label: "Customers", href: "/admin/customers" },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
    { icon: HelpCircle, label: "FAQs", href: "/admin/faqs" },
    { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = "/login"
    }

    return (
        <aside
            className={cn(
                "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center px-6 border-b">
                {!isCollapsed && (
                    <span className="text-lg font-bold tracking-tight font-lufga">
                        MODERN<span className="text-primary truncate">ADMIN</span>
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "ml-auto p-1.5 rounded-lg border bg-background hover:bg-muted transition-colors",
                        isCollapsed && "mx-auto"
                    )}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                            {!isCollapsed && <span className="text-xs font-bold tracking-tight">{item.label}</span>}
                            {isActive && !isCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
                <Link
                    href="/"
                    target="_blank"
                    className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                        isCollapsed && "justify-center"
                    )}
                >
                    <ExternalLink className="h-5 w-5" />
                    {!isCollapsed && <span className="text-xs font-bold">View Store</span>}
                </Link>
                <button
                    onClick={handleSignOut}
                    className={cn(
                        "flex w-full items-center space-x-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="text-xs font-bold">Sign Out</span>}
                </button>
            </div>
        </aside>
    )
}
