# Classes

Classes are a **JavaScript** feature (they emit real runtime code), but TypeScript adds the
type machinery — visibility modifiers, abstract classes, `implements` — that makes them
genuinely powerful.

## Table of Contents

- [Basic class](#basic)
- [Access modifiers: `#private`, `private`, `protected`, `public`](#modifiers)
- [Inheritance: `extends` and `super`](#inheritance)
- [Abstract classes](#abstract)
- [`implements` an interface/type](#implements)
- [Classes vs interfaces vs types](#vs)
- [Interview Questions](#interview-questions)

## Basic class <a id="basic"></a>

Same syntax as JS, plus property type declarations (usually at the top) and typed
parameters:

```ts
class Customer {
  firstName: string;
  lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

## Access modifiers <a id="modifiers"></a>

Two ways to make a field private:

| Syntax | Enforced by | Notes |
|---|---|---|
| `#field` | **JavaScript runtime** | True privacy; accessing outside throws at runtime |
| `private field` | **TypeScript only** | Erased at compile time; no runtime protection |

```ts
class Account {
  #balance: number;            // JS-native private (preferred)
  private pin: number;         // TS-only private

  constructor(balance: number, pin: number) {
    this.#balance = balance;
    this.pin = pin;
  }
}
```

**Prefer `#` private** — it's real, runtime-enforced privacy. Use `private`/`public` if
your team is used to other languages, knowing it's compile-time only.

- **`protected`** — accessible inside the class **and its subclasses**, but not outside.
  (TS-only; no JS equivalent.)
- **`public`** — the default; accessible everywhere.

## Inheritance: `extends` and `super` <a id="inheritance"></a>

```ts
class RegularCustomer extends Customer {
  protected balance: number;   // protected → reachable by further subclasses

  constructor(first: string, last: string, balance: number) {
    super(first, last);        // call the parent constructor first
    this.balance = balance;
  }

  getBalance(): number {
    return this.balance;
  }
}
```

A subclass can read `protected` members of its parent; it cannot read the parent's
`private`/`#` members.

## Abstract classes <a id="abstract"></a>

An `abstract` class is a **shell you can't instantiate** — only extend. It can define
shared implementation *and* declare `abstract` members that subclasses **must** implement.

```ts
abstract class Shape {
  abstract calculateArea(): number;     // subclasses must implement
  displayArea(): string {               // shared concrete method
    return `Area: ${this.calculateArea()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  calculateArea(): number { return Math.PI * this.radius ** 2; }
}

new Shape();   // ✗ can't instantiate an abstract class
new Circle(2); // ✓ concrete subclass
```

Use abstract classes when several concrete types share behavior but must each fill in
specific pieces.

## `implements` an interface/type <a id="implements"></a>

`implements` says "this class provides the shape described by this interface/type." Unlike
`extends`, it carries **no implementation** — just a contract the class must satisfy. Works
with both `interface` and `type`.

```ts
interface Drivable { drive(): void; }
type Vehicle = { make: string; model: string };

class ElectricCar implements Vehicle, Drivable {
  make = "Tesla";
  model = "3";
  drive() { /* ... */ }   // must exist to satisfy Drivable
}
```

## Classes vs interfaces vs types <a id="vs"></a>

| | Runtime? | Gives you |
|---|---|---|
| **Class** | ✅ emits JS | Real objects, methods with implementations, inheritance, `new` |
| **Interface** | ❌ erased | Shape/contract only |
| **Type** | ❌ erased | Shape/contract + unions/functions/mapped types |

Default to `type`/`interface` for ~95–99% of "describe a shape" needs (no runtime cost).
Reach for **classes** when you genuinely need OOP — instances with behavior, inheritance,
abstract base classes.

## Interview Questions

### Q: `#private` vs `private` keyword?

`#field` is JavaScript-native privacy enforced at runtime (access outside the class
throws). `private` is TypeScript-only — erased at compile time, so the field is accessible
in the emitted JS. Prefer `#` for real encapsulation.

### Q: `private` vs `protected`?

`private` (or `#`) is accessible only within the declaring class. `protected` is accessible
within the class **and its subclasses**, but not from outside. `protected` is TS-only.

### Q: When use a class vs an interface/type?

Use a class when you need runtime behavior: instances, methods with implementations,
inheritance, abstract bases, `instanceof`. Use `type`/`interface` (erased, zero runtime
cost) for plain data shapes and contracts — which is most of the time.

### Q: `extends` vs `implements`?

`extends` inherits implementation from a parent class (or extends an interface's shape).
`implements` only declares that a class conforms to an interface/type's contract — it
provides no implementation, just forces the class to define the required members.

### Q: What's an abstract class for?

A non-instantiable base that shares concrete behavior and declares `abstract` members
subclasses must implement (e.g. `Shape` with a shared `displayArea()` and an abstract
`calculateArea()`). It models "these types share behavior but each fills in specifics."
