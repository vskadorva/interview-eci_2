import type { Page } from "@playwright/test";
import { REFACTOR_REX } from "../constants.js";

export class PersonaDetailPage {
  constructor(private readonly page: Page) {}

  async goto(personaId = REFACTOR_REX.id) {
    await this.page.goto(`/personas/${personaId}`);
  }

  addToCartButton = () =>
    this.page.getByRole("button", { name: "Add to Cart" });

  favoriteButton = () =>
    this.addToCartButton().locator("xpath=following-sibling::button[1]");

  async waitForReady() {
    await this.addToCartButton().waitFor({ state: "visible" });
  }

  async expectPrice(price: string) {
    await this.page.getByText(price, { exact: true }).first().waitFor();
  }

  async addToCart() {
    await this.waitForReady();
    await this.addToCartButton().click();
  }

  async toggleFavorite() {
    await this.waitForReady();
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) =>
          res.url().includes(`/favorites/${REFACTOR_REX.id}`) ||
          (res.url().endsWith("/favorites") &&
            res.request().method() === "POST"),
      ),
      this.favoriteButton().click(),
    ]);
    return response;
  }
}
