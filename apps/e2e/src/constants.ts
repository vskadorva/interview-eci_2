export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:3001";

export const WEB_BASE_URL =
  process.env.WEB_BASE_URL ?? "http://localhost:5173";

export const AUTH_TOKEN_KEY = "auth_token";

export const AUTH_STORAGE_PATH = ".auth/user.json";

/** Persona used across cart/checkout/favorites tests */
export const REFACTOR_REX = {
  id: "p-001",
  name: "Refactor Rex",
  browsePrice: "$49.99/mo",
  detailPrice: "$49.99",
  apiPrice: 49.99,
};

export const ENGINEERING_PERSONAS = [
  "Refactor Rex",
  "Debug Duchess Dana",
  "Test Pilot Theo",
  "Migrator Max",
];
