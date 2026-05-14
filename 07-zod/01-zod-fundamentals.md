# Zod Fundamentals

Zod is a **TypeScript-first schema validation library**. You define a schema once and get
two things from it: **runtime validation** (does this unknown data match?) and a **static
type** (inferred automatically). It's the missing piece that protects the boundaries types
can't.

## Table of Contents

- [Why Zod exists](#why)
- [Install & import](#install)
- [Your first schema](#first)
- [`parse` vs `safeParse`](#parse)
- [`z.infer` — one source of truth](#infer)
- [Interview Questions](#interview-questions)

## Why Zod exists <a id="why"></a>

TypeScript types are erased at runtime, so at the edges of your program — API responses,
form input, `JSON.parse`, env vars, `localStorage` — the data could be **anything**, and TS
can't help. Zod validates that data at runtime *and* derives the TS type from the same
schema, so you never define the shape twice.

Highlights: zero dependencies, tiny, immutable/functional API, works in Node/Bun/browser,
and best-in-class TypeScript inference.

## Install & import <a id="install"></a>

```bash
npm install zod
```

```ts
import { z } from "zod";
```

The single `z` object is your entire toolkit. Requirement: `strict: true` in your
`tsconfig` (you almost certainly have it).

## Your first schema <a id="first"></a>

```ts
const userSchema = z.object({
  username: z.string(),
});

userSchema.parse({ username: "WDS" }); // ✓ returns the value
userSchema.parse({ username: 42 });    // ✗ throws ZodError
```

`z.object`, `z.string`, `z.number`, etc. compose to describe any shape. `.parse()` validates
and either returns the (typed) value or throws.

## `parse` vs `safeParse` <a id="parse"></a>

- **`.parse(data)`** — returns the validated value, or **throws** a `ZodError`. Use when a
  failure is exceptional (you'd want it to bubble up).
- **`.safeParse(data)`** — never throws. Returns a **discriminated union**:

```ts
const result = userSchema.safeParse(data);
if (result.success) {
  result.data;  // fully typed, validated value
} else {
  result.error; // ZodError — inspect/format it
}
```

Use `safeParse` for **form validation** and anywhere you want to handle the failure path
explicitly rather than with try/catch. (Notice the result shape is itself a textbook
discriminated union — `{ success: true; data } | { success: false; error }`.)

## `z.infer` — one source of truth <a id="infer"></a>

The killer feature. Derive the TypeScript type **from the schema** so you never write it
twice:

```ts
const userSchema = z.object({
  username: z.string(),
  age: z.number(),
});

type User = z.infer<typeof userSchema>;
// { username: string; age: number } — auto-derived, stays in sync
```

Change the schema and `User` updates automatically. Without Zod you'd define the type *and*
a separate validation function and keep them in sync by hand. Zod collapses both into one
declaration.

## Interview Questions

### Q: What problem does Zod solve that TypeScript can't?

Runtime validation at program boundaries. TS types are erased at runtime, so API responses,
form data, and `JSON.parse` output are effectively untyped. Zod validates that data at
runtime **and** infers the static type from the same schema — one source of truth on both
sides.

### Q: `parse` vs `safeParse`?

`parse` returns the validated value or **throws** a `ZodError`. `safeParse` never throws and
returns `{ success: true, data }` or `{ success: false, error }` — a discriminated union you
branch on. Use `safeParse` for form validation and expected-failure paths.

### Q: How does Zod avoid defining your types twice?

`z.infer<typeof schema>` derives the TypeScript type directly from the schema, so the schema
is the single source of truth — the type can't drift from the validation. Without it you'd
maintain a separate `type` and validator.

### Q: What's required to use Zod with TypeScript?

`strict: true` in `tsconfig` (for proper inference). Zod itself has zero dependencies and
works in any JS runtime; you can use it in plain JS, but it's designed for TS.
