// Run types:  npx tsc --noEmit --strict 09-labs/extra/07-fetch-wrapper-result-type.ts
// Run code:   npx tsx 09-labs/extra/07-fetch-wrapper-result-type.ts

import { z } from "zod";

// Problem:
// Raw `fetch` + throw on every failure forces try/catch at every call site.
// Callers can't tell network errors from parse errors without reading implementation.

// Bad version:
async function getJsonBad<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T;
}

// Better version:
type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: "network" | "http" | "parse"; status?: number; message: string };
type Result<T> = Ok<T> | Err;

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

type Post = z.infer<typeof postSchema>;

async function getPost(id: number): Promise<Result<Post>> {
  let res: Response;
  try {
    res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  } catch {
    return { ok: false, error: "network", message: "Failed to reach server" };
  }

  if (!res.ok) {
    return { ok: false, error: "http", status: res.status, message: `HTTP ${res.status}` };
  }

  const json: unknown = await res.json();
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "parse", message: parsed.error.message };
  }

  return { ok: true, data: parsed.data };
}

function handle(result: Result<Post>) {
  if (!result.ok) {
    console.log("failed:", result.error, result.message);
    return;
  }
  console.log("title:", result.data.title);
}

// Why this works:
// `Result` is a discriminated union on `ok`. Success path narrows to `data: Post`.
// Errors are data, not exceptions — callers must branch. Zod validation sits inside the wrapper.

// When to use:
// - Client SDKs, data loaders, background sync
// - When callers need to show different UI per failure kind (offline vs 404 vs corrupt JSON)

// When NOT to use:
// - Server middleware where throwing maps cleanly to HTTP 500/400
// - Every internal helper — reserve Result for I/O boundaries

// Interview line:
// "My fetch wrapper returns a Result discriminated union — network, HTTP, and schema failures
//  are explicit branches; validated data only exists after `ok: true`."

handle(await getPost(1));
handle(await getPost(99999));
