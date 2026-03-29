import { createClient } from '@supabase/supabase-js'

/**
 * WARNING: This client uses the service role key which bypasses RLS.
 * ONLY use this in server-side code (Actions or Route Handlers).
 * NEVER use this in client-side code.
 */
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
