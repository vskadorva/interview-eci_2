import type { Persona } from "@acme/shared";

export const tierColors: Record<Persona["tier"], string> = {
  Starter: "bg-green-100 text-green-800",
  Pro: "bg-blue-100 text-blue-800",
  Enterprise: "bg-purple-100 text-purple-800",
};
