import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding payment providers...");
    
    const providers = [
        { name: "Stripe", slug: "stripe", is_active: true },
        { name: "Khalti", slug: "khalti", is_active: true },
        { name: "eSewa", slug: "esewa", is_active: true }
    ];

    for (const provider of providers) {
        const { data, error } = await supabase
            .from("payment_providers")
            .upsert(provider, { onConflict: 'slug' });
        
        if (error) {
            console.error(`Error seeding ${provider.slug}:`, error.message);
        } else {
            console.log(`Successfully seeded ${provider.slug}`);
        }
    }
}

seed();
