
# TypeScript & Zod — Field Guide

A beginner-to-advanced, interview-focused walkthrough of **TypeScript** and **Zod**,
built to cover the top 80% you'll actually use (and be asked about) without skipping
the advanced 20% that separates senior engineers.

> Mental model for the whole language: **TypeScript is a static linter for JavaScript.**
> It runs at *author time* to catch type bugs and power your editor, then compiles away
> to plain JavaScript. None of the types exist at runtime.

## How to read this

| If you have… | Read |
|---|---|
| **1 hour before an interview** | [Cheatsheet](08-interview-prep/02-cheatsheet.md) → [Question Bank](08-interview-prep/01-question-bank.md) → [Gotchas](08-interview-prep/03-gotchas-and-tradeoffs.md) |
| **A day** | Module 1 (foundations → tooling) in order, then skim Zod |
| **A weekend** | Everything + the [labs](09-labs/README.md) (run them, break them, explain them) |

## Curriculum

### Module 1 — TypeScript

1. **[Foundations](01-foundations/01-what-is-typescript.md)** — what TS is, types & inference, functions, unions & literals
2. **[Collections & Objects](02-collections-and-objects/01-arrays-and-tuples.md)** — arrays, tuples, object types, sets & maps
3. **[Types & Shapes](03-types-and-shapes/01-interfaces-vs-types.md)** — `type` vs `interface`, intersections, enums vs unions, classes
4. **[Narrowing & Safety](04-narrowing-and-safety/01-narrowing.md)** — narrowing, type guards/predicates, assertions, `unknown`
5. **[Generics & Utility Types](05-generics-and-utility-types/01-generics.md)** — generics, built-in utility types, conditional/mapped/`infer`
6. **[Tooling](06-tooling/01-tsconfig.md)** — `tsconfig`, declaration files, migration, bundlers

### Module 2 — Zod

7. **[Zod](07-zod/01-zod-fundamentals.md)** — schema validation that infers your types: fundamentals -> advanced + error handling

### Interview & Labs

8. **[Interview Prep](08-interview-prep/01-question-bank.md)** — question bank, cheatsheet, gotchas
9. **[Labs](09-labs/README.md)** — runnable `.ts` files you can compile and reason about

## The one paragraph that ties it together

You write TypeScript to get **editor tooling + refactor safety + bug-catching before runtime**.
The compiler erases all of it to JavaScript (with two exceptions: `enum` and constructor
parameter properties emit real code). At the boundaries of your program — API responses,
form input, `JSON.parse`, env vars — types lie to you, because they're compile-time only.
That's where **Zod** comes in: it validates unknown data at runtime *and* infers a static
type from the same schema, so your single source of truth is enforced on both sides.

## License

MIT

## Connect

GitHub: [@nckhemanth](https://github.com/nckhemanth)
