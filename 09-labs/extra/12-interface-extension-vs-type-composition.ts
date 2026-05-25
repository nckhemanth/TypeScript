// Run types:  npx tsc --noEmit --strict 09-labs/extra/12-interface-extension-vs-type-composition.ts
// Run code:   npx tsx 09-labs/extra/12-interface-extension-vs-type-composition.ts

// Problem:
// Model grows: `User`, then `AdminUser` with extra fields, then `AuditedUser` with timestamps.
// When to `interface extends` vs `type` intersection?

// Bad version:
// Merging unrelated interfaces via declaration merging by accident (ambient .d.ts pollution).
// Or using intersection for classes when you need implements clarity.

// Better version:

// A) interface extends — clear OO hierarchy, good for public API surfaces
interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
}

interface AdminUser extends User, Timestamps {
  role: "admin";
  permissions: string[];
}

// B) type intersection — compose unions/primitives, utility types
type Identified = { id: string };
type WithEmail = { email: string };
type Guest = Identified & { kind: "guest" };
type Member = Identified & WithEmail & { kind: "member" };
type Account = Guest | Member;

function greet(account: Account): string {
  if (account.kind === "guest") return `Guest ${account.id}`;
  return `Member ${account.email}`;
}

// C) Prefer type when you need Omit/Pick on the result
type UserUpdate = Partial<Omit<User, "id">>;

// Why this works:
// `extends` chains readable object shapes; intersections compose aliases and unions flexibly.
// Interfaces can be extended by declaration merging (libs); types can't — safer for app models.

// When to use:
// - interface extends: entity models, React component props extension, `implements` in classes
// - type &: union members, mapped/utility type pipelines, discriminated unions

// When NOT to use:
// - interface extends for union types (can't extend a union)
// - type intersection to simulate declaration merging across packages

// Interview line:
// "I use interface extends for object hierarchies and type intersections for unions and utility-type
//  pipelines — intersections compose `Guest | Member`; extends doesn't."

const admin: AdminUser = {
  id: "1",
  email: "a@co.example",
  createdAt: new Date(),
  updatedAt: new Date(),
  role: "admin",
  permissions: ["users:write"],
};

console.log(greet({ kind: "member", id: "2", email: "m@x.com" }), admin.role);
