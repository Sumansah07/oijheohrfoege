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
                {/* Two balanced columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {/* Store Info */}
                    <div className="space-y-4 text-center">
                        <h3 className="text-lg font-bold font-lufga uppercase tracking-wider">{storeName}</h3>
                        <p className="text-sm text-muted-foreground">
                            {siteSettings?.store_description || "Your one-stop destination for premium fashion and lifestyle products. Quality meets style."}
                        </p>
                        <div className="flex space-x-4 justify-center">
                            <Link href={siteSettings?.social_links?.twitter || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.facebook || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.instagram || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href={siteSettings?.social_links?.youtube || "#"} className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Company Information Column */}
                    <div className="text-center">
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-widest">
                            {siteSettings?.footer_config?.columns?.[0]?.title || "Company Information"}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            {siteSettings?.footer_config?.columns?.[0]?.links?.length > 0 ? (
                                siteSettings.footer_config.columns[0].links.map((link: any, lIdx: number) => (
                                    <li key={lIdx}>
                                        <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                                    <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                                    <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
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
