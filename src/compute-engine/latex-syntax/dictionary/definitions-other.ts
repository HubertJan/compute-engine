import { LatexDictionary, Serializer } from '../public';

import {
  LIST,
  op,
  head,
  tail,
  getSequence,
  dictionary,
  string,
  machineValue,
  symbol,
} from '../../../math-json/utils';
import { Expression } from '../../../math-json/math-json-format';
import { joinLatex } from '../tokenizer';

export const DEFINITIONS_OTHERS: LatexDictionary = [
  {
    name: 'Overscript',
    trigger: ['\\overset'],
    kind: 'infix',
    precedence: 700, // @todo: not in MathML
  },
  {
    name: 'Underscript',
    trigger: ['\\underset'],
    kind: 'infix',
    precedence: 700, // @todo: not in MathML
  },
  {
    name: 'Increment',
    trigger: ['+', '+'],
    kind: 'postfix',
    precedence: 880,
  },
  {
    name: 'Decrement',
    trigger: ['-', '-'],
    kind: 'postfix',
    precedence: 880,
  },
  {
    name: 'PreIncrement',
    trigger: ['+', '+'],
    kind: 'prefix',
    precedence: 880,
  },
  {
    name: 'PreDecrement',
    trigger: ['-', '-'],
    kind: 'prefix',
    precedence: 880,
  },
  {
    name: 'Ring', // Aka 'Composition', i.e. function composition
    trigger: ['\\circ'],
    kind: 'infix',
    precedence: 265,
    // @todo: check lhs and rhs are functions
  },
  {
    name: 'Transpose',
    trigger: ['^', 'T'],
    kind: 'infix',
    // @todo: if lhs is a list/tensor
  },
  {
    // @todo: if lhs is a list/tensor
    name: 'ConjugateTranspose',
    trigger: ['^', 'H'],
    kind: 'infix',
  },
  {
    name: 'StringJoin', // @todo From Mathematica...?
    trigger: ['\\lt', '\\gt'],
    kind: 'infix',
    precedence: 780,
  },
  {
    name: 'Starstar',

    trigger: ['\\star', '\\star'],
    kind: 'infix',
    precedence: 780,
  },
  {
    // Partial derivative using a variation of the Euler notation: `∂_xf(x)`
    // (the Euler notation uses `D_1f(x)` where "1" is for the first variable
    // For the Leibniz notation see 'Divide' that handles `∂f/∂x`
    name: 'PartialDerivative', // PartialDerivative(expr, {lists of vars}, degree)
    trigger: ['\\partial'],
    kind: 'prefix',
    parse: (parser) => {
      let done = false;
      let sup: Expression | null = 'Nothing';
      let sub: Expression | null = 'Nothing';
      while (!done) {
        parser.skipSpace();
        if (parser.match('_')) {
          sub = parser.matchRequiredLatexArgument();
        } else if (parser.match('^')) {
          sup = parser.matchRequiredLatexArgument();
        } else {
          done = true;
        }
      }
      const seq = getSequence(sub);
      if (seq) sub = [LIST, ...seq];

      if (!sub || !sup) return null;
      let rhs = parser.matchRequiredLatexArgument() ?? 'Nothing';
      if (rhs !== 'Nothing') {
        const arg = parser.matchArguments('enclosure') ?? 'Nothing';
        rhs = [rhs, ...arg];
      }
      return ['PartialDerivative', rhs, sub, sup] as Expression;
    },
    serialize: (serializer: Serializer, expr: Expression): string => {
      let result = '\\partial';
      const fn = op(expr, 1);
      const vars = op(expr, 2);
      const degree = op(expr, 3);
      if (vars !== null && vars !== 'Nothing') {
        if (head(vars) === LIST) {
          result +=
            '_{' + serializer.serialize(['Sequence', ...tail(vars)]) + '}';
        } else {
          result += '_{' + serializer.serialize(vars) + '}';
        }
      }
      if (degree !== null && degree !== 'Nothing') {
        result += '^{' + serializer.serialize(degree) + '}';
      }
      if (fn !== null && fn !== 'Nothing') {
        result += serializer.serialize(fn);
      }
      return result;
    },
    precedence: 740,
  },
  {
    name: 'OverBar',
    trigger: ['\\overline'],
    requiredLatexArg: 1,
  },
  {
    name: 'UnderBar',
    trigger: ['\\underline'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverVector',
    trigger: ['\\vec'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverTilde',
    trigger: ['\\tilde'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverHat',
    trigger: ['\\hat'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverRightArrow',
    trigger: ['\\overrightarrow'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverLeftArrow',
    trigger: ['\\overleftarrow'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverRightDoubleArrow',
    trigger: ['\\Overrightarrow'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverLeftHarpoon',
    trigger: ['\\overleftharpoon'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverRightHarpoon',
    trigger: ['\\overrightharpoon'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverLeftRightArrow',
    trigger: ['\\overleftrightarrow'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverBrace',
    trigger: ['\\overbrace'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverLineSegment',
    trigger: ['\\overlinesegment'],
    requiredLatexArg: 1,
  },
  {
    name: 'OverGroup',
    trigger: ['\\overgroup'],
    requiredLatexArg: 1,
  },

  {
    trigger: ['\\displaystyle'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return [
        'Style',
        ...arg,
        ['KeyValuePair', "'display'", "'block'"],
      ] as Expression;
    },
  },
  {
    trigger: ['\\textstyle'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return [
        'Style',
        ...arg,
        ['KeyValuePair', "'display'", "'inline'"],
      ] as Expression;
    },
  },
  {
    trigger: ['\\scriptstyle'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return [
        'Style',
        ...arg,
        ['KeyValuePair', "'display'", "'script'"],
      ] as Expression;
    },
  },
  {
    trigger: ['\\scriptscriptstyle'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return [
        'Style',
        ...arg,
        ['KeyValuePair', "'display'", "'scriptscript'"],
      ] as Expression;
    },
  },

  {
    trigger: ['\\tiny'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 1]] as Expression;
    },
  },
  {
    trigger: ['\\scriptsize'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 2]] as Expression;
    },
  },
  {
    trigger: ['\\footnotesize'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 3]] as Expression;
    },
  },
  {
    trigger: ['\\small'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 4]] as Expression;
    },
  },
  {
    trigger: ['\\normalsize'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 5]] as Expression;
    },
  },
  {
    trigger: ['\\large'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 6]] as Expression;
    },
  },
  {
    trigger: ['\\Large'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 7]] as Expression;
    },
  },
  {
    trigger: ['\\LARGE'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 8]] as Expression;
    },
  },
  {
    trigger: ['\\huge'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 9]] as Expression;
    },
  },
  {
    trigger: ['\\Huge'],
    parse: (parser) => {
      const arg = parser.matchArguments('group');
      if (arg === null) return null;
      return ['Style', ...arg, ['KeyValuePair', "'size'", 10]] as Expression;
    },
  },

  {
    name: 'Style',
    serialize: (serializer, expr): string => {
      let result = serializer.serialize(op(expr, 1));

      const dict = dictionary(op(expr, 2));
      if (dict === null) return result;

      if (string(dict.display) === 'block')
        result = joinLatex(['{\\displaystyle', result, '}']);
      else if (string(dict.display) === 'inline')
        result = joinLatex(['{\\textstyle', result, '}']);
      else if (string(dict.display) === 'script')
        result = joinLatex(['{\\scriptstyle', result, '}']);
      else if (string(dict.display) === 'scriptscript')
        result = joinLatex(['{\\scriptscriptstyle', result, '}']);

      const v = machineValue(dict.size);
      if (v !== null && v >= 1 && v <= 10) {
        result = joinLatex([
          '{',
          {
            1: '\\tiny',
            2: '\\scriptsize',
            3: '\\footnotesize',
            4: '\\small',
            5: '\\normalsize',
            6: '\\large',
            7: '\\Large',
            8: '\\LARGE',
            9: '\\huge',
            10: '\\Huge',
          }[v]!,
          result,
          '}',
        ]);
      }
      return result;
    },
  },
  {
    trigger: ['\\!'],
    parse: () => ['HorizontalSpacing', 'Nothing', -3] as Expression,
  },
  {
    trigger: ['\\ '],
    parse: () => ['HorizontalSpacing', 'Nothing', 6] as Expression,
  },
  {
    trigger: ['\\:'],
    parse: () => ['HorizontalSpacing', 'Nothing', 4] as Expression,
  },
  {
    trigger: ['\\enskip'],
    parse: () => ['HorizontalSpacing', 'Nothing', 9] as Expression,
  },
  {
    trigger: ['\\quad'],
    parse: () => ['HorizontalSpacing', 'Nothing', 18] as Expression,
  },
  {
    trigger: ['\\qquad'],
    parse: () => ['HorizontalSpacing', 'Nothing', 36] as Expression,
  },
  {
    trigger: ['\\,'],
    parse: () => ['HorizontalSpacing', 'Nothing', 3] as Expression,
  },
  {
    trigger: ['\\;'],
    parse: () => ['HorizontalSpacing', 'Nothing', 5] as Expression,
  },
  {
    trigger: ['\\enspace'],
    parse: () => ['HorizontalSpacing', 'Nothing', 9] as Expression,
  },
  {
    name: 'HorizontalSpacing',
    serialize: (serializer, expr): string => {
      const content = op(expr, 1);
      if (symbol(content) === 'Nothing') {
        const v = machineValue(op(expr, 2));
        if (v === null) return '';
        return (
          {
            '-3': '\\!',
            6: '\\ ',
            3: '\\,',
            4: '\\:',
            5: '\\;',
            9: '\\enspace',
            18: '\\quad',
            36: '\\qquad',
          }[v] ?? ''
        );
      }
      // @todo: handle op(expr,2) == 'op', 'bin', etc...
      return '';
    },
  },
  // if (
  //   [
  //     '\\!',
  //     '\\:',
  //     '\\enskip',
  //     '\\quad',
  //     '\\,',
  //     '\\;',
  //     '\\enspace',
  //     '\\qquad',
  //     '\\selectfont',
  //   ].includes(token)
  // ) {
  //   return 'skip';
  // }

  // {
  //     name: '',
  //     trigger: '\\mathring',
  //     requiredLatexArg: 1,
  // },
  // {
  //     name: '',
  //     trigger: '\\check',
  //     requiredLatexArg: 1,
  // },
];

// https://reference.wolfram.com/language/tutorial/TextualInputAndOutput.html
