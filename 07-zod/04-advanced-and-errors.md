# Advanced Zod & Error Handling

Custom validation, transforms, and turning Zod's verbose errors into messages you can show.

## Table of Contents

- [Custom validation: `refine` / `superRefine`](#refine)
- [Transforms & coercion](#transform)
- [Custom error messages](#custom-errors)
- [Handling `ZodError`](#zoderror)
- [`zod-validation-error`](#zve)
- [A real-world pattern: validating env/config](#real)
- [Interview Questions](#interview-questions)

## Custom validation: `refine` / `superRefine` <a id="refine"></a>

When built-in validators aren't enough, write your own with `.refine()` — a predicate plus a
message:

```ts
const email = z
  .string()
  .email()
  .refine((val) => val.endsWith("@webdevsimplified.com"), {
    message: "Email must use the company domain",
  });
```

`.superRefine()` gives low-level access (multiple issues, custom codes) for complex,
cross-field validation. Reach for it only when `.refine()` can't express the rule.

## Transforms & coercion <a id="transform"></a>

```ts
z.string().transform((s) => s.length);   // parse a string, output its length (number)
z.coerce.number();                       // coerce input ("42") into a number before validating
```

`transform` changes the **output** type; `z.coerce.*` converts the input first (handy for
query params and form fields that arrive as strings).

## Custom error messages <a id="custom-errors"></a>

Pass messages inline on any schema or validator:

```ts
z.string({ required_error: "Name is required", invalid_type_error: "Name must be text" });
z.string().min(3, { message: "Min length must be 3" });
```

## Handling `ZodError` <a id="zoderror"></a>

A `ZodError` (`result.error`) is **very detailed** — an `issues` array with paths, codes, and
messages. That's great for programmatic handling but painful to show users directly:

```ts
const result = schema.safeParse(data);
if (!result.success) {
  result.error.issues; // [{ path: ["username"], code, message }, ...]
}
```

Don't hand-format this for UI. Use per-field custom messages (above) **or** a helper library.

## `zod-validation-error` <a id="zve"></a>

The cleanest way to turn a `ZodError` into a readable message:

```bash
npm install zod-validation-error
```

```ts
import { fromZodError } from "zod-validation-error";

const result = schema.safeParse(data);
if (!result.success) {
  console.log(fromZodError(result.error).toString());
  // "Validation error: Min length must be three at 'username'"
}
```

One line, readable output — good enough for API errors and decent for end users.

## A real-world pattern: validating env/config <a id="real"></a>

A canonical use: validate `process.env` at startup so the app fails fast with a clear
message instead of mysteriously breaking later:

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse(process.env); // typed, validated env object
```

Same idea for API responses (`schema.parse(await res.json())`) and form submissions
(`schema.safeParse(formData)`).

## Interview Questions

### Q: How do you add custom validation logic in Zod?

`.refine(predicate, { message })` for a single custom rule, or `.superRefine()` for complex/
multi-issue or cross-field validation. They run after the base type check passes.

### Q: How do you present Zod errors to users?

A raw `ZodError` is too verbose to show directly. Either attach per-field custom messages
(`required_error`, `.min(n, { message })`) or use a helper like `zod-validation-error`'s
`fromZodError()` to produce a clean, single-line message.

### Q: `transform` vs `coerce`?

`z.coerce.number()` converts the **input** (e.g. `"42"` → `42`) before validating — useful
for string-y sources like query params. `.transform()` changes the **output** after
validation (e.g. string → its length). Coerce on the way in, transform on the way out.

### Q: Give a production use case for Zod beyond forms.

Validating untrusted boundaries: `process.env` at startup (fail fast on misconfig), API
response bodies (`schema.parse(await res.json())`), webhook payloads, and `localStorage`/
`JSON.parse` output — anywhere data enters the program and TS types can't be trusted.
