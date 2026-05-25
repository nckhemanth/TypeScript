// Run types:  npx tsc --noEmit --strict 09-labs/extra/14-narrowing-unknown-json.ts
// Run code:   npx tsx 09-labs/extra/14-narrowing-unknown-json.ts

import { z } from "zod";

// Problem:
// `JSON.parse` and `req.body` are `unknown`. Casting to your interface skips runtime checks.
// Manual narrowing works but gets verbose; Zod compresses it for complex shapes.

// Bad version:
function parseNotificationBad(raw: unknown) {
  const n = raw as { type: string; message: string };
  return n.message.toUpperCase(); // crashes if shape wrong
}

// Better version — manual narrowing (good to know for interviews):
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseNotificationManual(raw: unknown): string {
  if (!isRecord(raw)) throw new Error("not an object");
  if (typeof raw["type"] !== "string") throw new Error("bad type");
  if (typeof raw["message"] !== "string") throw new Error("bad message");
  return raw["message"].toUpperCase();
}

// Better version — Zod for real payloads:
const notificationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("info"), message: z.string() }),
  z.object({ type: z.literal("alert"), message: z.string(), severity: z.number() }),
]);

type Notification = z.infer<typeof notificationSchema>;

function parseNotification(raw: unknown): Notification {
  return notificationSchema.parse(raw);
}

function render(n: Notification): string {
  switch (n.type) {
    case "info":
      return n.message;
    case "alert":
      return `[${n.severity}] ${n.message}`;
  }
}

// Why this works:
// Start from `unknown`, narrow with typeof/in/custom guards, or delegate to Zod at boundaries.
// After `parse`, TS knows `severity` exists only on `alert` branch.

// When to use:
// - JSON.parse, websocket messages, postMessage, localStorage restore
// - Manual guards: tiny payloads; Zod: nested/discriminated data

// When NOT to use:
// - Zod inside tight loops on already-validated data
// - Manual 20-field guards when a schema is clearer

// Interview line:
// "Everything from JSON.parse is unknown — I narrow with guards or Zod at the boundary;
//  I never cast straight to an interface."

const samples = [
  JSON.parse('{"type":"info","message":"hello"}'),
  JSON.parse('{"type":"alert","message":"disk","severity":3}'),
] as unknown[];

for (const raw of samples) {
  console.log(render(parseNotification(raw)));
  console.log(parseNotificationManual(raw));
}
