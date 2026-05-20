// Run types:  npx tsc --noEmit --strict 09-labs/extra/04-discriminated-api-state.ts
// Run code:   npx tsx 09-labs/extra/04-discriminated-api-state.ts

import { z } from "zod";

// Problem:
// API returns different shapes for success vs error. A flat optional-object schema
// allows `{ status: "success", code: 500 }` — invalid combinations slip through.

// Bad version:
const apiResponseBad = z.object({
  status: z.enum(["success", "error"]),
  data: z.string().optional(),
  code: z.number().optional(),
});
// Both `data` and `code` can be missing, both present, or wrong combo — TS can't narrow well.

// Better version:
const apiResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("error"), code: z.number().int(), message: z.string() }),
]);

type ApiResponse = z.infer<typeof apiResponse>;

function render(response: ApiResponse): string {
  switch (response.status) {
    case "success":
      return `OK: ${response.data}`;
    case "error":
      return `ERR ${response.code}: ${response.message}`;
  }
}

function parseApiResponse(raw: unknown): ApiResponse {
  return apiResponse.parse(raw);
}

// Why this works:
// `discriminatedUnion("status", ...)` picks the branch by literal `status`, then validates
// only that branch's fields. TypeScript narrows `data` vs `code` after the switch — same as lab 01.

// When to use:
// - REST/tRPC responses with success/error variants
// - Redux/query result states: loading | success | error
// - Webhook event types (`event: "invoice.paid" | "invoice.failed"`)

// When NOT to use:
// - Two variants that share 100% of fields (use a plain object + optional field)
// - More than ~10 variants without grouping (consider nested discriminant or registry pattern)

// Interview line:
// "For polymorphic API payloads I use Zod discriminated unions on a literal tag — O(1) branch
//  lookup, better errors, and TypeScript narrows the same way as a hand-written union type."

const samples: unknown[] = [
  { status: "success", data: "hello" },
  { status: "error", code: 404, message: "Not found" },
];

for (const raw of samples) {
  console.log(render(parseApiResponse(raw)));
}
