/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    // Product/category images are uploaded to Cloudinary - letting next/image
    // fetch from there lets it auto-generate resized, modern-format (AVIF/WebP)
    // variants instead of shipping the full-size original to every device.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;