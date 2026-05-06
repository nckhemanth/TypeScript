# Arrays & Tuples

## Table of Contents

- [Arrays](#arrays)
- [Heterogeneous arrays](#hetero)
- [The evolving `any` (and `never`) pitfall](#evolving)
- [Tuples](#tuples)
- [Tuple labels, optionals, and rest](#tuple-extras)
- [Tuple vs object — when to use which](#tuple-vs-object)
- [Interview Questions](#interview-questions)

## Arrays <a id="arrays"></a>

Two equivalent syntaxes — `T[]` (common) and `Array<T>` (generic form):

```ts
const scores: number[] = [90, 80];
const names: Array<string> = ["a", "b"];
const matrix: number[][] = [[1], [2]];   // array of arrays
```

Combine with unions — wrap in parentheses so the `[]` applies to the whole union:

```ts
const mixed: (string | number)[] = ["a", 1];
```

## Heterogeneous arrays <a id="hetero"></a>

Arrays that hold more than one type — exactly the `(string | number)[]` form above. Useful
when modeling JS arrays that genuinely mix types.

```ts
const comments: (string | number)[] = ["nice", 42, "ok"];
const i = comments.findIndex((c) => c === 42); // -1 if not found
```

## The evolving `any` (and `never`) pitfall <a id="evolving"></a>

An array declared empty with no type starts as `any[]` and **evolves** as you push:

```ts
const data = [];        // any[]
data.push(1);           // now number[]
data.push("x");         // now (string | number)[]
```

But in some configs an empty array can infer `never[]` (e.g. via a `?? []` fallback),
which then rejects everything. **Best practice: always annotate the element type** when you
create an array you'll fill later:

```ts
const data: (string | number | boolean)[] = [];
```

## Tuples <a id="tuples"></a>

A tuple is a **fixed-length array where each position has a specific type**:

```ts
type NameAge = [string, number];
const p: NameAge = ["Kyle", 30];
```

Great for functions that return multiple ordered values (think `useState` returning
`[value, setValue]`):

```ts
function createTicket(prev: number, comment: string): [number, string, boolean] {
  return [prev + 1, comment, comment.toLowerCase().includes("critical")];
}
const [id, text, isCritical] = createTicket(1, "Critical bug"); // each correctly typed
```

⚠️ Tuples are still arrays at runtime, so `.push()` works and bypasses the length contract.
Mark them `readonly` to prevent mutation:

```ts
type Point = readonly [number, number];
```

Rebuilding a tuple by hand loses the tuple type — it widens to `(A|B|C)[]`. Re-assert with
`as const` to get the tuple back.

## Tuple labels, optionals, and rest <a id="tuple-extras"></a>

**Labels** are documentation-only (no runtime/compile effect) but improve hover hints:

```ts
type Ticket = [id: number, comment: string, label?: string];
```

**Optional** elements (`?`) must be last; **rest** elements collect the tail:

```ts
type HttpResponse = [status: number, data: string, error?: string];
type Command = [name: string, ...args: number[]]; // name + any number of numbers
```

## Tuple vs object — when to use which <a id="tuple-vs-object"></a>

| Tuple | Object |
|---|---|
| **Order matters** (coordinates, `[status, data]`) | Order doesn't matter |
| Caller wants to rename freely via destructuring | You want named, self-documenting access |
| Skipping a middle value is awkward (`[, , age]`) | Grab exactly the field you want (`{ age }`) |

Rough split: objects ~90% of the time; tuples when ordering is intrinsic (LLM token
sequences, coordinate pairs, hook-style returns).

## Interview Questions

### Q: Difference between an array and a tuple?

An array is variable-length with a single element type (`number[]`). A tuple is
fixed-length with a specific type per position (`[string, number]`). Tuples model ordered,
heterogeneous data and multi-value returns.

### Q: Why annotate an array you build up later?

An empty `[]` infers `any[]` (unsafe) or, in edge cases like `value ?? []`, `never[]`
(rejects everything). Annotating the element type up front (`const xs: number[] = []`)
avoids both.

### Q: How do you stop a tuple from being mutated?

Mark it `readonly` (`readonly [number, number]`) — since tuples are arrays at runtime,
`.push()` otherwise bypasses the fixed length. Use `as const` when constructing one to lock
both length and values.
