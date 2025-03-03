---
title: Symbolic Computing
permalink: /compute-engine/guides/symbolic-computing/
layout: single
date: Last Modified
sidebar:
  - nav: 'compute-engine'
---

# Symbolic Computing

The CortexJS Compute Engine essentially perform computation by applying
rewriting rules to a MathJSON expression.

There are several categories of transformations, depending on the desired
result:

<div class=symbols-table>

| Transformation   |                                                                                                                                                                        |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canonicalize** | Put an expression in canonical ("standard") form, for easier sorting, comparing and computing.                                                                         |
| **Simplify**     | Eliminate constants and common sub-expressions. Use available assumptions to determine which rules are applicable. Limit calculations to exact results using integers. |
| **Evaluate**     | Calculate the value of an expression. Replace symbols with their value. Perform exact calculations using integers.                                                     |
| **N**            | Calculate a numeric approximation of an expression using floating point numbers.                                                                                       |

</div>

<div class="">

|                               | Canonicalize | Simplify | Evaluate |  N  |
| :---------------------------- | :----------: | :------: | :------: | :-: |
| Exact calculations            |      ✔︎      |    ✔︎    |    ✔︎    | ✔︎  |
| Use assumptions on symbols    |              |    ✔︎    |    ✔︎    | ✔︎  |
| Floating-point approximations |              |          |          | ✔︎  |

</div>

For example, if `f` is \\( 2 + (\sqrt{x^2 \times 4} + 1) \\) and `x` is 3:

<div class=symbols-table>

|                |                             |                                                              |
| :------------- | :-------------------------- | :----------------------------------------------------------- |
| `f.canonical`  | \\[ 1 + 2 + \sqrt{4x^2} \\] | Arguments sorted, distributed                                |
| `f.simplify()` | \\[ 2 + 2x \\]              | Exact calculations of some integer constants, simplification |
| `f.evaluate()` | \\[ 8 \\]                   | Evaluation of symbols                                        |

</div>

{% readmore "/compute-engine/guides/canonical-form/" %} Read more about the
<strong>Canonical Form</strong> {% endreadmore %}

{% readmore "/compute-engine/guides/simplify/" %} Read more about
<strong>Simplify</strong> {% endreadmore %}

{% readmore "/compute-engine/guides/evaluate/" %} Read more about
<strong>Evaluate</strong> {% endreadmore %}

{% readmore "/compute-engine/guides/numeric-evaluation/" %} Read more about
<strong>Numerical Evaluation</strong> {% endreadmore %}

Other operations can be performed on an expression: comparing it to a pattern,
replacing part of it, and applying conditional rewrite rules.

Functions such as `ce.box()` and `ce.parse()` require a `ComputeEngine` instance
which is denoted by a `ce.` prefix.<br>Functions that apply to a boxed
expression, such as `expr.simplify()` are denoted with a `expr.` prefix.
{.notice--info}

```ts
import { ComputeEngine } from '@cortex-js/compute-engine?module';
const ce = new ComputeEngine();
console.log(ce.parse('3x^2 + 2x^2 + x + 5').simplify().latex);
// ➔ "5x^2 + x + 5"
```

<section id='comparing'>

## Comparing Expressions

There are two useful ways to compare symbolic expressions:

- structural equality
- mathematical equality

### Structural Equality: `isSame()`

Structural equality (or syntactic equality) consider the symbolic structure used
to represent an expression. If a symbol, is it the same symbol, if a function,
does it have the same head, and are each arguments structurally equal, etc...

The `lhs.isSame(rhs)` function return true if `lhs` and `rhs` are structurally
exactly identical, that is each sub-expression is recursively identical in `lhs`
and `rhs`.

- \\(1 + 1 \\) and \\( 2 \\) are not structurally equal, one is a sum of two
  integers, the other is an integer
- \\(x + 1 \\) and \\( 1 + x \\) are not structurally equal, the order of the
  arguments is different
- \\( (x + 1)^2 \\) and \\( x^2 + 2x + 1 \\) are not structural equal, one is a
  power of a sum, the other a sum of terms.

For a less strict version of `isSame()`, you can use the canonical version of
both expressions, that is `lhs.canonical.isSame(rhs.canonical)`. In this case,
because the arguments are ordered in a standard way, the canonical form of \\(
x + 1 \\) and the canonical form of \\(1 + x \\) would be the same. However, \\(
(x + 1)^2 \\) and \\( x^2 + 2x + 1 \\) would still be considered different.

### Mathematical Equality: `isEqual()`

It turns out that comparing two arbitrary mathematical expressions is a complex
problem. In fact,
[Richardson's Theorem](https://en.wikipedia.org/wiki/Richardson%27s_theorem)
proves that it is impossible to determine if two symbolic expressions are
identical in general.

However, there are many cases where it is possible to make a comparison between
two expressions to check if they represent the same mathematical object.

The `lhs.isEqual(rhs)` function return true if `lhs` and `rhs` represent the
same mathematical object. If `lhs` and `rhs` are numeric expressions, they are
evaluated before being compared. They are considered equal if the absolute value
of the difference between them is less than `ce.tolerance`.

Note that unlike `expr.isSame()`, `expr.isEqual()` can return `true`, `false` or
`undefined`. The latter value indicates that there is not enough information to
determine if the two expressions are mathematically equal. Adding some
assumptions may result in a different answer.

### Other Comparisons

<div class=symbols-table>

|                                          |                                        |
| :--------------------------------------- | :------------------------------------- |
| `lhs === rhs`                            | If true, same box expression instances |
| `lhs.isSame(rhs)`                        | Structural equality                    |
| `lhs.isEqual(rhs)`                       | Mathematical equality                  |
| `lhs.match(rhs) !== null`                | Pattern match                          |
| `lhs.is(rhs)`                            | Synonym for `isSame()`                 |
| `ce.box(['Equal', lhs, rhs]).evaluate()` | Synonym for `isEqual()`                |
| `ce.box(['Same', lhs, rhs]).evaluate()`  | Synonym for `isSame()`                 |

</div>

</section>

## Other Symbolic Manipulation

An expression can be created from MathJSON or LaTeX, simplified, or evaluated.
An expression has many properties, such as `isZero`, `domain` or `symbol`.

{% readmore "/compute-engine/guides/expressions/" %} Read more about
<strong>Expressions</strong>, their properties and methods {% endreadmore %}

You can check if an expression match a pattern, apply a substitution to some
elements in an expression or apply conditional rewriting rules to an expression.

{% readmore "/compute-engine/guides/patterns-and-rules/" %} Read more about
<strong>Patterns and Rules</strong> for these operations {% endreadmore %}
