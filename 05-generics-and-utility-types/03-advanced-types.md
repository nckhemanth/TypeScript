# Advanced Types (Conditional, Mapped, `infer`, `keyof`)

This is **library-author territory** — you rarely write these in application code, but you
*read* them constantly (every utility type is built from them) and they come up in senior
interviews. Don't worry if it doesn't click on the first pass.

## Table of Contents

- [`keyof` and `typeof`](#keyof)
- [Indexed access types](#indexed)
- [Conditional types](#conditional)
- [The `infer` keyword](#infer)
- [Mapped types](#mapped)
- [Putting it together](#together)
- [Interview Questions](#interview-questions)

## `keyof` and `typeof` <a id="keyof"></a>

- **`keyof T`** → a union of T's keys.
- **`typeof value`** (in type position) → the *type* of a runtime value.

```ts
type Soldier = { name: string; age: number; branch: string };
type Keys = keyof Soldier; // "name" | "age" | "branch"

const config = { url: "/api", retries: 3 };
type Config = typeof config; // { url: string; retries: number }
```

Combine them to derive a union of an object's *values*, or of an array's elements:

```ts
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number]; // "red" | "green" | "blue"
```

## Indexed access types <a id="indexed"></a>

Look up a property's type with bracket syntax:

```ts
type Name = Soldier["name"];       // string
type ValueUnion = Soldier[keyof Soldier]; // string (union of all value types)
```

## Conditional types <a id="conditional"></a>

An `if/else` for types, written as a ternary with `extends`:

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hi">; // true
type B = IsString<42>;   // false
```

Read `T extends U` here as "does T **satisfy/match** U?" — not inheritance. Used to filter
unions (this is how `Extract`/`Exclude` work):

```ts
type ExtractMouse<T, U> = T extends U ? T : never; // never removes non-matches
```

## The `infer` keyword <a id="infer"></a>

`infer` captures a type *from within* another type during a conditional — "pull out whatever
is here and name it." This is how `ReturnType` is implemented:

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R = MyReturnType<() => string>; // string

// Infer from a template literal:
type KeyVal<T> = T extends `${infer K}:${infer V}` ? [K, V] : never;
type KV = KeyVal<"name:Kyle">; // ["name", "Kyle"]
```

## Mapped types <a id="mapped"></a>

Loop over the keys of a type to build a new one. `[K in keyof T]` is the loop:

```ts
type OptionalSoldier = { [K in keyof Soldier]?: Soldier[K] }; // ≈ Partial<Soldier>
type Nulled<T>        = { [K in keyof T]: null };             // all values → null
type Stringify<T>     = { [K in keyof T]: string };           // all values → string
```

This is literally how `Partial`, `Readonly`, `Record` are implemented. Combine with
conditionals to filter:

```ts
// Keep only string-valued keys, drop the rest
type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
```

Reading guide: `[K in keyof T]` = a loop; `… extends … ? … : …` = an if. Once you see
"loop + if," dense types become parseable.

## Putting it together <a id="together"></a>

The built-ins you use every day are just these primitives:

```ts
type Partial<T>  = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Record<K extends PropertyKey, V> = { [P in K]: V };
type ReturnType<T> = T extends (...a: any[]) => infer R ? R : never;
```

## Interview Questions

### Q: What does `keyof` do, and how do you get a union of an object's value types?

`keyof T` produces a union of T's keys. Index with that union — `T[keyof T]` — to get a
union of its value types. For arrays, `typeof arr[number]` gives the element union (often
with `as const`).

### Q: What is a conditional type?

A type-level ternary: `T extends U ? X : Y`. It picks a type based on whether `T` is
assignable to `U`. Combined with `never`, it filters unions — the mechanism behind `Extract`
and `Exclude`.

### Q: What does `infer` do?

Inside a conditional type, `infer R` captures a sub-type and binds it to `R` for use in the
true branch — e.g. extracting a function's return type (`(...a) => infer R`) or pulling
pieces out of a template literal type. It's how `ReturnType`, `Parameters`, `Awaited` are
built.

### Q: What's a mapped type?

`{ [K in keyof T]: ... }` iterates a type's keys to construct a new type, optionally adding
modifiers (`?`, `readonly`) or transforming each value. `Partial`, `Readonly`, and `Record`
are all mapped types.

### Q: Do you write these in application code?

Rarely — they're mostly for **library authors** writing reusable type utilities. App
developers mainly *consume* them (the built-in utility types). Knowing how they work helps
you read complex types and debug type errors.
