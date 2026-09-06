import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/framer-motion/,
      use: [
        {
          loader: path.resolve(__dirname, "scripts/strip-sourcemap-loader.cjs"),
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
