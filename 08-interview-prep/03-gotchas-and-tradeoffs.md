# Gotchas & Tradeoffs

The subtle stuff that separates "used TS" from "understands TS." Great for follow-up
questions and code review.

## Table of Contents

- [Types lie at runtime](#runtime)
- [`any` is infectious](#any)
- [Excess property checks only on literals](#excess)
- [Empty array/object inference](#empty)
- [Tuples are mutable arrays](#tuples)
- [Interface declaration merging](#merging)
- [Enums emit code](#enums)
- [Inferred vs explicit return types](#returns)
- [Custom type guards can lie](#guards)
- [`optional` vs `nullable` vs `nullish`](#zod-optional)
- [Decision table](#decisions)

## Types lie at runtime <a id="runtime"></a>
Types are erased. A value typed `User` from `JSON.parse` might be `null` at runtime. Validate
boundaries (Zod), don't trust the annotation.

## `any` is infectious <a id="any"></a>
One `any` spreads through everything it touches, silently disabling safety downstream.
Default to `unknown` and narrow.

## Excess property checks only on literals <a id="excess"></a>
`fn({ name, typo })` errors on the typo; `fn(variableWithTypo)` does **not** (structural
typing). The literal check is a typo guard, not a guarantee.

## Empty array/object inference <a id="empty"></a>
`const a = []` → `any[]` (or `never[]` via `?? []` fallback). Always annotate arrays you fill
later: `const a: number[] = []`. Empty objects (`{}`) mean "anything except null/undefined" —
annotate them too.

## Tuples are mutable arrays <a id="tuples"></a>
`.push()` bypasses a tuple's fixed length at runtime. Rebuilding a tuple by hand widens it to
`(A|B)[]` — re-assert with `as const`. Use `readonly` to lock them.

## Interface declaration merging <a id="merging"></a>
Two interfaces with the same name **silently merge**; two types error. Usually you wanted the
error. This is the #1 reason to default to `type`.

## Enums emit code <a id="enums"></a>
Unlike every other type construct, `enum` compiles to runtime JS and blends TS into your JS.
Prefer unions of literals.

## Inferred vs explicit return types <a id="returns"></a>
Explicit returns can be **wider/wrong** than reality (e.g. declaring `string | null` when you
never return null), causing downstream confusion. Infer internal returns; annotate only
public APIs.

## Custom type guards can lie <a id="guards"></a>
A type predicate (`x is T`) is trusted blindly by TS. A wrong predicate silently mis-narrows
across the whole codebase with no error. Write them carefully and unit-test them.

## `optional` vs `nullable` vs `nullish` (Zod) <a id="zod-optional"></a>
`.optional()` = `undefined`; `.nullable()` = `null`; `.nullish()` = both. Picking the wrong
one is a classic source of "valid data rejected" bugs — match it to how absence actually
arrives (missing key → undefined; explicit JSON `null` → null).

## Decision table <a id="decisions"></a>

| Situation | Reach for |
|---|---|
| Describe a data shape | `type` (default) |
| Augment `window` / global | `interface` (declaration merging) |
| Fixed set of choices | union of literals |
| "One of N" object states | discriminated union |
| Lock config / derive literal union | `as const` |
| Validate shape but keep precise type | `satisfies` |
| Untrusted/dynamic value | `unknown` + narrow / Zod |
| Reusable code keeping caller's type | generic (`<T extends ...>`) |
| Variation of an existing type | utility type (`Pick`/`Omit`/`Partial`) |
| Need real runtime behavior/instances | `class` |
| Runtime validation + inferred type | **Zod** schema + `z.infer` |
| Forbid a wrong type, certain & cumbersome to narrow | `as` (sparingly) |
| Guarantee a switch covers all cases | `value satisfies never` |

## The senior-signal soundbite

> "TypeScript is compile-time only — its job is tooling and catching bugs before runtime,
> with refactor safety as the biggest payoff. I keep `strict` on, default to `type` and
> unions over interfaces and enums, lean on inference, and reach for assertions rarely. At
> runtime boundaries I validate with Zod so one schema gives me both validation and the
> inferred type — a single source of truth."
