import type { FastifyReply } from "fastify";

interface ValidatableError {
  flatten: () => unknown;
}

export function sendValidationError(reply: FastifyReply, error: ValidatableError) {
  return reply.status(400).send({ error: error.flatten() });
}
