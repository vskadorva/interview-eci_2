import type { Page } from "@playwright/test";

export class NavPage {
  constructor(private readonly page: Page) {}

  username = () => this.page.getByText(/^e2e_|^setup_/);

  signOutButton = () => this.page.getByRole("button", { name: "Sign in" }).or(
    this.page.getByRole("button", { name: "Sign out" }),
  );

  async signOut() {
    await this.page.getByRole("button", { name: "Sign out" }).click();
  }

  cartBadge = () => this.page.locator('a[href="/cart"] span');

  async expectSignedIn(username: string) {
    await this.page.getByText(username).waitFor({ state: "visible" });
  }

  async expectSignedOut() {
    await this.page.getByRole("link", { name: "Sign in" }).waitFor({
      state: "visible",
    });
  }
}
