import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	trailingSlash: true,
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
