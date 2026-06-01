import { test as setup } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AUTH_STORAGE_PATH, AUTH_TOKEN_KEY, REFACTOR_REX } from "../../src/constants.js";
import { ApiClient } from "../../src/helpers/api-client.js";
import { createTestUser } from "../../src/helpers/test-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../../", AUTH_STORAGE_PATH);

setup("authenticate shared session", async ({ page, request }) => {
  const api = new ApiClient(request);
  const user = createTestUser("setup");
  const session = await api.register(user);

  await page.goto("/");
  await page.evaluate(
    ({ key, token }) => localStorage.setItem(key, token),
    { key: AUTH_TOKEN_KEY, token: session.token },
  );
  await page.reload();
  await page.getByRole("button", { name: "Sign out" }).waitFor({ state: "visible" });

  await api.clearCart(session.token);
  await api.removeFavorite(session.token, REFACTOR_REX.id).catch(() => undefined);

  await page.context().storageState({ path: authFile });
});
