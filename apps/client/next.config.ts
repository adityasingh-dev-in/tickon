import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@tickon/types"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
