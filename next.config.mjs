/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/expense-tracker-ai",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
