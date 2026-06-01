import type { FastifyInstance } from "fastify";
import { addFavoriteSchema, type Persona } from "@acme/shared";
import { db, favorites as favoritesStore, personas as personasStore } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { getUserId } from "../lib/request.js";
import { sendValidationError } from "../lib/validation.js";

export async function favoriteRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/favorites", async (request) => {
    const userFavs = favoritesStore.get(getUserId(request));
    const result: Persona[] = [];

    if (userFavs) {
      for (const pid of userFavs) {
        const persona = personasStore.get(pid);
        if (persona) result.push(persona);
      }
    }

    return { favorites: result };
  });

  app.post("/favorites", async (request, reply) => {
    const parsed = addFavoriteSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const { personaId } = parsed.data;
    const persona = db.personas.getById(personaId);
    if (!persona) {
      return reply.status(404).send({ error: "Persona not found" });
    }

    db.favorites.add(getUserId(request), personaId);
    return { success: true };
  });

  app.delete<{ Params: { personaId: string } }>(
    "/favorites/:personaId",
    async (request, reply) => {
      const removed = db.favorites.remove(
        getUserId(request),
        request.params.personaId,
      );
      if (!removed) {
        return reply.status(404).send({ error: "Favorite not found" });
      }
      return { success: true };
    },
  );
}
