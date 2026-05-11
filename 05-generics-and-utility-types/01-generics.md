# Generics

Generics are the hardest TypeScript concept and one of the most powerful. They let type
information flow **through** functions, types, and classes — a placeholder type that gets
filled in when the code is used.

## Table of Contents

- [The mental model](#model)
- [Generic functions](#functions)
- [Inference (you rarely pass the type)](#inference)
- [Multiple generics](#multiple)
- [Generic constraints (`extends`)](#constraints)
- [Generic types, interfaces, and classes](#types-classes)
- [Interview Questions](#interview-questions)

## The mental model <a id="model"></a>

A generic is a **placeholder type** declared in angle brackets. It sits empty until a real
type is supplied (explicitly or by inference), and then that real type is used everywhere
the placeholder appears — keeping full type information instead of collapsing to `any`.

You already use generics: `Array<T>`, `Set<T>`, `Map<K, V>`, `Pick<T, K>`.

## Generic functions <a id="functions"></a>

Declare the type parameter after the function name, before the parameters:

```ts
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

getFirst([1, 2, 3]); // T = number → returns number | undefined
getFirst(["a", "b"]); // T = string → returns string | undefined
```

Name it `T` for trivial cases; use a descriptive name (`Element`, `Item`) when the code
gets complex — single letters get unreadable fast.

## Inference (you rarely pass the type) <a id="inference"></a>

You almost never write `getFirst<number>([1,2,3])`. TS infers `T` from the argument ~99% of
the time:

```ts
const x = getFirst([1, 2, 3]); // T inferred as number automatically
```

You only pass the type explicitly to *constrain* it further (see generic classes example).

## Multiple generics <a id="multiple"></a>

Use as many as you need (`Map<K, V>` uses two):

```ts
function pair<A, B>(a: A[], b: B[]): [A, B][] {
  const out: [A, B][] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    out.push([a[i], b[i]]);
  }
  return out;
}

pair([1, 2], ["a", "b"]); // [number, string][] — both inferred
```

## Generic constraints (`extends`) <a id="constraints"></a>

By default a generic can be **anything**. Constrain it with `extends` to require a minimum
shape — while still keeping the caller's full type:

```ts
function pluckEmail<T extends { email: string }>(items: T[]): string[] {
  return items.map((item) => item.email); // autocomplete on .email
}

pluckEmail([{ email: "a@x.com", name: "A" }]); // ✓ keeps the `name` info too
pluckEmail([{ id: 1 }]);                         // ✗ no `email` property
```

`T extends { email: string }` reads like `satisfies`: "T must at least have an email." Unlike
typing the param as `{ email: string }` directly, the generic **retains** the extra
properties (`name`) for the return/inference.

## Generic types, interfaces, and classes <a id="types-classes"></a>

Anything can be generic — put the parameter right after the name:

```ts
// Generic type
type JobQueue<Element> = {
  push(item: Element): void;
  next(): Element;
};

// Generic interface (same idea)
interface Store<T> {
  get(id: string): T;
  save(item: T): void;
  list(): T[];
}

// Generic class
class FeatureFlags<T extends string> {
  #flags = new Set<T>();
  enable(flag: T) { this.#flags.add(flag); }
  isEnabled(flag: T) { return this.#flags.has(flag); }
}

// Passing the type narrows what's allowed:
type BG3Flag = "fog" | "dice" | "karmic";
const flags = new FeatureFlags<BG3Flag>(); // only those three strings allowed
```

Generics flowing through generics is where the magic compounds: a generic function that
calls a generic transform infers types end-to-end, so a value typed once stays correctly
typed through every step.

## Interview Questions

### Q: What problem do generics solve?

They let you write reusable functions/types/classes that work over many types **while
preserving** the specific type information (instead of falling back to `any`). The caller's
type flows through and is retained in returns and downstream usage.

### Q: Do you usually pass generic type arguments explicitly?

No — TS infers them from the arguments ~99% of the time. You only pass them explicitly to
*restrict* the type further (e.g. `new FeatureFlags<BG3Flag>()`), not for normal calls.

### Q: What's a generic constraint?

`<T extends Shape>` requires `T` to be assignable to `Shape`, so you can safely access
`Shape`'s members inside — while still retaining `T`'s extra properties for inference and
returns. It's like `satisfies` for type parameters.

### Q: Constraining with `extends` vs just typing the parameter as the shape — why generics?

Typing the param as `{ email: string }` discards everything else about the argument.
`<T extends { email: string }>` keeps the caller's full type, so returns and further usage
retain properties like `name`. Generics preserve information; plain annotations erase it.
