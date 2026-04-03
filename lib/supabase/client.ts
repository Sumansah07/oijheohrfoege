import { createBrowserClient } from '@supabase/ssr'

let client: any = null;

export function createClient() {
    if (client) {
        console.log('[Supabase Client] Returning existing client instance');
        return client;
    }

    console.log('[Supabase Client] Creating new client instance');
    
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'sb-auth-token', // Explicitly set storage key
                storage: {
                    getItem: (key) => {
                        const val = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
                        console.log(`[Supabase Client] getItem: ${key} -> ${val ? 'found' : 'not found'}`);
                        return val;
                    },
                    setItem: (key, value) => {
                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(key, value);
                            console.log(`[Supabase Client] setItem: ${key}`);
                        }
                    },
                    removeItem: (key) => {
                        if (typeof window !== 'undefined') {
                            window.localStorage.removeItem(key);
                            console.log(`[Supabase Client] removeItem: ${key}`);
                        }
                    },
                },
            }
        }
    )
    
    console.log(`[Supabase Client] Client created successfully at ${new Date().toISOString()}`);
    return client;
}
