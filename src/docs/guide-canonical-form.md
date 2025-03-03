---
title: Canonical Forms
permalink: /compute-engine/guides/canonical-form/
layout: single
date: Last Modified
sidebar:
  - nav: 'compute-engine'
---

# Canonical Form

Some mathematical objects can be represented by several equivalent expressions.

For example, the expressions in each row below represent the same mathematical
object:

<div class="equal-width-columns">

|                  |                            |                            |
| :---------------: | :-----------------------: | :------------------------: |
| \\[ 215.3465 \\] | \\[ 2.15346\mathrm{e}2 \\] | \\[ 2.15346 \times 10^2\\] |
| \\[ 1 - x \\]    | \\[-x + 1 \\]              | \\[ 1 + (-x)\\]            |
| \\[ -2x^{-1}\\]  | \\[ -\frac{2}{x} \\]       | \\[ \frac{-2}{x} \\]       |

</div>

By applying some conventions &mdash; for example sorting operands of 
commutative functions or flattening associative functions &mdash; 
we define a **canonical** representation.

A canonical representation is somewhat arbitrary, but using it consistently make
some operations easier, for example, comparing two expressions for equality.

The canonical form used by the Compute Engine follows common (but certainly not
universal) conventions in writing mathematical expressions, and expresses them
in a way that optimize their computation. It is not necessarily "the simplest" way
to represent an expression.

The canonical form of an expression is always the same when used with a given
Compute Engine instance. However, do not rely on the canonical form as future
versions of the Compute Engine could provide a different result.

The `ce.box()` and `ce.parse()` function return a non-canonical expression. 
This may be desirable for example to compare a "raw" user input.

The output of `expr.simplify()`, `expr.evaluate()` and `expr.N()` are
canonical expressions.

**To obtain the canonical representation of an expression**, use the
`expr.canonical` property.

```js
console.log(ce.box(['Add', 2, 'x', 3]).canonical);
// ➔ ["Add", 5, "x"]
```

If the expression is already canonical, `expr.canonical` immediately return 
`expr`.


Calculating the canonical form of an expression is applying some rewriting rules
to an expression. In that sense, it is similar to simplifying an expression with
`expr.simplify()`, but it is more conservative in the transformations it
applies, and it will not take into account any assumptions about symbols.

The default canonical representation applies a series of transformation to put
sums, products, numbers, roots, etc... in canonical form. Below is a list
of some of the transformations applied to obtain the canonical form:

- Idempotency: \\( f(f(x)) \to f(x) \\)
- Involution: \\( f(f(x)) \to x \\)
- Associativity: \\( f(a, f(b), c) \to f(a, b, c) \\)
- Commutativity: sorted arguments
- Some operations may be substituted with others, for example substraction
  replaced by addition. \\(1 + 2 - 3 \longrightarrow Add(1, 2, -3)\\)
- For `Add`, literal 0 is removed, small integers and small rationals are 
  added together.
- For `Multiply`, literal 1 is removed, small integers and small rations are
  multiplied together.
- For `Divide`, replaced by `Multiply` / `Power`
- For `Subtract`, replaced by `Add`
- For `Sqrt` and `Root`, replaced by `Power`
- Complex numbers with no imaginary component are replaced with a real number
- Rational numbers are reduced, the denominator is positive and not 1
- For `Power`
  - \\[x^{\tilde\infty} \longrightarrow \operatorname{NaN}\\]
  - \\[x^0 \longrightarrow 1\\]
  - \\[x^1 \longrightarrow x\\]
  - \\[(\pm 1)^{-1} \longrightarrow -1\\]
  - \\[(\pm\infty)^{-1} \longrightarrow 0\\]
  - \\[0^{\infty} \longrightarrow \tilde\infty\\]
  - \\[(\pm 1)^{\pm \infty} \longrightarrow \operatorname{NaN}\\]
  - \\[\infty^{\infty} \longrightarrow \infty\\]
  - \\[\infty^{-\infty} \longrightarrow 0\\]
  - \\[(-\infty)^{\pm \infty} \longrightarrow \operatorname{NaN}\\]


                                                                                                          
