# Utility Types

Built-in generic types that transform other types. They exist to enforce a **single source
of truth**: define a type once, then *derive* every variation instead of copy-pasting.

## Table of Contents

- [Single source of truth](#sssot)
- [`Partial` / `Required`](#partial-required)
- [`Readonly`](#readonly)
- [`Record`](#record)
- [`Pick` / `Omit`](#pick-omit)
- [`ReturnType` / `Parameters` / `Awaited`](#fn-utils)
- [`NonNullable`, `Exclude`, `Extract`](#set-utils)
- [Interview Questions](#interview-questions)

## Single source of truth <a id="sssot"></a>

The anti-pattern utility types fix: redefining nearly-identical types by hand.

```ts
type User = { id: string; name: string; email: string };
// ❌ duplicate definition that drifts out of sync:
type UserWithoutId = { name: string; email: string };
```

Change `User` and you must update every copy. Instead, **derive**:

```ts
type UserWithoutId = Omit<User, "id">; // stays in sync with User automatically
```

Almost every utility below has an opposite, because TS likes symmetry.

## `Partial` / `Required` <a id="partial-required"></a>

`Partial<T>` makes all top-level properties optional; `Required<T>` makes them required.

```ts
function updateUser(patch: Partial<User>) { /* any subset of User */ }

type Contact = { email?: string; phone?: string };
type FullContact = Required<Contact>; // email & phone now required
```

Both operate on the **top level only** (not nested). `Partial` is perfect for PATCH
endpoints and multi-step forms. Note `Required` gives real type safety, unlike slapping `!`
on each access — it forces callers to actually pass the values.

## `Readonly` <a id="readonly"></a>

Marks every top-level property `readonly`:

```ts
function loadConfig(c: Config): Readonly<Config> { return c; } // callers can't reassign props
```

## `Record` <a id="record"></a>

`Record<Keys, Value>` builds an object type from a key type and a value type. Great with
unions for **exhaustive** maps:

```ts
type Role = "tank" | "healer" | "dps";
const capacity: Record<Role, number> = { tank: 1, healer: 1, dps: 3 };
// Omit any role → error. Forces you to cover every union member.
```

## `Pick` / `Omit` <a id="pick-omit"></a>

Opposites. `Pick<T, Keys>` keeps only the listed keys; `Omit<T, Keys>` removes them.

```ts
type ProductSummary = Pick<Product, "id" | "name" | "price">;
type SafeUser = Omit<DatabaseUser, "passwordHash" | "updatedAt">;
```

`Pick` is one of the most-used utilities — narrow a big type down to exactly what a function
or component needs, keeping the original as the source of truth.

## `ReturnType` / `Parameters` / `Awaited` <a id="fn-utils"></a>

Derive types *from functions* — handy so you don't redeclare them:

```ts
function makeUser(name: string, age: number) { return { name, age, id: "x" }; }

type User = ReturnType<typeof makeUser>;       // { name: string; age: number; id: string }
type Args = Parameters<typeof makeUser>;       // [name: string, age: number]
type FirstArg = Parameters<typeof makeUser>[0]; // string

type Data = Awaited<ReturnType<typeof fetchUser>>; // unwraps a Promise's resolved type
```

`typeof someFunction` gets the function's type; the utility extracts from it. `Awaited<T>`
unwraps `Promise<T>` (even nested).

## `NonNullable`, `Exclude`, `Extract` <a id="set-utils"></a>

Union manipulators:

```ts
type T = NonNullable<string | null | undefined>; // string
type U = Exclude<"a" | "b" | "c", "a">;          // "b" | "c"  (remove from union)
type V = Extract<"a" | 1 | "b", string>;         // "a" | "b"  (keep matching)
```

## Interview Questions

### Q: Why use utility types instead of redefining types?

To keep a **single source of truth**. Deriving (`Omit`, `Pick`, `Partial`) means changing
the base type automatically updates every variation — no drift, easy refactors. Copy-pasting
shapes is error-prone and goes stale.

### Q: `Pick` vs `Omit`?

Opposites. `Pick<T, K>` keeps only keys `K`; `Omit<T, K>` keeps everything except `K`. Use
`Pick` to expose a minimal subset, `Omit` to strip sensitive/irrelevant fields.

### Q: How do you get a function's return type as a type?

`ReturnType<typeof fn>`. For arguments, `Parameters<typeof fn>` (a tuple). For an async
function's resolved value, `Awaited<ReturnType<typeof fn>>`.

### Q: `Partial<T>` and `Required<T>` — and a caveat?

`Partial` makes all properties optional; `Required` makes them all required. Both apply only
at the **top level** (not nested objects — use `DeepPartial`-style helpers for deep). Prefer
`Required<T>` over per-field `!` because it enforces the values are actually provided.

### Q: When is `Record` especially useful?

When you need an object keyed by every member of a union and want TS to enforce
completeness, e.g. `Record<Role, number>` errors if you forget a role — exhaustiveness for
maps.
