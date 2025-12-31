import { test, expect } from "@playwright/test";

test("albums page renders with mocked data", async ({ page }) => {
	await page.route("**/api/albums*", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				success: true,
				data: {
					albums: [
						{
							_id: "1",
							title: "Roots Rising",
							artist: "Rasman",
							coverArtUrl: "/images/logo.svg",
							price: 2500,
							songIds: [],
							description: "Test album",
							releaseDate: new Date().toISOString(),
							featured: true,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						},
					],
					pagination: {
						page: 1,
						limit: 12,
						totalCount: 1,
						totalPages: 1,
						hasNext: false,
						hasPrev: false,
					},
				},
			}),
		});
	});

	await page.goto("/albums");

	await expect(page.getByText("Roots Rising")).toBeVisible();
	await expect(page.getByRole("heading", { name: /Reggae Albums/i })).toBeVisible();
});
