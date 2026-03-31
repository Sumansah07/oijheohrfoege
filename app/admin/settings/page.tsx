"use client"

import { useState, useEffect, useRef } from "react"
import {
    Store,
    CreditCard,
    Truck,
    Bell,
    Shield,
    Globe,
    ExternalLink,
    Save,
    ChevronRight,
    Type,
    Image as ImageIcon,
    Upload,
    Loader2,
    X,
    Settings,
    Menu,
    Layout,
    List,
    Plus,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Zap,
    FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadToCloudinary } from "@/lib/actions/upload"
import { useToast } from "@/store/use-toast"

const STATIC_PAGES = [
    { label: "Home", url: "/" },
    { label: "All Products", url: "/category/all" },
    { label: "Contact Us", url: "/contact" },
    { label: "About Us", url: "/about" },
    { label: "FAQs", url: "/faq" },
    { label: "Blog", url: "/blog" },
    { label: "Cart", url: "/cart" },
    { label: "My Account", url: "/account/dashboard" },
]

const LinkSelector = ({
    value,
    onChange,
    categories,
    products,
    placeholder = "Select link..."
}: {
    value: string,
    onChange: (url: string, label?: string) => void,
    categories: any[],
    products: any[],
    placeholder?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const options = [
        { group: "Static Pages", items: STATIC_PAGES },
        { group: "Categories", items: (Array.isArray(categories) ? categories : []).map(c => ({ label: c.name, url: `/category/${c.slug}` })) },
        { group: "Products", items: (Array.isArray(products) ? products : []).map(p => ({ label: p.name, url: `/product/${p.slug}` })) },
    ];

    const filteredOptions = options.map(g => ({
        ...g,
        items: g.items.filter(i =>
            i.label.toLowerCase().includes(search.toLowerCase()) ||
            i.url.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(g => g.items.length > 0);

    return (
        <div className="relative flex-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="h-9 w-full px-3 rounded-xl border border-muted bg-white/50 text-[10px] font-bold text-left flex items-center justify-between hover:bg-white transition-all shadow-sm"
            >
                <span className="truncate flex-1 pr-2">{value ? (
                    STATIC_PAGES.find(p => p.url === value)?.label ||
                    (Array.isArray(categories) ? categories : []).find(c => `/category/${c.slug}` === value)?.name ||
                    (Array.isArray(products) ? products : []).find(p => `/product/${p.slug}` === value)?.name ||
                    value
                ) : placeholder}</span>
                <ChevronRight className={cn("h-3 w-3 transition-transform text-muted-foreground", isOpen ? "rotate-90" : "")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border-2 rounded-2xl shadow-2xl z-[70] max-h-80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-3 border-b bg-muted/10">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search pages..."
                                className="w-full h-8 px-3 rounded-lg border bg-white text-[10px] focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? filteredOptions.map(group => (
                                <div key={group.group}>
                                    <div className="px-3 py-1.5 bg-muted/20 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{group.group}</div>
                                    {group.items.map(item => (
                                        <button
                                            key={item.url}
                                            type="button"
                                            onClick={() => {
                                                onChange(item.url, item.label);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-[10px] text-left hover:bg-primary/5 hover:text-primary transition-all flex flex-col group/item"
                                        >
                                            <span className="font-bold group-hover/item:translate-x-1 transition-transform">{item.label}</span>
                                            <span className="text-[8px] opacity-40 font-medium truncate">{item.url}</span>
                                        </button>
                                    ))}
                                </div>
                            )) : (
                                <div className="p-4 text-center text-muted-foreground text-[10px] font-medium italic">No results found</div>
                            )}
                        </div>
                        <div className="p-2 border-t bg-muted/5 flex flex-col gap-1">
                            <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest px-1">Or paste custom URL</p>
                            <input
                                type="text"
                                placeholder="https://..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onChange(e.currentTarget.value);
                                        setIsOpen(false);
                                    }
                                }}
                                className="h-8 px-2 rounded-lg border bg-white text-[10px] outline-none"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default function AdminSettingsPage() {
    const { addToast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeSection, setActiveSection] = useState("Store Info")
    const [categories, setCategories] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [paymentProviders, setPaymentProviders] = useState<any[]>([])
    const [shippingProviders, setShippingProviders] = useState<any[]>([])

    const [settings, setSettings] = useState<any>({
        logo_type: "text",
        logo_text: "MODERNSTORE",
        logo_image_url: "",
        store_name: "Modern Store",
        contact_email: "hello@modernstore.com",
        contact_phone: "+1 (555) 000-0000",
        address: "123 Design St, Creative City, ST 12345",
        store_url: "modernstore.com",
        store_description: "Premium fashion and lifestyle artifacts for the modern world...",
        social_links: {
            facebook: "",
            instagram: "",
            twitter: "",
            youtube: ""
        },
        footer_config: {
            columns: [
                { id: "Shop", title: "Shop", links: [{ label: "Men", url: "/category/men" }, { label: "Women", url: "/category/women" }] },
                { id: "Support", title: "Support", links: [{ label: "FAQs", url: "/faq" }] }
            ],
            copyright_text: "© 2026 Modern Store. All rights reserved.",
            legal_links: [
                { label: "Privacy Policy", url: "/privacy-policy" },
                { label: "Terms & Conditions", url: "/terms" }
            ]
        },
        navigation_config: [
            { id: "Home", label: "Home", url: "/" },
            { id: "Shop", label: "Shop", url: "/category/all" }
        ],
        marquee_config: {
            items: [
                { icon: "Truck", title: "Fast Delivery", desc: "Standard & Express options" },
                { icon: "ShieldCheck", title: "Secure Payment", desc: "Stripe & PayPal integrated" },
                { icon: "Clock", title: "24/7 Support", desc: "Always here to help you" },
                { icon: "Zap", title: "Easy Returns", desc: "14-day return policy" }
            ],
            style: {
                speed: 40,
                height: 100,
                bg_type: "solid",
                bg_color: "#000000",
                bg_gradient: "linear-gradient(to right, #000, #111)",
                text_color: "#ffffff",
                accent_color: "#ff3366",
                font_size: 14,
                font_family: "lufga"
            }
        },
        shipping_config: {
            free_shipping_threshold: 0,
            default_rate: 10.00,
            weight_unit: "kg",
            dimension_unit: "cm"
        }
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, categoriesRes, productsRes, providersRes, shippingRes] = await Promise.all([
                    fetch("/api/settings"),
                    fetch("/api/categories"),
                    fetch("/api/products?limit=100"),
                    fetch("/api/admin/payment-providers"),
                    fetch("/api/admin/shipping-providers")
                ])

                const [settingsData, categoriesData, productsData, providersData, shippingData] = await Promise.all([
                    settingsRes.json(),
                    categoriesRes.json(),
                    productsRes.json(),
                    providersRes.json(),
                    shippingRes.json()
                ])

                if (settingsData && !settingsData.error) {
                    setSettings((prev: any) => ({
                        ...prev,
                        ...settingsData,
                        contact_phone: settingsData.contact_phone || prev.contact_phone,
                        address: settingsData.address || prev.address,
                        store_url: settingsData.store_url || "modernstore.com",
                        store_description: settingsData.store_description || prev.store_description,
                        social_links: settingsData.social_links || prev.social_links,
                        footer_config: {
                            ...prev.footer_config,
                            ...settingsData.footer_config,
                        },
                        marquee_config: {
                            items: Array.isArray(settingsData.marquee_config) ? settingsData.marquee_config : (settingsData.marquee_config?.items || prev.marquee_config.items),
                            style: settingsData.marquee_config?.style || prev.marquee_config.style,
                        },
                    }))
                }

                if (categoriesData && !categoriesData.error) {
                    setCategories(categoriesData.categories || categoriesData || [])
                }

                if (productsData && !productsData.error) {
                    setProducts(productsData.products || productsData || [])
                }

                if (providersData && !providersData.error) {
                    setPaymentProviders(providersData || [])
                }

                if (shippingData && !shippingData.error) {
                    setShippingProviders(shippingData || [])
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            if (res.ok) {
                addToast("Settings saved successfully", "success")
            } else {
                const errorData = await res.json()
                addToast(errorData.error || "Failed to save settings", "error")
            }
        } catch (error) {
            addToast("An error occurred while saving", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadToCloudinary(formData)
            if (result.url) {
                setSettings({ ...settings, logo_image_url: result.url })
                addToast("Logo uploaded successfully", "success")
            } else {
                addToast(result.error || "Failed to upload logo", "error")
            }
        } catch (error) {
            addToast("An error occurred during upload", "error")
        } finally {
            setUploading(false)
        }
    }

    const sections = [
        { icon: Store, label: "Store Info" },
        { icon: Menu, label: "Navigation" },
        { icon: Layout, label: "Footer" },
        { icon: Zap, label: "Marquee" },
        { icon: CreditCard, label: "Payments" },
        { icon: Truck, label: "Shipping" },
        { icon: Bell, label: "Notifications" },
        { icon: Shield, label: "Security" },
        { icon: Globe, label: "Regional" },
    ]

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-8">
                <div>
                    <h1 className="text-4xl font-bold font-lufga tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure your store's global parameters and branding.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 rounded-full bg-primary text-white flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg font-bold disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.label}
                            onClick={() => setActiveSection(section.label)}
                            className={cn(
                                "w-full flex items-center space-x-4 p-4 rounded-2xl transition-all group border",
                                activeSection === section.label ? "bg-white shadow-sm border-primary/20" : "bg-transparent border-transparent hover:bg-muted"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                activeSection === section.label ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/10"
                            )}>
                                <section.icon className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className={cn("font-bold", activeSection === section.label ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{section.label}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Configuration</p>
                            </div>
                            <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform", activeSection === section.label ? "text-primary" : "text-muted-foreground group-hover:translate-x-1")} />
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-2 space-y-12">
                    {activeSection === "Store Info" && (
                        <div className="space-y-10">
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3 mb-4">
                                    <ImageIcon className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Store Branding</h2>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Logo Type</label>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <button
                                            onClick={() => setSettings({ ...settings, logo_type: "text" })}
                                            className={cn(
                                                "flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 transition-all",
                                                settings.logo_type === "text" ? "border-primary bg-primary/5 text-primary" : "border-muted bg-transparent text-muted-foreground hover:border-muted-foreground/30"
                                            )}
                                        >
                                            <Type className="h-5 w-5" />
                                            <span className="font-bold">Text Based</span>
                                        </button>
                                        <button
                                            onClick={() => setSettings({ ...settings, logo_type: "image" })}
                                            className={cn(
                                                "flex items-center justify-center space-x-3 p-4 rounded-2xl border-2 transition-all",
                                                settings.logo_type === "image" ? "border-primary bg-primary/5 text-primary" : "border-muted bg-transparent text-muted-foreground hover:border-muted-foreground/30"
                                            )}
                                        >
                                            <ImageIcon className="h-5 w-5" />
                                            <span className="font-bold">Image Logo</span>
                                        </button>
                                    </div>

                                    {settings.logo_type === "text" ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Logo Text</label>
                                            <input
                                                type="text"
                                                value={settings.logo_text}
                                                onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })}
                                                className="w-full h-14 rounded-2xl border bg-muted/30 px-6 font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="MODERNSTORE"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Logo Image</label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <div className="flex items-start space-x-6">
                                                {settings.logo_image_url ? (
                                                    <div className="relative w-32 h-32 rounded-2xl border overflow-hidden bg-muted group">
                                                        <img src={settings.logo_image_url} alt="Logo" className="w-full h-full object-contain" />
                                                        <button
                                                            onClick={() => setSettings({ ...settings, logo_image_url: "" })}
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-6 w-6 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploading}
                                                        className="w-32 h-32 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center space-y-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground"
                                                    >
                                                        {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Upload className="h-6 w-6" /><span className="text-[10px] font-bold uppercase tracking-wider">Upload</span></>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-10">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Store className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">General Store Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Store Name</label>
                                        <input
                                            type="text"
                                            value={settings.store_name}
                                            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Support Email</label>
                                        <input
                                            type="email"
                                            value={settings.contact_email}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Store Description (SEO)</label>
                                        <textarea
                                            rows={4}
                                            value={settings.store_description}
                                            onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                                            className="w-full bg-muted/30 rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Navigation" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Menu className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-bold font-lufga">Main Navigation</h2>
                                    </div>
                                    <button
                                        onClick={() => setSettings({
                                            ...settings,
                                            navigation_config: [...(settings.navigation_config || []), { id: Date.now().toString(), label: "New Link", url: "/" }]
                                        })}
                                        className="h-10 px-6 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Nav Link
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(settings.navigation_config || []).map((nav: any, idx: number) => (
                                        <div key={nav.id || idx} className="p-6 border-2 border-dashed rounded-2xl flex items-center gap-4 bg-muted/5 group">
                                            <div className="grid grid-cols-2 gap-4 flex-1">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Label</label>
                                                    <input
                                                        type="text"
                                                        value={nav.label}
                                                        onChange={(e) => {
                                                            const newN = [...settings.navigation_config];
                                                            newN[idx].label = e.target.value;
                                                            setSettings({ ...settings, navigation_config: newN });
                                                        }}
                                                        className="h-10 w-full px-4 rounded-xl border bg-white text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Destination</label>
                                                    <LinkSelector
                                                        value={nav.url}
                                                        categories={categories}
                                                        products={products}
                                                        onChange={(url, label) => {
                                                            const newN = [...settings.navigation_config];
                                                            newN[idx].url = url;
                                                            if (!newN[idx].label && label) newN[idx].label = label;
                                                            setSettings({ ...settings, navigation_config: newN });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    navigation_config: settings.navigation_config.filter((_: any, i: number) => i !== idx)
                                                })}
                                                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Footer" && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" />
                                    Social Connectivity
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: "facebook", icon: Facebook, label: "Facebook" },
                                        { id: "instagram", icon: Instagram, label: "Instagram" },
                                        { id: "twitter", icon: Twitter, label: "Twitter" },
                                        { id: "youtube", icon: Youtube, label: "Youtube" }
                                    ].map((social) => (
                                        <div key={social.id} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                <social.icon className="h-3 w-3" />
                                                {social.label}
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.social_links[social.id]}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    social_links: { ...settings.social_links, [social.id]: e.target.value }
                                                })}
                                                placeholder="URL"
                                                className="h-10 w-full px-4 rounded-xl border bg-muted/20 text-xs focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <List className="h-5 w-5 text-primary" />
                                        Navigation Columns
                                    </h3>
                                    <button
                                        onClick={() => setSettings({
                                            ...settings,
                                            footer_config: {
                                                ...settings.footer_config,
                                                columns: [...settings.footer_config.columns, { title: "New Column", links: [] }]
                                            }
                                        })}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-colors"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Column
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {settings.footer_config.columns.map((col: any, colIdx: number) => (
                                        <div key={colIdx} className="p-6 border-2 border-dashed rounded-2xl space-y-4 relative group">
                                            <div className="flex items-center justify-between">
                                                <input
                                                    type="text"
                                                    value={col.title}
                                                    onChange={(e) => {
                                                        const newC = [...settings.footer_config.columns];
                                                        newC[colIdx].title = e.target.value;
                                                        setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                    }}
                                                    className="font-bold text-sm bg-transparent border-none focus:ring-0 w-3/4 p-0 h-auto"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newC = settings.footer_config.columns.filter((_: any, i: number) => i !== colIdx);
                                                        setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                    }}
                                                    className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {col.links.map((link: any, linkIdx: number) => (
                                                    <div key={linkIdx} className="bg-white p-4 rounded-2xl border shadow-sm relative">
                                                        <div className="space-y-3">
                                                            <input
                                                                type="text"
                                                                value={link.label}
                                                                placeholder="Label"
                                                                onChange={(e) => {
                                                                    const newC = [...settings.footer_config.columns];
                                                                    newC[colIdx].links[linkIdx].label = e.target.value;
                                                                    setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                                }}
                                                                className="h-9 w-full px-3 rounded-xl border bg-muted/10 text-[11px] font-medium transition-all"
                                                            />
                                                            <LinkSelector
                                                                value={link.url}
                                                                categories={categories}
                                                                products={products}
                                                                onChange={(url) => {
                                                                    const newC = [...settings.footer_config.columns];
                                                                    newC[colIdx].links[linkIdx].url = url;
                                                                    setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                                }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newC = [...settings.footer_config.columns];
                                                                newC[colIdx].links = newC[colIdx].links.filter((_: any, i: number) => i !== linkIdx);
                                                                setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 rounded-xl"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const newC = [...settings.footer_config.columns];
                                                        newC[colIdx].links.push({ label: "", url: "" });
                                                        setSettings({ ...settings, footer_config: { ...settings.footer_config, columns: newC } });
                                                    }}
                                                    className="w-full h-8 rounded-lg border border-dashed border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/5 transition-all"
                                                >
                                                    + Add Link
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Marquee" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Style Configuration */}
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3">
                                    <Settings className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Appearance & Style</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Scroll Speed (seconds)</label>
                                        <input
                                            type="number"
                                            value={settings.marquee_config.style?.speed || 40}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, speed: parseInt(e.target.value) } }
                                            })}
                                            className="w-full h-12 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Section Height (px)</label>
                                        <input
                                            type="number"
                                            value={settings.marquee_config.style?.height || 100}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, height: parseInt(e.target.value) } }
                                            })}
                                            className="w-full h-12 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Font Size (px)</label>
                                        <input
                                            type="number"
                                            value={settings.marquee_config.style?.font_size || 14}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, font_size: parseInt(e.target.value) } }
                                            })}
                                            className="w-full h-12 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Background Type</label>
                                        <select
                                            value={settings.marquee_config.style?.bg_type || "solid"}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, bg_type: e.target.value } }
                                            })}
                                            className="w-full h-12 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="solid">Solid Color</option>
                                            <option value="gradient">Linear Gradient</option>
                                            <option value="glass">Glassmorphism</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Background Color</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={settings.marquee_config.style?.bg_color || "#000000"}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, bg_color: e.target.value } }
                                                })}
                                                className="h-12 w-12 rounded-lg border-none cursor-pointer p-0 overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={settings.marquee_config.style?.bg_color || "#000000"}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, bg_color: e.target.value } }
                                                })}
                                                className="flex-1 h-12 rounded-xl border bg-muted/30 px-4 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["#000000", "#ffffff", "#ff3366", "#0070f3", "#10b981", "#f59e0b"].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSettings({
                                                        ...settings,
                                                        marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, bg_color: c } }
                                                    })}
                                                    className="w-6 h-6 rounded-full border border-muted"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Accent Color</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={settings.marquee_config.style?.accent_color || "#ff3366"}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, accent_color: e.target.value } }
                                                })}
                                                className="h-12 w-12 rounded-lg border-none cursor-pointer p-0 overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={settings.marquee_config.style?.accent_color || "#ff3366"}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, accent_color: e.target.value } }
                                                })}
                                                className="flex-1 h-12 rounded-xl border bg-muted/30 px-4 text-xs font-mono"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {["#ff3366", "#0070f3", "#10b981", "#f59e0b", "#8b5cf6", "#000000", "#ffffff"].map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSettings({
                                                        ...settings,
                                                        marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, accent_color: c } }
                                                    })}
                                                    className="w-6 h-6 rounded-full border border-muted"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {settings.marquee_config.style?.bg_type === "gradient" && (
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Gradient CSS</label>
                                            <input
                                                type="text"
                                                value={settings.marquee_config.style?.bg_gradient || ""}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    marquee_config: { ...settings.marquee_config, style: { ...settings.marquee_config.style, bg_gradient: e.target.value } }
                                                })}
                                                placeholder="linear-gradient(to right, #000, #111)"
                                                className="w-full h-12 rounded-xl border bg-muted/30 px-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items Configuration */}
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Zap className="h-6 w-6 text-primary" />
                                        <h2 className="text-2xl font-bold font-lufga">Marquee Items</h2>
                                    </div>
                                    <button
                                        onClick={() => setSettings({
                                            ...settings,
                                            marquee_config: {
                                                ...settings.marquee_config,
                                                items: [...(settings.marquee_config.items || []), { icon: "Truck", title: "New Feature", desc: "Short description" }]
                                            }
                                        })}
                                        className="h-10 px-6 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(settings.marquee_config.items || []).map((item: any, idx: number) => (
                                        <div key={idx} className="p-6 border-2 border-dashed rounded-2xl space-y-4 bg-muted/5 relative group">
                                            <div className="grid grid-cols-1 gap-4">
                                                <select
                                                    value={item.icon}
                                                    onChange={(e) => {
                                                        const newI = [...settings.marquee_config.items];
                                                        newI[idx].icon = e.target.value;
                                                        setSettings({ ...settings, marquee_config: { ...settings.marquee_config, items: newI } });
                                                    }}
                                                    className="h-10 w-full px-4 rounded-xl border bg-white text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                >
                                                    <option value="">None (No Icon)</option>
                                                    <option value="Truck">Truck</option>
                                                    <option value="ShieldCheck">ShieldCheck</option>
                                                    <option value="Clock">Clock</option>
                                                    <option value="Zap">Zap</option>
                                                    <option value="Star">Star</option>
                                                    <option value="Heart">Heart</option>
                                                    <option value="Package">Package</option>
                                                    <option value="CreditCard">CreditCard</option>
                                                    <option value="RotateCcw">RotateCcw</option>
                                                    <option value="Headphones">Headphones</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const newI = [...settings.marquee_config.items];
                                                        newI[idx].title = e.target.value;
                                                        setSettings({ ...settings, marquee_config: { ...settings.marquee_config, items: newI } });
                                                    }}
                                                    className="h-10 w-full px-4 rounded-xl border bg-white text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.desc}
                                                    onChange={(e) => {
                                                        const newI = [...settings.marquee_config.items];
                                                        newI[idx].desc = e.target.value;
                                                        setSettings({ ...settings, marquee_config: { ...settings.marquee_config, items: newI } });
                                                    }}
                                                    className="h-10 w-full px-4 rounded-xl border bg-white text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                    placeholder="Description"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    marquee_config: {
                                                        ...settings.marquee_config,
                                                        items: settings.marquee_config.items.filter((_: any, i: number) => i !== idx)
                                                    }
                                                })}
                                                className="absolute top-4 right-4 p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Payments" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3">
                                    <CreditCard className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Payment Gateways</h2>
                                </div>
                                <p className="text-sm text-muted-foreground">Select and configure the payment providers available to your customers during checkout.</p>

                                <div className="space-y-4">
                                    {paymentProviders.map((provider) => (
                                        <div key={provider.id} className={cn(
                                            "p-6 rounded-2xl border transition-all flex items-center justify-between bg-white hover:shadow-md",
                                            provider.is_active ? "border-primary/20" : "border-muted grayscale-[0.5]"
                                        )}>
                                            <div className="flex items-center space-x-6">
                                                <div className="h-12 w-32 flex items-center justify-center p-2 bg-muted/5 rounded-xl border border-muted-foreground/5">
                                                    <img 
                                                        src={provider.slug === 'stripe' ? '/fonts/assets/stripe-logo.png' : (provider.slug === 'khalti' ? '/fonts/assets/khalti-logo.jpg' : (provider.slug === 'esewa' ? '/fonts/assets/esewa-logo.jpeg' : (provider.slug === 'razorpay' ? '/fonts/assets/razorpay-logo.png' : '/fonts/assets/cash-on-delivery-logo.jpg')))} 
                                                        alt={provider.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="hidden md:block">
                                                    <h3 className="text-lg font-bold font-lufga">{provider.name}</h3>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{provider.slug}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", provider.is_active ? "text-primary" : "text-muted-foreground")}>
                                                        {provider.is_active ? 'ON' : 'OFF'}
                                                    </span>
                                                    <button
                                                        onClick={async () => {
                                                            // Optimistic Update
                                                            const previousState = provider.is_active;
                                                            const updated = { ...provider, is_active: !previousState };
                                                            setPaymentProviders(paymentProviders.map(p => p.id === provider.id ? updated : p));
                                                            
                                                            try {
                                                                const res = await fetch("/api/admin/payment-providers", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify(updated)
                                                                });
                                                                
                                                                if (!res.ok) {
                                                                    throw new Error("Failed to update");
                                                                }
                                                                
                                                                addToast(`${provider.name} ${updated.is_active ? 'enabled' : 'disabled'}`, "success");
                                                            } catch (err) {
                                                                // Rollback on failure
                                                                setPaymentProviders(paymentProviders.map(p => p.id === provider.id ? { ...provider, is_active: previousState } : p));
                                                                addToast("Failed to update status", "error");
                                                            }
                                                        }}
                                                        className={cn(
                                                            "h-8 w-14 rounded-full flex items-center transition-all px-1",
                                                            provider.is_active ? "bg-primary justify-end" : "bg-muted justify-start"
                                                        )}
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-white shadow-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {paymentProviders.length === 0 && (
                                        <div className="col-span-2 py-20 bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                                            <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground font-bold italic">No payment providers configured in database.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Shipping" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Shipping Providers */}
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3">
                                    <Truck className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Shipping Carriers</h2>
                                </div>
                                <p className="text-sm text-muted-foreground">Enable shipping carriers and configure delivery options for your customers.</p>

                                <div className="space-y-4">
                                    {shippingProviders.map((provider) => (
                                        <div key={provider.id} className={cn(
                                            "p-6 rounded-2xl border transition-all flex items-center justify-between bg-white hover:shadow-md",
                                            provider.is_active ? "border-primary/20" : "border-muted grayscale-[0.5]"
                                        )}>
                                            <div className="flex items-center space-x-6">
                                                <div className="h-12 w-32 flex items-center justify-center p-2 bg-muted/5 rounded-xl border border-muted-foreground/5">
                                                    {provider.logo_url ? (
                                                        <img 
                                                            src={provider.logo_url} 
                                                            alt={provider.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Truck className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="hidden md:block">
                                                    <h3 className="text-lg font-bold font-lufga">{provider.name}</h3>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{provider.slug}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", provider.is_active ? "text-primary" : "text-muted-foreground")}>
                                                        {provider.is_active ? 'ON' : 'OFF'}
                                                    </span>
                                                    <button
                                                        onClick={async () => {
                                                            const previousState = provider.is_active;
                                                            const updated = { ...provider, is_active: !previousState };
                                                            setShippingProviders(shippingProviders.map(p => p.id === provider.id ? updated : p));
                                                            
                                                            try {
                                                                const res = await fetch("/api/admin/shipping-providers", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify(updated)
                                                                });
                                                                
                                                                if (!res.ok) {
                                                                    throw new Error("Failed to update");
                                                                }
                                                                
                                                                addToast(`${provider.name} ${updated.is_active ? 'enabled' : 'disabled'}`, "success");
                                                            } catch (err) {
                                                                setShippingProviders(shippingProviders.map(p => p.id === provider.id ? { ...provider, is_active: previousState } : p));
                                                                addToast("Failed to update status", "error");
                                                            }
                                                        }}
                                                        className={cn(
                                                            "h-8 w-14 rounded-full flex items-center transition-all px-1",
                                                            provider.is_active ? "bg-primary justify-end" : "bg-muted justify-start"
                                                        )}
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-white shadow-sm" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {shippingProviders.length === 0 && (
                                        <div className="col-span-2 py-20 bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                                            <Truck className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground font-bold italic">No shipping providers configured in database.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Configuration */}
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3">
                                    <Settings className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Shipping Rules</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Free Shipping Threshold ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.shipping_config?.free_shipping_threshold || 0}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                shipping_config: { ...settings.shipping_config, free_shipping_threshold: parseFloat(e.target.value) || 0 }
                                            })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="0.00"
                                        />
                                        <p className="text-[10px] text-muted-foreground ml-1">Orders above this amount get free shipping (0 = disabled)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Default Flat Rate ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.shipping_config?.default_rate || 10}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                shipping_config: { ...settings.shipping_config, default_rate: parseFloat(e.target.value) || 10 }
                                            })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="10.00"
                                        />
                                        <p className="text-[10px] text-muted-foreground ml-1">Fallback rate when carriers are unavailable</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Weight Unit</label>
                                        <select
                                            value={settings.shipping_config?.weight_unit || "kg"}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                shipping_config: { ...settings.shipping_config, weight_unit: e.target.value }
                                            })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="lb">Pounds (lb)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Dimension Unit</label>
                                        <select
                                            value={settings.shipping_config?.dimension_unit || "cm"}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                shipping_config: { ...settings.shipping_config, dimension_unit: e.target.value }
                                            })}
                                            className="w-full h-14 rounded-xl border bg-muted/30 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="cm">Centimeters (cm)</option>
                                            <option value="in">Inches (in)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "Shipping" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-8">
                                <div className="flex items-center space-x-3">
                                    <Truck className="h-6 w-6 text-primary" />
                                    <h2 className="text-2xl font-bold font-lufga">Shipping Providers</h2>
                                </div>
                                <p className="text-sm text-muted-foreground">Configure shipping carriers and their API credentials for automated label generation and tracking.</p>

                                <div className="space-y-4">
                                    {[
                                        { name: 'DHL Express', slug: 'dhl', logo: '/fonts/assets/dhl-logo.svg', description: 'Global express shipping' },
                                        { name: 'FedEx', slug: 'fedex', logo: '/fonts/assets/fedex-logo.svg', description: 'Reliable worldwide delivery' },
                                        { name: 'UPS', slug: 'ups', logo: '/fonts/assets/ups-logo.svg', description: 'United Parcel Service' },
                                    ].map((provider) => (
                                        <div key={provider.slug} className="p-6 rounded-2xl border transition-all bg-white hover:shadow-md">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="flex items-center space-x-6 flex-1">
                                                    <div className="h-16 w-32 flex items-center justify-center p-3 bg-muted/5 rounded-xl border border-muted-foreground/5">
                                                        <img 
                                                            src={provider.logo}
                                                            alt={provider.name}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="%23666">' + provider.name + '</text></svg>';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold font-lufga">{provider.name}</h3>
                                                        <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                                                        <button 
                                                            onClick={() => {
                                                                const section = document.getElementById(`config-${provider.slug}`);
                                                                if (section) {
                                                                    section.classList.toggle('hidden');
                                                                }
                                                            }}
                                                            className="text-xs text-primary font-bold mt-2 hover:underline"
                                                        >
                                                            Configure API Credentials →
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                        Coming Soon
                                                    </span>
                                                    <button
                                                        disabled
                                                        className="h-8 w-14 rounded-full flex items-center transition-all px-1 bg-muted justify-start opacity-50 cursor-not-allowed"
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-white shadow-sm" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Collapsible Configuration */}
                                            <div id={`config-${provider.slug}`} className="hidden mt-6 pt-6 border-t space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">API Key / Client ID</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Enter API key..."
                                                            className="w-full h-10 rounded-xl border bg-muted/20 px-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">API Secret / Account Number</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Enter secret..."
                                                            className="w-full h-10 rounded-xl border bg-muted/20 px-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shipper Address (Your Warehouse)</label>
                                                    <textarea
                                                        rows={3}
                                                        placeholder="123 Warehouse St, City, State, ZIP, Country"
                                                        className="w-full rounded-xl border bg-muted/20 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between pt-2">
                                                    <p className="text-xs text-muted-foreground">
                                                        <ExternalLink className="h-3 w-3 inline mr-1" />
                                                        Get API credentials from {provider.name} developer portal
                                                    </p>
                                                    <button className="h-9 px-6 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                                                        Save Credentials
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-blue-900">How Shipping Integration Works</h4>
                                            <ul className="text-xs text-blue-800 space-y-1 leading-relaxed">
                                                <li>• Configure API credentials for your preferred shipping carriers</li>
                                                <li>• When orders are placed, generate shipping labels automatically via API</li>
                                                <li>• Print labels and attach to packages</li>
                                                <li>• Schedule pickups or drop off at carrier locations</li>
                                                <li>• Track shipments in real-time and update customers automatically</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection !== "Store Info" && activeSection !== "Navigation" && activeSection !== "Footer" && activeSection !== "Marquee" && activeSection !== "Payments" && activeSection !== "Shipping" && (
                        <div className="bg-white border border-dashed rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center shadow-sm">
                                <Settings className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{activeSection} Configuration</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mt-1">This section is currently under development. Global parameters for {activeSection.toLowerCase()} will appear here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
