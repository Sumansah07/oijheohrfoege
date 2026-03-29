"use server"

import { createClient } from "@/lib/supabase/server"

export async function getWishlistIds() {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return []

        const { data, error } = await supabase
            .from("wishlists")
            .select("product_id")
            .eq("user_id", user.id)

        if (error) {
            console.error("Error fetching wishlist IDs:", error)
            return []
        }

        return data ? data.map(w => w.product_id) : []
    } catch (error) {
        console.error("Failed to fetch wishlist IDs:", error)
        return []
    }
}

export async function toggleWishlistAction(productId: string) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: "Not logged in" }

        // Check if item is already in wishlist
        const { data: existing } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .single()

        if (existing) {
            // Remove from wishlist
            const { error } = await supabase
                .from("wishlists")
                .delete()
                .eq("id", existing.id)

            if (error) throw error
            return { success: true, added: false }
        } else {
            // Add to wishlist
            const { error } = await supabase
                .from("wishlists")
                .insert({ user_id: user.id, product_id: productId })

            if (error) throw error
            return { success: true, added: true }
        }
    } catch (error: any) {
        console.error("Failed to toggle wishlist item:", error)
        return { success: false, error: error.message || "Failed to toggle wishlist item" }
    }
}
