import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("https://qa-challenge-d.planday.com/");
  await page
    .getByRole("textbox", { name: "Username" })
    .fill("zydrune.lisauskaite@gmail.com");
  await page.getByLabel("Password", { exact: true }).fill("Testing1234!");
  await page.getByRole("button", { name: "Log in" }).click({ force: true });
  // Wait until the page receives the cookies.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("https://qa-challenge-d.planday.com/home");
  await expect(
    page.getByRole("heading", { name: "QA challenge" })
  ).toBeVisible();

  await page.context().storageState({ path: authFile });
});
