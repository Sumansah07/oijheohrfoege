/**
 * Cloudinary Upload Utility
 * Handles image/video uploads to Cloudinary via server-side or unsigned presets.
 */

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
}

export async function deleteImage(publicId: string): Promise<boolean> {
    // Deletion usually requires a signature, which should be handled via a server action or API route.
    // This is a placeholder for the logic.
    const response = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
    });

    return response.ok;
}
