# TypeScript & Zod Cheatsheet

One-screen recall for the night before. Skim top to bottom.

## The 30-second pitch

> TypeScript is a **static linter for JavaScript**: it type-checks at author time, powers
> editor tooling, then **erases to JS** (exceptions: `enum`, constructor param properties).
> Its biggest win is **fearless refactoring**. Types are gone at runtime, so validate
> boundaries with **Zod**.

## Types at a glance

| Type | Meaning |
|---|---|
| `any` | type-checking OFF; infectious; avoid |
| `unknown` | safe `any` — must narrow before use |
| `never` | impossible value; bottom type; exhaustiveness |
| `void` | function returns nothing meaningful |
| `string \| number` | union — "one of" |
| `A & B` | intersection — "all of" |
| `"north"`, `42` | literal types |
| `readonly`, `?` | immutable / optional property |

## Hierarchy
`unknown` (widest) → `string`/`number` → literal `"hi"` → `never` (narrowest)

## Annotate vs infer
- **Annotate:** function parameters, public library return types.
- **Infer:** local vars, internal return types (more accurate, self-updating).

## Narrowing toolkit
`typeof` (primitives) · truthiness / guard clauses · `in` (property) · `instanceof` (class)
· **discriminated union** (shared literal tag — best) · custom **type predicate** (`x is T`)
· exhaustiveness via `value satisfies never`.

## `type` vs `interface`
Default **`type`**. `interface` only for **declaration merging** (augmenting `window`) or big
extension hierarchies. `interface` silently merges duplicates; `type` errors (safer).

## enum vs union
Prefer **union of literals** (`"a" | "b"`): zero runtime cost, less code, direct values.
Enums **emit JS** and blur the TS/JS line.

## `as const` vs `satisfies`
- `as const` → deeply readonly, narrow literal types (derive unions: `typeof arr[number]`).
- `satisfies T` → validate against T **without widening** the value's own type.

## Assertions (use sparingly)
- `x as T` — trust me, no runtime check (risky).
- `x!` — not null/undefined (risky). Prefer a real null check / narrowing.
- `x as unknown as T` — double assertion; code smell.

## Generics
`function f<T>(x: T): T` · constrain: `<T extends { id: string }>` · TS infers `T` ~99% of
the time · anything can be generic (type/interface/class).

## Utility types
`Partial` `Required` `Readonly` `Record<K,V>` `Pick<T,K>` `Omit<T,K>` `ReturnType<typeof fn>`
`Parameters<typeof fn>` `Awaited<T>` `NonNullable<T>` `Exclude<U,X>` `Extract<U,X>`.
All built from **mapped + conditional + `infer`**.

## Advanced type primitives
`keyof T` (key union) · `typeof v` (value→type) · `T[K]` (indexed access) ·
`T extends U ? X : Y` (conditional) · `infer R` (capture) · `{ [K in keyof T]: ... }` (mapped).

## tsconfig must-knows
`strict: true` (always) · `skipLibCheck` · `esModuleInterop` · `noUncheckedIndexedAccess`
(arr[i] → `T | undefined`) · install TS **locally**, restart TS server when types act weird.

## Zod
```ts
const s = z.object({ name: z.string().min(3), age: z.number().optional() });
type S = z.infer<typeof s>;           // derive type from schema
s.parse(x);                            // throws ZodError on fail
const r = s.safeParse(x);              // { success, data | error }
```
- required by default · `.optional()` (undef) / `.nullable()` (null) / `.nullish()` (both)
- `.default()` `.refine()` `.transform()` `z.coerce.number()`
- `z.enum([...])` · `z.discriminatedUnion("tag", [...])` · `z.record` / `z.map` / `z.set`
- unknown keys **stripped** by default (`.passthrough()` / `.strict()`)
- errors: `fromZodError()` from `zod-validation-error`

## The closing line
> TS gives compile-time safety; Zod gives runtime safety at the boundaries. One schema →
> validation + inferred type → single source of truth.
