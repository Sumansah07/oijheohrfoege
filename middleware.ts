import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Skip middleware if env vars are not available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refreshing the auth token - DON'T remove this
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. Protected routes - redirect to login if no user
    if (!user && (path.startsWith("/account") || path.startsWith("/admin"))) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        const response = NextResponse.redirect(url);
        // IMPORTANT: Transfer cookies so session refresh is not lost
        supabaseResponse.cookies.getAll().forEach((cookie) =>
            response.cookies.set(cookie.name, cookie.value, cookie)
        );
        return response;
    }

    // 2. Admin check
    if (user && path.startsWith("/admin")) {
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        console.log(`[Admin Check] UserID: ${user.id}, Role: ${profile?.role}, Error: ${profileError?.message}`);

        if (profile?.role !== "admin") {
            const url = request.nextUrl.clone();
            url.pathname = "/";
            const response = NextResponse.redirect(url);
            supabaseResponse.cookies.getAll().forEach((cookie) =>
                response.cookies.set(cookie.name, cookie.value, cookie)
            );
            return response;
        }
    }

    // 3. Logged-in users shouldn't see login/register
    if (user && (path === "/login" || path === "/register")) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        const response = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) =>
            response.cookies.set(cookie.name, cookie.value, cookie)
        );
        return response;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
