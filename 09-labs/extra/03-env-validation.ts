// Run types:  npx tsc --noEmit --strict 09-labs/extra/03-env-validation.ts
// Run code:   npx tsx 09-labs/extra/03-env-validation.ts

import { z } from "zod";

// Problem:
// `process.env.PORT` is `string | undefined`. Apps start fine then crash on first request
// when PORT is missing or `"abc"`. Coercion and defaults belong in one place.

// Bad version:
const portBad = Number(process.env.PORT) || 3000;
// NaN if PORT="abc" — silent bug. NODE_ENV unchecked — typos slip through.

// Better version:
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(raw: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    console.error("Invalid environment:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

// Simulate process.env (strings only — like Node)
const env = loadEnv({
  PORT: "8080",
  NODE_ENV: "development",
  DATABASE_URL: "https://db.example.com/main",
});

// Why this works:
// `z.coerce.number()` turns `"8080"` → 8080 before validating.
// `.default()` fills missing keys. Parse once at startup — fail fast with readable errors.
// Inferred `Env` gives `PORT: number`, not `string | undefined`.

// When to use:
// - `process.env` / `.env` files / Docker/K8s injected config
// - CLI flags that arrive as strings
// - Any config loaded before the app serves traffic

// When NOT to use:
// - Secrets you read directly in one line without reuse (still better to validate, but overkill for throwaway scripts)
// - Re-parsing env on every request (parse once, export `env`)

// Interview line:
// "I validate env at module load with Zod — coerce strings to numbers, default optional keys,
//  and exit the process if required vars are missing so prod never boots half-configured."

console.log("env:", env.PORT, typeof env.PORT, env.NODE_ENV);
