import { test, expect } from "@playwright/test";
import { format } from "date-fns";

test("Successfully add a shift and approve it", async ({ page }) => {
  const employeeName = "Zydrune Lisauskaite-Bojeva";
  const todaysDate = new Date();
  const formattedDate = format(todaysDate, "d MMMM yyyy");

  await page.goto("https://qa-challenge-d.planday.com/");
  await expect(page.getByText("QA Challenge")).toBeVisible();

  await page
    .getByLabel("Main navigation")
    .getByRole("link", { name: "Schedule" })
    .click();

  await expect(page.getByText(employeeName)).toBeVisible();

  const employeeShift = page
    .locator("css=div.virtualized-board__row")
    .filter({ hasText: employeeName })
    .getByLabel(`${formattedDate} ${employeeName}`);

  await employeeShift.click();

  await expect(
    page.getByRole("heading", { name: formattedDate })
  ).toBeVisible();

  await page.locator("#shiftStartEnd_start").fill("9");
  await page.locator("#shiftStartEnd_end").fill("17");

  const shiftCreatePromise = page.waitForResponse(
    "https://scheduling-shift-api.prod-westeurope.planday.cloud/schedules/**/shifts/"
  );

  await page.getByRole("button", { name: "Create" }).click();

  await shiftCreatePromise;

  await employeeShift.click({ position: { x: 0, y: 0 } });

  await expect(
    page.getByRole("heading", { name: formattedDate })
  ).toBeVisible();

  const shiftListUpdatePromise = page.waitForResponse(
    "https://scheduling-shift-api.prod-westeurope.planday.cloud/schedules/**/shifts/intervals"
  );

  await page.locator(".switch").click();
  await page.getByRole("button", { name: "Save" }).click();

  await shiftListUpdatePromise;

  expect(employeeShift).toContainText("Approved");

  //clean up created shift
  await employeeShift.click({ position: { x: 0, y: 0 }, force: true });

  await expect(
    page.getByRole("heading", { name: formattedDate })
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.locator(".edit-shift-modal")).toContainText("Delete shift");

  const shiftListUpdatePromise2 = page.waitForResponse(
    "https://scheduling-shift-api.prod-westeurope.planday.cloud/schedules/**/shifts/intervals"
  );

  await page.getByRole("button", { name: "Delete" }).click();

  await shiftListUpdatePromise2;
});
