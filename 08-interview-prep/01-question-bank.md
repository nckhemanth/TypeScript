# Question Bank

Rapid-fire Q&A, ordered roughly easy → hard. Cover the answer, say it out loud, then check.

## Fundamentals

**Q1. What is TypeScript?**
A superset of JavaScript that adds optional static types. It type-checks at author time and
compiles ("erases") to plain JS. Think "static linter for JavaScript."

**Q2. Is all TypeScript valid JavaScript?**
No. All JavaScript is valid TypeScript, but TS adds syntax (annotations, `interface`, `enum`)
that isn't legal JS, so it must compile first.

**Q3. What gets emitted at runtime?**
Nothing type-related — types are erased. Exceptions: **`enum`** and **constructor parameter
properties** emit real JS.

**Q4. Biggest practical benefit of TS?**
Fearless **refactoring** — change a signature and every wrong call site errors immediately.
(Then tooling/IntelliSense, then bug-catching.)

**Q5. `any` vs `unknown`?**
`any` disables checking and is infectious. `unknown` accepts anything but forces narrowing
before use. Prefer `unknown` for untrusted data.

**Q6. What is `never`?**
A type with no possible value (bottom type). Used for exhaustiveness checks and impossible
branches.

**Q7. When annotate vs infer?**
Annotate function params + public return types; infer the rest (more specific, self-updating).

## Types & shapes

**Q8. Union vs intersection?**
Union `A | B` = one of (common members until narrowed). Intersection `A & B` = all of
(combined properties).

**Q9. Literal type, and why does `const` matter?**
A type allowing one exact value (`"north"`). `const` infers the literal; `let` widens to the
general type. `as const` forces literal + readonly.

**Q10. `type` vs `interface`?**
Default `type`. `interface` only for declaration merging (augmenting `window`) or large
extension hierarchies. Duplicate interfaces merge silently; duplicate types error.

**Q11. enum vs union of literals?**
Prefer unions: erased (no runtime), less code, direct values, pairs with switch/exhaustive.
Enums emit JS and blur TS/JS.

**Q12. Discriminated union — what and why?**
A union of object types sharing a literal tag; checking the tag narrows to the exact member.
Ideal for API state and results.

**Q13. `as const` vs `Object.freeze`?**
`as const` is compile-time, deeply readonly, narrows to literals. `Object.freeze` is runtime
and only top-level.

**Q14. `satisfies` vs `: T`?**
`: T` widens the value to T. `satisfies T` validates against T but keeps the value's own
narrower inferred type.

## Narrowing & safety

**Q15. What is narrowing?**
TS refining a broad type to a specific one via control-flow checks (`typeof`, `in`,
`instanceof`, truthiness, discriminant).

**Q16. Type predicate?**
A function returning `arg is T`; when true, TS narrows the argument. Powerful but TS trusts
your logic — test it.

**Q17. How to guarantee a switch is exhaustive?**
`default: value satisfies never` (or assign to a `never`). Unhandled members error.

**Q18. `as` and `!` risks?**
Both override TS with **no runtime check** — wrong assertions compile but crash. Prefer
narrowing.

**Q19. How to handle an external API response?**
Type as `unknown`, then validate at runtime (Zod) which checks data and infers the type.

## Generics & advanced

**Q20. What problem do generics solve?**
Reusable code that preserves specific type info instead of collapsing to `any`.

**Q21. Generic constraint?**
`<T extends Shape>` requires T to match Shape (so you can use Shape's members) while keeping
T's extra properties.

**Q22. Do you pass generic args explicitly?**
Rarely — TS infers them ~99% of the time. Pass explicitly only to restrict further.

**Q23. Get a function's return type as a type?**
`ReturnType<typeof fn>`; args via `Parameters<typeof fn>`; async via `Awaited<...>`.

**Q24. Why utility types over redefining?**
Single source of truth — derive variations (`Omit`, `Pick`, `Partial`) so they never drift.

**Q25. `keyof`, conditional, `infer`, mapped — one line each?**
`keyof T` = key union. Conditional `T extends U ? X : Y` = type-level if. `infer R` captures
a type inside a conditional. Mapped `{ [K in keyof T]: ... }` loops keys to build a type.

## Tooling

**Q26. Most important tsconfig flag?**
`strict: true`. Without it you're basically writing JS with a few annotations.

**Q27. `target` vs `lib`?**
`target` = JS version to compile down to. `lib` = available built-in API typings (add `DOM`
for browser).

**Q28. Local vs global TS install?**
Local — editor and build share the pinned version, avoiding "works in editor, fails in CI."

**Q29. Library has no types — what do you do?**
`npm i -D @types/<lib>`; if none, write a `.d.ts` with `declare module`.

**Q30. `@ts-ignore` vs `@ts-expect-error`?**
Both suppress the next line. `@ts-expect-error` errors if there's no error there — so it
self-flags for removal once fixed. Prefer it.

## Zod

**Q31. What does Zod solve that TS can't?**
Runtime validation at boundaries + type inference from one schema (`z.infer`).

**Q32. `parse` vs `safeParse`?**
`parse` throws on failure; `safeParse` returns `{ success, data | error }` (a discriminated
union) — use for forms/expected failures.

**Q33. `optional` vs `nullable` vs `nullish`?**
`undefined` / `null` / both.

**Q34. `z.enum` `as const` requirement?**
An external array must be `as const` so Zod treats its values as a fixed literal union.

**Q35. `discriminatedUnion` over `union`?**
When members share a literal tag — faster and clearer errors.

**Q36. Default behavior for unknown object keys?**
Stripped. `.passthrough()` keeps, `.strict()` throws.

**Q37. How to show Zod errors to users?**
Custom per-field messages or `fromZodError()` from `zod-validation-error`.

**Q38. `transform` vs `coerce`?**
`coerce` converts input before validation; `transform` changes output after.

## Curveballs

**Q39. Why might inferred return types be *better* than explicit ones?**
They're often more **specific** (e.g. `"a" | "b"` vs `string`) and can't drift from the
implementation. Explicit returns risk declaring a wider/wrong type than you actually return.

**Q40. Structural typing — what is it?**
TS types are compatible by **shape**, not name. If an object has all required properties, it
satisfies the type regardless of how it was declared (with excess-property checks on literals
as a guardrail).

**Q41. Why is `enum` controversial among TS maintainers?**
It emits runtime JS (unlike other types), complicates bundling (`const enum`), and unions do
the job better — the creator has said they might omit enums if redesigning today.
