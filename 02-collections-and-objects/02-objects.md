# Object Types

Object literal types are TypeScript's most powerful feature for inference and safety —
you describe the shape, and the editor guides you through it everywhere.

## Table of Contents

- [Defining object types](#defining)
- [Optional & readonly properties](#optional-readonly)
- [Excess property checks](#excess)
- [Index signatures & `Record`](#index)
- [`PropertyKey` and required + dynamic keys](#propertykey)
- [Discriminated unions](#discriminated)
- [`as const`](#as-const)
- [`satisfies`](#satisfies)
- [Interview Questions](#interview-questions)

## Defining object types <a id="defining"></a>

Same shape as an object literal, but each property maps to a **type** instead of a value:

```ts
type Mail = {
  from: string;
  to: string;
  subject: string;
  body: string;
  urgent: boolean;
};
```

Now anywhere you use a `Mail`, the editor autocompletes its exact properties and flags
typos. This is the backbone of safe refactoring.

## Optional & readonly properties <a id="optional-readonly"></a>

```ts
type Hero = {
  name: string;
  readonly id: number;   // can't reassign after creation
  cape?: boolean;        // optional → boolean | undefined
};
```

`readonly` is compile-time only — TS errors if you reassign, but nothing stops it at
runtime.

## Excess property checks <a id="excess"></a>

A subtle, helpful behavior. Passing a **variable** that has *extra* properties is fine
(structural typing — it meets the minimum). But passing an **object literal** with extra
properties errors, to catch typos:

```ts
type Ship = { name: string; speed: number };

const falcon = { name: "Falcon", speed: 9, weapons: 2 };
takeShip(falcon);                              // ✓ extra prop ok via a variable
takeShip({ name: "X", speed: 9, weapons: 2 }); // ✗ excess property 'weapons' on a literal
takeShip({ name: "X", sped: 9 });              // ✗ catches the 'sped' typo
```

The literal check assumes a hard-coded object means you intended exactly these props, so a
stray one is probably a mistake.

## Index signatures & `Record` <a id="index"></a>

When keys are **dynamic** (not known ahead of time) but follow a key/value type:

```ts
type MailPrefs = { [key: string]: boolean };       // index signature
type MailPrefs2 = Record<string, boolean>;         // identical, cleaner
```

The `[key: string]` syntax mirrors JS bracket access (`obj[key]`). `Record<K, V>` is the
preferred form. You can mix required keys with a dynamic index signature, but use it
sparingly — usually you want *fully fixed* or *fully dynamic*, not a hybrid:

```ts
type Form = {
  email: string;             // required
  password: string;          // required
  [field: string]: string;   // plus arbitrary extra string fields
};
```

## `PropertyKey` and required + dynamic keys <a id="propertykey"></a>

`PropertyKey` is the built-in type for anything usable as an object key: `string | number
| symbol`. Use it instead of writing the union yourself:

```ts
type AnyKeyed = { [k: PropertyKey]: unknown };
```

## Discriminated unions <a id="discriminated"></a>

**The pattern you'll use constantly.** A union of object types that share one literal
"tag" property; checking that tag narrows to the exact member. Perfect for state machines
and API results.

```ts
type ApiState =
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: number };

function render(s: ApiState) {
  switch (s.status) {
    case "loading": return "…";
    case "success": return s.data;   // TS knows `data` exists here
    case "error":   return s.error;  // TS knows `error` exists here
  }
}
```

Prefer discriminated unions over `in`-checks when you control the types — the explicit tag
is unambiguous and survives refactors. (Zod's `safeParse` returns exactly this shape:
`{ success: true; data } | { success: false; error }`.)

## `as const` <a id="as-const"></a>

`as const` freezes a value into its **narrowest, deeply-readonly literal type**:

```ts
const colors = ["red", "green", "blue"] as const;
// type: readonly ["red", "green", "blue"] — not string[]

const config = {
  url: "/api",
  features: ["a", "b"],
} as const; // every nested property is readonly literal, recursively
```

Unlike `Object.freeze` (top-level only, runtime cost), `as const` is compile-time and
**deeply** immutable. Use it to derive literal unions from data (`typeof colors[number]`)
and to lock config objects.

## `satisfies` <a id="satisfies"></a>

`satisfies` checks that a value **conforms to** a type **without widening** the value's own
inferred type. You keep the precise literal/extra info *and* get validation.

```ts
type Config = { name: string };

const a = { name: "Kyle", theme: "dark" } satisfies Config;
// a.name is string; a.theme is still known; missing `name` would error
```

Contrast: annotating `: Config` would hide `theme` and widen literals. `satisfies` = "prove
it matches, but don't change what it is."

## Interview Questions

### Q: What's a discriminated (tagged) union and why use it?

A union of object types sharing a literal tag property (e.g. `status`/`kind`). Checking the
tag narrows to the exact member, giving safe access to that member's fields. Ideal for API
results and state machines; safer than `in`-checks when you own the types.

### Q: `as const` vs `Object.freeze`?

`as const` is compile-time, deeply readonly, and produces narrow literal types — zero
runtime cost. `Object.freeze` is runtime, only freezes the top level, and doesn't narrow
types. With TS you usually prefer `as const`.

### Q: `satisfies` vs a type annotation (`: T`)?

`: T` widens the variable to `T`, discarding extra/literal info. `satisfies T` validates
the value against `T` but preserves its own (narrower) inferred type — so you keep
literal precision and extra keys while still being checked.

### Q: Why does passing an object literal with an extra property error, but a variable doesn't?

**Excess property checks.** A hard-coded literal is assumed to be exactly what you meant, so
an unexpected key is likely a typo and TS flags it. A pre-existing variable only needs to
meet the minimum structural shape (structural typing), so extra props are allowed.

### Q: How do you type an object with dynamic keys?

An index signature `{ [k: string]: V }` or, preferably, `Record<string, V>`. For keys you
want to allow `string | number | symbol`, use `Record<PropertyKey, V>`.
