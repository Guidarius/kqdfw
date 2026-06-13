import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so module resolution
  // (e.g. @tailwindcss/oxide native bindings) doesn't get confused by stray
  // lockfiles further up the directory tree (e.g. C:\Users\<user>\package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },

  // BARE-BONES PROOF OF CONCEPT: send the root straight to the League page.
  // The Home page (app/page.tsx) is left intact — delete this redirect to
  // bring it back. `permanent: false` (307) so browsers don't hard-cache it.
  async redirects() {
    return [{ source: "/", destination: "/league", permanent: false }];
  },
};

export default nextConfig;
