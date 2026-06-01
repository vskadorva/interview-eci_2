import type { FastifyInstance } from "fastify";
import {
  registerSchema,
  loginSchema,
  type AuthResponse,
  type User,
} from "@acme/shared";
import { db } from "../db.js";
import type { StoredUser } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { getUserId } from "../lib/request.js";
import { sendValidationError } from "../lib/validation.js";

let userCounter = 0;

function toAuthUser(user: StoredUser): User {
  return { id: user.id, username: user.username, email: user.email };
}

function createAuthResponse(
  app: FastifyInstance,
  user: StoredUser,
): AuthResponse {
  return {
    token: app.jwt.sign({ id: user.id, email: user.email }),
    user: toAuthUser(user),
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const { username, email, password } = parsed.data;

    if (db.users.getByEmail(email)) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    if (db.users.getByUsername(username)) {
      return reply.status(409).send({ error: "Username already taken" });
    }

    const user = db.users.create({
      id: `user-${++userCounter}`,
      username,
      email,
      passwordHash: hashPassword(password),
    });

    return reply.status(201).send(createAuthResponse(app, user));
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const { email, password } = parsed.data;
    const user = db.users.getByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }

    return createAuthResponse(app, user);
  });

  app.get(
    "/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const user = db.users.getById(getUserId(request));
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }
      return toAuthUser(user);
    },
  );
}
