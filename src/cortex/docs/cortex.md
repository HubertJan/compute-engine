---
title: Cortex
permalink: /cortex/
layout: single
date: Last Modified
sidebar:
  - nav: 'cortex'
---

# Cortex

Cortex is a programming language for scientific computing built on the Cortex
Compute Engine.

The Cortex language is a work in progress. The information below reflects the
current thinking and may change.{notice--warning}

Here is "Hello World" in Cortex:

```cortex
"Hello World"
```

Here are a few more examples:

```cortex
Simplify(2 + 3x^3 + 2x^2 + x^3 + 1)
// ➔ 4x^3 + 2x^2 + 3

x = 2^11 - 1
"\(x) is a \(Domain(x))"
// ➔ "2047 is a PrimeNumber"
```

{% readmore "/cortex/syntax/" %} Read more about the <strong>formal syntax of
Cortex</strong> {% endreadmore %}

{% readmore "/cortex/implementation/" %} Read more about the
<strong>implementation of Cortex</strong> {% endreadmore %}

## Pragmas

Pragmas, or compiler directives, are annotations in the source code that provide
instructions to the parser/compiler about how to interpret the source code.
These instructions are executed during the parsing/compilation phase, not during
the execution phase.

### Environment Variables

Environment variables are defined in the execution environment of the compiler
process when executed from a `node` process. In Unix, they are set using a
shell-specific syntax (`export VARIABLE=value` in bash shells, for example).

Environment variables are not available when the compilation/parsing is taking
place in a browser process.

**To access an environment variable**, use the `#env()` pragma.

```cortex
#env("DEBUG")
```

Some common environment variables include:

- `NO_COLOR`: if set, color output to the terminal should be avoided
- `TERM`: describe the capabilities of the output terminal, e.g.
  `xterm-256color`
- `HOME`: path to the user home directory
- `TEMP`: path to a temporary file directory

### Navigator Properties

The navigator properties are available when the compilation/parsing is taking
place in a browser process.

**To access the properties of the `navigator` JavaScript global object**, use
the `#navigator()` pragma function. It returns 'Nothing' if the property is not
available.

```cortex
#navigator("userAgent")
```

### Compile-Time Diagnostic Statement

A compile-time diagnostic statement causes the compiler to emit an error or a
warning during compilation.

**To output a message to the console and immediately interrupt the
parsing/compilation**, use the `#error()` pragma function.

```cortex
#error("File cannot be compiled")
```

**To output a message to the console**, but continue the parsing/compilation,
use the `#warning()` pragma function.

```cortex
#warning("TODO: Implement function")
```

### Line Control Statements

The name and URL of the source file being parsed/compiled can be accessed using
the `#sourceFile` and `#sourceUrl` pragmas. The current line is indicated by
`#line` and column by `#column`.

When generating and pre-processing code, it might be useful to indicate the
original source code and location, rather than the current one. To change the
source URL and line of the current file, use the `#sourceLocation()` pragma
function.

```cortex
#sourceLocation(145, "file://localhost/~user/dev/source.ctx")
```

**To number the following line to 146**, use:

```cortex
#sourceLocation(145)
```

**To reset the source location to the actual source and line**, use
`#sourceLocation()`.

### Other Pragmas

The following pragmas are replaced with the indicated value:

- `#line`: the current source line number, which is either the actual source
  line number, or as calculated based on `#sourceLocation()`. The first line is
  line 1.
- `#column`: the current column number. The first column is column 1.
- `#url`: the URL of the current source file.
- `#filename`: the filename of the current source file.
- `#date`: the current date in the `YYYY-MM-DD` format.
- `#time`: the current time in the `HH:MM:SS` format.

## Comments

**Line Comments** start with `//`. Everything after a `//` is ignored until the
end of the line.

**Block (multi-line) Comments** start with `/*` and end with `*/`. Block
comments can be nested.

**To indicate that a comment is part of the documentation and is formatted using
markdown**, use `///` for single line comments and `/** */` for block comments.

**Hashbang Comment** can be included as the first line of a Cortex source file
prefixed with `#!`. Its content indicate the command line interpreter to use:

```
#!/usr/bin/cortex
```

## Strings

### Single Line String

A single-line string is delimited by a `"` character (**U+0022 QUOTATION
MARK**).

A single-line string cannot include an unescaped `"` (**U+0022 QUOTATION
MARK**), an unescaped backslash `\` (**U+005C REVERSE SOLIDUS**), or an
unescaped **new line character** (**U+00A LINE FEED**, **U+00D CARRIAGE
RETURN**, **U+2028 LINE SEPARATOR** or **U+2029 PARAGRAPH SEPARATOR**).

### Escape Sequence

Inside a string, backslash `\` (**U+005C REVERSE SOLIDUS**) is the escape
character:

- `\0` is the NULL character (**U+0000**)
- `\\` is a backslash character
- `\'` is a single quote character
- `\"` is a quotation mark
- `\t` is a tab character
- `\n` is a line feed character
- `\r` is a carriage return character
- `\u0061` is the Unicode character **U+0061 LATIN SMALL LETTER A**. In this
  form, the `\u` must be followed by exactly 4 hex-digits.
- `\u{61}` is the Unicode character **U+0061 LATIN SMALL LETTER A**. In this
  form, a string of 0 to 8 hex-digits must be included between `\u{` and `}.

### Multi-line String Literals

A multiline string is delimited by `"""` (three quotation marks).

````cortex
cortex = """
      ,ad8888ba,
    d8"'    `"8b                             ,d
    d8'                                       88
    88              ,adPPYba,   8b,dPPYba,  MM88MMM   ,adPPYba,  8b,     ,d8
    88             a8"     "8a  88P'   "Y8    88     a8P_____88   `Y8, ,8P'
    Y8,            8b       d8  88            88     8PP"""""""     )888(
    Y8a.    .a8P  "8a,   ,a8"  88            88,    "8b,   ,aa   ,d8" "8b,
      `"Y8888Y"'    `"YbbdP"'   88            "Y888   `"Ybbd8"'  8P'     `Y8
    """
```

A multiline string can contain `"` or new line characters. It can't contain an
unescaped sequence of `"""`.

Anything after the `"""` that begins the multiline string literal and before the
end of the line is ignored. The line break after the `"""` isn’t part of the
string.

The line break before the `"""` that ends the literal is also not part of the
string. To make a multiline string literal that begins or ends with a line feed,
write a blank line as its first or last line.

A multiline string literal can be indented using any combination of spaces and
tabs; this indentation isn’t included in the string. The `"""` that ends the
literal determines the indentation: Every nonblank line in the literal must
begin with exactly the same indentation that appears before the closing `"""`;
there’s no conversion between tabs and spaces. You can include additional spaces
and tabs after that indentation; those spaces and tabs appear in the string.

Line breaks in a multiline string literal are normalized to use the line feed
character. Even if your source file has a mix of carriage returns and line
feeds, all of the line breaks in the string will be the same.

If a line of a multiline string ends with a `\` character, the next line is
considered a continuation and the string will include neither the `\` nor the
new line characters. Any whitespace between the backslash and the line break is
also omitted.This can come in handy when using a very long string.

```cortex
hello = "Hello \
World"  // Same as "Hello World"
````

```cortex
hello2 = """
Hello
World
""" // Same as "Hello\nWorld"

hello3 = """
    Hello
    World
    """ // Same as "Hello\nWorld"
```

If there is some whitespace before the final `"""`, this whitespace will be
excluded from all the lines before it.

### Interpolated Strings

A single-line string or a multiline string can include interpolated expressions
that are indicated by an expression in parentheses after a backslash (**U+005C
REVERSE SOLIDUS**). The interpolated expression can contain a string literal,
but can’t contain an unescaped backslash, or a **new line character** (**U+000A
LINE FEED**, **U+000D CARRIAGE RETURN**, **U+2028 LINE SEPARATOR**, **U+2029
PARAGRAPH SEPARATOR**)

```cortex
"1 2 3"
"1 2 \("3")"
"1 2 \(3)"
"1 2 \(1 + 2)"
```

### Extended String Literal

A string literal which contains no escape sequences is delimited by one or more
'#' and a quotation mark.

```
#"There is no escaping now"#
#"Using "quotation marks" and \ without escaping"#
##"As many # as one needs"##
```

These string as useful for string containing characters such as quotation mark
or backslash that would otherwise need to be escaped, leading to the
[Leaning Tootpick Syndrome](https://en.wikipedia.org/wiki/Leaning_toothpick_syndrome).

## Symbols

**Symbols** are strings of Unicode characters, except for the prohibited
characters described below.

Before they are used, symbols are normalized to the
[Unicode Normalization Form Canonical Composition (NFC)](http://www.macchiato.com/unicode/nfc-faq).
They are stored internally and compared using the NFC.

These 6 expressions represent the same symbol: once the escape sequences are
resolved and after applying the Unicode NFC, the symbol name is the single
Unicode character **U+00C5 LATIN CAPITAL LETTER A WITH RING ABOVE**.

```cortex
`Å`
`\u00c5`
`\u212b`
`A\u030a`
`\u0041\u030a`
```

### Prohibited Symbol Characters

The name of a symbol cannot contain any of the following characters:

- **U+0000** to **U+0020**
- **U+0022 QUOTATION MARK**: **`"`**
- **U+0060 GRAVE ACCENT** backtick : **`` ` ``**
- **U+2028 LINE SEPARATOR**
- **U+2029 PARAGRAPH SEPARATOR**
- **U+FEFF BYTE ORDER MARK**
- **U+FFFE** Invalid Byte Order Mark

In addition, the first character of a symbol cannot be:

- **U+0021 EXCLAMATION MARK** : **`!`**
- **U+0023 NUMBER SIGN** : **`#`**
- **U+0024 DOLLAR SIGN** : **`$`**
- **U+0025 PERCENT** : **`%`**
- **U+0026 AMPERSAND** : **`&`**
- **U+0027 APOSTROPHE** : **`'`**
- **U+0028 LEFT PARENTHESIS** : **`(`**
- **U+0029 RIGHT PARENTHESIS** : **`)`**
- **U+002E FULL STOP** : **`'`**
- **U+003A COLON** : **`:`**
- **U+003C LESS THAN SIGN** : **`:`**
- **U+003F QUESTION MARK** : **`?`**
- **U+0040 COMMERCIAL AT** : **`@`**
- **U+005B LEFT SQUARE BRACKET** : **`[`**
- **U+005D RIGHT SQUARE BRACKET** : **`]`**
- **U+005E CIRCUMFLEX ACCENT** : **`^`**
- **U+007B LEFT CURLY BRACKET** : **`{`**
- **U+007D RIGHT CURLY BRACKET** : **`}`**
- **U+007E TILDE** : **`~`**

### Verbatim Form

The Verbatim Form must be used if:

- the first character of the symbol name is a decimal digit: **U+0030** to
  **U+0039** (0-9) or **U+FF10** to **U+FF19** (**FULLWIDTH DIGIT ZERO** to
  **FULLWIDTH DIGIT NINE**)
- the symbol name includes a character with the **White_Space** or the
  **Pattern_Syntax** Unicode property

  Characters with the **White_Space** property include:

  - **U+0020 SPACE**
  - **U+0009 HORIZONTAL TABULATION**
  - **U+000D CARRIAGE RETURN**
  - **U+000A LINE FEED**

  Characters with the **Pattern_Syntax** property include:
  `!"#$%&'()*+,-./:;>=<?@[\\]^|{}~`.

  See the
  [Unicode Character Database](https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt)
  for a complete list of the characters with the **White_Space** or
  **Pattern_Syntax** property.

- the symbol name is a reserved word

  **Reserved words** are: `abstract`, `at`, `and`, `as`, `assert`, `await`,
  `begin`, `break`, `case`, `catch`,`class`, `const`, `continue`,`debugger`,
  `default`, `delete`, `dynamic`, `do`, `each`, `else`, `end`, `export`,
  `extern`, `finally`, `for`, `from`, `function`, `get`, `global`, `goto`, `if`,
  `in`, `inline`, `interface`, `internal`, `import`, `label`, `lazy`, `local`,
  `loop`, `match`, `module`, `namespace`, `native`, `new`, `not`, `of`, `on`,
  `optional`, `or`, `package`, `private`, `protected`, `protocol`, `public`,
  `repeat`, `return`, `self`, `set`, `static`, `super`, `switch`, `this`,
  `throw`, `to`, `try`, `until`, `using`, `var`, `warn`, `when`, `where`,
  `while`, `with`, `xor`, `yield`.

**To write a symbol with the _Verbatim Form_** , put a backtick **`` ` ``**
(**U+0060 GRAVE ACCENT**) before and after its name.

The string between the two backticks can be a reserved word or it can include
characters with the **Pattern_Syntax** property or the **White_Space** property,
except for prohibited symbol characters.

The string between the two ticks can include the same escape character sequences
as in a string.

The following characters must be escaped: **U+000A LINE FEED**, **U+000D
CARRIAGE RETURN**, **U+2028 LINE SEPARATOR**, **U+2029 PARAGRAPH SEPARATOR**.

```cortex
`Hello World`
`new`
`\u{2135}0`  // same as `ℵ0` (Alef symbol)
`\u21350`  // same as `ℵ0` (Alef symbol)
```

## Numbers

Numbers can be written as:

- A decimal number, with no prefix
- A binary number, with a `0b` prefix
- A hexadecimal number, with a `0x` prefix

**Decimal digits** include **U+0030** to **U+0039** (0-9) and **U+FF10** to
**U+FF19** (**FULLWIDTH DIGIT ZERO** to **FULLWIDTH DIGIT NINE**).

Hexadecimal digits include decimal digits and **a** to **f** and **A** to **F**.

Decimal floating point numbers can include an exponent indicated by an uppercase
or lowercase letter `e`. This exponent is a power of 10. The value of the
exponent is a decimal integer.

Hexadecimal floats **must** have an exponent, indicated by an uppercase or
lowercase `p`. This exponent is a power of 2. The value of the exponent is a
decimal integer.

- `1.25e2` means $$1.25 \times 10^2$$, or $$125.0$$.
- `1.25e-2` means $$1.25 \times 10^{-2}$$, or $$0.0125$$.
- `0xFp2` means $$15 \times 2^2$$, or $$60.0$$.
- `0xFp-2` means $$15 \times 2^{-2}$$, or $$3.75$$.

The hexadecimal float format is documented in
[the C99 standard](http://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf)
(p.57-58). {.notice--info}

Numeric literals can contain extra formatting to make them easier to read. Both
integers and floats can be padded with extra zeros and can contain underscores
to help with readability. Neither type of formatting affects the underlying
value of the literal.

```cortex
+03.14_15_92_65
```

## Operators

Most operators are infix operators: they have two operands, a left-hand side
(lhs) operand and a right-hand side operand (rhs).

An infix operator can either have whitespace before and after the operator or
have no whitespace neither before nor after the operator.

Infix operators have a precedence that indicate how strongly they bind to their
operand and a left or right associativity.

A few operators are prefix operators: they only have a right-hand side. Prefix
operators are followed immediately by their operand: they cannot be separated by
whitespace.

The whitespace rules are necessary to support unambiguous parsing of expressions
spanning multiple lines without requiring a separator between expressions
{.notice--info}

### Arithmetic Operations

- `+`, `-`, `/`, `*`, `^`
- `<`, `<=`, `=`, `>=`, '`>`, '!='
- `==`, '!=='

### Logic Operations

- `and`, `or`, `not`, `=>`, `<=>`

## Functions

## Collections

### Tuples

### Dictionaries

A dictionary is a collection of set of key/value pairs separated with a comma
(`,`) and surrounded by curly brackets.

Elements in a dictionary are not ordered and the keys are unique. They are
iterable and indexable by the key value.

A key/value pair is a string, followed by `->` and by an expression. If the
string does not contain a character with a _White_Space_ or _Pattern_Syntax_
Unicode property the quotation mark around the string can be omitted. Note that
if the quotation mark is omitted the character escape sequences are not applied.

```cortex
{one -> 1, two -> 2}
{"one" -> 1, "two" -> 2}
```

The empty dictionary is `{->}`.

### Lists

A list is a collection of expressions separated with a comma `,` and surrounded
by square brackets: `[` and `]`

Elements in a list are ordered and don't have to be unique. They are iterable
and indexable with a numeric value (their order in the list, start with 0).

```cortex
[3, 5, 7, 11]
[3, 3 + 5, 3 + + 7, 3 + 5 + 7 + 11]
```

The empty list is `[]`.

### Sets

A set is a collection of expressions surrounded by curly brackets: `{` and `}`.

Elements in a set are not ordered and must be unique. They are iterable but they
are not indexable.

The empty set is `{}`.

## Flow Control
