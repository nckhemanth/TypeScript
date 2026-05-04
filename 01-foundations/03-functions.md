# Functions

Functions are where TypeScript earns its keep: typed parameters and return values make
every call site safe and self-documenting.

## Table of Contents

- [Typing parameters and returns](#params)
- [Inferred vs explicit return types](#returns)
- [`void` — functions that return nothing](#void)
- [Optional and default parameters](#optional)
- [Rest parameters](#rest)
- [Function types & type aliases](#function-types)
- [Function overloads](#overloads)
- [Interview Questions](#interview-questions)

## Typing parameters and returns <a id="params"></a>

Parameters **must** be annotated — TS can't infer what a caller will pass. The return type
can be annotated after the parameter list, but is usually inferred.

```ts
function priceAfterDiscount(price: number, discount: number): number {
  return price * (1 - discount);
}
```

If you remove the param types, those params become implicitly `any` (an error under
`strict`/`noImplicitAny`).

## Inferred vs explicit return types <a id="returns"></a>

This is a real debate. The pragmatic answer:

| Use **inferred** returns (default, ~99%) | Use **explicit** returns |
|---|---|
| Internal/app code | Public library API you export |
| Less typing, always accurate | Complex function with many return points |
| Stays correct as you edit | You want TS to *enforce* a contract |

```ts
// Inferred: return type is exactly "hello admin" | "hello user" — more specific!
function greet(isAdmin: boolean) {
  return isAdmin ? "hello admin" : "hello user";
}
```

If you'd annotated `: string`, you'd **widen** the type and lose that precision. The one
risk inferred-returns avoids: annotating `: string | null` when you never actually return
`null` — your declared type would diverge from reality. Let inference keep them in sync.

**Heuristic:** code only your codebase calls → infer. Code outside consumers depend on
(a library) → annotate, so you never change the contract by accident.

## `void` — functions that return nothing <a id="void"></a>

`void` means "this function returns nothing meaningful." It's distinct from `undefined`:
it signals intent.

```ts
function log(msg: string): void {
  console.log(msg);     // no return
}
```

You rarely write `void` explicitly — it's inferred. You mostly *see* it when typing
callback parameters (e.g. `onClick: () => void`).

## Optional and default parameters <a id="optional"></a>

A `?` makes a parameter optional; its type becomes `T | undefined`. **Optional params must
come after required ones.**

```ts
function greet(name: string, title?: string) {
  // title: string | undefined — you must handle the undefined case
  return title ? `${title} ${name}` : name;
}
```

A **default value** also makes a parameter optional *and* infers its type — no `?` and no
annotation needed:

```ts
function estimate(promptLength = 100, model = "text") {
  // promptLength: number, model: string — both inferred from defaults
}
```

`x == null` checks both `null` and `undefined` in one comparison — handy for default-ish
guards.

## Rest parameters <a id="rest"></a>

A JS feature TS types as an array — collect any number of trailing args:

```ts
function gatherParty(name: string, ...adventurers: string[]) {
  return `${name}: ${adventurers.join(", ")}`;
}
gatherParty("Alpha", "a", "b", "c");
```

The rest parameter is always an array and must be last.

## Function types & type aliases <a id="function-types"></a>

To type "a variable that holds a function," use arrow-function syntax: named params with
types, an arrow, then the return type.

```ts
type Sum = (a: number, b: number) => number;

const add: Sum = (a, b) => a + b;   // params inferred from Sum
```

Both the parameter **names** and **types** are required in a function type. Aliasing keeps
complex signatures readable and reusable.

## Function overloads <a id="overloads"></a>

Define multiple call signatures for one function — useful when valid argument combinations
aren't expressible as a single signature.

```ts
// Overload signatures
function format(employee: string): string;
function format(employee: string, isNew: boolean, onboardedAt: number): string;
// Implementation signature (not directly callable)
function format(employee: string, isNew?: boolean, onboardedAt?: number): string {
  return isNew ? `${employee} (onboarded ${onboardedAt})` : employee;
}
```

Now you can call it with 1 arg or all 3, but **not** the in-between combination.

⚠️ Overloads are fragile: TS doesn't cross-check that each overload's return matches the
implementation. Use sparingly — 95%+ of the time a union or generic is cleaner.

## Interview Questions

### Q: Should you annotate return types?

For internal code, prefer **inferred** returns — less code, always accurate, and often more
*specific* than what you'd write. For **public library APIs**, annotate explicitly so you
never change the contract unintentionally and so consumers get a stable signature.

### Q: Optional parameter vs default parameter?

`param?: T` makes it optional with type `T | undefined` (you must handle undefined). A
default `param = value` makes it optional *and* infers the type from the default *and*
substitutes the value when omitted. Both must follow required params.

### Q: How do you type a callback that returns nothing?

`() => void`. `void` signals the function isn't expected to return a usable value
(distinct from explicitly returning `undefined`).

### Q: When are function overloads worth it?

Rarely. When the legal combinations of arguments can't be captured by one signature and
you want to forbid invalid combos. They add complexity and TS won't verify your
implementation matches the overloads, so prefer unions/generics when possible.
