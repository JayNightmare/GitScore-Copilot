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
    assetPrefix: process.env.NODE_ENV === "production" ? "/github-scorer" : "",
    basePath: process.env.NODE_ENV === "production" ? "/github-scorer" : "",
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Disable API routes for static export
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};

module.exports = nextConfig;
