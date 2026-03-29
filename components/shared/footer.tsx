"use client"

import * as React from "react"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

interface FooterProps {
    initialSettings?: any
}

export function Footer({ initialSettings }: FooterProps) {
    const [siteSettings, setSiteSettings] = React.useState<any>(initialSettings);
    const storeName = siteSettings?.store_name || "Modern Store";

    return (
        <footer className="w-full border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold font-lufga uppercase tracking-wider">{storeName}</h3>
                        <p className="text-sm text-muted-foreground">
                            {siteSettings?.store_description || "Your one-stop destination for premium fashion and lifestyle products. Quality meets style."}
                        </p>
                        <div className="flex space-x-4">
                            <Link href={siteSettings?.social_links?.twitter || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.facebook || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.instagram || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.youtube || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {siteSettings?.footer_config?.columns?.length > 0 ? (
                        siteSettings.footer_config.columns.slice(0, 2).map((col: any, idx: number) => (
                            <div key={idx}>
                                <h4 className="mb-4 text-sm font-bold uppercase tracking-widest">{col.title}</h4>
                                <ul className="space-y-2 text-sm">
                                    {col.links.map((link: any, lIdx: number) => (
                                        <li key={lIdx}>
                                            <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <>
                            <div>
                                <h4 className="mb-4 text-sm font-bold uppercase tracking-widest">Shop</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/category/men" className="text-muted-foreground hover:text-primary transition-colors">Men's Collection</Link></li>
                                    <li><Link href="/category/women" className="text-muted-foreground hover:text-primary transition-colors">Women's Collection</Link></li>
                                    <li><Link href="/category/accessories" className="text-muted-foreground hover:text-primary transition-colors">Accessories</Link></li>
                                    <li><Link href="/new-arrivals" className="text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-4 text-sm font-bold uppercase tracking-widest">Support</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                                    <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                                    <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping Policy</Link></li>
                                    <li><Link href="/returns" className="text-muted-foreground hover:text-primary transition-colors">Returns & Exchanges</Link></li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
                    <p>{siteSettings?.footer_config?.copyright_text || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}</p>
                    <div className="mt-2 flex justify-center space-x-4">
                        {siteSettings?.footer_config?.legal_links?.length > 0 ? (
                            siteSettings.footer_config.legal_links.map((link: any, idx: number) => (
                                <Link key={idx} href={link.url} className="hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            ))
                        ) : (
                            <>
                                <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-primary">Terms & Conditions</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}
