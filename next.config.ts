import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	output: "standalone",
	trailingSlash: false,
	experimental: {
		authInterrupts: true,
	},
	images: {
		unoptimized: true,
	},
};

export default async function configureNext(): Promise<NextConfig> {
	if (process.env.NODE_ENV === "development") {
		await initOpenNextCloudflareForDev();
	}
	return nextConfig;
}
