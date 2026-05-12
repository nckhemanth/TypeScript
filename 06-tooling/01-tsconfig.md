# `tsconfig.json`

The control panel for how TypeScript compiles and how strict it is. You configure it once
per project.

## Table of Contents

- [What it does](#what)
- [`target` and `lib`](#target-lib)
- [`strict` — the single most important flag](#strict)
- [Other flags worth knowing](#other)
- [A sane modern config](#sane)
- [Local vs global TypeScript](#local-global)
- [Interview Questions](#interview-questions)

## What it does <a id="what"></a>

`tsconfig.json` tells `tsc` how to compile: which JS version to target, what libraries are
available, how strict to be, where files live. Create one with `npx tsc --init`.

## `target` and `lib` <a id="target-lib"></a>

- **`target`** — which JavaScript version to compile **down to** (e.g. `ES2022`, `ESNext`).
  Lets you write modern syntax and emit older JS for compatibility.
- **`lib`** — which built-in APIs are available to your code. Add `"DOM"` for browser APIs
  (`document`, `window`); otherwise you get Node-only globals.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  }
}
```

## `strict` — the single most important flag <a id="strict"></a>

```json
{ "compilerOptions": { "strict": true } }
```

`strict: true` enables a bundle of checks (`noImplicitAny`, `strictNullChecks`, and more).
**Always set it on new projects.** Without it, you're basically writing JavaScript with a
few annotations — null/undefined slip through, untyped params become silent `any`. The only
time to leave it off: mid-migration of a huge legacy JS codebase where turning it on would
produce thousands of errors at once.

## Other flags worth knowing <a id="other"></a>

| Flag | Set to | Why |
|---|---|---|
| `skipLibCheck` | `true` | Skip type-checking `node_modules` `.d.ts` — much faster builds |
| `esModuleInterop` | `true` | Clean interop between CommonJS and ES module imports |
| `moduleDetection` | `"force"` | Treat every file as a module (modern default) |
| `verbatimModuleSyntax` | `true` | Forces `import type` for type-only imports (smaller output) |
| `noUncheckedIndexedAccess` | `true` | `arr[i]` is typed `T \| undefined` — catches out-of-bounds bugs (adds boilerplate) |

`noUncheckedIndexedAccess` is off by default but genuinely catches real bugs: without it,
`arr[999]` is typed `T` even when the element doesn't exist.

## A sane modern config <a id="sane"></a>

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleDetection": "force",
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true
  }
}
```

(`noEmit: true` when a bundler like Vite does the actual transpiling and TS is just the
type-checker.)

## Local vs global TypeScript <a id="local-global"></a>

Install TypeScript as a **project dev dependency**, not globally:

```bash
npm install -D typescript
```

Your editor and `tsc` then use the *same* version pinned in `package.json`. With a global
install, your editor might type-check with a different TS version than your build — leading
to "works in editor, fails in CI" (or vice versa). If types look wrong but should be fine,
**restart the TS server** in your editor (VS Code: `TypeScript: Restart TS Server`).

## Interview Questions

### Q: What's the most important `tsconfig` setting?

`strict: true`. It turns on the suite of safety checks (`noImplicitAny`, `strictNullChecks`,
…). Without it you lose most of TypeScript's value. Always enable it on new projects.

### Q: `target` vs `lib`?

`target` is the JavaScript version you compile **down to** (for runtime compatibility).
`lib` is the set of built-in API typings available while you write (e.g. add `DOM` for
browser globals). They're independent.

### Q: Why install TypeScript locally instead of globally?

So your editor and your build use the **same pinned version**. Version mismatches cause
errors that appear in one place but not the other. Local install (`-D typescript`) keeps
everyone on the project's version.

### Q: What does `noUncheckedIndexedAccess` do?

Makes indexed access (`arr[i]`, `record[key]`) return `T | undefined` instead of `T`,
forcing you to handle the missing-element case. It adds boilerplate but prevents a common
class of runtime "undefined is not a function" bugs.
