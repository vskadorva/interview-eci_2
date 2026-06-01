import { expect, type Page } from "@playwright/test";
import { ENGINEERING_PERSONAS } from "../constants.js";

export class BrowsePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async filterBySpecialty(specialty: string) {
    await this.page.getByRole("button", { name: specialty }).click();
  }

  personaCard(name: string) {
    return this.page.getByRole("link", { name: new RegExp(name) });
  }

  async expectPersonaPrice(name: string, price: string) {
    await this.page.getByRole("link", { name: new RegExp(name) }).getByText(price).waitFor();
  }

  async expectEngineeringFilterResults() {
    for (const name of ENGINEERING_PERSONAS) {
      await expect(this.personaCard(name)).toBeVisible();
    }

    await expect(this.personaCard("Zero-Day Zara")).toHaveCount(0);
  }
}
