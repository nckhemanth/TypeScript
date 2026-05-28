// Run types:  npx tsc --noEmit --strict 09-labs/extra/20-when-not-to-over-type.ts
// Run code:   npx tsx 09-labs/extra/20-when-not-to-over-type.ts

import { z } from "zod";

// Problem:
// Teams add generics, branded types, and Zod everywhere — velocity drops, types fight you.
// Senior TS is knowing where strictness pays off and where plain JS shapes are enough.

// Bad version (over-typed):
type NonEmptyString = string & { __nonEmpty: true };
type PositiveInt = number & { __positive: true };

function logMessageBad(msg: NonEmptyString, count: PositiveInt) {
  console.log(msg, count);
}
// Constant casting at every call site — ceremony without safety gain

// Bad version (Zod everywhere):
function addWithZodBad(a: number, b: number) {
  const schema = z.object({ a: z.number(), b: z.number() });
  const { a: x, b: y } = schema.parse({ a, b }); // absurd — already typed
  return x + y;
}

// Better version — pragmatic layers:

// 1) Trust inside, validate at boundaries
function add(a: number, b: number): number {
  return a + b;
}

function handleCheckout(rawBody: unknown) {
  const checkoutSchema = z.object({
    cartId: z.string().uuid(),
    paymentToken: z.string().min(1),
  });
  const body = checkoutSchema.parse(rawBody);
  // internal helpers use plain types
  return processPayment(body.cartId, body.paymentToken);
}

function processPayment(cartId: string, token: string) {
  return { ok: true as const, cartId, token: token.slice(0, 4) + "…" };
}

// 2) `any` escape hatches — isolated, documented, shrinking over time
function legacyPluginConfig(config: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = config as any; // third-party plugin doc says "object" — narrow what you use
  const theme: string = typeof raw.theme === "string" ? raw.theme : "light";
  return { theme };
}

// 3) Inference over explicit annotations
const statuses = ["pending", "done", "failed"] as const;
type Status = (typeof statuses)[number]; // not a manual union copy

// 4) Don't brand every string — only IDs that cross function boundaries frequently

// Why this works:
// Type effort is proportional to failure cost. Internal math doesn't need Zod.
// Boundaries (HTTP, env, plugins) get schemas; core domain uses plain types + tests.

// When to use (strict typing):
// - Public API contracts, shared packages, money/identity fields
// - Refactor-heavy codebases where drift is expensive

// When NOT to use (keep it simple):
// - Scripts, one-off migrations, throwaway prototypes
// - Private functions called only with already-validated data
// - Third-party globals where `unknown` + small narrow is enough

// Interview line:
// "I validate at trust boundaries with Zod and keep internal code plain — over-typing helpers
//  and branding every string slows the team without reducing real bugs."

console.log(add(2, 3));
console.log(handleCheckout({ cartId: crypto.randomUUID(), paymentToken: "tok_123" }));
console.log(legacyPluginConfig({ theme: "dark" }));
console.log(statuses);
