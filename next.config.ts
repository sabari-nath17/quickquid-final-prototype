import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "quickquid-final-prototype";
const pagesBasePath = isGitHubPages ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : "standalone",
  basePath: pagesBasePath,
  assetPrefix: pagesBasePath,
  trailingSlash: isGitHubPages,
  images: { unoptimized: isGitHubPages },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
