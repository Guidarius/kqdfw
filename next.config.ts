import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so module resolution
  // (e.g. @tailwindcss/oxide native bindings) doesn't get confused by stray
  // lockfiles further up the directory tree (e.g. C:\Users\<user>\package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
