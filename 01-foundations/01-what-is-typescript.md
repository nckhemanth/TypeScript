# What Is TypeScript?

TypeScript is a **superset of JavaScript**: every valid JavaScript file is valid
TypeScript, and TS adds optional, static type syntax on top. You feed TS code to the
compiler (`tsc`), it checks types and **erases** them, emitting plain JavaScript that
runs anywhere JS runs.

## Table of Contents

- [Mental model](#mental-model)
- [Why it exists](#why)
- [Compilation is about correctness, not speed](#correctness)
- [The superset relationship](#superset)
- [Setup in 60 seconds](#setup)
- [Interview Questions](#interview-questions)

## Mental model

Think of TypeScript as **an advanced linter for JavaScript**. It runs while you write
code to (1) power editor tooling — autocomplete, go-to-definition, inline errors — and
(2) prove your types are consistent before you ship. At runtime, the browser/Node only
sees JavaScript; the types are gone.

```ts
let name: string = "Kyle";
name = 42; // ✗ compile error: Type 'number' is not assignable to type 'string'
```

That error appears in your editor *as you type* — you don't have to run the code and
wait for a user to hit the bug.

## Why it exists <a id="why"></a>

JavaScript is dynamic and loosely typed. A function that's "supposed to" return a number
might silently return a string, and you only find out from an angry user. TypeScript's
creators (Microsoft, many with C# backgrounds) wanted C#-style type safety that still
**compiles down to JavaScript**, the only language the browser natively runs.

The three concrete wins, in order of how much they matter day-to-day:

1. **Refactoring safety** (the underrated #1). Change a function's signature in one place
   and every wrong call site lights up red immediately — across hundreds of files. In
   JS, you'd only discover those breaks at runtime (if your tests are perfect, which they
   never are).
2. **Editor tooling / IntelliSense.** Autocomplete on every object, parameter, and import.
   You write less and guess less.
3. **Bug catching.** Type errors caught before runtime. (Most people think this is #1;
   it's actually the least valuable of the three.)

## Compilation is about correctness, not speed <a id="correctness"></a>

"Compiled" usually implies "fast." Not here. `tsc` compiles for **correctness** — it
verifies every type in your codebase and strips types out. The emitted JavaScript isn't
faster than hand-written JS; it's the same code minus the type annotations.

```ts
// TypeScript
function add(a: number, b: number): number {
  return a + b;
}
```
```js
// Emitted JavaScript — types simply removed
function add(a, b) {
  return a + b;
}
```

## The superset relationship <a id="superset"></a>

- **All JavaScript is valid TypeScript.** (TS without annotations *is* JS.)
- **Not all TypeScript is valid JavaScript.** TS adds syntax (`: string`, `interface`,
  `enum`) the browser can't run. Run TS directly and it fails — you must compile first.

Modern runtimes (Node 22+, Deno, Bun) can run TS directly by stripping types on the fly,
so the explicit compile step is increasingly optional during development.

## Setup in 60 seconds <a id="setup"></a>

```bash
# Install as a project dev dependency (preferred over global — see Tooling module)
npm install -D typescript
npx tsc --init       # creates tsconfig.json
npx tsc              # compile per tsconfig
npx tsc --watch      # recompile on save
```

For app projects, use a bundler (Vite) instead of calling `tsc` by hand — it handles
the compile + dev server + hot reload for you (covered in the Tooling module).

## Interview Questions

### Q: Is all TypeScript valid JavaScript?

**No.** All *JavaScript* is valid TypeScript (TS is a superset), but TypeScript adds
type syntax that isn't legal JavaScript, so TS must be compiled before it runs.

### Q: What does the TypeScript compiler actually do?

It **type-checks** your code and **erases** type annotations to produce plain JS. It's
about correctness, not runtime speed. The one surprise: `enum` and constructor parameter
properties emit *additional* JS code rather than just being erased.

### Q: Types are erased — so what protects you at runtime?

Nothing, by default. Types are a compile-time contract. At program boundaries (API
responses, `JSON.parse`, form input, env vars) you need **runtime validation** — that's
the job of a library like **Zod**, which validates *and* infers the static type from one
schema.

### Q: Why pick TypeScript over JavaScript?

Refactor safety, editor tooling, and earlier bug detection — with zero runtime cost since
types compile away. The biggest real-world win is fearless refactoring in large codebases.
