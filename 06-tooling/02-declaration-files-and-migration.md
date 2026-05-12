# Declaration Files, Migration & Bundlers

The practical edges of real-world TypeScript: typing JS libraries, augmenting globals,
escape hatches, and the build setup you'll actually use.

## Table of Contents

- [Declaration files (`.d.ts`)](#dts)
- [Augmenting global types (`window`)](#augment)
- [Typing untyped libraries (`@types`, `declare module`)](#libs)
- [Escape hatches: `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`](#ignore)
- [Bundlers (Vite)](#vite)
- [Interview Questions](#interview-questions)

## Declaration files (`.d.ts`) <a id="dts"></a>

A `.d.ts` file contains **types only** — no runtime code. It describes the shape of
JavaScript so TypeScript can type-check code that uses it. They're globally visible to your
project.

```ts
// chats.d.ts
export type Chat = { time: string; message: string };
export function log(chats: Chat[]): void;
export const chats: Chat[];
```

## Augmenting global types (`window`) <a id="augment"></a>

Libraries often attach properties to the browser's `window`. TS doesn't know about them, so
you **merge** into the built-in `Window` interface (this is the one place interface
declaration merging shines):

```ts
// global.d.ts
declare global {
  interface Window {
    supportAI: { version: string; enableAutoReply: () => void };
  }
}
export {}; // makes the file a module so the global augmentation is picked up
```

Now `window.supportAI.enableAutoReply()` is fully typed. The `export {}` line is a common
fix when augmentation "isn't taking."

## Typing untyped libraries <a id="libs"></a>

Two scenarios:

1. **Community types exist** — install them from DefinitelyTyped:
   ```bash
   npm install -D @types/<library-name>
   ```
   Most popular libraries either ship their own types or have an `@types/` package. Without
   types, everything from the library is `any`.

2. **No types exist** — write your own with `declare module`:
   ```ts
   // my-lib.d.ts
   declare module "pregnant-goku" {
     export function doThing(x: number): string;
     export const version: string;
   }
   ```
   You only need `declare module "<name>"` for **third-party npm packages**. For your own
   local JS files, export the types directly from a `.d.ts` without the module wrapper.

## Escape hatches <a id="ignore"></a>

When converting JS→TS, some lines fight you. Three tools:

| Directive | Scope | Use |
|---|---|---|
| `// @ts-ignore` | next line | Silence the error, no questions asked |
| `// @ts-expect-error` | next line | Silence **and** error if there's *no* error there |
| `// @ts-nocheck` | whole file | Turn off checking for the file |

**Prefer `@ts-expect-error`** over `@ts-ignore`: when the underlying issue is fixed (e.g. a
library ships correct types), `@ts-expect-error` starts erroring because the expected error
is gone — reminding you to delete it. `@ts-ignore` silently lingers forever.

## Bundlers (Vite) <a id="vite"></a>

In real projects you don't call `tsc` by hand — a bundler does the compile + dev server +
hot reload. **Vite** is the standard:

```bash
npm create vite@latest      # choose "Vanilla" + "TypeScript"
npm install
npm run dev                 # instant dev server with hot module reload
```

Vite transpiles TS on the fly (no manual `tsc`), updates the browser on save, and bundles
for production. Its `build` script typically runs `tsc` for type-checking + Vite for
bundling. For any React/Vue/vanilla TS app, Vite is the default choice — it removes nearly
all the manual `tsconfig`/compile friction.

## Interview Questions

### Q: What's a `.d.ts` file?

A declaration file containing only type information (no runtime code) that describes the
shape of JavaScript to TypeScript. Used to type untyped libraries and to augment globals.

### Q: A library has no TypeScript types — what do you do?

First try `npm i -D @types/<lib>` (DefinitelyTyped). If none exist, write a `.d.ts` with
`declare module "<lib>"` exporting the functions/values you use. Otherwise the library is
typed as `any`.

### Q: How do you add a property to `window` in TypeScript?

Augment the global `Window` interface via declaration merging in a `.d.ts`:
`declare global { interface Window { myThing: ... } }` plus `export {}`. This is the
canonical use of interface merging.

### Q: `@ts-ignore` vs `@ts-expect-error`?

Both suppress the error on the next line. `@ts-expect-error` additionally errors if there's
*no* error there — so when the root cause is fixed, it flags itself for removal. Prefer it;
`@ts-ignore` silently rots.

### Q: Why use a bundler like Vite instead of running `tsc`?

It handles transpilation, a fast dev server, hot reload, and production bundling
automatically — no manual compile step or hand-tuned config. `tsc` is then used mainly for
type-checking, while Vite does the actual build.
