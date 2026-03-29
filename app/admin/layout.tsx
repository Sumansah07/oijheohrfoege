import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Bell, Search, User } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center relative max-w-md w-full">
                        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search anything..."
                            className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                        </button>
                        <div className="h-8 w-[1px] bg-border mx-2" />
                        <div className="flex items-center space-x-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold leading-none group-hover:text-primary transition-colors">Admin User</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border group-hover:border-primary transition-all">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-muted/20 p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    )
}
