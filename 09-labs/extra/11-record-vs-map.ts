// Run types:  npx tsc --noEmit --strict 09-labs/extra/11-record-vs-map.ts
// Run code:   npx tsx 09-labs/extra/11-record-vs-map.ts

// Problem:
// You need a lookup from string key → value. `Record`, plain object, or `Map`?
// Wrong choice causes perf issues or awkward typing for non-string keys.

// Bad version:
// Using Map when keys are fixed enum members — unnecessary API, worse JSON story.
const statusBad = new Map<string, string>();
statusBad.set("pending", "yellow");
statusBad.set("done", "green");
// No compile-time check that all statuses are covered.

// Better version:

// A) Record — fixed string-key dictionary known at compile time
type OrderStatus = "pending" | "shipped" | "delivered";

const statusColor: Record<OrderStatus, string> = {
  pending: "yellow",
  shipped: "blue",
  delivered: "green",
  // missing key → ERROR
};

// B) Map — dynamic keys, non-string keys, frequent add/delete
const sessionCache = new Map<string, { userId: string; expires: number }>();

function cacheSession(token: string, userId: string) {
  sessionCache.set(token, { userId, expires: Date.now() + 3600_000 });
}

// C) Object with satisfies for readonly lookup tables
const HTTP_STATUS = {
  404: "Not Found",
  500: "Server Error",
} as const satisfies Record<number, string>;

// Why this works:
// `Record<OrderStatus, T>` enforces exhaustiveness for known key unions.
// `Map` shines for runtime-grown collections and non-string keys (DOM nodes, objects).
// Plain `as const` objects are best for static tables.

// When to use:
// - Record: enum/union keys, label maps, reducer state slices with known keys
// - Map: cache, memoization, keys not known until runtime
// - as const object: HTTP codes, icon lookup, constants

// When NOT to use:
// - Map for API JSON — serialize to plain object first
// - Record with unbounded dynamic keys — use Map or `Record<string, T>` knowingly (loses exhaustiveness)

// Interview line:
// "I use Record for exhaustive fixed-key maps, Map for dynamic or non-string keys,
//  and `as const` objects for static lookup tables — each matches how the data grows."

console.log(statusColor.pending, sessionCache.size, HTTP_STATUS[404]);
