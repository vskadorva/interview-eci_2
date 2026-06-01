import { test, expect } from "../../src/fixtures/test.js";
import { AuthPage } from "../../src/pages/auth.page.js";
import { NavPage } from "../../src/pages/nav.page.js";
import { AUTH_TOKEN_KEY } from "../../src/constants.js";

test.describe("Auth regressions (C-01, H-04, H-11)", () => {
  test("register restores session on page reload via /auth/me", async ({
    page,
    testUser,
  }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);

    await auth.register(testUser.username, testUser.email, testUser.password);
    await nav.expectSignedIn(testUser.username);

    await page.reload();
    await nav.expectSignedIn(testUser.username);
    await expect(page.getByRole("link", { name: "Favorites" })).toBeVisible();
  });

  test("login displays username in navbar", async ({ page, api, testUser }) => {
    await api.register(testUser);

    const auth = new AuthPage(page);
    const nav = new NavPage(page);

    await auth.login(testUser.email, testUser.password);
    await nav.expectSignedIn(testUser.username);
  });

  test("logout clears persisted session on reload", async ({
    page,
    testUser,
  }) => {
    const auth = new AuthPage(page);
    const nav = new NavPage(page);

    await auth.register(testUser.username, testUser.email, testUser.password);
    await nav.expectSignedIn(testUser.username);

    await nav.signOut();
    await nav.expectSignedOut();

    const tokenAfterLogout = await page.evaluate(
      (key) => localStorage.getItem(key),
      AUTH_TOKEN_KEY,
    );
    expect(tokenAfterLogout).toBeNull();

    await page.reload();
    await nav.expectSignedOut();
  });
});
