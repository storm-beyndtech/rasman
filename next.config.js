/** @type {import('next').NextConfig} */
const nextConfig = {
	serverExternalPackages: ["mongoose"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	experimental: {
		optimizePackageImports: ["lucide-react", "@tanstack/react-query", "@tanstack/react-query-devtools"],
		proxyClientMaxBodySize: "40mb",
	},
	webpack: (config) => {
		config.experiments = {
			...config.experiments,
			topLevelAwait: true,
		};
		return config;
	},
};

module.exports = nextConfig;
