"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAddresses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching addresses:", error)
        return []
    }

    return data
}

export async function saveAddress(address: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not authenticated" }

    const { id, ...dataToSave } = address
    const addressData = {
        ...dataToSave,
        user_id: user.id,
        updated_at: new Date().toISOString()
    }

    // If this is set as default, unset others first
    if (addressData.is_default) {
        await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)
    }

    let result
    if (id) {
        result = await supabase
            .from("addresses")
            .update(addressData)
            .eq("id", id)
            .eq("user_id", user.id)
    } else {
        result = await supabase
            .from("addresses")
            .insert(addressData)
    }

    if (result.error) {
        console.error("Error saving address:", result.error)
        return { success: false, error: result.error.message }
    }

    revalidatePath("/account/addresses")
    return { success: true }
}

export async function deleteAddress(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error deleting address:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/account/addresses")
    return { success: true }
}

export async function setDefaultAddress(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not authenticated" }

    // Unset all as default
    await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)

    // Set target as default
    const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error setting default address:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/account/addresses")
    return { success: true }
}
