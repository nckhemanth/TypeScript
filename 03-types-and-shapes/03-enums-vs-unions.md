# Enums vs Union Types

Enums are one of the few TypeScript features the language's own creator regrets. This
chapter explains what they are — and why a **union of literals** is almost always better.

## Table of Contents

- [What enums are](#what)
- [The catch: enums emit JavaScript](#emit)
- [`const enum`](#const-enum)
- [Why prefer union types](#prefer-unions)
- [Migration: enum → union](#migration)
- [Interview Questions](#interview-questions)

## What enums are <a id="what"></a>

An enum maps names to values. Numeric enums auto-increment from 0; you can also use string
values.

```ts
enum Direction { North, East, South, West } // North=0, East=1, South=2, West=3
Direction.North;       // 0
Direction[2];          // "South" — numeric enums support reverse mapping

enum LogLevel { Error = "ERROR", Warn = "WARN" } // string enum (no reverse mapping)
```

## The catch: enums emit JavaScript <a id="emit"></a>

Almost everything in TS is erased at compile time. **Enums are the exception** — they
compile into a real JavaScript object (with extra code for numeric reverse-mapping). This:

- **Adds runtime code** to your bundle.
- **Blurs the TS/JS boundary** — you reference an enum (a "type") directly in runtime JS,
  unlike every other type construct. Confusing, especially for beginners.

## `const enum` <a id="const-enum"></a>

`const enum` inlines values at compile time (no runtime object, smaller output) but loses
reverse mapping and has its own caveats (breaks under isolated-module bundlers). The gains
are tiny — most teams just avoid enums entirely, so you'll rarely use `const enum`.

## Why prefer union types <a id="prefer-unions"></a>

```ts
// Enum
enum CardSuit { Hearts = "hearts", Diamonds = "diamonds", Clubs = "clubs", Spades = "spades" }

// Union of literals — does the same job
type CardSuit2 = "hearts" | "diamonds" | "clubs" | "spades";
```

Unions win on every practical axis:
- **Zero runtime cost** — fully erased.
- **Less code**, uses the familiar `type` keyword.
- **Use values directly** (`"hearts"`) instead of an indirection (`CardSuit.Hearts`).
- No weird number mappings, no duplicated label/value.
- Pairs perfectly with `switch` and exhaustiveness (`never`) checks.

Enums' supposed advantages (easier refactor, reverse lookup) are moot: editors rename
across a codebase with one keypress, and you rarely need reverse lookup when the label and
value are the same string.

## Migration: enum → union <a id="migration"></a>

```ts
// Before
enum ApiTier { Free = "free", Basic = "basic", Pro = "pro" }
callApi(ApiTier.Free);

// After
type ApiTier = "free" | "basic" | "pro";
callApi("free");
```

If you must derive a union from an existing array of values, use `as const` +
`typeof arr[number]` (see Advanced Types).

## Interview Questions

### Q: How are enums different from every other TypeScript type?

They **emit JavaScript** instead of being erased — a numeric enum compiles to a real object
with reverse-mapping code. Every other type construct (types, interfaces, generics)
disappears at compile time. This runtime footprint and the blurred TS/JS line are the main
arguments against enums.

### Q: Enum or union of string literals — what do you choose and why?

Union of literals, almost always: zero runtime cost, less code, direct value usage, no
duplicated label/value, great with `switch` + exhaustiveness checks. Reserve enums for
legacy code that already uses them.

### Q: What does `const enum` change?

It inlines the enum values at compile time so no runtime object is emitted (smaller
bundle), at the cost of reverse mapping and compatibility with some bundlers. The benefit is
marginal, so most teams skip enums altogether.
