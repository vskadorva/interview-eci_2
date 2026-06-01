import type { Cart, CartItem } from "@acme/shared";
import { db } from "../db.js";

export function buildCartForUser(userId: string): Cart {
  const entries = db.cart.getByUserId(userId);
  const items: CartItem[] = [];
  let total = 0;

  for (const entry of entries) {
    const persona = db.personas.getById(entry.personaId);
    if (!persona) continue;

    items.push({
      id: entry.id,
      personaId: entry.personaId,
      persona,
      quantity: entry.quantity,
    });

    total += persona.price * entry.quantity;
  }

  return { items, total: Math.round(total * 100) / 100 };
}
