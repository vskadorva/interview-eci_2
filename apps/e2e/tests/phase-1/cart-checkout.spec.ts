import { test, expect } from "../../src/fixtures/test.js";
import { ApiClient } from "../../src/helpers/api-client.js";
import { AUTH_TOKEN_KEY, REFACTOR_REX } from "../../src/constants.js";
import { PersonaDetailPage } from "../../src/pages/persona-detail.page.js";
import { CartPage } from "../../src/pages/cart.page.js";
import { CheckoutPage } from "../../src/pages/checkout.page.js";
import { NavPage } from "../../src/pages/nav.page.js";

test.describe.configure({ mode: "serial" });

test.describe("Cart & checkout regressions (H-06)", () => {
  test.beforeEach(async ({ page, api }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign out" }).waitFor({ state: "visible" });

    const token = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    );
    if (token) {
      await api.clearCart(token);
      await page.reload();
      await expect(new NavPage(page).cartBadge()).toHaveCount(0);
    }
  });

  test.afterEach(async ({ page, api }) => {
    await page.goto("/");
    const token = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    );
    if (token) {
      await api.clearCart(token);
    }
  });

  test("checkout empties cart and shows confirmation", async ({ page }) => {
    const detail = new PersonaDetailPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const nav = new NavPage(page);

    await detail.goto();
    await detail.addToCart();
    await expect(nav.cartBadge()).toHaveText("1");

    await cart.goto();
    await cart.expectItem(REFACTOR_REX.name);
    await cart.proceedToCheckout();

    await checkout.fillAndSubmit("E2E Buyer", "buyer@test.com");
    await checkout.expectConfirmation();

    await cart.goto();
    await cart.expectEmpty();
  });
});
