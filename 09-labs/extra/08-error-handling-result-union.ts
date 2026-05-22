// Run types:  npx tsc --noEmit --strict 09-labs/extra/08-error-handling-result-union.ts
// Run code:   npx tsx 09-labs/extra/08-error-handling-result-union.ts

// Problem:
// Business functions throw strings, Error, or nothing — callers can't know what to catch.
// Mixing thrown exceptions with return values is hard to reason about in UI layers.

// Bad version:
function divideBad(a: number, b: number): number {
  if (b === 0) throw new Error("divide by zero");
  return a / b;
}

// Caller must remember try/catch; TS doesn't track failure modes.

// Better version:
type DivideError = { kind: "divide_by_zero" };
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function divide(a: number, b: number): Result<number, DivideError> {
  if (b === 0) return { ok: false, error: { kind: "divide_by_zero" } };
  return { ok: true, value: a / b };
}

type AppError =
  | { kind: "not_found"; id: string }
  | { kind: "forbidden" }
  | { kind: "validation"; field: string };

function getUser(id: string): Result<{ name: string }, AppError> {
  if (id === "missing") return { ok: false, error: { kind: "not_found", id } };
  if (id === "banned") return { ok: false, error: { kind: "forbidden" } };
  return { ok: true, value: { name: "Kyle" } };
}

function toHttpStatus(err: AppError): number {
  switch (err.kind) {
    case "not_found":
      return 404;
    case "forbidden":
      return 403;
    case "validation":
      return 400;
  }
}

// Why this works:
// Errors are typed members of a union (`kind` discriminant). Exhaustive `switch` on `kind`.
// Success and failure are both return values — TS forces you to handle `ok: false`.

// When to use:
// - Domain/service layer where failures are expected (not exceptional)
// - Mapping to HTTP status or toast messages in one place
// - Rust/Go-style ergonomics in TS

// When NOT to use:
// - Programmer bugs (null dereference) — let those throw
// - Deep async stacks where Result wrapping every layer adds noise — validate at boundary, throw inside framework

// Interview line:
// "I model expected failures as a Result union with a `kind` discriminant — callers exhaustively
//  switch on error type instead of catching opaque exceptions."

console.log(divide(10, 2));
console.log(divide(10, 0));

const user = getUser("missing");
if (!user.ok) console.log("http would be", toHttpStatus(user.error));
