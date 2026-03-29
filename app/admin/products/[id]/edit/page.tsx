import { ProductForm } from "@/components/admin/product-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single()

    if (error || !product) notFound()

    return <ProductForm productId={params.id} initialData={product} />
}
