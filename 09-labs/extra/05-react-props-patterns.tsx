// Run types:  npx tsc --noEmit --strict 09-labs/extra/05-react-props-patterns.tsx
//
// Requires: react + @types/react (devDependencies in package.json)

import type { ReactNode } from "react";

// Problem:
// Button/modal props get messy: optional `href` vs `onClick`, icon slots, variant strings.
// `any` or huge optional bags lose autocomplete and allow impossible combinations.

// Bad version:
type ButtonBadProps = {
  children?: ReactNode;
  variant?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};
// Allows href + onClick together, or neither — bugs at runtime.

// Better version:

// 1) Discriminated props — link OR button, never both
type ButtonProps =
  | {
      variant: "primary" | "ghost";
      children: ReactNode;
      href: string;
      onClick?: never;
    }
  | {
      variant: "primary" | "ghost";
      children: ReactNode;
      onClick: () => void;
      href?: never;
      disabled?: boolean;
    };

function Button(props: ButtonProps) {
  if ("href" in props && props.href !== undefined) {
    return (
      <a href={props.href} className={props.variant}>
        {props.children}
      </a>
    );
  }
  return (
    <button type="button" onClick={props.onClick} disabled={props.disabled} className={props.variant}>
      {props.children}
    </button>
  );
}

// 2) Component with required children + optional render prop
type CardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

function Card({ title, children, footer }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
      {footer}
    </section>
  );
}

// 3) Polymorphic "as" pattern (simplified) — default element is `div`
type BoxProps<T extends React.ElementType = "div"> = {
  as?: T;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Box<T extends React.ElementType = "div">({ as, children, ...rest }: BoxProps<T>) {
  const Component = as ?? "div";
  return <Component {...rest}>{children}</Component>;
}

// Why this works:
// Discriminated unions encode mutually exclusive props — TS errors if you pass href + onClick.
// `children: ReactNode` documents composition. `ComponentPropsWithoutRef` forwards native attrs safely.

// When to use:
// - Design-system components (Button, Link, Input)
// - Modals that are either controlled or uncontrolled (not both)
// - Tables/lists with slot props (header, row, empty state)

// When NOT to use:
// - Leaf components with 2 props — plain interface is fine
// - Over-engineering every div with polymorphic `as` — use only when reuse demands it

// Interview line:
// "For React props I use discriminated unions when combinations are mutually exclusive —
//  link vs button, controlled vs uncontrolled — so invalid prop sets fail at compile time."

// Compile-time checks (uncomment to see errors):
// <Button variant="primary">Oops</Button>           // missing href OR onClick
// <Button variant="primary" href="/" onClick={() => {}}>Both</Button>

export { Button, Card, Box };
