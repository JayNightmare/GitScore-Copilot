/**
 * Next.js configuration for static export to GitHub Pages
 * Enables output: 'export' for static site generation and configures asset prefix
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: "out",
    images: {
        unoptimized: true,
    },
    // Configure for GitHub Pages deployment
    assetPrefix: process.env.NODE_ENV === "production" ? "/GitScore-Copilot" : "",
    basePath: process.env.NODE_ENV === "production" ? "/GitScore-Copilot" : "",
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Disable server-side features for static export
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    // Ensure static export works properly
    env: {
        customKey: 'static-export',
    },
};

module.exports = nextConfig;
