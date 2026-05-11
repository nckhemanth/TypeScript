# Type Guards & Type Predicates

When `typeof`/`in`/`instanceof` aren't enough, you can write your **own** narrowing
functions. Powerful — and dangerous if you get them wrong.

## Table of Contents

- [Custom type guards with predicates](#predicates)
- [Guarding complex/overlapping types](#complex)
- [The big pitfall: lying to the compiler](#pitfall)
- [`unknown` + guards = safe boundaries](#unknown)
- [Interview Questions](#interview-questions)

## Custom type guards with predicates <a id="predicates"></a>

A **type predicate** is a function whose return type is `arg is Type`. If it returns
`true`, TS narrows the argument to `Type`:

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function run(x: unknown) {
  if (isString(x)) {
    x.toLowerCase(); // x: string — narrowed by the predicate
  }
}
```

Instead of declaring the return type as `boolean`, you declare `value is string` — that's
what tells TS to narrow.

## Guarding complex/overlapping types <a id="complex"></a>

Predicates shine when built-in narrowing can't distinguish types with overlapping
properties:

```ts
type Admin = { accessLevel: number; payrollDate: number };
type Manager = { accessLevel: number; reports: number };

function isManagerAdmin(x: Admin | Manager): x is Admin & Manager {
  return "payrollDate" in x && "reports" in x;
}
```

## The big pitfall: lying to the compiler <a id="pitfall"></a>

A predicate **overrides** TS's normal checking — TS trusts your boolean blindly. If your
logic is wrong (or you return the wrong type), you've poisoned type safety everywhere the
guard is used, and TS gives **no error**:

```ts
function isModelA(m: ModelA | ModelB): m is ModelA {
  return "version" in m; // if this logic is wrong, callers get a lie
}
```

Because of this:
- Write predicates **carefully** and **sparingly**.
- **Unit-test** them — a bug here propagates silently through your whole app.

## `unknown` + guards = safe boundaries <a id="unknown"></a>

The canonical safe pattern at program edges: type incoming data as `unknown`, then narrow
with guards (or a validation library):

```ts
function parseInput(input: unknown) {
  if (typeof input === "string") return { source: "email", content: input };
  if (Array.isArray(input)) return { source: "chat", content: input.join("\n") };
  return { source: "unknown", content: "" };
}
```

For real-world untrusted data (API responses), a schema validator like **Zod** generates
the guard *and* the type for you — strictly better than hand-written predicates (covered in
the Zod module).

## Interview Questions

### Q: What is a type predicate?

A function whose return type is `arg is Type` (instead of `boolean`). When it returns true,
TS narrows the argument to `Type` at the call site — letting you write custom narrowing
logic beyond `typeof`/`in`/`instanceof`.

### Q: What's the danger of custom type guards?

TS trusts the predicate's boolean without verifying your logic. A wrong predicate silently
mis-narrows types throughout the codebase with no compiler error — so guards must be written
carefully and unit-tested.

### Q: How should you handle data from an external API in TypeScript?

Type it as `unknown` (never `any`), then narrow with type guards or — better — validate it
at runtime with a schema library (Zod), which both checks the data and infers the static
type. Types alone can't protect you at runtime boundaries.
