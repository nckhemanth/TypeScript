# `type` vs `interface`

TypeScript gives you two ways to describe object shapes. They overlap ~95%. Here's the
decision rule and the real differences.

## Table of Contents

- [The bottom line](#bottom-line)
- [Syntax differences](#syntax)
- [Extending](#extending)
- [Declaration merging (the big difference)](#merging)
- [When to actually use `interface`](#use-interface)
- [Interview Questions](#interview-questions)

## The bottom line <a id="bottom-line"></a>

**Prefer `type` ~99% of the time.** Reasons:
- You already use `type` for unions, function types, tuples, mapped/conditional types — one
  consistent construct.
- **No silent declaration merging** (see below) — redeclaring a `type` is an error, which
  is what you want.

Use `interface` only for the two specific cases below. And **never mix randomly** — pick one
per codebase for consistency (they're interchangeable when extending/implementing).

## Syntax differences <a id="syntax"></a>

```ts
// type — works like a variable assignment
type Superhero = {
  name: string;
  power: number;
};

// interface — keyword, no equals sign
interface Superhero2 {
  name: string;
  power: number;
}
```

Both produce the same kind of object type. `type` can also alias *non-object* types
(unions, primitives, functions); `interface` only describes object/function shapes.

## Extending <a id="extending"></a>

```ts
// type: intersection
type Wizard = Character & { spellbook: string[] };

// interface: extends keyword (can extend multiple, comma-separated)
interface Wizard2 extends Character, Magical {
  spellbook: string[];
}
```

Both produce equivalent results, and you can **mix** them — an `interface` can extend a
`type` and vice versa. The TS team notes `interface extends` can be marginally faster to
type-check and slightly safer for large hierarchies, but it rarely matters outside big
codebases.

## Declaration merging (the big difference) <a id="merging"></a>

Declare the **same `interface` name twice** and TS silently **merges** them. Declare the
same `type` twice and it's an **error**.

```ts
interface Box { name: string; }
interface Box { size: number; }   // merged → { name: string; size: number }

type T = { a: number };
type T = { b: number };           // ✗ Error: Duplicate identifier 'T'
```

99% of the time, merging is *not* what you want — it usually means you forgot you already
defined that name. `type`'s error is safer. **This is the main reason to default to
`type`.**

## When to actually use `interface` <a id="use-interface"></a>

1. **You want declaration merging** — almost always to **augment a global type you don't
   own**, like adding a property to the browser's `window`:

   ```ts
   declare global {
     interface Window {
       google: GoogleApi; // merge your property into the built-in Window
     }
   }
   ```
   This is impossible with `type` because you can't reopen and add to `window`'s type
   otherwise. (Real-world example: "Sign in with Google" attaches to `window`.)

2. **Public API / extension-heavy hierarchies** where the TS-wiki-recommended `interface
   extends` gives slightly better tooling performance.

## Interview Questions

### Q: `type` vs `interface` — which do you default to and why?

Default to `type`. It's consistent (unions, functions, mapped types all use it) and
redeclaring a `type` errors, whereas redeclaring an `interface` **silently merges**, which
is usually an accidental bug. Reach for `interface` only for declaration merging (e.g.
augmenting `window`) or very large extension hierarchies.

### Q: What is declaration merging?

Defining the same `interface` name multiple times causes TS to combine them into one. It's
intentional for augmenting third-party/global types (like `Window`) but a footgun
otherwise — which is why `type` (no merging) is the safer default.

### Q: Can you mix `type` and `interface`?

Yes — an interface can `extends` a type and a class can `implements` either. They're
interchangeable for object shapes. For codebase consistency, still standardize on one.
