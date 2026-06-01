import { test, expect } from "../../src/fixtures/test.js";
import { REFACTOR_REX } from "../../src/constants.js";

test.describe("API security & data regressions (C-01, H-05, H-07, H-08)", () => {
  test("GET /cart without token returns 401", async ({ request }) => {
    const response = await request.get("http://localhost:3001/cart");
    expect(response.status()).toBe(401);
  });

  test("GET /cart with valid token returns 200", async ({ api, testUser }) => {
    const session = await api.register(testUser);
    const response = await api.getCart(session.token);
    expect(response.status()).toBe(200);
  });

  test("minPrice filter returns personas at or above threshold", async ({
    api,
  }) => {
    const response = await api.getPersonas("?minPrice=50");
    expect(response.ok()).toBeTruthy();

    const personas = await response.json();
    expect(personas.length).toBeGreaterThan(0);
    for (const persona of personas) {
      expect(persona.price).toBeGreaterThanOrEqual(50);
    }
  });

  test("user cannot delete another users cart item", async ({ api }) => {
    const userA = await api.register();
    const userB = await api.register();

    await api.addToCart(userA.token, REFACTOR_REX.id);
    const cartResponse = await api.getCart(userA.token);
    const cart = await cartResponse.json();
    const itemId = cart.items[0].id;

    const deleteResponse = await api.deleteCartItem(userB.token, itemId);
    expect(deleteResponse.status()).toBe(404);

    const ownerCart = await api.getCart(userA.token);
    const ownerData = await ownerCart.json();
    expect(ownerData.items).toHaveLength(1);
  });

  test("CORS preflight allows DELETE from web origin", async ({ api }) => {
    const response = await api.corsPreflightDelete("/favorites/p-001");
    expect(response.status()).toBeLessThan(400);

    const allowMethods = response.headers()["access-control-allow-methods"] ?? "";
    expect(allowMethods).toContain("DELETE");
  });

  test("checkout clears cart server-side", async ({ api, testUser }) => {
    const session = await api.register(testUser);
    await api.addToCart(session.token, REFACTOR_REX.id);

    const checkoutResponse = await api.checkout(
      session.token,
      "API Buyer",
      testUser.email,
    );
    expect(checkoutResponse.status()).toBe(201);

    const cartResponse = await api.getCart(session.token);
    const cart = await cartResponse.json();
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
  });
});
