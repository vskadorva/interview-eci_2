import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  buildPersonaQueryString,
  parsePersonaFilter,
  type Persona,
  type PersonaFilter,
} from "@acme/shared";
import { api } from "~/lib/api";
import { PersonaCard } from "~/components/PersonaCard";
import { SearchBar } from "~/components/SearchBar";
import { FilterPanel } from "~/components/FilterPanel";

export type BrowseSearchParams = PersonaFilter;

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): BrowseSearchParams =>
    parsePersonaFilter(search),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data: personas = [], isLoading } = useQuery({
    queryKey: ["personas", search],
    queryFn: () =>
      api.get<Persona[]>(`/personas${buildPersonaQueryString(search)}`),
  });

  const updateSearch = (updates: Partial<BrowseSearchParams>) => {
    navigate({
      to: "/",
      search: (prev: BrowseSearchParams) => {
        const next = { ...prev, ...updates };
        for (const key of Object.keys(next) as (keyof BrowseSearchParams)[]) {
          if (next[key] === undefined || next[key] === "") {
            delete next[key];
          }
        }
        return next;
      },
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Agentic Personas
        </h1>
        <p className="text-gray-600">
          Find the perfect AI agent for your team. Browse our curated collection
          of specialized personas.
        </p>
      </div>

      <SearchBar
        value={search.q ?? ""}
        onChange={(q) => updateSearch({ q: q || undefined })}
      />

      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        <FilterPanel
          specialty={search.specialty}
          tier={search.tier}
          minPrice={search.minPrice}
          maxPrice={search.maxPrice}
          sort={search.sort}
          onSpecialtyChange={(specialty) => updateSearch({ specialty })}
          onTierChange={(tier) => updateSearch({ tier })}
          onMinPriceChange={(minPrice) => updateSearch({ minPrice })}
          onMaxPriceChange={(maxPrice) => updateSearch({ maxPrice })}
          onSortChange={(sort) => updateSearch({ sort })}
        />

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : personas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No personas found matching your criteria.
              </p>
              <button
                onClick={() => navigate({ to: "/", search: {} })}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
