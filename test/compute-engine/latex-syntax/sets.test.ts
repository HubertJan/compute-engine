import { box, latex, parse } from '../../utils';

describe('SERIALIZING SETS', () => {
  test('Set', () => {
    expect(latex(['Set'])).toMatchInlineSnapshot(`'\\mathrm{Set}()'`);
    expect(latex(['Set', 2, 5, 7])).toMatchInlineSnapshot(
      `'\\mathrm{Set}(2, 5, 7)'`
    );
    // With lambda-condition
    expect(
      latex(['Set', 'Number', ['Condition', ['NotEqual', '_', 0]]])
    ).toMatchInlineSnapshot(
      `'\\mathrm{Set}(\\mathrm{Number}, \\mathrm{Condition}(\\text{\\_}\\ne0))'`
    );
    // With predicate and named arguments
    expect(
      latex([
        'Set',
        ['Element', 'x', 'Number'],
        ['Condition', ['NotEqual', 'x', 0]],
      ])
    ).toMatchInlineSnapshot(
      `'\\mathrm{Set}(x\\in\\mathrm{Number}, \\mathrm{Condition}(x\\ne0))'`
    );
  });

  // test('Range', () => {});

  // test('Interval', () => {});

  test('Multiple', () => {
    expect(latex(['Multiple', 'Integer'])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Integer', 1])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Integer', 1, 0])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Integer', 2])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Integer', 2, 0])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Integer', 2, 1])).toMatchInlineSnapshot(`''`);
    expect(latex(['Multiple', 'Pi', 2, 3])).toMatchInlineSnapshot(`''`);
    expect(
      latex(['Multiple', ['Divide', 'Pi', 2], 2, 3])
    ).toMatchInlineSnapshot(`''`);
  });

  test('Union, Intersection, etc...', () => {
    expect(latex(['Union', 'Integer', 'RealNumber'])).toMatchInlineSnapshot(
      `'\\Z\\cup\\R'`
    );
    expect(
      latex(['Intersection', 'Integer', 'RealNumber'])
    ).toMatchInlineSnapshot(`'\\Z\\cap\\R'`);
    expect(latex(['Complement', 'ComplexNumber'])).toMatchInlineSnapshot(
      `'\\C'`
    );
    expect(latex(['CartesianProduct'])).toMatchInlineSnapshot(`''`);
    expect(latex(['CartesianProduct', 'Integer'])).toMatchInlineSnapshot(
      `'\\Z'`
    );
    expect(
      latex(['CartesianProduct', 'Integer', 'Integer'])
    ).toMatchInlineSnapshot(`'\\Z\\times\\Z'`);
    expect(
      latex(['CartesianProduct', 'Integer', 'RationalNumber'])
    ).toMatchInlineSnapshot(`'\\Z\\times\\Q'`);
    expect(
      latex(['CartesianProduct', 'Integer', 'Integer', 'Integer'])
    ).toMatchInlineSnapshot(`'\\Z\\times\\Z\\times\\Z'`);
    expect(latex(['CartesianPower', 'Integer', 3])).toMatchInlineSnapshot(
      `'\\mathrm{CartesianPower}(\\Z, 3)'`
    );
    expect(latex(['CartesianPower', 'Integer', 'n'])).toMatchInlineSnapshot(
      `'\\mathrm{CartesianPower}(\\Z, n)'`
    );
  });
});

describe('PARSING SETS', () => {
  test('Set', () => {
    // Empty set
    expect(parse('\\{\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'\\\\}'"]
      ]'
    `);

    // Finite set
    expect(parse('\\{1, 2, 3\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'1, 2, 3\\\\}'"]
      ]'
    `);

    // Infinite sets
    expect(parse('\\{1, 2, 3...\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'1, 2, 3...\\\\}'"]
      ]'
    `);
    expect(parse('\\{1, 2, 3, ...\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'1, 2, 3, ...\\\\}'"]
      ]'
    `);
    expect(parse('\\{...-2, -1, 0, 1, 2, 3...\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'...-2, -1, 0, 1, 2, 3...\\\\}'"]
      ]'
    `);
    expect(parse('\\{...-2, -1, 0\\}')).toMatchInlineSnapshot(`
      '[
        "Error",
        ["Error", "Missing", "'unknown-command'", ["LatexForm", "'\\\\{'"]],
        "'syntax-error'",
        ["LatexForm", "'...-2, -1, 0\\\\}'"]
      ]'
    `);
  });
  test('Union, Intersection, etc...', () => {
    expect(parse('\\N \\cup \\R')).toMatchInlineSnapshot(
      `'["Union", "NonNegativeInteger", "RealNumber"]'`
    );
    expect(parse('\\N \\cap \\R')).toMatchInlineSnapshot(
      `'["Intersection", "NonNegativeInteger", "RealNumber"]'`
    );
    expect(parse('\\N \\setminus \\R')).toMatchInlineSnapshot(
      `'["SetMinus", "NonNegativeInteger", "RealNumber"]'`
    );
    expect(box('\\N^\\complement')).toMatchInlineSnapshot(
      `'"\\\\N^\\\\complement"'`
    );
    expect(parse('\\N \\times \\N')).toMatchInlineSnapshot(
      `'["Multiply", "NonNegativeInteger", "NonNegativeInteger"]'`
    );
    expect(parse('\\N^3')).toMatchInlineSnapshot(
      `'["Power", "NonNegativeInteger", 3]'`
    );
    expect(parse('\\N^{n}')).toMatchInlineSnapshot(
      `'["Power", "NonNegativeInteger", "n"]'`
    );
  });
});
