# Type Narrowing

Narrowing is TypeScript's superpower: as you check what a value *is*, TS automatically
refines its type within that scope. Master this and most "how do I make the error go away"
problems disappear.

## Table of Contents

- [The idea](#idea)
- [`typeof` narrowing](#typeof)
- [Truthiness & guard clauses](#guards)
- [`in` operator narrowing](#in)
- [`instanceof` narrowing](#instanceof)
- [Discriminated union narrowing](#discriminated)
- [Exhaustiveness checks with `never`](#exhaustive)
- [Interview Questions](#interview-questions)

## The idea <a id="idea"></a>

A value typed `string | number` can't safely use string-only methods — until you prove
it's a string. After the check, TS *narrows* the type:

```ts
function f(id: string | number) {
  if (typeof id === "string") {
    id.toUpperCase(); // id: string here
  } else {
    id.toFixed(2);    // id: number here
  }
}
```

## `typeof` narrowing <a id="typeof"></a>

Works for primitives JS tracks at runtime: `"string"`, `"number"`, `"boolean"`,
`"bigint"`, `"symbol"`, `"undefined"`, `"function"`, `"object"`.

```ts
if (typeof x === "string") { /* x: string */ }
```

`typeof` can't distinguish your custom object types (they're erased) — only primitives.

## Truthiness & guard clauses <a id="guards"></a>

Checking for `null`/`undefined`/falsy values narrows too. **Guard clauses** (early return)
are the cleanest pattern — return on the bad case so the rest of the function has the
narrowed type:

```ts
function format(name: string | null): string {
  if (name == null) return "";   // == null catches null AND undefined
  return name.toUpperCase();      // name: string from here down
}
```

Throwing also narrows: after `if (!x) throw …`, TS knows `x` is truthy below.

## `in` operator narrowing <a id="in"></a>

`"prop" in obj` narrows to the union members that have that property:

```ts
type ImageAttachment = { width: number; height: number };
type DocAttachment = { pages: number };

function describe(a: ImageAttachment | DocAttachment) {
  if ("width" in a) return `${a.width}×${a.height}`; // a: ImageAttachment
  return `${a.pages} pages`;                          // a: DocAttachment
}
```

Good for **third-party types you can't change**. If you own the types, prefer a
discriminated union — `in` gets fragile when properties overlap or names change.

## `instanceof` narrowing <a id="instanceof"></a>

For class instances:

```ts
if (err instanceof TypeError) { /* err: TypeError */ }
```

## Discriminated union narrowing <a id="discriminated"></a>

The cleanest narrowing of all — a shared literal tag:

```ts
type Result =
  | { type: "witcher"; sign: string }
  | { type: "starwars"; force: number };

function act(r: Result) {
  if (r.type === "witcher") r.sign;   // narrowed to the witcher member
  else r.force;                        // narrowed to the starwars member
}
```

TS even narrows **multiple variables together** — checking `p1.type === "witcher" &&
p2.type === "witcher"` narrows both.

## Exhaustiveness checks with `never` <a id="exhaustive"></a>

Force TS to error when you forget a case. Two styles:

```ts
type Topic = "question" | "complaint" | "upgrade" | "refund";

function handle(t: Topic) {
  switch (t) {
    case "question": return 1;
    case "complaint": return 2;
    case "upgrade": return 3;
    case "refund": return 4;
    default:
      // If a new Topic is added and unhandled, `t` isn't `never` → error here.
      t satisfies never;
      throw new Error(`Unhandled topic: ${t}`);
  }
}
```

`t satisfies never` is the modern idiom (preferred over `const _: never = t`): it asserts
exhaustiveness **without** introducing an unused variable or changing types. Add a new union
member and every non-exhaustive switch lights up — invaluable for safe refactors.

## Interview Questions

### Q: What is type narrowing?

TS automatically refining a broad type to a more specific one based on control-flow checks
(`typeof`, `in`, `instanceof`, truthiness, discriminant tags). Inside the checked branch,
the value gets the narrowed type and its members become safely accessible.

### Q: How do you guarantee a `switch` handles every case of a union?

Add a `default` that asserts the value is `never` (e.g. `value satisfies never` or
`const _: never = value`). If a union member is unhandled, the value won't be `never` and
TS errors — so adding a new member surfaces every place you must update.

### Q: `in` narrowing vs discriminated unions?

`in` checks for a property's presence and is great for types you don't control. Discriminated
unions use an explicit shared literal tag and are unambiguous and refactor-safe — prefer
them when you own the types.

### Q: Why are guard clauses good for narrowing?

Returning (or throwing) early on the invalid case removes `null`/`undefined`/wrong-type
possibilities, so the rest of the function operates on the already-narrowed type — cleaner
than nesting the happy path inside an `if`.
