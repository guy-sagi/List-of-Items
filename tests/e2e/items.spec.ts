import { test, expect } from "@playwright/test";

test("items page loads", async ({ page }) => {
    await page.goto("/");

    await expect(
        page.getByRole("heading", { name: /items/i })
    ).toBeVisible();
});

test.beforeEach(async ({ page }) => {
    await page.route("**/items", route =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
                { id: "1", title: "Item A", selected: false },
                { id: "2", title: "Item B", selected: false }
            ])
        })
    );
});

test("delete iten and undo", async ({ page }) => {
    await page.goto("/");

    // select item
    await page.getByRole("checkbox", { name: /item a/i }).check();

    // perform delete action
    await page.getByRole("button", { name: /delete/i }).click();

    // Item A deleted
    await expect(page.getByText("Item A")).not.toBeVisible();

    // perform undo action
    await page.getByRole("button", { name: /undo/i }).click();

    // Item A restored after undo
    await expect(page.getByText("Item A")).toBeVisible();
})