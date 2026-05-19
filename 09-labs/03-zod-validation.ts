// Lab 03 — Zod: runtime validation + inferred types
// Setup:      npm install zod
// Run types:  npx tsc --noEmit --strict 03-zod-validation.ts
// Run code:   npx tsx 03-zod-validation.ts
//
// Goal: one schema → runtime validation AND a static type (single source of truth).

import { z } from "zod";

// ── 1. schema + inferred type ──────────────────────────────────────────
const userSchema = z.object({
  username: z.string().min(3),
  age: z.number().int().positive().optional(),
  role: z.enum(["admin", "user", "guest"]),
});

// The type is DERIVED from the schema — never written by hand.
type User = z.infer<typeof userSchema>;
// { username: string; age?: number; role: "admin" | "user" | "guest" }

// ── 2. parse vs safeParse ──────────────────────────────────────────────
try {
  const valid = userSchema.parse({ username: "kyle", role: "admin" });
  console.log("parsed:", valid); // age omitted (optional) is fine
} catch (e) {
  console.log("parse threw");
}

const result = userSchema.safeParse({ username: "ab", role: "admin" }); // too short
if (result.success) {
  console.log("ok:", result.data);
} else {
  // result is narrowed: error is available here (discriminated union!)
  console.log("validation failed:", result.error.issues[0]?.message);
}

// ── 3. custom validation with refine ───────────────────────────────────
const companyEmail = z
  .string()
  .email()
  .refine((s) => s.endsWith("@company.example"), {
    message: "Must be a company email",
  });

console.log(companyEmail.safeParse("a@company.example").success); // true
console.log(companyEmail.safeParse("a@gmail.com").success); // false

// ── 4. discriminated union (what safeParse itself returns) ─────────────
const apiResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("error"), code: z.number() }),
]);

const r = apiResponse.parse({ status: "success", data: "hello" });
if (r.status === "success") console.log("data:", r.data);

// ── 5. real-world pattern: validate config/env, fail fast ──────────────
const envSchema = z.object({
  PORT: z.coerce.number().default(3000), // "3000" string → 3000 number
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const env = envSchema.parse({ PORT: "8080" });
console.log("env:", env); // { PORT: 8080, NODE_ENV: "development" }

// TRY THIS: change `coerce` to plain `z.number()` and pass PORT: "8080".
// It fails — coercion is what turns the string into a number first.
