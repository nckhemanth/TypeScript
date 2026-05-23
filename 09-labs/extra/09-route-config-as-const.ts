// Run types:  npx tsc --noEmit --strict 09-labs/extra/09-route-config-as-const.ts
// Run code:   npx tsx 09-labs/extra/09-route-config-as-const.ts

// Problem:
// Route paths and nav labels live in strings scattered across the app.
// Typos in `"/dashbord"` aren't caught; union of allowed routes is lost.

// Bad version:
const routesBad = {
  home: "/",
  dashboard: "/dashboard",
  settings: "/settings",
};
type RoutePathBad = string; // too wide — accepts any string

function navigateBad(path: RoutePathBad) {
  console.log("go", path);
}
navigateBad("/dashbord"); // typo — no error

// Better version:
const routes = {
  home: "/",
  dashboard: "/dashboard",
  settings: "/settings",
} as const;

type RouteKey = keyof typeof routes;
type RoutePath = (typeof routes)[RouteKey];

function navigate(path: RoutePath) {
  console.log("go", path);
}

const navItems = (
  Object.entries(routes) as [RouteKey, RoutePath][]
).map(([key, path]) => ({ key, path, label: key }));

// Why this works:
// `as const` makes values readonly literal types (`"/dashboard"` not `string`).
// `keyof typeof routes` and indexed access build a finite path union from one config object.

// When to use:
// - App router path constants, feature flags keys, event name registries
// - i18n key maps where typos are costly

// When NOT to use:
// - Dynamic user-generated paths (`/users/${id}`) — use template + param schema instead
// - Config that must be mutated at runtime

// Interview line:
// "I centralize routes with `as const` and derive `RoutePath` from the object — navigation
//  only accepts known literals, and adding a route updates the union automatically."

navigate(routes.dashboard);
console.log(navItems);

// navigate("/nope"); // ERROR: not assignable to RoutePath
