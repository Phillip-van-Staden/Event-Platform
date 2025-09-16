import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        port: "",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
