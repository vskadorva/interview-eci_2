import type { FastifyInstance } from "fastify";
import { addToCartSchema, updateCartItemSchema } from "@acme/shared";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { buildCartForUser } from "../lib/cart.js";
import { getUserId } from "../lib/request.js";
import { sendValidationError } from "../lib/validation.js";

export async function cartRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/cart", async (request) => {
    return buildCartForUser(getUserId(request));
  });

  app.post("/cart", async (request, reply) => {
    const userId = getUserId(request);
    const parsed = addToCartSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const { personaId, quantity } = parsed.data;
    const persona = db.personas.getById(personaId);
    if (!persona) {
      return reply.status(404).send({ error: "Persona not found" });
    }

    db.cart.add(userId, personaId, quantity);
    return buildCartForUser(userId);
  });

  app.put<{ Params: { itemId: string } }>(
    "/cart/:itemId",
    async (request, reply) => {
      const userId = getUserId(request);
      const parsed = updateCartItemSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendValidationError(reply, parsed.error);
      }

      const item = db.cart.getById(request.params.itemId);
      if (!item || item.userId !== userId) {
        return reply.status(404).send({ error: "Cart item not found" });
      }

      db.cart.update(request.params.itemId, parsed.data.quantity);
      return buildCartForUser(userId);
    },
  );

  app.delete<{ Params: { itemId: string } }>(
    "/cart/:itemId",
    async (request, reply) => {
      const userId = getUserId(request);
      const item = db.cart.getById(request.params.itemId);
      if (!item || item.userId !== userId) {
        return reply.status(404).send({ error: "Cart item not found" });
      }

      db.cart.remove(request.params.itemId);
      return buildCartForUser(userId);
    },
  );
}
