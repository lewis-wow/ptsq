export abstract class Transformer<TValue, TResult> {
  abstract parse(value: TValue): TResult;

  createTransformation() {}
}
