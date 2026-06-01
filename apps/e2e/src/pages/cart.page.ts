import type { Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/cart");
  }

  async proceedToCheckout() {
    await this.page.getByRole("button", { name: "Proceed to Checkout" }).click();
  }

  async expectEmpty() {
    await this.page.getByRole("heading", { name: "Your cart is empty" }).waitFor();
  }

  async expectItem(name: string) {
    await this.page.getByRole("heading", { name: "Your Cart" }).waitFor();
    await this.page.getByText(name).first().waitFor();
  }
}
