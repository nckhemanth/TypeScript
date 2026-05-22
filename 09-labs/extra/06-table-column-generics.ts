// Run types:  npx tsc --noEmit --strict 09-labs/extra/06-table-column-generics.ts
// Run code:   npx tsx 09-labs/extra/06-table-column-generics.ts

// Problem:
// Data table columns need to work for any row type but still type-check `accessor` and `cell` renderers.
// Copy-pasting column defs per entity doesn't scale.

// Bad version:
type ColumnBad = {
  id: string;
  header: string;
  accessor: string; // no link to row shape — typos like "emial"
  cell?: (row: unknown) => string;
};

const columnsBad: ColumnBad[] = [
  { id: "email", header: "Email", accessor: "emial" }, // typo — no error
];

// Better version:
type ColumnDef<T> = {
  id: string;
  header: string;
  accessor: keyof T & string;
  cell?: (row: T) => string;
};

function defineColumns<T>(cols: ColumnDef<T>[]): ColumnDef<T>[] {
  return cols;
}

type User = { id: string; name: string; email: string };

const userColumns = defineColumns<User>([
  { id: "name", header: "Name", accessor: "name", cell: (row) => row.name.toUpperCase() },
  { id: "email", header: "Email", accessor: "email" },
  // { id: "x", header: "X", accessor: "emial" }, // ERROR: not keyof User
]);

function renderTable<T>(rows: T[], columns: ColumnDef<T>[]): string[][] {
  return rows.map((row) =>
    columns.map((col) => (col.cell ? col.cell(row) : String(row[col.accessor]))),
  );
}

// Why this works:
// Generic `T` flows into `keyof T` for accessors and into `cell: (row: T) => ...`.
// `defineColumns` helper gives inference — you rarely need to write `<User>` explicitly.

// When to use:
// - Admin tables, TanStack Table column defs, CSV export mappers
// - Any reusable list/grid keyed by entity fields

// When NOT to use:
// - One-off HTML table with 3 static columns
// - Columns computed at runtime with dynamic keys you can't express as `keyof T`

// Interview line:
// "Table columns are generic over the row type — accessor is keyof T so renames on the model
//  break the column def at compile time, not in production."

const rows: User[] = [
  { id: "1", name: "Kyle", email: "k@x.com" },
  { id: "2", name: "Jane", email: "j@x.com" },
];

console.log(renderTable(rows, userColumns));
