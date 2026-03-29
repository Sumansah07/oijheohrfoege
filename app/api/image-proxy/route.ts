import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        // Decode the URL if it's encoded
        const decodedUrl = decodeURIComponent(imageUrl);

        // Fetch the image from Cloudinary
        const response = await fetch(decodedUrl);

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
        }

        // Get the image buffer
        const buffer = await response.arrayBuffer();

        // Return with proper CORS headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
    }
}
