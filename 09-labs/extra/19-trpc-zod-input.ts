// Run types:  npx tsc --noEmit --strict 09-labs/extra/19-trpc-zod-input.ts
// Run code:   npx tsx 09-labs/extra/19-trpc-zod-input.ts

import { z } from "zod";

// Problem:
// REST handlers take `req.body: any`. tRPC + Zod validates input once and infers types for
// the handler — client autocomplete matches server without codegen.

// Bad version:
type CreateUserBodyBad = { email: string; name: string };

async function createUserBad(body: CreateUserBodyBad) {
  // If client sends extra/missing fields, TS never knows — runtime bugs
  return { id: "1", ...body };
}

// Better version:
// Minimal tRPC-shaped helper (real apps: `publicProcedure.input(schema).mutation(...)`)

const createUserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type CreateUserInput = z.infer<typeof createUserInput>;

type Procedure<TInput extends z.ZodType, TOutput> = {
  input: TInput;
  handler: (opts: { input: z.infer<TInput> }) => Promise<TOutput>;
};

function defineMutation<TInput extends z.ZodType, TOutput>(
  input: TInput,
  handler: (opts: { input: z.infer<TInput> }) => Promise<TOutput>,
): Procedure<TInput, TOutput> {
  return { input, handler };
}

const createUser = defineMutation(createUserInput, async ({ input }) => {
  // `input` is fully typed — email, name
  return { id: crypto.randomUUID(), email: input.email, name: input.name };
});

async function callMutation<TInput extends z.ZodType, TOutput>(
  proc: Procedure<TInput, TOutput>,
  raw: unknown,
): Promise<TOutput> {
  const parsed = proc.input.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.message);
  return proc.handler({ input: parsed.data });
}

// Client infers from AppRouter type in real tRPC — here we show input/output link:
type CreateUserOutput = Awaited<ReturnType<typeof createUser.handler>>;

async function clientCall(raw: unknown): Promise<CreateUserOutput> {
  return callMutation(createUser, raw);
}

// Why this works:
// Zod schema is the contract. Handler receives narrowed `input`. Export `typeof appRouter`
// for client proxy — TS propagates procedure input/output across the wire.

// When to use:
// - Full-stack TS monorepos (T3, tRPC + Next.js)
// - Internal apps where you own client and server

// When NOT to use:
// - Public REST API with non-TS consumers — use OpenAPI + Zod-to-openapi
// - Simple CRUD where codegen overhead exceeds benefit

// Interview line:
// "tRPC procedures take Zod input schemas — the handler's `input` is inferred, and the client
//  gets the same types from `AppRouter` without a separate OpenAPI codegen step."

const out = await clientCall({ email: "k@x.com", name: "Kyle" });
console.log("created:", out.id, out.email);
