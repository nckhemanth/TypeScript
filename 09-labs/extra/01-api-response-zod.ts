// Run types:  npx tsc --noEmit --strict 09-labs/extra/01-api-response-zod.ts
// Run code:   npx tsx 09-labs/extra/01-api-response-zod.ts

import { z } from "zod";

// Problem:
// You fetch JSON from a third-party API. TypeScript interfaces disappear at runtime —
// `as User` only silences the compiler; it does not validate the wire format.

// Bad version:
type UserBad = { id: string; name: string; email: string };

async function fetchUserBad(id: string): Promise<UserBad> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  // Cast trusts the network. If the API renames `name` → `fullName`, you get undefined at runtime.
  return (await res.json()) as UserBad;
}

// Better version:
const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
});

type User = z.infer<typeof userSchema>;

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json: unknown = await res.json();
  const parsed = userSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Invalid user payload: ${parsed.error.message}`);
  }

  return parsed.data;
}

// Why this works:
// Zod checks shape at runtime. `z.infer` keeps compile-time types in sync with the schema.
// `safeParse` returns a discriminated union — you handle bad data explicitly instead of crashing later.

// When to use:
// - External HTTP APIs (Stripe, GitHub, internal microservices you don't own)
// - Webhook payloads, file imports, LLM JSON output
// - Any `unknown` / `JSON.parse` boundary

// When NOT to use:
// - Data you just created in the same process (`makeTicket()` return value)
// - Already-validated data passed between your own typed modules in one request
// - Hot inner loops re-parsing the same object (validate once at the edge)

// Interview line:
// "I treat interfaces as documentation; at trust boundaries I validate with Zod and infer types
//  from the schema so runtime checks and compile-time types can't drift."

async function main() {
  const user = await fetchUser("1");
  console.log("validated user:", user.name, user.email);
}

main().catch(console.error);
