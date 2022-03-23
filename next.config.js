/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ipfs.io"],
  },
  webpack(config, options) {
    config.resolve.alias["~"] = path.join(__dirname, ".");
    return config;
  },
};

module.exports = nextConfig;
