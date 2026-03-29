/**
 * Wraps an image URL through the local proxy to bypass COEP restrictions in WebContainer
 */
export function proxyImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
        return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
    }

    // If it's already a proxy URL, return as-is
    if (imageUrl.includes('/api/image-proxy')) {
        return imageUrl;
    }

    // Encode the URL and pass through proxy
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}
