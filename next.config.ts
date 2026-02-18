import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/campaign/**",
        search: "*",
      },
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
