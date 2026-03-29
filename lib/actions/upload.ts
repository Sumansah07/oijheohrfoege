"use server";

export async function uploadToCloudinary(formData: FormData): Promise<{ url: string; error?: string }> {
    const file = formData.get("file") as File;
    if (!file) return { url: "", error: "No file provided" };

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) return { url: "", error: "Cloudinary cloud name not configured" };

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("folder", "ecommerce");

    try {
        if (uploadPreset && uploadPreset !== "your-upload-preset") {
            // Unsigned upload using preset
            uploadFormData.append("upload_preset", uploadPreset);
        } else if (apiKey && apiSecret) {
            // Signed upload
            const timestamp = Math.round(Date.now() / 1000);
            const encoder = new TextEncoder();
            const signString = `folder=ecommerce&timestamp=${timestamp}${apiSecret}`;
            const hashBuffer = await crypto.subtle.digest("SHA-1", encoder.encode(signString));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

            uploadFormData.append("api_key", apiKey);
            uploadFormData.append("timestamp", String(timestamp));
            uploadFormData.append("signature", signature);
        } else {
            return { url: "", error: "Cloudinary API credentials not configured. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env" };
        }

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: uploadFormData }
        );
        const data = await res.json();
        if (data.error) return { url: "", error: data.error.message };
        return { url: data.secure_url };
    } catch (err: any) {
        return { url: "", error: err.message };
    }
}
