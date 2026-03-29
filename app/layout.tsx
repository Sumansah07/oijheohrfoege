import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});

import { ToastProvider } from "@/components/shared/toast-provider";

export const metadata: Metadata = {
    title: "Modern E-commerce Store",
    description: "A premium single-vendor e-commerce platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-background font-poppins antialiased", poppins.variable)}>
                {children}
                <ToastProvider />
                {/* Bolt Inspector for Design Mode - Next.js Enhanced Version v1.1.0 */}
                <Script src="/bolt-inspector-nextjs.js?v=1.1.0" strategy="afterInteractive" />
            </body>
        </html>
    );
}
