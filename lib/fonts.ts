import { Poppins } from "next/font/google";
import localFont from "next/font/local";

export const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
});

// Lufga is a custom font, assuming it will be placed in /public/fonts/
// If not found, it won't break the build but won't load either.
export const lufga = localFont({
    src: [
        {
            path: "../public/fonts/Lufga-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/Lufga-SemiBold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../public/fonts/Lufga-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-lufga",
});
