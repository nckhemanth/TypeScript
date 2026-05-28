// Run types:  npx tsc --noEmit --strict 09-labs/extra/18-react-query-types.ts
// Run code:   npx tsx 09-labs/extra/18-react-query-types.ts

// Problem:
// React Query hooks return loading/error/data states. Untyped query keys and `data: any`
// break when you refactor the fetcher or invalidate the wrong cache.

// Bad version:
// useQuery({ queryKey: ["user", id], queryFn: () => fetch(`/api/users/${id}`) })
// data is unknown/any — no link between key and fetcher return type

// Better version:
// Minimal stand-ins mirroring @tanstack/react-query (no dependency required for this lab).

type User = { id: string; name: string };

type QueryKey = readonly ["users", "detail", { id: string }] | readonly ["users", "list"];

type UseQueryResult<T> =
  | { status: "pending"; data: undefined }
  | { status: "error"; error: Error; data: undefined }
  | { status: "success"; data: T };

declare function useQuery<TData, TKey extends QueryKey>(options: {
  queryKey: TKey;
  queryFn: () => Promise<TData>;
}): UseQueryResult<TData>;

// Typed query key factory — single source for fetch + invalidate
const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: { q?: string }) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), { id }] as const,
};

async function fetchUser(id: string): Promise<User> {
  return { id, name: "Kyle" };
}

function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });
}

function UserProfile({ id }: { id: string }) {
  const query = useUser(id);

  if (query.status === "pending") return "Loading…";
  if (query.status === "error") return `Error: ${query.error.message}`;
  // narrowed: query.data is User
  return `Hello ${query.data.name}`;
}

// Why this works:
// Query key factories keep keys consistent for `invalidateQueries`.
// Generic `useQuery<User>` ties fetcher return type to `data` after success.
// Discriminated `status` mirrors narrowing patterns from lab 01.

// When to use:
// - Any client cache layer (TanStack Query, SWR with typed fetcher)
// - Co-locate key factory next to API module

// When NOT to use:
// - Server Components that fetch once — no client cache needed
// - Over-typing one-off `useEffect` fetches — plain async is fine

// Interview line:
// "I use a typed query-key factory and generic useQuery so cache keys, invalidation, and
//  `data` stay linked to the fetcher's return type."

// Demo without React runtime:
const mockResult = useUser("1");
if (mockResult.status === "success") {
  console.log("user:", mockResult.data.name);
}
console.log("key:", userKeys.detail("1"));
void UserProfile;
