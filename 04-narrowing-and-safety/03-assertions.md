# Type Assertions

Sometimes you know more than the compiler. Assertions let you override TS — which is exactly
why they're risky. Use them rarely and deliberately.

## Table of Contents

- [`as` — "trust me, it's this type"](#as)
- [Why `as` is dangerous](#danger)
- [Double assertion (`as unknown as T`)](#double)
- [Non-null assertion (`!`)](#non-null)
- [Prefer narrowing over assertions](#prefer)
- [Interview Questions](#interview-questions)

## `as` — "trust me, it's this type" <a id="as"></a>

`as` tells TS to treat a value as a given type, bypassing its inference:

```ts
let a: string | number = getValue();
(a as string).toLowerCase(); // you assert it's a string
```

(There's an alternative `<string>a` angle-bracket syntax — **avoid it**; it clashes with
generics and JSX, and nobody uses it.)

A common legitimate use: data from a third-party service you trust to be a known shape, where
runtime validation would be heavy:

```ts
function handlePayment(orderResponse: unknown) {
  const order = orderResponse as OrderData; // assert the known shape
  return order.total;
}
```

## Why `as` is dangerous <a id="danger"></a>

`as` does **no runtime check**. If you're wrong, TS stays silent and you get a runtime crash:

```ts
let a: string | number = 42;
(a as string).toLowerCase(); // compiles fine, throws at runtime
```

It's almost as unsafe as `any` — except instead of "anything," you're asserting one specific
(possibly wrong) type. Treat every `as` as a place you've turned off safety.

## Double assertion (`as unknown as T`) <a id="double"></a>

TS blocks assertions between unrelated types (e.g. `number` → `string`). You can force it by
laundering through `unknown`:

```ts
const id = (42 as unknown) as string; // TS allows it via the unknown hop
```

🚩 This is a strong code smell. You'll mostly see it when integrating libraries with broken
type definitions or during JS→TS migration. Avoid in normal code.

## Non-null assertion (`!`) <a id="non-null"></a>

`!` asserts a value is **not `null`/`undefined`**, removing those from its type:

```ts
const cleaned: string | null = clean(text);
cleaned!.trim(); // you assert cleaned isn't null
```

Same risk as `as` — if it *is* null at runtime, you crash with no compiler warning. Almost
always, a one-line null check is safer and barely more code:

```ts
if (cleaned == null) return;
cleaned.trim(); // narrowed, no assertion needed
```

## Prefer narrowing over assertions <a id="prefer"></a>

The safe alternative to `as`/`!` is real narrowing — TS verifies it, and the code behaves
correctly even when the unexpected type shows up:

```ts
// Instead of: (a as string).toLowerCase()
if (typeof a === "string") a.toLowerCase();
```

Rule of thumb: reach for an assertion only when you're 100% certain of the type *and*
narrowing would be genuinely cumbersome (some API/library boundaries). Otherwise, narrow.

## Interview Questions

### Q: What does `as` do, and what's the risk?

It asserts a value is a specific type, overriding TS's inference — with **no runtime
check**. If the assertion is wrong, the code compiles but crashes at runtime. It's nearly as
unsafe as `any`; prefer narrowing, which TS actually verifies.

### Q: What is the non-null assertion `!`?

It strips `null`/`undefined` from a value's type, asserting it's present. Risky for the same
reason as `as` — no runtime guarantee. A simple null check is safer and recommended.

### Q: Why is double assertion (`as unknown as T`) usually a bad idea?

It bypasses TS's guard against asserting between unrelated types, so it can assert a value
to a completely wrong type and cause runtime errors. It's a smell seen mostly in
JS→TS migration or working around bad library types — avoid otherwise.

### Q: Assertion vs narrowing — which should you prefer?

Narrowing. It's verified by the compiler and stays correct even when the data isn't what you
expected. Use assertions only when you're certain and narrowing is impractical (trusted API
boundaries).
