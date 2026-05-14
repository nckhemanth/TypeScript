# Objects & Collections

The object schema is Zod's workhorse — and it mirrors TypeScript's utility types. Plus
arrays, tuples, unions, records, maps, sets, and promises.

## Table of Contents

- [Object methods (`partial`, `pick`, `omit`, `extend`, `merge`)](#object)
- [Unknown keys: strip, passthrough, strict](#keys)
- [Arrays](#arrays)
- [Tuples](#tuples)
- [Unions & discriminated unions](#unions)
- [Records, Maps, Sets](#records)
- [Promises](#promises)
- [Interview Questions](#interview-questions)

## Object methods <a id="object"></a>

`z.object` schemas expose methods that parallel TS utility types:

```ts
const user = z.object({
  username: z.string(),
  age: z.number(),
  hobby: z.enum(["a", "b"]),
});

user.shape.age;          // grab one field's schema
user.partial();          // all fields optional (≈ Partial<T>)
user.deepPartial();      // optional recursively, through nested objects
user.pick({ username: true });   // keep listed keys (≈ Pick)
user.omit({ age: true });        // drop listed keys (≈ Omit)
user.extend({ name: z.string() }); // add fields
user.merge(otherSchema);           // combine two object schemas
```

`partial()` is ideal for multi-step forms; `pick`/`omit` keep a single source of truth, just
like the TS utilities.

## Unknown keys: strip, passthrough, strict <a id="keys"></a>

By default, Zod **strips** keys not in the schema from the output:

```ts
z.object({ username: z.string() }).parse({ username: "k", extra: 1 });
// → { username: "k" }  (extra removed — default behavior)

schema.passthrough(); // keep unknown keys in the output
schema.strict();      // throw if any unknown key is present
```

## Arrays <a id="arrays"></a>

```ts
z.array(z.string());          // string[]
z.string().array();           // equivalent
z.array(z.string()).nonempty(); // at least one element
z.array(z.number()).min(2).max(5).length(3); // size constraints
schema.element;               // the element schema
```

## Tuples <a id="tuples"></a>

Fixed-length, positional, can chain validators per slot and add a `rest`:

```ts
const coord = z.tuple([z.number(), z.number(), z.number().int().gt(4)]);
const variadic = z.tuple([z.string(), z.date()]).rest(z.number());
// [string, date, ...number[]]
```

## Unions & discriminated unions <a id="unions"></a>

```ts
z.union([z.string(), z.number()]); // string | number
z.string().or(z.number());          // same thing

// Discriminated union — faster, better errors; share a literal key:
const result = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("failed"), error: z.number() }),
]);
```

Use `discriminatedUnion` when every member shares an identical literal field — it's more
performant and gives clearer errors than a plain `union`.

## Records, Maps, Sets <a id="records"></a>

```ts
z.record(z.string());                 // { [key: string]: string }
z.record(z.string(), z.number());     // typed keys AND values
z.map(z.string(), z.object({ name: z.string() })); // Map<string, {name}>
z.set(z.number());                    // Set<number>, with .min()/.max()
```

Use `record` for plain objects with dynamic keys; `map`/`set` when the runtime value is an
actual `Map`/`Set`.

## Promises <a id="promises"></a>

```ts
const schema = z.promise(z.string()); // validates it's a Promise resolving to a string
schema.parse(Promise.resolve("ok"));
```

Two-step validation: first checks the value is a Promise, then attaches a `.then` that
validates the resolved value.

## Interview Questions

### Q: How do Zod object methods relate to TypeScript utility types?

They mirror them at the schema level: `.partial()`≈`Partial`, `.pick()`≈`Pick`,
`.omit()`≈`Omit`, `.extend()`/`.merge()`≈intersection. You transform the schema and the
inferred type follows, keeping one source of truth.

### Q: What happens to unknown keys by default, and how do you change it?

By default Zod **strips** them from the output. `.passthrough()` keeps them; `.strict()`
throws if any unknown key is present.

### Q: When use `discriminatedUnion` over `union`?

When all members share one identical literal property (a tag). It's more performant and
produces clearer validation errors than `z.union`, because Zod can jump straight to the
matching member by its discriminant.

### Q: `z.record` vs `z.map`?

`z.record` validates a plain **object** with dynamic keys (`{ [k]: v }`). `z.map` validates
an actual JavaScript **`Map`** instance with typed key/value. Match the schema to the runtime
data structure.
