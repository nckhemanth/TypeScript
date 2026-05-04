# Types & Inference

The core loop of TypeScript: annotate *just enough*, and let **inference** do the rest.

## Table of Contents

- [Primitive types](#primitives)
- [Inference: let TypeScript do the work](#inference)
- [Type aliases](#aliases)
- [`any` — the escape hatch you should avoid](#any)
- [`unknown` — the safe `any`](#unknown)
- [`never` — the impossible type](#never)
- [Type-only imports](#type-imports)
- [Interview Questions](#interview-questions)

## Primitive types <a id="primitives"></a>

```ts
let title: string = "TS";
let count: number = 42;
let big: bigint = 9007199254740991n;
let active: boolean = true;
let nothing: null = null;
let missing: undefined = undefined;
let when: Date = new Date(); // not a primitive, but built-in
```

Explicit annotation uses `identifier: Type`. The emitted JS just drops the `: Type`.

## Inference: let TypeScript do the work <a id="inference"></a>

You rarely need to write types. ~95–99% of the time TS infers them correctly from the
value:

```ts
let logs = "hello";   // inferred: string
const n = 42;         // inferred: 42 (a literal type, because const can't change)
let arr = [1, 2, 3];  // inferred: number[]
```

**Rule of thumb:** annotate **function parameters** (TS can't guess what a caller passes)
and let almost everything else infer. Over-annotating adds noise and can make types *less*
accurate (see "wider than reality" in the functions chapter).

## Type aliases <a id="aliases"></a>

A `type` alias is a named variable for a type — define once, reuse everywhere. By
convention, alias names are `PascalCase`.

```ts
type ID = string | number;
type SupportResponse = (name: string) => string;

let userId: ID = "abc";
```

Aliases are erased at compile time — they exist only for the type-checker. You **cannot**
check `typeof x === "SupportResponse"` at runtime; that information is gone in JS.

## `any` — the escape hatch you should avoid <a id="any"></a>

`any` means "turn type-checking off for this value." It can be anything and lets you do
anything to it — no errors, no safety.

```ts
let x: any = "hello";
x.foo.bar();   // no error, even though this will crash at runtime
```

`any` is **infectious**: it spreads through every value it touches and silently removes
type safety. Don't reach for it when writing fresh code. Its one legitimate use is
**incremental migration** of an old JS codebase — sprinkle `any` on hard-to-type spots
and fix them later.

## `unknown` — the safe `any` <a id="unknown"></a>

`unknown` also accepts any value, but it's **maximally restrictive**: you can't use it
until you've narrowed it to a real type.

```ts
let a: unknown = JSON.parse(input);
a.toLowerCase();              // ✗ error: 'a' is of type 'unknown'

if (typeof a === "string") {
  a.toLowerCase();            // ✓ narrowed to string
}
```

**Default to `unknown` over `any`** whenever you'd be tempted by `any` — especially for
API responses and `JSON.parse`. It keeps type-checking on and forces you to validate.

> `any` = "TypeScript, look away." `unknown` = "I don't know yet, so make me check."

## `never` — the impossible type <a id="never"></a>

`never` is the opposite of `any`: a value that can **never** exist. It's the bottom of the
type hierarchy.

Where it shines: **exhaustiveness checks**. If you've handled every case of a union, the
leftover type is `never` — and assigning anything else to it errors, so TS forces you to
handle new cases you forgot.

```ts
type Status = 200 | 404 | 500;

function handle(code: Status) {
  switch (code) {
    case 200: return "ok";
    case 404: return "not found";
    case 500: return "error";
    default:
      const _exhaustive: never = code; // ✗ errors if a Status is unhandled
      throw new Error(`Unhandled: ${code}`);
  }
}
```

The type hierarchy, widest → narrowest: `unknown` → `string`/`number`/… → literal like
`"hi"`/`42` → `never`.

## Type-only imports <a id="type-imports"></a>

When you import something used **only as a type**, use `import type`. It guarantees the
import is erased from the JS bundle (it never pulls in the file's runtime code):

```ts
import type { User } from "./user";        // whole statement is a type-only import
import { type User, createUser } from "./user"; // inline: User is type-only, createUser is real
```

Smaller bundles, zero accidental runtime imports. Setting `verbatimModuleSyntax: true` in
`tsconfig` enforces this style.

## Interview Questions

### Q: `any` vs `unknown` — when do you use each?

`any` disables type checking entirely and is infectious — avoid it in new code (acceptable
only when migrating JS). `unknown` accepts any value but forces you to narrow before use,
keeping safety on. Use `unknown` for untrusted/dynamic data (API responses, `JSON.parse`).

### Q: What is `never` and where is it useful?

A type with no possible values — the bottom type. Most useful for **exhaustiveness
checking** in switch/if over unions: assign the remaining value to a `never` and TS errors
if you forgot a case, so adding a new union member surfaces every place you must update.

### Q: When should you annotate vs let TS infer?

Always annotate **function parameters** (and public library return types). Let inference
handle local variables and most return types — inferred types are often more *specific*
(e.g. `42` vs `number`) and stay correct automatically when you change code.

### Q: Why `import type`?

It marks an import as type-only so it's guaranteed erased from the emitted JS, avoiding
pulling a module's runtime code into your bundle just to reference its types.
