import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The file-backed catalog is read with `fs` at request time, so make sure the
  // seeded JSON ships inside the serverless bundle on Vercel.
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
};

export default nextConfig;
