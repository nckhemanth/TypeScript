// Run types:  npx tsc --noEmit --strict 09-labs/extra/02-form-validation-zod.ts
// Run code:   npx tsx 09-labs/extra/02-form-validation-zod.ts

import { z } from "zod";

// Problem:
// Registration form: email + password rules must match on client and server.
// Duplicating validation logic leads to drift (client allows 6 chars, server requires 8).

// Bad version:
type RegisterBodyBad = { email: string; password: string };

function validateRegisterBad(body: RegisterBodyBad): string | null {
  if (!body.email.includes("@")) return "Invalid email";
  if (body.password.length < 8) return "Password too short";
  return null;
}

// Separate copy-paste on the "client" — easy to forget to update both.
function validateRegisterClientBad(email: string, password: string): string | null {
  if (!email.includes("@")) return "Invalid email";
  if (password.length < 6) return "Password too short"; // BUG: mismatch with server
  return null;
}

// Better version:
export const registerSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Need one uppercase letter"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// "Client" — same schema (in React: zodResolver(registerSchema) + react-hook-form)
function validateOnClient(raw: unknown): RegisterInput | { fieldErrors: Record<string, string[]> } {
  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    // NOTE: We cast here because `flatten().fieldErrors` is typed more precisely (keys are known fields and
    // values can be optional) than our looser return type `Record<string, string[]>`.
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }
  // No cast needed: `safeParse` returns a discriminated union. In the `success` branch, Zod has validated the
  // payload at runtime, and TS narrows `result` so `result.data` is `RegisterInput`.
  return result.data;
}

// "Server" — same schema in a route handler / server action
function handleRegister(raw: unknown): { ok: true; user: RegisterInput } | { ok: false; status: 400 } {
  const result = registerSchema.safeParse(raw);
  if (!result.success) return { ok: false, status: 400 };
  return { ok: true, user: result.data };
}

// Why this works:
// One schema = one source of truth. `z.infer` gives you the TS type; `safeParse` gives field-level errors.
// Client and server literally import the same `registerSchema`.

// When to use:
// - Login, signup, checkout, settings forms
// - Any user-edited payload hitting your API
// - React Hook Form + `@hookform/resolvers/zod`

// When NOT to use:
// - Internal admin tools where you control every caller and trust the shape
// - Replacing all business rules (e.g. "email already taken" still needs a DB check after Zod)

// Interview line:
// "I define the form schema once, infer the type, and run safeParse on both client blur/submit
//  and server action — validation rules can't diverge."

console.log(validateOnClient({ email: "bad", password: "short" }));
console.log(handleRegister({ email: "you@co.example", password: "Secret1!" }));
