// Run types:  npx tsc --noEmit --strict 09-labs/extra/10-satisfies-config.ts
// Run code:   npx tsx 09-labs/extra/10-satisfies-config.ts

// Problem:
// Theme/config objects need checking against a shape but you also want precise literal types
// for autocomplete (`"sm" | "md"`) — not widened to `string`.

// Bad version:
type ThemeConfig = {
  spacing: Record<string, number>;
  colors: Record<string, string>;
};

const themeBad: ThemeConfig = {
  spacing: { sm: 8, md: 16 },
  colors: { primary: "#3366ff" },
};
// Annotating with ThemeConfig widens keys — `themeBad.colors.primary` is just `string`.

// Better version:
type ThemeShape = {
  spacing: Record<string, number>;
  colors: Record<string, string>;
};

const theme = {
  spacing: { sm: 8, md: 16, lg: 24 },
  colors: { primary: "#3366ff", danger: "#cc0000" },
} satisfies ThemeShape;

type PrimaryColor = (typeof theme)["colors"]["primary"]; // "#3366ff" literal, not string

function getSpacing(size: keyof typeof theme.spacing): number {
  return theme.spacing[size];
}

// Why this works:
// `satisfies` checks the value against `ThemeShape` without changing inferred types.
// Extra keys still allowed if shape uses Record; literals on known keys stay narrow.

// When to use:
// - Design tokens, feature config, route metadata
// - When you want validation + literal inference (TS 4.9+)

// When NOT to use:
// - When you intentionally want the annotation to widen (rare)
// - Runtime validation — `satisfies` is compile-time only; use Zod at boundaries

// Interview line:
// "`satisfies` lets me verify config matches an interface while keeping narrow literal types
//  for autocomplete — unlike `: ThemeConfig` which widens everything to string/number."

console.log(getSpacing("md"), theme.colors.primary);
