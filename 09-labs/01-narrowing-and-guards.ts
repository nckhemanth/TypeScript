// Lab 01 — Narrowing & Type Guards
// Run types:  npx tsc --noEmit --strict 01-narrowing-and-guards.ts
// Run code:   npx tsx 01-narrowing-and-guards.ts
//
// Goal: feel how TypeScript refines a broad type as you check it.

// ── 1. typeof narrowing ────────────────────────────────────────────────
function describeId(id: string | number): string {
  if (typeof id === "string") {
    // PREDICT: what type is `id` here?  → string
    return `string id: ${id.toUpperCase()}`;
  }
  // Guard clause above means `id` is narrowed to `number` here.
  return `number id: ${id.toFixed(0)}`;
}

console.log(describeId("abc"));
console.log(describeId(42));

// ── 2. discriminated union narrowing ───────────────────────────────────
type ApiState =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: number };

function render(state: ApiState): string {
  switch (state.status) {
    case "loading":
      return "…loading";
    case "success":
      return `data: ${state.data}`; // `data` only exists on the success member
    case "error":
      return `error ${state.error}`; // `error` only exists on the error member
    default:
      // EXHAUSTIVENESS: if you add a new member above and forget a case,
      // `state` won't be `never` and the next line errors. Try it!
      return assertNever(state);
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled state: ${JSON.stringify(x)}`);
}

console.log(render({ status: "success", data: "hello" }));

// ── 3. `in` narrowing for types you don't control ──────────────────────
type ImageAttachment = { width: number; height: number };
type DocAttachment = { pages: number };

function summarize(a: ImageAttachment | DocAttachment): string {
  if ("width" in a) {
    return `${a.width}x${a.height}`; // narrowed to ImageAttachment
  }
  return `${a.pages} pages`; // narrowed to DocAttachment
}

console.log(summarize({ width: 800, height: 600 }));
console.log(summarize({ pages: 12 }));

// ── 4. custom type predicate ───────────────────────────────────────────
// `value is string` is the magic: returning true narrows the argument.
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function shout(value: unknown): string {
  if (isString(value)) {
    return value.toUpperCase(); // value: string — narrowed by the predicate
  }
  return "(not a string)";
}

console.log(shout("hi"));
console.log(shout(123));

// TRY THIS: comment out the "error" case in render() and watch assertNever()
// light up — that's the exhaustiveness check protecting you.
