import { Save, User, Mail, Phone } from "lucide-react"
import { PasswordChangeForm } from "@/components/auth/password-change-form"
import { createClient } from "@/lib/supabase/server"

export default async function AccountProfilePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
        profile = data
    }

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map((n: string) => n[0]).join("")
        : "U"

    const firstName = profile?.full_name?.split(" ")[0] || ""
    const lastName = profile?.full_name?.split(" ").slice(1).join(" ") || ""

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-bold font-lufga tracking-tight">Profile Details</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information and security settings.</p>
            </div>

            <div className="grid grid-cols-1 gap-12">
                <div className="space-y-8">
                    <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-8">
                        <div className="flex items-center space-x-6">
                            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/30 relative group cursor-pointer overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name || "User"} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-primary group-hover:opacity-20 transition-opacity">{initials}</span>
                                )}
                                <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase">Change</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-lufga">Profile Picture</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-balance">Format: JPG, PNG. Max size: 2MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input type="text" defaultValue={firstName} className="h-12 w-full rounded-2xl border bg-muted/20 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input type="text" defaultValue={lastName} className="h-12 w-full rounded-2xl border bg-muted/20 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <div className="relative opacity-70">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input type="email" defaultValue={profile?.email || user?.email || ""} disabled className="h-12 w-full rounded-2xl border bg-muted/10 pl-11 pr-4 text-sm cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input type="tel" defaultValue={profile?.phone_number || ""} className="h-12 w-full rounded-2xl border bg-muted/20 pl-11 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                            </div>
                        </div>

                        <button className="h-14 px-10 rounded-2xl bg-primary text-white font-bold flex items-center justify-center space-x-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                            <Save className="h-5 w-5" />
                            <span>Update Profile</span>
                        </button>
                    </div>

                    <div className="bg-card border rounded-3xl p-8 shadow-sm border-l-4 border-l-primary/50">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold font-lufga">Password & Security</h3>
                            <p className="text-sm text-muted-foreground mt-1">Change your password and manage your security settings.</p>
                        </div>

                        <PasswordChangeForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

