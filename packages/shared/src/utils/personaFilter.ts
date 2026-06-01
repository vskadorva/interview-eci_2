import { personaFilterSchema, type PersonaFilter } from "../schemas/persona.js";

export function parsePersonaFilter(
  search: Record<string, unknown>,
): PersonaFilter {
  const parsed = personaFilterSchema.safeParse({
    q: search.q || undefined,
    specialty: search.specialty || undefined,
    tier: search.tier || undefined,
    minPrice:
      search.minPrice != null && search.minPrice !== ""
        ? search.minPrice
        : undefined,
    maxPrice:
      search.maxPrice != null && search.maxPrice !== ""
        ? search.maxPrice
        : undefined,
    sort: search.sort || undefined,
  });

  return parsed.success ? parsed.data : {};
}

export function buildPersonaQueryString(filter: PersonaFilter): string {
  const params = new URLSearchParams();

  if (filter.q) params.set("q", filter.q);
  if (filter.specialty) params.set("specialty", filter.specialty);
  if (filter.tier) params.set("tier", filter.tier);
  if (filter.minPrice != null) params.set("minPrice", String(filter.minPrice));
  if (filter.maxPrice != null) params.set("maxPrice", String(filter.maxPrice));
  if (filter.sort) params.set("sort", filter.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
}
