# Sets & Maps

JavaScript's `Set` and `Map` are fully typed in TypeScript via generics.

## Table of Contents

- [Set](#set)
- [Map](#map)
- [When to use Set/Map vs array/object](#when)
- [Interview Questions](#interview-questions)

## Set <a id="set"></a>

A `Set` is a collection of **unique** values — duplicates are dropped automatically.

```ts
const ids = new Set<string>();
ids.add("a");
ids.add("a"); // ignored — already present

// Inference: pass initial values and TS infers the element type
const nums = new Set([1, 2, 2, 3]); // Set<number>, contents {1,2,3}
```

Key gotchas:
- Use **`.size`**, not `.length`, to count elements.
- Dedupe an array in one line: `new Set(arr)` then spread or `.size`.

```ts
function uniqueCount(items: string[]): number {
  return new Set(items).size;
}
```

## Map <a id="map"></a>

A `Map` is like an object, but **keys can be any type** (not just strings) and it preserves
insertion order. Type both the key and value via two generic params:

```ts
const files = new Map<string, string>(); // key: string, value: string
files.set("a.ts", "content");

// Inference from initial entries
const scores = new Map([["alice", 1], ["bob", 2]]); // Map<string, number>

const file = files.get("a.ts"); // string | undefined — get() may miss
if (file) {
  const bytes = new TextEncoder().encode(file).length;
}
```

`.get()` always returns `V | undefined` because the key may not exist — handle that.

## When to use Set/Map vs array/object <a id="when"></a>

| Need | Use |
|---|---|
| Unique values, fast membership checks | **Set** |
| Key→value with **non-string keys** or order guarantees | **Map** |
| Ordered list, duplicates allowed | Array |
| String-keyed record, JSON-serializable | Object / `Record` |

Note: `Set`/`Map` are **not** JSON-serializable directly (`JSON.stringify(new Set())` →
`{}`). Convert to array/object first if you need to serialize.

## Interview Questions

### Q: `Set` vs array; `Map` vs object?

`Set` guarantees uniqueness and O(1) `has()`; arrays allow duplicates and ordered access.
`Map` allows any key type, preserves insertion order, and has a clean size/iteration API;
plain objects only take `string`/`symbol` keys and are better for JSON. Use Map for dynamic
key/value collections, objects for fixed-shape records.

### Q: How do you type and count a Set?

`new Set<T>()` (or infer from initial values). Count with **`.size`** — `Set` has no
`.length`. Dedupe an array via `new Set(arr).size`.

### Q: What does `map.get(key)` return in TypeScript?

`V | undefined`, because the key might not be present. You must narrow away `undefined`
before using the value.
