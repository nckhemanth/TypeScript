// Run types:  npx tsc --noEmit --strict 09-labs/extra/15-type-guard-danger.ts
// Run code:   npx tsx 09-labs/extra/15-type-guard-danger.ts

// Problem:
// Type predicates (`x is T`) tell the compiler to trust you. A wrong guard compiles fine
// but lies at runtime — worse than `as` because it looks "safe".

// Bad version:
type User = { id: string; name: string };

// LYING GUARD — always returns true, checks nothing meaningful
function isUserBad(value: unknown): value is User {
  return true;
}

function greetUserBad(value: unknown) {
  if (isUserBad(value)) {
    console.log(value.name.toUpperCase()); // runtime crash if value is null
  }
}

// Another common lie: check one field, assume the rest
function isUserLazy(value: unknown): value is User {
  return typeof value === "object" && value !== null && "name" in value;
  // { name: 123 } passes — id might be missing
}

// Better version:
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is User {
  if (!isRecord(value)) return false;
  return typeof value["id"] === "string" && typeof value["name"] === "string";
}

function greetUser(value: unknown) {
  if (isUser(value)) {
    console.log(value.name.toUpperCase());
  } else {
    console.log("(invalid user)");
  }
}

// Best at boundaries: Zod — guard logic is tested and centralized
// const userSchema = z.object({ id: z.string(), name: z.string() });

// Why this works:
// Type predicates are unchecked by TS — you must validate every required field.
// Prefer Zod for external data; hand-written guards for hot paths with tests.

// When to use:
// - Small internal unions (`isApiError`) with thorough checks + unit tests
// - Array.filter narrowing: `items.filter(isUser)` 

// When NOT to use:
// - Guards that only check one property on complex objects
// - `return true` to silence the compiler — use Zod or fix the type

// Interview line:
// "Type guards are assertions I prove in code — TS doesn't verify them. I validate every field
//  or use Zod, because a lying `value is User` is how you get production undefined errors."

greetUserBad(null);
greetUser({ id: "1", name: "Kyle" });
greetUser({ name: 42 });
