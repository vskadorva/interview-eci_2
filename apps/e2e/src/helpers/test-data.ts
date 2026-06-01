export interface TestUser {
  username: string;
  email: string;
  password: string;
}

export function createTestUser(prefix = "e2e"): TestUser {
  const id = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    username: id,
    email: `${id}@test.com`,
    password: "password123",
  };
}
