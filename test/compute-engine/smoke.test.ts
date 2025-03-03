/**
 * This file contains a series of lightweight tests. More exhaustive tests
 * are included in the `./test/compute-engine` and
 * `./test/latex-syntax` directories.
 *
 * They are divided in:
 * - boxing (MathJSON to boxed expressions)
 * - parsing (LaTeX to boxed expressions)
 * - serializing (boxed expressions to Latex)
 * - canonicalization
 * - simplification
 * - symbolic evaluation
 * - numerical evaluation
 */

import { Expression } from '../../src/math-json/math-json-format';
import {
  boxToJson,
  canonical,
  canonicalToJson,
  engine,
  evaluateToJson,
  expand,
  latex,
  N,
  NToJson,
  parse,
  parseToJson,
  simplify,
  simplifyToJson,
} from '../utils';

const ce = engine;

console.log(ce.latexOptions.decimalMarker);
ce.latexOptions.decimalMarker = '{,}';
console.log(ce.latexOptions.decimalMarker);

console.log(ce.parse('3{,}1415').toJSON());

// \frac{x}{} \text{ cm}
// ce.jsonSerializationOptions.metadata = ['latex'];
const v = ce.parse('\\frac{x}{} \\text{ cm}').json;
console.log(v);

let w = ce.parse('\\mathrm{ invalid name}').json;
console.log(w);
w = ce.parse('\\mathrm{$invalid}').json;
console.log(w);

// ce.jsonSerializationOptions.metadata = [];

const b = ce.parse('-');
console.log(b.canonical.toJSON());
console.log(b.simplify().toJSON());
console.log(b.evaluate().toJSON());
console.log(b.N().toJSON());
// let f = ce.parse('\\frac{\\sqrt{4+2\\sqrt{3}}-\\sqrt{28+10\\sqrt{3}}}{15}');
// f = f.simplify();
// console.log(f.toJSON());

const q = ce.box(['Divide', 'weight', ['Square', 'height']]);
console.log(q.latex);
console.log(ce.parse(q.latex).toJSON());

// console.log(ce.parse('f(x)').toJSON());
// console.log(ce.parse('f_{n - 1}(x)').toJSON());
// console.log(ce.parse('x \\times f_{n - 1}(x) + f_{n - 2}(x)').toJSON());

//
// BOXING
//

// describe('BOXING', () => {});

//
// PARSING
//

describe('PARSING numbers', () => {
  test(`{ num: '-12n' }`, () => {
    // The `n` prefix is not necessary, but is supported for legacy reasons
    // (an earlier version of the MathJSON spec included it)
    expect(boxToJson({ num: '-12n' })).toEqual(-12);
  });
  test(`-2+3-4`, () => {
    expect(parse('-2+3-4')).toMatchInlineSnapshot(
      `'["Add", -2, ["Subtract", 3, 4]]'`
    );
  });
  test(`-i`, () => {
    expect(parseToJson('-i')).toMatchObject(['Negate', 'ImaginaryUnit']);
  });
  test(`3.424242334e4`, () => {
    expect(parseToJson('3.424242334e4')).toEqual(34242.42334);
    // Should not sum, loss of precision (very big intger + small integer)
  });
  test(`1 + 1e199`, () => {
    expect(parse('1 + 1e199')).toMatch('["Add", 1, 1e+199]');
    // @fixme
  });
  test(`421.35e+1000`, () => {
    expect(parse('421.35e+1000')).toMatch('{num: "4.2135e+1002"}');
  });
  // @todo Add should get flattened (as part of boxing?)
  test(`\\frac34 + 1e199`, () =>
    expect(parse('\\frac34 + 1e199')).toMatch(
      '["Add", ["Rational", 3, 4], 1e+199]'
    ));
  test(`-5-3-2`, () =>
    expect(parse('-5-3-2')).toMatchInlineSnapshot(
      `'["Subtract", ["Subtract", -5, 3], 2]'`
    ));
  test(`5+3+2`, () => {
    expect(parseToJson('5+3+2')).toMatchObject(['Add', 5, 3, 2]);
  });
});

describe('PARSING symbols', () => {
  test('x', () => {
    expect(parse('x')).toMatchInlineSnapshot(`'"x"'`);
  });
  test('\\pi', () => {
    expect(parse('\\pi')).toMatchInlineSnapshot(`'"Pi"'`);
  });
  test('3\\pi', () => {
    expect(parse('3\\pi')).toMatchInlineSnapshot(`'["Multiply", 3, "Pi"]'`);
  });
});

describe('PARSING functions', () => {
  test(`\\frac{-x}{-n}`, () => {
    expect(parse('\\frac{-x}{-n}')).toMatchInlineSnapshot(
      `'["Divide", ["Negate", "x"], ["Negate", "n"]]'`
    );
  });
});

//
// SERIALIZING
//

describe('SERIALIZING Incomplete expressions', () => {
  test(`['Multiply', 2, ['Rational', 1, 3]]`, () => {
    expect(
      engine.serialize(['Multiply', 2, ['Rational', 1, 3]])
    ).toMatchInlineSnapshot(`'2\\times\\frac{1}{3}'`);
  });
  test(`['Divide']`, () => {
    expect(latex(['Divide'])).toMatchInlineSnapshot(
      `'\\frac{\\placeholder{}}{\\placeholder{}}'`
    );
  });
  test(`['Power', undefined]`, () => {
    expect(
      latex(['Power', undefined as unknown as Expression])
    ).toMatchInlineSnapshot(`'(\\mathrm{Nothing})^{\\placeholder{}}'`);
  }); // @fixme
});

describe('SERIALIZING Negative factors', () => {
  test(`(-2)\\times(-x)\\times y\\times\\frac{3}{-5}`, () => {
    expect(
      engine.parse('(-2)\\times(-x)\\times y\\times\\frac{3}{-5}')?.canonical
        .latex
    ).toMatchInlineSnapshot(`'\\frac{-6}{5}xy'`);
  });
});

//
// CANONICALIZATION
//

describe('CANONICALIZATION negate', () => {
  test('Negate', () => {
    expect(canonicalToJson('-(5)')).toEqual(-5);
  });
  test(`-(-x)`, () => {
    expect(canonicalToJson('-(-x)')).toEqual('x');
  });
  test(`2-q`, () => {
    expect(canonicalToJson('2-q')).toMatchObject(['Subtract', 2, 'q']);
  });
});
describe('CANONICALIZATION Add', () => {
  test('7 + 2 + 5', () =>
    expect(canonical('7 + 2 + 5')).toMatchInlineSnapshot(`'14'`));

  test(`7 + \\frac12`, () =>
    expect(canonical('7 + \\frac12')).toMatchInlineSnapshot(
      `'["Rational", 15, 2]'`
    ));

  test(`1 + 2 + x`, () =>
    expect(canonical('1 + 2 + x')).toMatchInlineSnapshot(`'["Add", 3, "x"]'`));

  test(`1 + \\infty`, () =>
    expect(canonical('1 + \\infty')).toMatchInlineSnapshot(
      `'{num: "+Infinity"}'`
    ));

  test(`7 + (2 + 5) // Associative`, () =>
    expect(canonical('7 + (2 + 5)')).toMatchInlineSnapshot(`'14'`));

  test(`-2+a+b`, () =>
    expect(canonical('-2+a+b')).toMatchInlineSnapshot(
      `'["Add", -2, "a", "b"]'`
    ));

  test(`-2+a^2+a+a^2`, () =>
    expect(canonical('-2+a^2+a+a^2')).toMatchInlineSnapshot(
      `'["Add", -2, ["Multiply", 2, ["Square", "a"]], "a"]'`
    ));
});
describe('CANONICALIZATION multiply', () => {
  test('2\\times3', () =>
    expect(canonicalToJson('2\\times3')).toStrictEqual(6));

  test(`-2\\times-3`, () =>
    expect(canonicalToJson('-2\\times-3')).toStrictEqual(6));

  test(`x\\times(-y)`, () =>
    expect(canonicalToJson('x\\times(-y)')).toMatchObject([
      'Negate',
      ['Multiply', 'x', 'y'],
    ]));

  test(`2\\times\\frac12`, () =>
    expect(canonicalToJson('2\\times\\frac12')).toStrictEqual(1));

  test(`2\\times(5-5)\\times5\\times4`, () =>
    expect(
      canonicalToJson('2\\times(5-5)\\times5\\times4')
    ).toMatchInlineSnapshot(`0`));

  test(`(-2)\\times(-x)\\times y\\times\\frac{3}{-5}`, () =>
    expect(
      canonicalToJson('(-2)\\times(-x)\\times y\\times\\frac{3}{-5}')
    ).toMatchInlineSnapshot(`['Multiply', ['Rational', -6, 5], 'x', 'y']`));

  test(`'1\\times x\\times 2\\times -5.23 \\times 3.2 \\times \\frac23\\times \\frac1x  // Commutative order'`, () => {
    expect(
      canonical(
        '1\\times x\\times 2\\times -5.23 \\times 3.2 \\times \\frac23\\times \\frac1x'
      )
    ).toMatchInlineSnapshot(`'["Multiply", ["Rational", -4, 3], 3.2, 5.23]'`);
  });
});
describe('CANONICALIZATION divide', () => {
  test(`\\frac{-x}{-n}`, () => {
    expect(canonical('\\frac{-x}{-n}')).toMatch('["Divide", "x", "n"]');
  });
  test(`\\frac{-x}{2}`, () => {
    expect(canonical('\\frac{-x}{2}')).toMatchInlineSnapshot(
      `'["Negate", ["Multiply", ["Rational", 1, 2], "x"]]'`
    );
  });
  test(`\\frac{-x}{\\frac{1}{n}}`, () => {
    expect(canonical('\\frac{-x}{\\frac{1}{n}}')).toMatchInlineSnapshot(
      `'["Negate", ["Multiply", "n", "x"]]'`
    );
  });
});
describe('CANONICALIZATION sqrt', () => {
  test('\\sqrt{3^2}', () => {
    expect(canonical('\\sqrt{3^2}')).toMatchInlineSnapshot(`'3'`);
    // Canonical of Sqrt should not transform to Power
    expect(canonical('\\sqrt{12}')).toMatchInlineSnapshot(
      `'["Multiply", 2, ["Sqrt", 3]]'`
    );
  });
  test(`\\sqrt[3]{x}`, () => {
    expect(canonical('\\sqrt[3]{x}')).toMatch('["Root", "x", 3]');
  });
  test(`\\sqrt{x}`, () => {
    expect(canonical('\\sqrt{x}')).toMatch('["Sqrt", "x"]');
  });
});
describe('CANONICALIZATION invisible operators', () => {
  test('2x // invisible multiply', () => {
    expect(canonicalToJson('2x')).toMatchObject(['Multiply', 2, 'x']);
  });
  test(`'3\\frac18 // invisible add`, () => {
    expect(canonicalToJson('3\\frac18')).toMatchInlineSnapshot(
      `['Rational', 25, 8]`
    );
  });
  test(`2(x)`, () => {
    expect(canonicalToJson('2(x)')).toMatchObject(['Multiply', 2, 'x']);
  });
  test(`(2)(x)`, () => {
    expect(canonicalToJson('(2)(x)')).toMatchObject(['Multiply', 2, 'x']);
  });
  test(`2x+x`, () =>
    expect(canonicalToJson('2x+x')).toMatchInlineSnapshot(
      `['Multiply', 3, 'x']`
    ));
});

//
// SIMPLIFICATION
//

describe('SIMPLIFICATION add', () => {
  test('7 + 2 + 5', () => expect(simplifyToJson('7 + 2 + 5')).toEqual(14));
  test(`2-q`, () => expect(simplify('2-q')).toMatch('["Subtract", 2, "q"]'));

  test(`-i`, () =>
    expect(simplify('-i')).toMatchInlineSnapshot(
      `'["Negate", "ImaginaryUnit"]'`
    )); // @fixme ['Complex', 0, -1]?
  test(`3-i`, () => expect(simplifyToJson('3-i')).toEqual(['Complex', 3, -1]));
  test(`2\\sqrt{3}+\\sqrt{1+2}`, () =>
    expect(simplify('2\\sqrt{3}+\\sqrt{1+2}')).toMatchInlineSnapshot(
      `'["Add", ["Multiply", 2, ["Sqrt", 3]], ["Sqrt", 3]]'`
    ));
});

describe('SIMPLIFICATION divide', () => {
  test(`simplify('\\frac{\\sqrt{5040}}{3}')`, () => {
    expect(simplifyToJson('\\frac{\\sqrt{5040}}{3}')).toMatchObject([
      'Multiply',
      4,
      ['Sqrt', 35],
    ]);
  });

  test(`'\\frac{-x}{-n}'`, () =>
    expect(simplifyToJson('\\frac{-x}{-n}')).toMatchObject([
      'Divide',
      'x',
      'n',
    ]));

  test(`\\frac{5}{\\frac{7}{x}}`, () =>
    expect(simplifyToJson('\\frac{5}{\\frac{7}{x}}')).toMatchInlineSnapshot(
      `['Multiply', ['Rational', 5, 7], 'x']`
    ));

  test(`simplify('\\frac{\\sqrt{15}}{\\sqrt{3}}')`, () =>
    expect(simplify('\\frac{\\sqrt{15}}{\\sqrt{3}}')).toMatchInlineSnapshot(
      `'["Divide", ["Sqrt", 15], ["Sqrt", 3]]'`
    ));
});

describe('SIMPLIFICATION sqrt', () => {
  test(`\\sqrt{5040}`, () =>
    expect(simplifyToJson('\\sqrt{5040}')).toMatchObject([
      'Multiply',
      12,
      ['Sqrt', 35],
    ]));

  test(`simplify('\\sqrt{3^2}')`, () =>
    expect(simplifyToJson('\\sqrt{3^2}')).toEqual(3));

  test(`simplify('\\sqrt{12}')`, () =>
    expect(simplifyToJson('\\sqrt{12}')).toMatchObject([
      'Multiply',
      2,
      ['Sqrt', 3],
    ]));
});
describe('SIMPLIFICATION negate', () => {
  test(`simplify('-(-x)')`, () => expect(simplifyToJson('-(-x)')).toMatch('x'));

  test(`simplify('-(x+1)')`, () =>
    expect(simplify('-(x+1)')).toMatchInlineSnapshot(
      `'["Subtract", ["Negate", "x"], 1]'`
    ));
});

describe('SIMPLIFICATION trigonometry', () => {
  test(`simplify('\\sin\\pi')`, () =>
    expect(simplify('\\sin\\pi')).toEqual('0'));

  test(`simplify('1+4\\times\\sin\\frac{\\pi}{10}')`, () =>
    expect(simplify('1+4\\times\\sin\\frac{\\pi}{10}')).toMatchInlineSnapshot(
      `'["Sqrt", 5]'`
    ));
});

describe('SIMPLIFICATION power', () => {
  test(`simplify('a^3a\\times a^2')`, () =>
    expect(simplify('a^3a\\times a^2')).toMatchInlineSnapshot(
      `'["Power", "a", 6]'`
    ));
  test(`simplify('\\frac{a^4}{a^2}')`, () =>
    expect(simplify('\\frac{a^4}{a^2}')).toMatchInlineSnapshot(
      `'["Square", "a"]'`
    ));
  test(`simplify('(a+b)^6')`, () =>
    expect(simplify('(a+b)^6')).toMatchInlineSnapshot(
      `'["Power", ["Add", "a", "b"], 6]'`
    ));
});

describe('EXPAND', () => {
  test(`Expand('(a+b)^6')`, () =>
    expect(expand('(a+b)^6')).toMatchInlineSnapshot(
      `['Add', ['Power', 'a', 6], ['Multiply', 20, ['Power', 'a', 3], ['Power', 'b', 3]], ['Multiply', 15, ['Square', 'a'], ['Power', 'b', 4]], ['Multiply', 6, 'a', ['Power', 'b', 5]], ['Power', 'b', 6], ['Multiply', 15, ['Square', 'b'], ['Power', 'a', 4]], ['Multiply', 6, 'b', ['Power', 'a', 5]]]`
    ));
});

describe('SIMPLIFICATION multiply', () => {
  test(`3(2+5)`, () => {
    expect(simplifyToJson('3(2+5)')).toStrictEqual(21);
  });

  test('2x', () =>
    expect(simplifyToJson('2x')).toMatchObject(['Multiply', 2, 'x']));

  test(`-\\frac{-x+2\\times x}{-2\\times x + 1}`, () => {
    expect(
      simplify('-\\frac{-x+2\\times x}{-2\\times x + 1}')
    ).toMatchInlineSnapshot(
      `'["Negate", ["Divide", "x", ["Add", 1, ["Multiply", -2, "x"]]]]'`
    );
  });
});

//
// SYMBOLIC EVALUATION
//

describe('SYMBOLIC EVALUATION trigonometric functions', () => {
  test(`\\sin\\frac\\pi3 // constructible values`, () =>
    expect(evaluateToJson('\\sin\\frac\\pi3')).toMatchInlineSnapshot(
      `['Multiply', ['Rational', 1, 2], ['Sqrt', 3]]`
    ));
  test(`\\sin(\\frac13\\pi) // constructible values`, () =>
    expect(evaluateToJson('\\sin(\\frac13\\pi)')).toMatchInlineSnapshot(
      `['Multiply', ['Rational', 1, 2], ['Sqrt', 3]]`
    ));
});

describe('SYMBOLIC EVALUATION Other functions', () => {
  test('-(-x)', () => expect(NToJson('-(-x)')).toMatch('x'));

  test('50!', () =>
    expect(evaluateToJson('50!')).toMatchInlineSnapshot(
      `{num: '3.0414093201713378043612608166064768844377641568960512e+64'}`
    ));
});

//
// NUMERIC EVALUATION
//

describe('NUMERIC EVALUATION arithmetic', () => {
  test(`N('1 + \\frac{1}{3}')`, () => {
    expect(NToJson('1 + \\frac{1}{3}')).toMatchObject({});
  });
  test(`N('\\frac34 + 1e98')`, () =>
    expect(NToJson('\\frac34 + 1e98')).toEqual({
      num: '1.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008e+98',
    }));
  test(`N('\\frac34 + 1e99') // Precision is at 100 digits, so loss of 3/4 is expected`, () =>
    expect(N('\\frac34 + 1e199')).toMatch('1e+199'));
  test(`NToJson('12345678^3 + \\frac{1}{3}')`, () =>
    expect(NToJson('12345678^3 + \\frac{1}{3}')).toMatchInlineSnapshot(
      `{num: '1.881675960266558605752(3)e+21'}`
    ));
  test(`NToJson('50!')`, () =>
    expect(NToJson('50!')).toMatchObject({
      num: '3.0414093201713378043612608166064768844377641568960512e+64',
    }));
  test(`Wester-3`, () =>
    expect(
      NToJson(
        '\\frac12+\\frac13+\\frac14+\\frac15+\\frac16+\\frac17+\\frac18+\\frac19+\\frac{1}{10}'
      )
    ).toMatchInlineSnapshot(`{num: '1.928(968253)'}`));
});

describe('NUMERIC EVALUATION trigonometry', () => {
  test(`N('\\sin\\pi')`, () => expect(N('\\sin\\pi')).toEqual('0'));
  test(`N('\\cos\\frac{\\pi}{7}')`, () =>
    expect(N('\\cos\\frac{\\pi}{7}')).toMatchInlineSnapshot(`
      '{
        num: "0.9009688679024191262361023195074450511659191621318571500535624231994324204279399655013614547185124153"
      }'
    `));
});
