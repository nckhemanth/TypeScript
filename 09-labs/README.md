# Labs

Small, runnable TypeScript files to *prove* you understand the concepts — not just read
them. Each lab is heavily commented: read the comment, predict the type/output, then verify.

## Setup

```bash
cd TypeScript
npm install
npm run typecheck          # type-check everything (the real test)
npm run lab:1              # run a file
```

> The point of most labs is the **type-checker output**, not console logs. Hover the
> annotated lines in your editor, and try breaking them — change a type and watch where the
> red squiggles appear. That "what lights up when I change X" instinct is the whole game.

## The labs

| File | Teaches |
|---|---|
| [`01-narrowing-and-guards.ts`](01-narrowing-and-guards.ts) | unions, `typeof`/`in`/discriminated narrowing, exhaustiveness with `never`, type predicates |
| [`02-generics-and-utility-types.ts`](02-generics-and-utility-types.ts) | generic functions, constraints, `Pick`/`Omit`/`ReturnType`, a tiny mapped type |
| [`03-zod-validation.ts`](03-zod-validation.ts) | schema → `z.infer`, `safeParse`, refine, discriminated union, env-style validation |

## Extra — 20 real-world mini use cases

See [`extra/README.md`](extra/README.md). Each file follows: Problem → Bad → Better → When / When NOT → Interview line.

Lab 3 uses Zod; `npm install` installs it with the other lab dependencies.

## How to use these in an interview-prep loop

1. **Predict** — before running, write down the inferred type / output.
2. **Verify** — run `tsc --noEmit` and `tsx`.
3. **Break it** — introduce a bug (wrong type, missing case) and confirm TS catches it.
4. **Explain** — say out loud *why* it failed. If you can teach it, you know it.
