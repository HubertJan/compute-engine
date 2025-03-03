import { Expression } from '../../math-json/math-json-format';
import { AbstractBoxedExpression } from './abstract-boxed-expression';
import {
  BoxedExpression,
  Domain,
  IComputeEngine,
  Metadata,
  PatternMatchOption,
  Substitution,
} from '../public';
import { serializeJsonString } from './serialize';
import { hashCode } from './utils';

/**
 * BoxedString
 */

export class BoxedString extends AbstractBoxedExpression {
  private readonly _string: string;
  constructor(ce: IComputeEngine, expr: string, metadata?: Metadata) {
    super(ce, metadata);
    // Strings are always stored in Unicode NFC canonical order
    // See https://unicode.org/reports/tr15/
    this._string = expr.normalize();

    ce._register(this);
  }
  get hash(): number {
    return hashCode('String' + this._string);
  }
  get json(): Expression {
    return serializeJsonString(this.engine, this._string);
  }
  get head(): string {
    return 'String';
  }
  get isPure(): boolean {
    return true;
  }
  get isLiteral(): boolean {
    return true;
  }
  get isCanonical(): boolean {
    return true;
  }
  set isCanonical(_va: boolean) {
    return;
  }
  get domain(): Domain {
    return this.engine.domain('String');
  }
  get complexity(): number {
    return 19;
  }
  get string(): string {
    return this._string;
  }
  isEqual(rhs: BoxedExpression): boolean {
    return rhs.string === this._string;
  }
  isSame(rhs: BoxedExpression): boolean {
    return rhs.string === this._string;
  }
  match(
    rhs: BoxedExpression,
    _options?: PatternMatchOption
  ): Substitution | null {
    if (!(rhs instanceof BoxedString)) return null;
    if (this._string === rhs._string) return {};
    return null;
  }
}
