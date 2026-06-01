import type { APIRequestContext } from "@playwright/test";
import { API_BASE_URL, WEB_BASE_URL } from "../constants.js";
import { createTestUser, type TestUser } from "./test-data.js";

export interface AuthSession {
  token: string;
  user: { id: string; username: string; email: string };
}

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: TestUser = createTestUser()): Promise<AuthSession> {
    const response = await this.request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });

    if (!response.ok()) {
      throw new Error(`Register failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  async login(user: Pick<TestUser, "email" | "password">): Promise<AuthSession> {
    const response = await this.request.post(`${API_BASE_URL}/auth/login`, {
      data: user,
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
    }

    return response.json();
  }

  authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async getCart(token: string) {
    return this.request.get(`${API_BASE_URL}/cart`, {
      headers: this.authHeaders(token),
    });
  }

  async addToCart(token: string, personaId: string, quantity = 1) {
    return this.request.post(`${API_BASE_URL}/cart`, {
      headers: this.authHeaders(token),
      data: { personaId, quantity },
    });
  }

  async deleteCartItem(token: string, itemId: string) {
    return this.request.delete(`${API_BASE_URL}/cart/${itemId}`, {
      headers: this.authHeaders(token),
    });
  }

  async checkout(token: string, name: string, email: string) {
    return this.request.post(`${API_BASE_URL}/checkout`, {
      headers: this.authHeaders(token),
      data: { name, email },
    });
  }

  async getFavorites(token: string) {
    return this.request.get(`${API_BASE_URL}/favorites`, {
      headers: this.authHeaders(token),
    });
  }

  async addFavorite(token: string, personaId: string) {
    return this.request.post(`${API_BASE_URL}/favorites`, {
      headers: this.authHeaders(token),
      data: { personaId },
    });
  }

  async removeFavorite(token: string, personaId: string) {
    return this.request.delete(`${API_BASE_URL}/favorites/${personaId}`, {
      headers: this.authHeaders(token),
    });
  }

  async getPersonas(query = "") {
    return this.request.get(`${API_BASE_URL}/personas${query}`);
  }

  async corsPreflightDelete(path: string) {
    return this.request.fetch(`${API_BASE_URL}${path}`, {
      method: "OPTIONS",
      headers: {
        Origin: WEB_BASE_URL,
        "Access-Control-Request-Method": "DELETE",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    });
  }

  async clearCart(token: string) {
    const response = await this.getCart(token);
    if (!response.ok()) return;

    const cart = await response.json();
    for (const item of cart.items ?? []) {
      await this.deleteCartItem(token, item.id);
    }
  }
}
