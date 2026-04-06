import { createClient } from "@/lib/supabase/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const error_description = searchParams.get("error_description")

  // Handle auth errors
  if (error) {
    console.error("Auth callback error:", error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, request.nextUrl.origin)
    )
  }

  // Handle missing code
  if (!code) {
    console.error("No auth code provided")
    return NextResponse.redirect(
      new URL("/login?error=no_code", request.nextUrl.origin)
    )
  }

  try {
    const supabase = createClient()

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError)
      return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", request.nextUrl.origin)
      )
    }

    // Redirect to dashboard on success
    return NextResponse.redirect(new URL("/account/dashboard", request.nextUrl.origin))
  } catch (err) {
    console.error("Callback handler error:", err)
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", request.nextUrl.origin)
    )
  }
}
