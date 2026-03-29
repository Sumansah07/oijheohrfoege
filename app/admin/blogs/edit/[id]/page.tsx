import { BlogForm } from "@/components/admin/blog-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditBlogPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: blog } = await supabase.from("blogs").select("*").eq("id", params.id).single()

    if (!blog) notFound()

    return <BlogForm blogId={params.id} initialData={blog} />
}
