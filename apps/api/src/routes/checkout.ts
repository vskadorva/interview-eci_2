import type { FastifyInstance } from "fastify";
import { checkoutSchema, type Order } from "@acme/shared";
import { db } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { buildCartForUser } from "../lib/cart.js";
import { getUserId } from "../lib/request.js";
import { sendValidationError } from "../lib/validation.js";

export async function checkoutRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post("/checkout", async (request, reply) => {
    const userId = getUserId(request);
    const parsed = checkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const cart = buildCartForUser(userId);
    if (cart.items.length === 0) {
      return reply.status(400).send({ error: "Cart is empty" });
    }

    const order: Order = {
      id: db._nextOrderId(),
      userId,
      items: cart.items,
      total: cart.total,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      createdAt: new Date().toISOString(),
    };

    db.orders.create(order);
    db.cart.clearForUser(userId);

    return reply.status(201).send(order);
  });
}
