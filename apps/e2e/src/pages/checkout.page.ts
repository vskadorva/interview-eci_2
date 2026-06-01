import type { Page } from "@playwright/test";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async fillAndSubmit(name: string, email: string) {
    await this.page.getByLabel("Full Name").fill(name);
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByRole("button", { name: "Place Order" }).click();
  }

  async expectConfirmation() {
    await this.page.getByRole("heading", { name: "Order Confirmed!" }).waitFor();
  }
}
