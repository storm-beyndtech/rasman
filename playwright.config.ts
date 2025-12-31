import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	timeout: 60_000,
	expect: {
		timeout: 10_000,
	},
	reporter: "list",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3002",
		trace: "on-first-retry",
		video: "retain-on-failure",
	},
	webServer: {
		command: "npm run dev -- --hostname 0.0.0.0 --port 3002",
		url: "http://localhost:3002",
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile",
			use: { ...devices["Pixel 7"] },
		},
	],
});
