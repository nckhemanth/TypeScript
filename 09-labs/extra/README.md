# Extra — 20 real-world mini use cases

Runnable patterns beyond the core labs. Each file uses the same skeleton:

```text
Problem → Bad version → Better version → Why → When / When NOT → Interview line
```

## Setup

```bash
cd TypeScript
npm install
npx tsc --noEmit --strict 09-labs/extra/<file>.ts   # type-check one file
npx tsx 09-labs/extra/<file>.ts                      # run if it has console output
```

For `.tsx` files, use the same `tsc` command with the `.tsx` path.

## Index

| File | Topic |
|------|--------|
| `01-api-response-zod.ts` | Validate external API JSON at the boundary |
| `02-form-validation-zod.ts` | One schema for client + server form data |
| `03-env-validation.ts` | Fail-fast env parsing with coercion |
| `04-discriminated-api-state.ts` | Zod discriminated union for API payloads |
| `05-react-props-patterns.tsx` | Props typing: children, variants, discriminated props |
| `06-table-column-generics.ts` | Generic table column definitions |
| `07-fetch-wrapper-result-type.ts` | Typed fetch wrapper returning `Result` |
| `08-error-handling-result-union.ts` | `Result<T, E>` instead of throw/catch everywhere |
| `09-route-config-as-const.ts` | `as const` for route literals |
| `10-satisfies-config.ts` | `satisfies` — check shape without widening |
| `11-record-vs-map.ts` | `Record` vs `Map` for keyed lookups |
| `12-interface-extension-vs-type-composition.ts` | `extends` vs intersection |
| `13-utility-types-dto-patch.ts` | `Omit` / `Partial` for API DTOs |
| `14-narrowing-unknown-json.ts` | Narrow `unknown` from `JSON.parse` |
| `15-type-guard-danger.ts` | Why lying type guards are dangerous |
| `16-branded-id-types.ts` | Branded types for UserId vs OrderId |
| `17-pagination-response-generic.ts` | Generic paginated API envelope |
| `18-react-query-types.ts` | Typing query keys and hook return data |
| `19-trpc-zod-input.ts` | Procedure input schema (tRPC-style) |
| `20-when-not-to-over-type.ts` | Pragmatic limits — don't type everything |
