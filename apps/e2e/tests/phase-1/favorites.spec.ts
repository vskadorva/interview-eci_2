import { test, expect } from "../../src/fixtures/test.js";
import { PersonaDetailPage } from "../../src/pages/persona-detail.page.js";
import { AUTH_TOKEN_KEY, REFACTOR_REX } from "../../src/constants.js";

test.describe.configure({ mode: "serial" });

test.describe("Favorites regressions (H-08, H-10)", () => {
  test.beforeEach(async ({ page, api }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign out" }).waitFor({ state: "visible" });

    const token = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    );
    if (token) {
      await api.removeFavorite(token, REFACTOR_REX.id).catch(() => undefined);
    }
  });

  test.afterEach(async ({ page, api }) => {
    await page.goto("/");
    const token = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    );
    if (token) {
      await api.removeFavorite(token, REFACTOR_REX.id).catch(() => undefined);
    }
  });

  test("can add and remove favorite from persona detail", async ({ page }) => {
    const detail = new PersonaDetailPage(page);
    await detail.goto();

    const addResponse = await detail.toggleFavorite();
    expect(addResponse.request().method()).toBe("POST");
    expect(addResponse.ok()).toBeTruthy();

    await page.goto("/favorites");
    await expect(
      page.getByRole("link", { name: new RegExp(REFACTOR_REX.name) }),
    ).toBeVisible();

    await detail.goto();
    await expect(detail.favoriteButton().locator("svg")).toHaveClass(/fill-red-500/);

    const removeResponse = await detail.toggleFavorite();
    expect(removeResponse.request().method()).toBe("DELETE");
    expect(removeResponse.ok()).toBeTruthy();

    await page.goto("/favorites");
    await expect(
      page.getByRole("link", { name: new RegExp(REFACTOR_REX.name) }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Your Favorites" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(REFACTOR_REX.name);
  });

  test("favorite heart toggles add and remove correctly", async ({ page }) => {
    const detail = new PersonaDetailPage(page);
    await detail.goto();

    const heart = detail.favoriteButton();

    await detail.toggleFavorite();
    await expect(heart.locator("svg")).toHaveClass(/fill-red-500/);

    await detail.toggleFavorite();
    await expect(heart.locator("svg")).not.toHaveClass(/fill-red-500/);
  });
});
