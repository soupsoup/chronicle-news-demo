import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the VPS (deploy/vps). Vercel ignores this.
  output: "standalone",
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
