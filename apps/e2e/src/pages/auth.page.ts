import type { Page } from "@playwright/test";

export class AuthPage {
  constructor(private readonly page: Page) {}

  async gotoRegister() {
    await this.page.goto("/register");
  }

  async gotoLogin() {
    await this.page.goto("/login");
  }

  async register(username: string, email: string, password: string) {
    await this.gotoRegister();
    await this.page.getByLabel("Username").fill(username);
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Create Account" }).click();
  }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }
}
