import { test, expect } from "@playwright/test";

test("contact form submits successfully", async ({ page }) => {
	let submitted = false;
	await page.route("**/api/contact", async (route) => {
		submitted = true;
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ success: true, message: "ok" }),
		});
	});

	await page.goto("/contact");

	await page.getByPlaceholder("Your full name").fill("Test User");
	await page.getByPlaceholder("you@example.com").fill("user@example.com");
	await page.getByPlaceholder("How can we help?").fill("Support");
	await page.getByPlaceholder("Share details about your request...").fill("I need help with a recent purchase.");

	await page.getByRole("button", { name: "Send Message" }).click();

	await expect.poll(() => submitted).toBe(true);
	await expect(page.getByPlaceholder("Your full name")).toHaveValue("");
	await expect(page.getByPlaceholder("you@example.com")).toHaveValue("");
});
