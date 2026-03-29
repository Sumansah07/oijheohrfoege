"use client"

import { createClient } from "@/lib/supabase/client";

export async function submitContactForm(formData: {
    first_name: string;
    last_name: string;
    email: string;
    message: string;
}) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("contact_messages")
        .insert([
            {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                message: formData.message,
                status: 'new'
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Error submitting contact form:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
