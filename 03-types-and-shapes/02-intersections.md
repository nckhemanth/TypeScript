# Intersections

Where unions say "**one of**," intersections say "**all of**." You combine multiple types
into one that has everything.

## Table of Contents

- [The `&` operator](#operator)
- [Union vs intersection](#vs)
- [Conflicting properties produce `never`](#never)
- [Interview Questions](#interview-questions)

## The `&` operator <a id="operator"></a>

```ts
type IndividualContributor = { id: number; name: string; tasks: string[] };
type Manager = { directReports: string[] };

type GoodManager = IndividualContributor & Manager;
// { id; name; tasks; directReports } — all properties combined
```

Read `&` as "and." A `GoodManager` must satisfy **every** member type. This is the
`type`-keyword equivalent of `interface extends`, and you'll use it constantly to compose
types from smaller building blocks:

```ts
type TextBot = SupportBot & {
  messageLog: string[];
  sendMessage: (msg: string) => string;
};
```

## Union vs intersection <a id="vs"></a>

| | Union `A \| B` | Intersection `A & B` |
|---|---|---|
| Meaning | one of | all of |
| Value has | properties **common** to A and B (until narrowed) | properties of A **and** B |
| Use for | "this can be X or Y" (states, ids) | "combine these shapes into one" |

```ts
type Human = { name: string; age: number };
type Elf = { name: string; ears: string };

type Both = Human & Elf;  // must have name, age, AND ears
type Either = Human | Elf; // name guaranteed; age/ears only after narrowing
```

## Conflicting properties produce `never` <a id="never"></a>

If two intersected types declare the **same property with incompatible types**, that
property — and often the whole type — collapses to `never` (an impossible value):

```ts
type Saiyan = { name: "Goku" | "Vegeta" };
type Human  = { name: "Bob" | "Alice" };

type SaiyanHuman = Saiyan & Human;
// name: "Goku"|"Vegeta" & "Bob"|"Alice" → no overlap → never (whole type unusable)
```

When you hit this, you usually didn't want to *merge* the types — you wanted to keep them
separate. Restructure into an object with two fields, or a union, instead of forcing an
intersection:

```ts
type Combined = { saiyan: Saiyan; human: Human }; // keep them side by side
```

## Interview Questions

### Q: When do you use an intersection?

To **compose** a new type from existing ones — e.g. `Base & { extra: T }`, or combining a
`SupportBot` with channel-specific capabilities. It's the `type` equivalent of
`interface extends`.

### Q: What happens when intersected types have conflicting property types?

The conflicting property's type becomes the intersection of incompatible types, which is
`never` — usually rendering the whole type unusable. It signals you should keep the types
separate (a union, or an object with distinct fields) rather than merge them.

### Q: Union or intersection — `string | number` vs `Human & Elf`?

`string | number` (union) is a value that's *one of* those types. `Human & Elf`
(intersection) is a value that has *all* properties of both. Pick union to model
alternatives, intersection to model composition.
