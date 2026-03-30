/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        esmExternals: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'i.pravatar.cc' },
            { protocol: 'https', hostname: 'api.dicebear.com' },
        ],
    },
    // Generate unique build ID to prevent chunk caching issues in WebContainer
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    // Optimize for WebContainer environment
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Improve chunk loading reliability
            config.output = {
                ...config.output,
                publicPath: '/_next/',
            };
        }
        return config;
    },
};

export default nextConfig;
