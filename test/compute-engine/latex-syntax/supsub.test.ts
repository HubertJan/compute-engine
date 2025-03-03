import { POWER } from '../../../src/math-json/utils';
import { Expression } from '../../../src/math-json/math-json-format';
import { parse, latex } from '../../utils';

describe('POWER', () => {
  test('Power Invalid forms', () => {
    expect(latex([POWER])).toMatchInlineSnapshot(
      `'(\\placeholder{})^{\\placeholder{}}'`
    );
    expect(latex([POWER, null as unknown as Expression])).toMatchInlineSnapshot(
      `'(\\mathrm{Nothing})^{\\placeholder{}}'`
    );
    expect(
      latex([POWER, undefined as unknown as Expression])
    ).toMatchInlineSnapshot(`'(\\mathrm{Nothing})^{\\placeholder{}}'`);
    expect(latex([POWER, 1])).toMatchInlineSnapshot(`'1^{\\placeholder{}}'`);
    expect(latex([POWER, NaN])).toMatchInlineSnapshot(
      `'\\operatorname{NaN}^{\\placeholder{}}'`
    );
    expect(latex([POWER, Infinity])).toMatchInlineSnapshot(
      `'\\infty^{\\placeholder{}}'`
    );
  });
});

describe('INVERSE FUNCTION', () => {
  test('Valid forms', () => {
    expect(latex(['InverseFunction', 'Sin'])).toMatchInlineSnapshot(
      `'\\mathrm{InverseFunction}(\\sin)'`
    );
    expect(latex(['InverseFunction', 'f'])).toMatchInlineSnapshot(
      `'\\mathrm{InverseFunction}(f)'`
    );
  });
});

describe('SUPSUB', () => {
  test('Superscript', () => {
    expect(parse('2^2')).toMatchInlineSnapshot(`'["Power", 2, 2]'`);
    expect(parse('x^t')).toMatchInlineSnapshot(`'["Power", "x", "t"]'`);
    expect(parse('2^{10}')).toMatchInlineSnapshot(`'["Power", 2, 10]'`);
    expect(parse('\\pi^2')).toMatchInlineSnapshot(`'["Power", "Pi", 2]'`);
    expect(parse('2^23')).toMatchInlineSnapshot(
      `'["Multiply", ["Power", 2, 2], 3]'`
    );
    expect(parse('2^\\pi')).toMatchInlineSnapshot(`'["Power", 2, "Pi"]'`);
    expect(parse('2^\\frac12')).toMatchInlineSnapshot(`'["Power", 2, "Half"]'`);
    expect(parse('2^{3^4}')).toMatchInlineSnapshot(
      `'["Power", 2, ["Power", 3, 4]]'`
    );
    expect(parse('2^{10}')).toMatchInlineSnapshot(`'["Power", 2, 10]'`);
    expect(parse('2^{-2}')).toMatchInlineSnapshot(`'["Power", 2, -2]'`);
    expect(parse('2^3^4')).toMatchInlineSnapshot(
      `'["Power", 2, ["Sequence", 3, 4]]'`
    ); // @todo: unclear what the right answer is... (and it's invalid LaTeX)
    expect(parse('2^{3^4}')).toMatchInlineSnapshot(
      `'["Power", 2, ["Power", 3, 4]]'`
    );
    expect(parse('12^34.5')).toMatchInlineSnapshot(
      `'["Multiply", ["Power", 12, 3], 4.5]'`
    );
    expect(parse('x^2')).toMatchInlineSnapshot(`'["Power", "x", 2]'`);
    expect(parse('x^{x+1}')).toMatchInlineSnapshot(
      `'["Power", "x", ["Add", "x", 1]]'`
    );
  });
  test('Subscript', () => {
    expect(parse('x_0')).toMatchInlineSnapshot(`'["Subscript", "x", 0]'`);
    expect(parse('x^2_0')).toMatchInlineSnapshot(
      `'["Power", ["Subscript", "x", 0], 2]'`
    );
    expect(parse('x_0^2')).toMatchInlineSnapshot(
      `'["Power", ["Subscript", "x", 0], 2]'`
    );
    expect(parse('x_{n+1}')).toMatchInlineSnapshot(
      `'["Subscript", "x", ["Add", "n", 1]]'`
    );
    expect(parse('x_n_{+1}')).toMatchInlineSnapshot(
      `'["Subscript", "x", ["Sequence", "n", 1]]'`
    );
  });
  test('Pre-sup, pre-sub', () => {
    expect(parse('_p^qx')).toMatchInlineSnapshot(
      `'["Error", "Nothing", "'syntax-error'", ["LatexForm", "'_p^qx'"]]'`
    ); // @todo: nope...
    expect(parse('_p^qx_r^s')).toMatchInlineSnapshot(
      `'["Error", "Nothing", "'syntax-error'", ["LatexForm", "'_p^qx_r^s'"]]'`
    ); // @todo: nope...
    expect(parse('_{p+1}^{q+1}x_{r+1}^{s+1}')).toMatchInlineSnapshot(`
      '[
        "Error",
        "Nothing",
        "'syntax-error'",
        ["LatexForm", "'_{p+1}^{q+1}x_{r+1}^{s+1}'"]
      ]'
    `); // @todo: nope...
    expect(parse('x{}_{p+1}^{q+1}x_{r+1}^{s+1}')).toMatchInlineSnapshot(`
      '[
        "Multiply",
        ["Power", ["Subscript", "x", ["Add", "p", 1]], ["Add", "q", 1]],
        ["Power", ["Subscript", "x", ["Add", "r", 1]], ["Add", "s", 1]]
      ]'
    `); // @todo: nope...
  });
  test('Sup/Sub groups', () => {
    expect(parse('(x+1)^{n-1}')).toMatchInlineSnapshot(
      `'["Power", ["Delimiter", ["Add", "x", 1]], ["Subtract", "n", 1]]'`
    );
    expect(parse('(x+1)_{n-1}')).toMatchInlineSnapshot(
      `'["Subscript", ["Delimiter", ["Add", "x", 1]], ["Subtract", "n", 1]]'`
    );
    expect(parse('(x+1)^n_0')).toMatchInlineSnapshot(
      `'["Power", ["Subscript", ["Delimiter", ["Add", "x", 1]], 0], "n"]'`
    );
    expect(parse('^p_q{x+1}^n_0')).toMatchInlineSnapshot(`
      '[
        "Error",
        "Nothing",
        "'syntax-error'",
        ["LatexForm", "'^p_q{x+1}^n_0'"]
      ]'
    `); // @todo: nope...
    expect(parse('^{12}_{34}(x+1)^n_0')).toMatchInlineSnapshot(`
      '[
        "Error",
        "Nothing",
        "'syntax-error'",
        ["LatexForm", "'^{12}_{34}(x+1)^n_0'"]
      ]'
    `); // @todo: nope...
  });
  test('Accents', () => {
    expect(parse('\\vec{x}')).toMatchInlineSnapshot(`'["OverVector", "x"]'`);
    expect(parse('\\vec{AB}')).toMatchInlineSnapshot(
      `'["OverVector", ["Multiply", "A", "B"]]'`
    ); // @todo: nope...
    expect(parse('\\vec{AB}^{-1}')).toMatchInlineSnapshot(
      `'["Power", ["OverVector", ["Multiply", "A", "B"]], -1]'`
    );
  });
});

describe('PRIME', () => {
  test('Valid forms', () => {
    expect(parse("f'")).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "'''"]]'`
    ); // @todo
    expect(parse("f''")).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "''''"]]'`
    ); // @todo
    expect(parse("f'''")).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "'''''"]]'`
    ); // @todo
    expect(parse('f\\prime')).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "'\\\\prime'"]]'`
    ); // @todo
    expect(parse('f\\prime\\prime')).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "'\\\\prime\\\\prime'"]]'`
    ); // @todo
    expect(parse('f\\prime\\prime\\prime')).toMatchInlineSnapshot(`
      '[
        "Error",
        "f",
        "'syntax-error'",
        ["LatexForm", "'\\\\prime\\\\prime\\\\prime'"]
      ]'
    `); // @todo
    expect(parse('f\\doubleprime')).toMatchInlineSnapshot(
      `'["Error", "f", "'syntax-error'", ["LatexForm", "'\\\\doubleprime'"]]'`
    ); // @todo
    expect(parse('f^{\\prime}')).toMatchInlineSnapshot(`
      '[
        "Power",
        "f",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\prime'"]]
      ]'
    `);
    expect(parse('f^{\\prime\\prime}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Power", "f", "Missing"],
        "'syntax-error'",
        ["LatexForm", "'{\\\\prime\\\\prime}'"]
      ]'
    `); // @todo
    expect(parse('f^{\\prime\\prime\\prime}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Power", "f", "Missing"],
        "'syntax-error'",
        ["LatexForm", "'{\\\\prime\\\\prime\\\\prime}'"]
      ]'
    `); // @todo
    expect(parse('f^{\\doubleprime}')).toMatchInlineSnapshot(`
      '[
        "Power",
        "f",
        [
          "Error",
          "Missing",
          "'unknown-command'",
          ["LatexForm", "'\\\\doubleprime'"]
        ]
      ]'
    `);
  });
});
