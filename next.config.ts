import type { NextConfig } from "next";

const repositoryName = "mi-operations-hub";

const nextConfig: NextConfig = {
	output: "export",
	trailingSlash: true,
	images: {
		unoptimized: true,
	},
	...(process.env.NODE_ENV === "production" ? { basePath: `/${repositoryName}` } : {}),
};

export default nextConfig;
