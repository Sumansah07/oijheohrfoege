"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: {
    productId: string;
    rating: number;
    comment: string;
    title?: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("You must be logged in to submit a review");
    }

    const { error } = await supabase.from("reviews").insert({
        product_id: formData.productId,
        user_id: user.id,
        rating: formData.rating,
        comment: formData.comment,
        title: formData.title || "",
        status: "approved", // auto-approving for this template, can be changed to 'pending'
    });

    if (error) {
        console.error("Error submitting review:", error);
        throw new Error("Failed to submit review");
    }

    revalidatePath(`/product/[slug]`, "page");
    return { success: true };
}

export async function getProductReviews(productId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            *,
            profiles (full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }

    return data;
}
