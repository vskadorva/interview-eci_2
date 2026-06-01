import { test as base, expect } from "@playwright/test";
import { ApiClient } from "../helpers/api-client.js";
import { createTestUser, type TestUser } from "../helpers/test-data.js";

type Fixtures = {
  api: ApiClient;
  testUser: TestUser;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    const api = new ApiClient(request);
    await use(api);
  },

  testUser: async ({}, use) => {
    const user = createTestUser();
    await use(user);
  },
});

export { expect };
