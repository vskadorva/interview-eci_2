import type { FastifyRequest } from "fastify";

export function getUserId(request: FastifyRequest): string {
  return (request.user as { id: string }).id;
}
