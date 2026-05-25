// Run types:  npx tsc --noEmit --strict 09-labs/extra/13-utility-types-dto-patch.ts
// Run code:   npx tsx 09-labs/extra/13-utility-types-dto-patch.ts

// Problem:
// DB entity has secrets and internal fields. API must expose DTOs; PATCH accepts partial updates.
// Copy-pasting fields creates drift when the entity changes.

// Bad version:
type UserEntityBad = {
  id: string;
  email: string;
  passwordHash: string;
  internalScore: number;
};

type PublicUserBad = {
  id: string;
  email: string;
}; // manual duplicate — forget to add `name` when entity grows

// Better version:
type UserEntity = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  internalScore: number;
  createdAt: Date;
};

type PublicUser = Omit<UserEntity, "passwordHash" | "internalScore" | "createdAt">;
type UserCreateInput = Omit<UserEntity, "id" | "createdAt" | "internalScore" | "passwordHash"> & {
  password: string;
};
type UserPatchInput = Partial<Omit<UserEntity, "id" | "createdAt" | "passwordHash">>;

function toPublic(user: UserEntity): PublicUser {
  const { passwordHash: _p, internalScore: _s, createdAt: _c, ...pub } = user;
  return pub;
}

function applyPatch(user: UserEntity, patch: UserPatchInput): UserEntity {
  return { ...user, ...patch };
}

// Why this works:
// Single entity type is source of truth. `Omit`/`Partial` derive API contracts.
// Change `UserEntity` → compiler shows every DTO that needs updating.

// When to use:
// - REST GET/POST/PATCH bodies vs DB models
// - GraphQL/tRPC input types derived from domain types
// - Form "draft" state: `Partial<T>`

// When NOT to use:
// - Public API intentionally different shape (use explicit mapper + separate type + tests)
// - Over-nesting Omit chains nobody can read — extract named aliases (`type PublicUser = ...`)

// Interview line:
// "API DTOs are derived with Omit and Partial from the domain entity — I never hand-copy
//  field lists, so new columns force compile errors in every layer."

const entity: UserEntity = {
  id: "1",
  name: "Kyle",
  email: "k@x.com",
  passwordHash: "hash",
  internalScore: 99,
  createdAt: new Date(),
};

console.log(toPublic(entity));
console.log(applyPatch(entity, { name: "K" }));
