// Run types:  npx tsc --noEmit --strict 09-labs/extra/17-pagination-response-generic.ts
// Run code:   npx tsx 09-labs/extra/17-pagination-response-generic.ts

import { z } from "zod";

// Problem:
// List endpoints return `{ items, page, pageSize, total }`. Copy-pasting the envelope per
// entity duplicates pagination logic and typos `items` vs `data`.

// Bad version:
type UserListBad = {
  items: { id: string; name: string }[];
  page: number;
  pageSize: number;
  total: number;
};

type OrderListBad = {
  items: { id: string; totalCents: number }[];
  page: number;
  pageSize: number;
  total: number;
};

// Better version:
type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

type Paginated<T> = PageMeta & {
  items: T[];
};

function paginate<T>(items: T[], page: number, pageSize: number, total: number): Paginated<T> {
  return {
    items,
    page,
    pageSize,
    total,
    hasNextPage: page * pageSize < total,
  };
}

// Zod factory for API boundary
function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
  });
}

const userSchema = z.object({ id: z.string(), name: z.string() });
const userListSchema = paginatedSchema(userSchema);
type UserList = z.infer<typeof userListSchema>;

function renderPage<T extends { id: string }>(page: Paginated<T>): string {
  return `page ${page.page}: ${page.items.length} rows (${page.total} total)`;
}

// Why this works:
// Generic `Paginated<T>` wraps any item type. Zod factory reuses pagination rules.
// UI helpers (`hasNextPage`) live once on the envelope.

// When to use:
// - REST list endpoints, infinite scroll cursors (extend meta with `cursor`)
// - Admin tables sharing pagination footer component

// When NOT to use:
// - GraphQL connections (Relay cursor spec is different)
// - Single-item endpoints — don't force pagination wrapper

// Interview line:
// "I model lists as `Paginated<T>` with a shared meta shape and a Zod factory so pagination
//  rules and item schema compose without copy-paste."

const users: Paginated<{ id: string; name: string }> = paginate(
  [
    { id: "1", name: "A" },
    { id: "2", name: "B" },
  ],
  1,
  10,
  42,
);

console.log(renderPage(users));

const parsed: UserList = userListSchema.parse({
  items: [{ id: "1", name: "A" }],
  page: 1,
  pageSize: 10,
  total: 1,
  hasNextPage: false,
});
console.log(parsed.items[0]?.name);
