import { Expression } from '../../../math-json/math-json-format';
import {
  machineValue,
  ROOT,
  SQRT,
  NEGATE,
  SUBTRACT,
  ADD,
  MULTIPLY,
  DIVIDE,
  isNumberObject,
  POWER,
  LIST,
  COMPLEX_INFINITY,
  PI,
  EXPONENTIAL_E,
  IMAGINARY_UNIT,
  applyAssociativeOperator,
  rationalValue,
  op,
  nops,
  head,
  tail,
} from '../../../math-json/utils';
import { Serializer, Parser, LatexDictionary } from '../public';
import { getFractionStyle, getRootStyle } from '../serializer-style';
import { joinLatex } from '../tokenizer';

/**
 * If expression is a product, collect all the terms with a
 * negative exponents in the denominator, and all the terms
 * with a positive exponent (or no exponent) in the numerator.
 */
function numeratorDenominator(expr: Expression): [Expression[], Expression[]] {
  if (head(expr) !== 'Multiply') return [[], []];
  const numerator: Expression[] = [];
  const denominator: Expression[] = [];
  const args = tail(expr);
  for (const arg of args) {
    if (head(arg) === 'Power') {
      if (head(op(arg, 2)) === 'Negate') {
        const a = op(arg, 1) ?? 'Missing';
        const b = op(op(arg, 2), 1) ?? 'Missing';
        denominator.push([POWER, a, b]);
      } else {
        const exponentVal = machineValue(op(arg, 2)) ?? NaN;
        if (exponentVal === -1) {
          denominator.push(op(arg, 1) ?? 'Missing');
        } else if (exponentVal < 0) {
          denominator.push([POWER, op(arg, 1) ?? 'Missing', -exponentVal]);
        } else {
          numerator.push(arg);
        }
      }
    } else {
      numerator.push(arg);
    }
  }
  return [numerator, denominator];
}

function parseRoot(parser: Parser): Expression | null {
  const degree = parser.matchOptionalLatexArgument();
  const base = parser.matchRequiredLatexArgument();
  if (base === null) {
    if (degree !== null) return [ROOT, 'Missing', degree];
    return [SQRT, 'Missing'];
  }
  if (degree !== null) return [ROOT, base, degree];
  return [SQRT, base];
}

function serializeRoot(
  serializer: Serializer,
  style: 'radical' | 'quotient' | 'solidus',
  base: Expression | null,
  degree: Expression | null
): string {
  if (base === null) return '\\sqrt{}';
  degree = degree ?? 2;
  if (style === 'solidus') {
    return (
      serializer.wrapShort(base) + '^{1\\/' + serializer.serialize(degree) + '}'
    );
  } else if (style === 'quotient') {
    return (
      serializer.wrapShort(base) +
      '^{\\frac{1}{' +
      serializer.serialize(degree) +
      '}}'
    );
  }

  const degreeValue = machineValue(degree);
  if (degreeValue === 2) {
    return '\\sqrt{' + serializer.serialize(base) + '}';
  }

  // It's the n-th root
  return (
    '\\sqrt[' +
    serializer.serialize(degree) +
    ']{' +
    serializer.serialize(base) +
    '}'
  );
}

function serializeAdd(serializer: Serializer, expr: Expression): string {
  // "add" doesn't increase the "level" for styling purposes
  // so, preventively decrease it now.
  serializer.level -= 1;

  const name = head(expr);
  let result = '';
  let arg = op(expr, 1);
  let argWasNumber = !Number.isNaN(machineValue(arg) ?? NaN);
  if (name === NEGATE) {
    result = '-' + serializer.wrap(arg, 276);
  } else if (name === ADD) {
    result = serializer.serialize(arg);
    const last = nops(expr) + 1;
    for (let i = 2; i < last; i++) {
      arg = op(expr, i);
      const val = machineValue(arg) ?? NaN;
      const argIsNumber = !Number.isNaN(val);
      let done = false;
      if (arg !== null) {
        if (argWasNumber) {
          // Check if we can convert to an invisible plus, e.g. "1\frac{1}{2}"
          const [numer, denom] = rationalValue(arg);
          if (numer !== null && denom !== null) {
            if (isFinite(numer) && isFinite(denom) && denom !== 1) {
              // Don't include the '+' sign, it's a rational, use 'invisible plus'
              result +=
                serializer.options.invisiblePlus + serializer.serialize(arg);
              done = true;
            }
          }
        }
      }
      if (!done) {
        if (val < 0) {
          // Don't include the minus sign, it will be serialized for the arg
          result += serializer.serialize(arg);
        } else if (head(arg) === 'Negate') {
          result += serializer.wrap(arg, 275);
        } else {
          const term = serializer.wrap(arg, 275);
          if (term[0] === '-' || term[0] === '+') {
            result += term;
          } else {
            result = result + '+' + term;
          }
        }
      }
      argWasNumber = argIsNumber;
    }
  } else if (name === SUBTRACT) {
    const arg2 = op(expr, 2);
    if (arg2 !== null) {
      result = serializer.wrap(arg, 275) + '-' + serializer.wrap(arg2, 275);
    } else {
      result = serializer.wrap(arg, 275);
    }
  }

  // Restore the level
  serializer.level += 1;

  return result;
}

function serializeMultiply(
  serializer: Serializer,
  expr: Expression | null
): string {
  if (expr === null) return '';

  // "Multiply" doesn't increase the "level" for styling purposes
  // so, preventively decrease it now.
  serializer.level -= 1;

  let result = '';

  //
  // Is it a fraction?
  // (i.e. does it have a denominator, i.e. some factors with a negative power)
  //
  const [numer, denom] = numeratorDenominator(expr);
  if (denom.length > 0) {
    if (denom.length === 1 && denom[0] === 1) {
      if (numer.length === 0) {
        result = '1';
      } else if (numer.length === 1) {
        result = serializer.serialize(numer[0]);
      } else {
        result = serializeMultiply(serializer, [MULTIPLY, ...numer]);
      }
    } else {
      result = serializer.serialize([
        DIVIDE,
        numer.length === 1 ? numer[0] : [MULTIPLY, ...numer],
        denom.length === 1 ? denom[0] : [MULTIPLY, ...denom],
      ]);
    }
  }
  if (result) {
    // Restore the level
    serializer.level += 1;
    return result;
  }

  let isNegative = false;
  let arg: Expression | null = null;
  const count = nops(expr) + 1;
  let prevWasNumber = false;
  for (let i = 1; i < count; i++) {
    arg = op(expr, i);
    if (arg === null) continue;
    let term: string;
    //
    // 1. Should the terms be separated by an explicit MULTIPLY?
    //
    if (typeof arg === 'number' || isNumberObject(arg)) {
      term = serializer.serialize(arg);
      if (term === '-1' && !result) {
        result = '-';
      } else {
        if (term[0] === '-') {
          term = term.slice(1);
          isNegative = !isNegative;
        }
        result = !result
          ? term
          : joinLatex([result, serializer.options.multiply, term]);
      }
      prevWasNumber = true;
      continue;
    }

    if (head(arg) === 'Power') {
      // It's a power with a fractional exponent,
      // it's a nth-root
      const [n, d] = rationalValue(op(arg, 2) ?? NaN);
      if (n === 1 && d !== null) {
        result += serializeRoot(
          serializer,
          getRootStyle(arg, serializer.level),
          op(arg, 1),
          d
        );
        prevWasNumber = false;
        continue;
      }
    }

    if (head(arg) === 'Power' && !isNaN(machineValue(op(arg, 1)) ?? NaN)) {
      // It's a power and the base is a number...
      // add a multiply...
      term = serializer.serialize(arg);
      result = !result
        ? term
        : joinLatex([result, serializer.options.multiply, term]);
      prevWasNumber = true;
      continue;
    }

    if (head(arg) === 'Negate') {
      arg = op(arg, 1);
      isNegative = !isNegative;
    }
    // 2.1 Wrap the term if necessary
    // (if it's an operator of precedence less than 390)
    term = serializer.wrap(arg, 390);

    // 2.2. The terms can be separated by an invisible multiply.
    if (!result) {
      // First term
      result = term;
    } else {
      const h = head(arg);
      if (prevWasNumber && (h === 'Divide' || h === 'Rational')) {
        // Can't use an invisible multiply if a number
        // multiplied by a fraction
        result = joinLatex([result, serializer.options.multiply, term]);
      }
      // Not first term, use invisible multiply
      else if (!serializer.options.invisibleMultiply) {
        // Replace, joining the terms correctly
        // i.e. inserting a space between '\pi' and 'x'
        result = joinLatex([result, term]);
      } else {
        result = joinLatex([
          result,
          serializer.options.invisibleMultiply,
          term,
        ]);
      }
    }
    prevWasNumber = false;
  }

  // Restore the level
  serializer.level += 1;

  return isNegative ? '-' + result : result;
}

function parseFraction(parser: Parser): Expression | null {
  const numer = parser.matchRequiredLatexArgument() ?? 'Missing';
  const denom = parser.matchRequiredLatexArgument() ?? 'Missing';
  if (
    head(numer) === 'PartialDerivative' &&
    (head(denom) === 'PartialDerivative' ||
      (head(denom) === 'Multiply' &&
        head(op(denom, 1)) === 'PartialDerivative'))
  ) {
    // It's a Leibniz notation partial derivative
    // `∂f(x)/∂x` or `∂^2f(x)/∂x∂y` or `∂/∂x f(x)`
    const degree: Expression = op(numer, 3) ?? 'Missing';
    // Expect: getArg(numer, 2) === 'Nothing' -- no args
    let fn = op(numer, 1);
    if (fn === null || fn === 'Missing') {
      fn = parser.matchExpression() ?? 'Missing';
    }

    let vars: Expression[] = [];
    if (head(denom) === 'Multiply') {
      // ?/∂x∂y
      for (const arg of tail(denom)) {
        if (head(arg) === 'PartialDerivative') {
          const v = op(arg, 2);
          if (v) vars.push(v);
        }
      }
    } else {
      // ?/∂x
      const v = op(denom, 2);
      if (v) vars.push(v);
    }
    if (vars.length > 1) {
      vars = [LIST, ...vars];
    }

    return [
      'PartialDerivative',
      fn,
      ...vars,
      degree === 'Missing' ? 1 : degree,
    ];
  }

  return [DIVIDE, numer, denom];
}

function serializeFraction(
  serializer: Serializer,
  expr: Expression | null
): string {
  // console.assert(getFunctionName(expr) === DIVIDE);
  if (expr === null) return '';

  const numer = op(expr, 1) ?? 'Missing';
  const denom = op(expr, 2) ?? 'Missing';

  if (nops(expr) === 1) return serializer.serialize(numer);
  const style = getFractionStyle(expr, serializer.level);
  if (style === 'inline-solidus' || style === 'nice-solidus') {
    const numerStr = serializer.wrapShort(numer);
    const denomStr = serializer.wrapShort(denom);

    if (style === 'inline-solidus') return `${numerStr}\\/${denomStr}`;
    return `^{${numerStr}}\\!\\!/\\!_{${denomStr}}`;
  } else if (style === 'reciprocal') {
    return serializer.wrap(numer) + serializer.wrap(denom) + '^{-1}';
  } else if (style === 'factor') {
    return (
      '\\frac{1}{' + serializer.serialize(denom) + '}' + serializer.wrap(numer)
    );
  }
  // Quotient (default)
  const numerLatex = serializer.serialize(numer);
  const denomLatex = serializer.serialize(denom);
  return `\\frac{${numerLatex}}{${denomLatex}}`;
}

function serializePower(
  serializer: Serializer,
  expr: Expression | null
): string {
  const name = head(expr);
  const arg1 = op(expr, 1) ?? 'Missing';
  const arg2 = op(expr, 2) ?? 'Missing';

  if (name === 'Sqrt') {
    return serializeRoot(
      serializer,
      getRootStyle(expr, serializer.level),
      arg1,
      2
    );
  }
  if (name === 'Root')
    return serializeRoot(
      serializer,
      getRootStyle(expr, serializer.level),
      arg1,
      arg2
    );

  const val2 = machineValue(arg2) ?? 1;
  if (val2 === -1) {
    return serializer.serialize([DIVIDE, '1', arg1]);
  } else if (val2 < 0) {
    return serializer.serialize([DIVIDE, '1', [POWER, arg1, -val2]]);
  } else if (head(arg2) === 'Divide' || head(arg2) === 'Rational') {
    if (machineValue(op(arg2, 1)) === 1) {
      // It's x^{1/n} -> it's a root
      const style = getRootStyle(expr, serializer.level);
      return serializeRoot(serializer, style, arg1, op(arg2, 2));
    }
  } else if (head(arg2) === POWER) {
    if (machineValue(op(arg2, 2)) === -1) {
      // It's x^{n^-1} -> it's a root
      const style = getRootStyle(expr, serializer.level);
      return serializeRoot(serializer, style, arg1, op(arg2, 1));
    }
  }
  return serializer.wrapShort(arg1) + '^{' + serializer.serialize(arg2) + '}';
}

export const DEFINITIONS_ARITHMETIC: LatexDictionary = [
  // Constants
  { name: 'CatalanConstant', serialize: 'G' },
  { name: 'GoldenRatio', serialize: '\\varphi' },
  { name: 'EulerGamma', serialize: '\\gamma' },
  { name: 'Degrees', serialize: '\\frac{\\pi}{180}' },
  {
    trigger: ['\\infty'],
    parse: { num: '+Infinity' },
  },
  {
    name: COMPLEX_INFINITY,
    trigger: ['\\tilde', '\\infty'],
    serialize: '\\tilde\\infty',
  },
  {
    trigger: ['\\tilde', '<{>', '\\infty', '<}>'],
    parse: COMPLEX_INFINITY,
  },
  { name: PI, trigger: ['\\pi'] },
  { trigger: ['π'], parse: 'Pi' },
  { name: EXPONENTIAL_E, trigger: ['e'], serialize: 'e' },
  {
    trigger: ['\\mathrm', '<{>', 'e', '<}>'],
    parse: EXPONENTIAL_E,
  },
  {
    trigger: ['\\exponentialE'],
    parse: EXPONENTIAL_E,
  },
  {
    name: IMAGINARY_UNIT,
    trigger: ['\\imaginaryI'],
  },
  {
    trigger: ['i'],
    parse: IMAGINARY_UNIT,
  },
  {
    trigger: ['\\mathrm', '<{>', 'i', '<}>'],
    parse: IMAGINARY_UNIT,
  },

  // Operations
  // {
  //   /** Could be the determinant if the argument is a matrix */
  //   /** @todo: domain check */
  //   /** If a literal matrix, the `serialize` should be custom, the parens are
  //    * replaced with bars */
  //   name: 'Abs',
  //   kind: 'matchfix',
  //   openDelimiter: '|',
  //   closeDelimiter: '|',
  // },
  {
    name: 'Add',
    trigger: ['+'],
    kind: 'infix',
    associativity: 'both',
    precedence: 275,
    parse: (parser, until, lhs) => {
      if (275 < until.minPrec) return null;

      const rhs = parser.matchExpression({ ...until, minPrec: 275 });
      if (rhs === null) return null;

      return applyAssociativeOperator('Add', lhs, rhs);
    },
    serialize: serializeAdd,
  },
  {
    kind: 'prefix',
    trigger: ['+'],
    precedence: 275,
    parse: (parser, until) => {
      if (275 < until.minPrec) return null;
      return parser.matchExpression({ ...until, minPrec: 400 });
    },
  },
  // {
  //   name: 'Ceil',
  //   kind: 'matchfix',
  //   openDelimiter: '\\lceil',
  //   closeDelimiter: '\\rceil',
  // },
  {
    name: 'Complex',
    precedence: 274, // Same precedence as `Add`: used for correct wrapping
    serialize: (serializer: Serializer, expr: Expression): string => {
      const re = machineValue(op(expr, 1));
      const im = machineValue(op(expr, 2));
      if (im === 0) return serializer.serialize(op(expr, 1));

      const imPart =
        im === 1
          ? '\\imaginaryI'
          : im === -1
          ? '-\\imaginaryI'
          : joinLatex([serializer.serialize(op(expr, 2)), '\\imaginaryI']);
      if (re === 0) return imPart;
      if (im !== null && im < 0)
        return joinLatex([serializer.serialize(op(expr, 1)), imPart]);

      return joinLatex([serializer.serialize(op(expr, 1)), '+', imPart]);
    },
  },
  {
    name: 'Divide',
    trigger: ['\\frac'],
    requiredLatexArg: 2,
    precedence: 660,
    // For \frac specifically, not for \div, etc..
    // handles Leibnitz notation for partial derivatives
    parse: parseFraction,
    serialize: serializeFraction,
  },
  {
    trigger: ['\\/'],
    kind: 'infix',
    associativity: 'non',
    precedence: 660, // ??? MathML has 265, but it's wrong.
    // It has to be at least higher than multiply
    // e.g. `1/2+3*x` -> `1/2 + 3*x` , not `1/(2+3*x)`
    parse: 'Divide',
  },
  {
    trigger: ['/'],
    kind: 'infix',
    associativity: 'non',
    precedence: 660,
    parse: 'Divide',
  },
  {
    trigger: ['\\div'],
    kind: 'infix',
    associativity: 'non',
    precedence: 660, // ??? according to MathML
    parse: 'Divide',
  },
  {
    name: 'Exp',
    serialize: (serializer: Serializer, expr: Expression): string =>
      joinLatex([
        '\\exponentialE^{',
        serializer.serialize(op(expr, 1) ?? 'Missing'),
        '}',
      ]),
  },
  {
    name: 'Factorial',
    trigger: ['!'],
    kind: 'postfix',
    precedence: 810,
  },
  {
    name: 'Factorial2',
    trigger: ['!', '!'],
    kind: 'postfix',
    precedence: 810,
  },
  // {
  //   name: 'Floor',
  //   kind: 'matchfix',
  //   openDelimiter: '\\lfloor',
  //   closeDelimiter: '\\rfloor',
  // },
  {
    trigger: '\\operatorname{floor}',
    parse: (parser) => {
      const arg = parser.matchArguments('enclosure');
      return arg === null ? null : (['Floor', ...arg] as Expression);
    },
  },
  {
    name: 'Gcd',
    trigger: '\\operatorname{gcd}',
    parse: (parser) => {
      const arg = parser.matchArguments('enclosure');
      return arg === null ? null : (['Gcd', ...arg] as Expression);
    },
    serialize: (serializer, expr): string =>
      joinLatex([
        '\\operatorname{gcd}',
        '\\left(',
        serializer.serialize(expr),
        '\\right)',
      ]),
  },
  {
    name: 'Half',
    serialize: '\\frac12',
  },
  {
    name: 'Lcm',
    trigger: '\\operatorname{lcm}',
    // @todo!
  },

  {
    name: 'MinusPlus',
    trigger: ['\\mp'],
    kind: 'infix',
    associativity: 'both',
    precedence: 270,
  },
  {
    name: MULTIPLY,
    trigger: ['\\times'],
    kind: 'infix',
    associativity: 'both',
    precedence: 390,
    serialize: serializeMultiply,
  },
  {
    trigger: ['\\cdot'],
    kind: 'infix',
    associativity: 'both',
    precedence: 390,
    parse: (parser, terminator, lhs) => {
      if (391 < terminator.minPrec) return null;
      const rhs = parser.matchExpression({ ...terminator, minPrec: 392 });
      if (rhs === null) return null;

      return applyAssociativeOperator('Multiply', lhs, rhs);
    },
  },
  {
    trigger: ['*'],
    kind: 'infix',
    associativity: 'both',
    precedence: 390,
    parse: (parser, terminator, lhs) => {
      if (391 < terminator.minPrec) return null;
      const rhs = parser.matchExpression({ ...terminator, minPrec: 392 });
      return rhs === null ? null : ['Multiply', lhs, rhs];
    },
  },
  {
    name: NEGATE,
    trigger: ['-'],
    kind: 'prefix',
    parse: (parser, terminator) => {
      if (276 < terminator.minPrec) return null;
      const rhs = parser.matchExpression({ ...terminator, minPrec: 400 });
      return rhs === null ? null : ([NEGATE, rhs] as Expression);
    },
    precedence: 275,
  },
  // {
  //   /** If the argument is a vector */
  //   /** @todo: domain check */
  //   name: 'Norm',
  //   kind: 'matchfix',
  //   openDelimiter: '|',
  //   closeDelimiter: '|',
  // },
  // {
  //   /** If the argument is a set */
  //   /** @todo: domain check */
  //   name: 'Cardinality',
  //   kind: 'matchfix',
  //   openDelimiter: '|',
  //   closeDelimiter: '|',
  // },
  // {
  //   /** If the argument is a vector */
  //   /** @todo: domain check */
  //   name: 'Norm',
  //   kind: 'matchfix',
  //   openDelimiter: '||',
  //   closeDelimiter: '||',
  // },
  {
    name: 'PlusMinus',
    trigger: ['\\pm'],
    kind: 'infix',
    associativity: 'both',
    precedence: 270,
  },
  {
    name: POWER,
    trigger: ['^'],
    kind: 'infix',
    serialize: serializePower,
  },
  // {
  //   trigger: ['*', '*'],
  //   kind: 'infix',
  //   associativity: 'non',
  //   precedence: 720,
  // },
  {
    name: 'Rational',
    precedence: 660,
    serialize: serializeFraction,
  },
  {
    name: ROOT,
    serialize: serializePower,
  },
  {
    name: 'Round',
    trigger: '\\operatorname{round}',
    // @todo parse args
  },
  {
    name: 'Square',
    precedence: 720,
    serialize: (serializer, expr) => serializer.wrapShort(op(expr, 1)) + '^2',
  },
  {
    name: 'Sign',
    // As per ISO 80000-2, "signum" is 'sgn'
    trigger: '\\operatorname{sgn}',
    // @todo parse args
  },
  {
    name: SQRT,
    trigger: ['\\sqrt'],
    optionalLatexArg: 1,
    requiredLatexArg: 1,
    parse: parseRoot,
    serialize: serializePower,
  },
  {
    name: SUBTRACT,
    trigger: ['-'],
    kind: 'infix',
    associativity: 'both',
    precedence: 275,
    parse: (parser, terminator, lhs) => {
      if (276 < terminator.minPrec) return null;
      const rhs = parser.matchExpression({ ...terminator, minPrec: 277 });
      return rhs === null ? null : ([SUBTRACT, lhs, rhs] as Expression);
    },
  },
];
