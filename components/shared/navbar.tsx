"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Heart, Menu, X, ChevronDown, LogOut, LayoutDashboard, UserCircle, Plus, RefreshCw } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/store/use-wishlist";
import { proxyImageUrl } from "@/lib/image-proxy";
import { getWishlistIds } from "@/app/actions/wishlist-actions";
import { useToast } from "@/store/use-toast";

interface NavLink {
    id: string
    label: string
    url: string
    parent_id: string | null
    is_active: boolean
    order_index: number
    children?: NavLink[]
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const searchRef = React.useRef<HTMLDivElement>(null);
    const mobileSearchRef = React.useRef<HTMLDivElement>(null);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [navLinks, setNavLinks] = React.useState<NavLink[]>([]);
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
    const [siteSettings, setSiteSettings] = React.useState<any>(null);
    const { totalItems, isOpen: isCartOpen, openCart } = useCart();
    const { setItems } = useWishlist();
    const { addToast } = useToast();
    const supabase = createClient();
    const router = useRouter();

    const cartCount = totalItems();

    React.useEffect(() => {
        const getSiteSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                const data = await res.json();
                if (data && !data.error) setSiteSettings(data);
            } catch (e) {
                console.error("Failed to fetch site settings", e);
            }
        };
        getSiteSettings();

        const getNavLinks = async () => {
            try {
                const res = await fetch("/api/navigation", { cache: 'no-store' });
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Construct tree
                    const tree: NavLink[] = [];
                    const map: Record<string, NavLink> = {};

                    data.forEach(item => {
                        map[item.id] = { ...item, children: [] };
                    });

                    data.forEach(item => {
                        if (item.parent_id && map[item.parent_id]) {
                            map[item.parent_id].children?.push(map[item.id]);
                        } else if (!item.parent_id) {
                            tree.push(map[item.id]);
                        }
                    });

                    // Sort by order_index and filter inactive children
                    const sortTree = (nodes: NavLink[]) => {
                        nodes.sort((a, b) => a.order_index - b.order_index);
                        nodes.forEach(node => {
                            if (node.children) {
                                node.children = node.children.filter(c => c.is_active);
                                sortTree(node.children);
                            }
                        });
                    };
                    sortTree(tree);

                    setNavLinks(tree.filter(n => n.is_active));
                }
            } catch (e) {
                console.error("Failed to fetch nav links", e);
            }
        };
        getNavLinks();
    }, []);

    React.useEffect(() => {
        const getUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const ids = await getWishlistIds();
                setItems(ids);
            } else {
                setItems([]);
            }
        };
        getUserAndData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase, setItems]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            addToast("Successfully signed out. See you soon!", "success");
            router.refresh();
            setIsProfileOpen(false);
        } catch (error) {
            addToast("Failed to sign out. Please try again.", "error");
        }
    };

    // Real-time search logic
    React.useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                setShowSearchDropdown(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=6`);
                const data = await res.json();
                setSearchResults(data.products || []);
                setShowSearchDropdown(true);
            } catch (error) {
                console.error("Search fetch failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close dropdown on outside click or Esc key
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscKey);
        };
    }, []);

    const SearchDropdown = ({ results, isLoading }: { results: any[], isLoading: boolean }) => (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b bg-muted/50 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Suggestions</span>
                {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-primary mr-2" />}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                    <>
                        {results.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                onClick={() => setShowSearchDropdown(false)}
                                className="flex items-center gap-4 p-3 hover:bg-muted transition-colors group border-b last:border-0"
                            >
                                <div className="h-12 w-12 rounded-lg border bg-muted shrink-0 overflow-hidden">
                                    <img src={product.featured_image} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-bold text-primary">${product.base_price.toFixed(2)}</span>
                                        {product.discount_price && (
                                            <span className="text-[10px] text-muted-foreground line-through">${product.discount_price.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <Link
                            href={`/search?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="block p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t"
                        >
                            View All Results
                        </Link>
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold text-muted-foreground">No products found</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Try searching for something else</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    {siteSettings?.logo_type === 'image' && siteSettings.logo_image_url ? (
                        <img src={proxyImageUrl(siteSettings.logo_image_url)} alt={siteSettings.store_name} className="h-8 w-auto object-contain" />
                    ) : (
                        <span className="text-xl font-bold tracking-tight font-lufga uppercase">
                            {siteSettings?.logo_text ? (
                                <>
                                    {siteSettings.logo_text.slice(0, Math.ceil(siteSettings.logo_text.length / 2))}
                                    <span className="text-primary font-bold tracking-tight">
                                        {siteSettings.logo_text.slice(Math.ceil(siteSettings.logo_text.length / 2))}
                                    </span>
                                </>
                            ) : (
                                <>MODERN<span className="text-primary font-bold tracking-tight">STORE</span></>
                            )}
                        </span>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest h-full">
                    {siteSettings?.navigation_config && siteSettings.navigation_config.length > 0 ? (
                        siteSettings.navigation_config.map((link: any, idx: number) => (
                            <Link
                                key={idx}
                                href={link.url}
                                className="transition-colors hover:text-primary h-full py-4 flex items-center"
                            >
                                {link.label}
                            </Link>
                        ))
                    ) : navLinks.length > 0 ? (
                        navLinks.map(link => {
                            const hasChildren = link.children && link.children.length > 0;
                            return (
                                <div
                                    key={link.id}
                                    className="relative group h-full flex items-center"
                                >
                                    <Link
                                        href={link.url}
                                        className={cn(
                                            "flex items-center gap-1 transition-colors hover:text-primary h-full py-4",
                                            activeDropdown === link.id && "text-primary"
                                        )}
                                        onMouseEnter={() => hasChildren && setActiveDropdown(link.id)}
                                        onMouseLeave={() => setActiveDropdown(null)}
                                    >
                                        {link.label}
                                        {hasChildren && (
                                            <ChevronDown className={cn("h-3 w-3 transition-transform group-hover:rotate-180")} />
                                        )}
                                    </Link>

                                    {hasChildren && (
                                        <div className="absolute top-full left-0 w-48 rounded-2xl border bg-white shadow-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-[60]">
                                            {link.children?.map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={child.url}
                                                    className="block px-6 py-2.5 text-xs font-bold hover:text-primary hover:bg-muted/50 transition-colors"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <>
                            <Link href="/category/men" className="transition-colors hover:text-primary">Men</Link>
                            <Link href="/category/women" className="transition-colors hover:text-primary">Women</Link>
                            <Link href="/category/accessories" className="transition-colors hover:text-primary">Accessories</Link>
                            <Link href="/blog" className="transition-colors hover:text-primary">Blog</Link>
                        </>
                    )}
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    <div ref={searchRef} className="hidden lg:flex items-center relative">
                        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                            placeholder="Search products..."
                            className="h-9 w-64 rounded-full border bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {showSearchDropdown && !isMenuOpen && (
                            <div className="w-[400px] absolute top-full right-0">
                                <SearchDropdown results={searchResults} isLoading={isSearching} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-5">
                        {/* Auth Section */}
                        <div className="relative">
                            {user ? (
                                <div className="relative group">
                                    <button
                                        className="flex items-center space-x-1 hover:text-primary transition-colors text-sm font-bold"
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", isProfileOpen && "rotate-180")} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-xl py-2 animate-in fade-in zoom-in duration-200">
                                            <div className="px-4 py-2 border-b">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account</p>
                                                <p className="text-sm font-bold truncate">{user.email}</p>
                                            </div>
                                            <Link href="/account/dashboard" className="flex items-center px-4 py-2.5 text-sm font-bold hover:bg-muted transition-colors">
                                                <LayoutDashboard className="h-4 w-4 mr-3" />
                                                Dashboard
                                            </Link>
                                            <Link href="/account/profile" className="flex items-center px-4 py-2.5 text-sm font-bold hover:bg-muted transition-colors">
                                                <UserCircle className="h-4 w-4 mr-3" />
                                                Profile
                                            </Link>
                                            <Link href="/account/orders" className="flex items-center px-4 py-2.5 text-sm font-bold hover:bg-muted transition-colors">
                                                <ShoppingBag className="h-4 w-4 mr-3" />
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t"
                                            >
                                                <LogOut className="h-4 w-4 mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="hidden md:flex items-center space-x-2 h-10 px-6 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                                >
                                    <span>Sign In</span>
                                </Link>
                            )}
                        </div>

                        <Link href="/account/wishlist" className="hidden md:block transition-colors hover:text-primary">
                            <Heart className="h-5 w-5" />
                        </Link>

                        <button
                            onClick={() => openCart()}
                            className="relative transition-colors hover:text-primary"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="md:hidden transition-colors hover:text-primary"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background p-4 animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
                    <nav className="flex flex-col space-y-4">
                        {siteSettings?.navigation_config && siteSettings.navigation_config.length > 0 ? (
                            siteSettings.navigation_config.map((link: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className="text-sm font-bold uppercase tracking-widest"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))
                        ) : navLinks.length > 0 ? (
                            navLinks.map(link => (
                                <div key={link.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={link.url}
                                            className="text-sm font-bold uppercase tracking-widest"
                                            onClick={() => !link.children?.length && setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                        {link.children && link.children.length > 0 && (
                                            <button onClick={() => setActiveDropdown(activeDropdown === link.id ? null : link.id)}>
                                                {activeDropdown === link.id ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                    {link.children && link.children.length > 0 && activeDropdown === link.id && (
                                        <div className="flex flex-col space-y-3 pl-4 border-l ml-1 border-primary/20">
                                            {link.children.filter(c => c.is_active).map(child => (
                                                <Link
                                                    key={child.id}
                                                    href={child.url}
                                                    className="text-xs font-bold text-muted-foreground uppercase"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <Link href="/category/men" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Men</Link>
                                <Link href="/category/women" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Women</Link>
                                <Link href="/category/accessories" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Accessories</Link>
                                <Link href="/blog" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                            </>
                        )}
                        <div className="pt-4 border-t space-y-4">
                            {user ? (
                                <Link href="/account/dashboard" className="text-sm font-bold text-primary flex items-center" onClick={() => setIsMenuOpen(false)}>
                                    <LayoutDashboard className="h-4 w-4 mr-2" /> My Account
                                </Link>
                            ) : (
                                <Link href="/login" className="text-sm font-bold text-primary flex items-center" onClick={() => setIsMenuOpen(false)}>
                                    <User className="h-4 w-4 mr-2" /> Sign In
                                </Link>
                            )}
                            <div ref={mobileSearchRef} className="relative pt-2">
                                <Search className="absolute left-3 top-5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                                    placeholder="Search products..."
                                    className="h-10 w-full rounded-2xl border bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {showSearchDropdown && isMenuOpen && (
                                    <SearchDropdown results={searchResults} isLoading={isSearching} />
                                )}
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
