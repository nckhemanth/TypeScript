// Lab 02 — Generics & Utility Types
// Run types:  npx tsc --noEmit --strict 02-generics-and-utility-types.ts
// Run code:   npx tsx 02-generics-and-utility-types.ts
//
// Goal: see type information flow THROUGH functions and derive types from one source.

// ── 1. generic function + inference ────────────────────────────────────
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = getFirst([1, 2, 3]); // PREDICT: number | undefined (T inferred = number)
const b = getFirst(["x", "y"]); // PREDICT: string | undefined
console.log(a, b);

// ── 2. generic constraint — keep the caller's full type ────────────────
// <T extends { email: string }> requires an email but RETAINS extra props.
function pluckEmails<T extends { email: string }>(items: T[]): string[] {
  return items.map((i) => i.email);
}

const people = [
  { email: "k@x.com", name: "Kyle" }, // has extra `name` — still allowed
  { email: "j@x.com", name: "Jane" },
];
console.log(pluckEmails(people));
// pluckEmails([{ id: 1 }]); // ← uncomment: ERROR, no `email` property

// ── 3. single source of truth with utility types ──────────────────────
type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

type PublicUser = Omit<User, "passwordHash">; // derive, don't copy
type UserPreview = Pick<User, "id" | "name">; // minimal subset
type UserPatch = Partial<User>; // all optional — for PATCH endpoints

const preview: UserPreview = { id: "1", name: "Kyle" };
console.log(preview);

// ── 4. derive a type FROM a function ───────────────────────────────────
function makeTicket(title: string, priority: number) {
  return { id: crypto.randomUUID(), title, priority, createdAt: Date.now() };
}

type Ticket = ReturnType<typeof makeTicket>; // { id; title; priority; createdAt }
type MakeTicketArgs = Parameters<typeof makeTicket>; // [title: string, priority: number]

const t: Ticket = makeTicket("Bug", 1);
console.log(t.priority);

// ── 5. a tiny mapped type (how Partial is built) ───────────────────────
type MyPartial<T> = { [K in keyof T]?: T[K] };
type DraftUser = MyPartial<User>; // same as Partial<User>

const draft: DraftUser = { name: "WIP" }; // every field optional
console.log(draft);

// TRY THIS: change `makeTicket` to also return `assignee: string`.
// Notice `Ticket` updates automatically everywhere — single source of truth.
