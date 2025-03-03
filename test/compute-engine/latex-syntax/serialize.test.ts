import {
  MULTIPLY,
  PI,
  ADD,
  SUBTRACT,
  NEGATE,
  POWER,
  DIVIDE,
} from '../../../src/math-json/utils';
import { box, latex, parse } from '../../utils';

describe('LATEX SERIALIZING', () => {
  test('Numbers', () => {
    expect(latex(1)).toMatch('1');
    expect(latex(+1)).toMatch('1');
    expect(latex(-123)).toMatch('-123');
    expect(latex(-1234567.89)).toMatch('-1\\,234\\,567.89');
    expect(latex(-1234567.89e-123)).toMatchInlineSnapshot(
      `'-1.234\\,567\\,89\\cdot10^{-117}'`
    );
    expect(box({ num: '-1234567.890e-123' })).toMatchInlineSnapshot(
      `'-1.23456789e-117'`
    );
    // Should not `1\\times` as `1\\times10^{199}`
    expect(latex({ num: '1e199' })).toMatchInlineSnapshot(`'10^{+199}'`);
    // Should not `-1\\times` as `-1\\times10^{-199}`
    expect(latex({ num: '-1e-199' })).toMatchInlineSnapshot(
      `'-1\\cdot10^{-199}'`
    );
    expect(
      latex({ num: '-123456789012345678901234567890.890e-123' })
    ).toMatchInlineSnapshot(
      `'-1.234\\,567\\,890\\,123\\,456\\,789\\,012\\,345\\,678\\,908\\,9\\cdot10^{-94}'`
    );
    expect(latex({ num: '+Infinity' })).toMatchInlineSnapshot(`'\\infty'`);
    expect(latex({ num: '-Infinity' })).toMatchInlineSnapshot(`'-\\infty'`);
    expect(latex({ num: 'NaN' })).toMatchInlineSnapshot(
      `'\\operatorname{NaN}'`
    );
    expect(latex({ num: 'Infinity' })).toMatchInlineSnapshot(`'\\infty'`);

    // Repeating patern
    expect(
      latex({ num: '3.123456785678567856785678567856785678' })
    ).toMatchInlineSnapshot(`'3.123\\,4\\overline{5678}'`);

    expect(
      latex({ num: '0.1234567872368237462387623876' })
    ).toMatchInlineSnapshot(
      `'0.123\\,456\\,787\\,236\\,823\\,746\\,238\\,762\\,387\\,6'`
    );

    expect(parse('  - 1 2')).toMatchInlineSnapshot(
      `'["Negate", ["Multiply", 1, 2]]'`
    );
    expect(parse('-123,456.789,012')).toMatchInlineSnapshot(
      `'["Sequence", -123, 456.789, 12]'`
    );
    expect(parse('-1,23456.7890,12')).toMatchInlineSnapshot(
      `'["Sequence", -1, 23456.789, 12]'`
    );
  });
  // Leave space between pi and x
  test('Spacing', () => {
    expect(latex([MULTIPLY, PI, 'x'])).toMatchInlineSnapshot(`'\\pi x'`);
  });

  test('Symbols', () => {
    expect(latex('x')).toMatchInlineSnapshot(`'x'`);
    expect(latex('symbol')).toMatchInlineSnapshot(`'\\mathrm{symbol}'`);
    expect(latex({ sym: 'x' })).toMatchInlineSnapshot(`'x'`);
    expect(latex({ sym: 'symbol' })).toMatchInlineSnapshot(
      `'\\mathrm{symbol}'`
    );
  });

  test('Functions', () => {
    expect(latex(['f', 'x', 1, 0])).toMatchInlineSnapshot(`'f(x, 1, 0)'`);
    expect(latex(['\\foo', 'x', 1, 0])).toMatchInlineSnapshot(
      `'\\foo{x}{1}{0}'`
    );
    expect(latex(['\\frac', 'n', 4])).toMatchInlineSnapshot(`'\\frac{n}{4}'`);

    expect(parse('\\foo[0]{1}{2}')).toMatchInlineSnapshot(`
      '[
        "Error",
        "Missing",
        "'unknown-command'",
        ["LatexForm", "'\\\\foo[0]{1}{2}'"]
      ]'
    `);

    // Head as expression
    expect(latex([['g', 'f'], 'x', 1, 0])).toMatchInlineSnapshot(
      `'\\operatorname{Apply}(g(f), \\left[\\begin{array}{lll}\\end{array}\\right])'`
    );
  });

  test('Basic operations', () => {
    expect(latex([ADD, 'a', 'b'])).toMatchInlineSnapshot(`'a+b'`);
    // Invisible operator
    expect(latex([MULTIPLY, 'a', 'b'])).toMatchInlineSnapshot(`'ab'`);
    expect(
      latex([MULTIPLY, [ADD, 'x', 1], [SUBTRACT, 'x', 1]])
    ).toMatchInlineSnapshot(`'(x+1)(x-1)'`);
    expect(
      latex([ADD, [MULTIPLY, 'x', -1], [MULTIPLY, 'x', 2]])
    ).toMatchInlineSnapshot(`'-x\\times1+x\\times2'`);
    expect(latex([SUBTRACT, [NEGATE, 'x'], -1])).toMatchInlineSnapshot(
      `'-x--1'`
    );
  });
  test('Power', () => {
    expect(latex([POWER, 'x', -2])).toMatchInlineSnapshot(`'\\frac{1}{x^{2}}'`);
    expect(latex([POWER, 'x', [DIVIDE, 1, 2]])).toMatchInlineSnapshot(
      `'x^{\\frac12}'`
    );
    expect(latex([POWER, [ADD, 'x', 1], [DIVIDE, 1, 2]])).toMatchInlineSnapshot(
      `'(x+1)^{\\frac12}'`
    );
    expect(
      latex([POWER, [MULTIPLY, 2, 'x'], [DIVIDE, 1, 2]])
    ).toMatchInlineSnapshot(`'(2x)^{\\frac12}'`);
    expect(
      latex([POWER, [MULTIPLY, 2, 'x'], [SUBTRACT, 1, 'n']])
    ).toMatchInlineSnapshot(`'(2x)^{1-n}'`);
  });
  test('Missing', () => {
    expect(
      latex(['Equal', ['Multiply', 2, 2], 'Missing'])
    ).toMatchInlineSnapshot(`'2\\times2=\\placeholder{}'`);
  });
});

describe('LATEX', () => {
  test('LaTeX Valid forms', () => {
    expect(latex(['LatexTokens', 3, 4])).toMatchInlineSnapshot(`'34'`);
    expect(latex(['LatexTokens', 'x', 3])).toMatchInlineSnapshot(`'x3'`);
    expect(
      latex(['LatexTokens', "'\\frac'", "'<{>'", 42.12, "'<}>'"])
    ).toMatchInlineSnapshot(`'\\frac{42.12}'`);
    expect(latex(['LatexTokens', ['Divide', 'Pi', 2]])).toMatchInlineSnapshot(
      `'\\frac{\\pi}{2}'`
    );
  });
});
