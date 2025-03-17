import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@material/web"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ["d3cchcep3ekd0z.cloudfront.net"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
