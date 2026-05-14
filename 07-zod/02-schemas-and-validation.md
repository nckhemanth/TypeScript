# Schemas & Validation

The building blocks: primitive schemas, the validation chain, optionality, defaults, and
enums.

## Table of Contents

- [Primitive schemas](#primitives)
- [Everything is required by default](#required)
- [Chained validations](#chained)
- [`optional`, `nullable`, `nullish`](#optionality)
- [`default`](#default)
- [`literal`](#literal)
- [`enum` and `nativeEnum`](#enum)
- [Interview Questions](#interview-questions)

## Primitive schemas <a id="primitives"></a>

```ts
z.string();    z.number();   z.bigint();   z.boolean();
z.date();      z.undefined(); z.null();    z.void();
z.any();       z.unknown();  z.never();
```

`z.any()`/`z.unknown()` accept anything; `z.never()` accepts nothing (use to forbid a key).
`z.void()` ≈ "nothing," typically a function return.

## Everything is required by default <a id="required"></a>

Every field in a Zod schema is **required** unless you say otherwise:

```ts
const schema = z.object({
  name: z.string(),
  age: z.number(),       // required — missing → validation fails
});
```

## Chained validations <a id="chained"></a>

Most schemas expose extra validators you chain on. This is validation **beyond** what TS
types can express (length, ranges, formats):

```ts
z.string().min(3).max(20);
z.string().email();          // valid email
z.string().url();            // valid URL
z.number().positive();       // > 0
z.number().int().gte(1);     // integer ≥ 1
z.date().min(new Date("2020-01-01"));
```

This is the real value over plain TS: `z.string().email()` enforces a rule the type
`string` never could.

## `optional`, `nullable`, `nullish` <a id="optionality"></a>

Three subtly different modifiers — a classic interview trap:

| Modifier | Accepts |
|---|---|
| `.optional()` | the value **or `undefined`** |
| `.nullable()` | the value **or `null`** |
| `.nullish()` | the value **or `null` or `undefined`** |

```ts
z.number().optional(); // number | undefined
z.number().nullable(); // number | null
z.number().nullish();  // number | null | undefined
```

## `default` <a id="default"></a>

Provide a fallback when the value is missing. Can be a value or a function (re-evaluated
each parse):

```ts
z.boolean().default(true);
z.number().default(() => Math.random()); // fresh value per parse
```

The default appears in `parse`'s **output** when the field is absent.

## `literal` <a id="literal"></a>

Require an exact value:

```ts
z.literal(true);     // must be exactly true
z.literal("admin");  // must be exactly "admin"
```

## `enum` and `nativeEnum` <a id="enum"></a>

`z.enum` validates one of a fixed list of **string literals** — Zod's recommended way (great
inference):

```ts
const hobby = z.enum(["programming", "weightlifting", "guitar"]);
type Hobby = z.infer<typeof hobby>; // "programming" | "weightlifting" | "guitar"
```

Defining the list as a separate array? Mark it `as const` so Zod knows it's a fixed,
readonly tuple:

```ts
const hobbies = ["programming", "weightlifting", "guitar"] as const;
const hobby = z.enum(hobbies);
```

`z.nativeEnum(SomeTsEnum)` validates against an existing TypeScript `enum`, but `z.enum` is
preferred for its cleaner inference.

## Interview Questions

### Q: `optional` vs `nullable` vs `nullish` in Zod?

`.optional()` allows `undefined`; `.nullable()` allows `null`; `.nullish()` allows both
`null` and `undefined`. Pick based on whether the absent value arrives as `undefined`
(missing key) or explicit `null` (e.g. from JSON/DB).

### Q: What does Zod give you over TypeScript's own types?

Runtime **value-level** validation TS can't express: `.min()`, `.max()`, `.email()`,
`.url()`, `.positive()`, `.int()`, date ranges, etc. — plus it runs at runtime to validate
real data, where TS types are already erased.

### Q: Why does `z.enum` need `as const` on an external array?

Without `as const`, the array is mutable (`string[]`) and Zod can't treat its contents as a
fixed literal union. `as const` makes it a readonly tuple of literals, so the enum's type is
the exact union of those strings.

### Q: Are Zod fields optional by default?

No — every field is **required** unless you chain `.optional()` / `.nullish()` / `.default()`.
