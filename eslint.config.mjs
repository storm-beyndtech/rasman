import nextPlugin from "@next/eslint-plugin-next";

const nextConfig = nextPlugin.configs["core-web-vitals"];

export default [
	{
		ignores: ["node_modules/**", ".next/**", "playwright-report/**", "test-results/**"],
	},
	nextConfig,
];
