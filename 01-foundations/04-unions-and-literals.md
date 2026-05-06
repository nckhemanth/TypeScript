# Unions & Literal Types

Two of TypeScript's most-used features, and the foundation for narrowing and modeling
"one of N" states.

## Table of Contents

- [Union types](#unions)
- [Literal types](#literals)
- [Unions of literals = your enum replacement](#literal-unions)
- [Narrowing a union (intro)](#narrowing)
- [Open unions (`"a" | "b" | string`)](#open-unions)
- [Template literal types](#template-literals)
- [Interview Questions](#interview-questions)

## Union types <a id="unions"></a>

A union (`|`) is a value that can be **one of several types**:

```ts
type ID = string | number;

function getTicket(id: string | number) { /* ... */ }
```

Chain as many as you want: `string | number | boolean`. Read `|` as "or."

## Literal types <a id="literals"></a>

A literal type is a type whose value is a **specific literal**, not a whole category:

```ts
let dir: "north";   // can only ever be the string "north"
let one: 1;         // can only ever be the number 1
```

`const` declarations infer literal types automatically (they can't be reassigned), while
`let` widens to the general type:

```ts
const a = "north"; // type: "north"
let b = "north";   // type: string
```

## Unions of literals = your enum replacement <a id="literal-unions"></a>

The everyday pattern: a union of string literals to model a fixed set of choices. This is
the **preferred alternative to `enum`** (see the enums chapter for why).

```ts
type Direction = "north" | "south" | "east" | "west";
type Priority = "low" | "medium" | "high" | "critical";

function setPriority(p: Priority) { /* autocomplete shows the 4 options */ }
setPriority("low");      // ✓
setPriority("urgent");   // ✗ not assignable
```

These pair beautifully with `switch`, and TS **narrows** inside each case automatically.

## Narrowing a union (intro) <a id="narrowing"></a>

Once you check what a union value *is*, TS narrows it to that type within the block:

```ts
function process(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase(); // here id is string
  }
  return id + 1;             // here id is number (guard clause narrowed it)
}
```

`typeof` works because JS keeps runtime type info for primitives. Full narrowing toolkit
(`in`, `instanceof`, discriminated unions, type predicates) is its own chapter.

## Open unions (`"a" | "b" | string`) <a id="open-unions"></a>

A union of specific literals **plus** `string` collapses to `string` for type-checking —
but you still get **autocomplete** for the literals. Great for library APIs that suggest
common values while allowing any string:

```ts
type EmploymentStatus = "employed" | "unemployed" | "student" | (string & {});
// IDE suggests the three, but any string is accepted
```

(`string & {}` is the idiomatic trick to preserve the literal suggestions; plain `string`
works too.)

## Template literal types <a id="template-literals"></a>

A TS-only superpower: build string types by interpolating other types. TS expands every
combination of the unions involved.

```ts
type LogLevel = "info" | "warn" | "error";
type LogMessage = `${LogLevel}: ${string}`;
// "info: ..." | "warn: ..." | "error: ..."

type Class = "wizard" | "warrior" | "rogue";
type Race = "elf" | "human" | "dwarf";
type Hero = `${Race} ${Class}`; // 9 combinations: "elf wizard" | "elf warrior" | ...
```

⚠️ Combinatorial explosion is real. Cross-multiplying large unions (e.g. 9 × 8 × 9…)
generates millions of types and TS will refuse with "type is too complex." Keep template
unions small — a few options each. Mostly a **library-author** tool.

## Interview Questions

### Q: Union vs intersection?

A **union** (`A | B`) is "one of" — the value is A *or* B, so you can only safely use
members common to both until you narrow. An **intersection** (`A & B`) is "all of" —
the value has every property of A *and* B combined.

### Q: Why use a union of string literals instead of an enum?

Unions are erased at compile time (zero runtime cost), are less code, use the familiar
`type` keyword, and you use the literal values directly (`"low"`) instead of an
indirection (`Priority.Low`). Enums emit extra JS and blur the TS/JS boundary. Even the
creator of TS has said they might omit enums today.

### Q: What's a literal type and why does `const` matter?

A literal type permits exactly one value (`"north"`, `42`). `const` infers the literal
type because the binding can't change; `let` widens to the general type (`string`,
`number`) because it can be reassigned. Use `as const` to force literal/readonly inference
on objects and arrays.

### Q: When would you reach for template literal types?

Modeling structured strings (event names, CSS units, route patterns, `${level}: message`).
Powerful for library types and autocomplete; keep the constituent unions small to avoid
blowing up the type-checker.
