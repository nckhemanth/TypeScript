// Run types:  npx tsc --noEmit --strict 09-labs/extra/16-branded-id-types.ts
// Run code:   npx tsx 09-labs/extra/16-branded-id-types.ts

import { z } from "zod";

// Problem:
// `userId` and `orderId` are both `string`. Easy to pass arguments in the wrong order —
// TypeScript won't catch `shipOrder(userId, orderId)` swapped.

// Bad version:
function shipOrderBad(orderId: string, userId: string) {
  console.log("ship", orderId, "to", userId);
}
const uid = "user_abc";
const oid = "order_xyz";
shipOrderBad(uid, oid); // swapped — compiles, wrong shipment

// Better version:
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function userId(id: string): UserId {
  if (!id.startsWith("user_")) throw new Error("invalid user id");
  return id as UserId;
}

function orderId(id: string): OrderId {
  if (!id.startsWith("order_")) throw new Error("invalid order id");
  return id as OrderId;
}

function shipOrder(orderId: OrderId, userId: UserId) {
  console.log("ship", orderId, "to", userId);
}

// Zod branded (runtime + type brand):
const UserIdSchema = z.string().startsWith("user_").brand<"UserId">();
type UserIdFromZod = z.infer<typeof UserIdSchema>;

// Why this works:
// Brands are compile-time only (zero runtime cost except your constructor validators).
// Same underlying string, distinct nominal types — swaps become compile errors.

// When to use:
// - IDs, currency codes, email strings that must not mix
// - Units (Pixels vs Percent) in design/layout code

// When NOT to use:
// - Every string in the app — noise and casting friction
// - JSON boundaries — parse to branded in one factory function

// Interview line:
// "Branded types give nominal safety on structural primitives — UserId and OrderId are both
//  strings at runtime but can't be swapped at compile time."

shipOrder(orderId("order_xyz"), userId("user_abc"));
// shipOrder(userId("user_abc"), orderId("order_xyz")); // ERROR: wrong order

const parsed: UserIdFromZod = UserIdSchema.parse("user_99");
console.log(parsed);
