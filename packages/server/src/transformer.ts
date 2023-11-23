/**
 * @internal
 */
export type ArgsTransformerPicker<TArgs> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: ArgsTransformerPicker<TArgs[K]>;
        }
      | AnyTransformer
  : AnyTransformer;

/**
 * @internal
 */
export type ArgsTransformerPickerOutput<TArgsTransformerPicker> =
  TArgsTransformerPicker extends AnyTransformer
    ? inferTransformerResult<TArgsTransformerPicker>
    : TArgsTransformerPicker extends object
    ? {
        [K in keyof TArgsTransformerPicker]: ArgsTransformerPickerOutput<
          TArgsTransformerPicker[K]
        >;
      }
    : TArgsTransformerPicker extends AnyTransformer
    ? inferTransformerResult<TArgsTransformerPicker>
    : never;

/**
 * @internal
 */
export type inferTransformerScopedArgs<TTransformer extends AnyTransformer> =
  Parameters<TTransformer['parse']>[0];

/**
 * @internal
 */
export type inferTransformerResult<TTransformer extends AnyTransformer> =
  ReturnType<TTransformer['parse']>;

export type TransformerAnyParseFunction = (...args: any[]) => any;

export type AnyTransformer = Transformer<TransformerAnyParseFunction>;

export class Transformer<TParseFunction extends TransformerAnyParseFunction> {
  constructor(public parse: TParseFunction) {}

  static transformRecursively<
    TArgs,
    TTransfomerPicker extends ArgsTransformerPicker<TArgs>,
  >({
    input,
    transformerPicker,
  }: {
    input: TArgs;
    transformerPicker: TTransfomerPicker;
  }) {
    if (transformerPicker instanceof Transformer)
      return transformerPicker.parse(input);

    if (typeof transformerPicker === 'object') {
      const result = { ...input };
      const transformerPickerKeys = Object.keys(transformerPicker);

      for (const transformerPickerKey of transformerPickerKeys) {
        result[transformerPickerKey as keyof typeof input] =
          this.transformRecursively({
            input: input[transformerPickerKey as keyof typeof input],
            transformerPicker: transformerPicker[
              transformerPickerKey as keyof typeof transformerPicker
            ] as ArgsTransformerPicker<TArgs[keyof TArgs]>,
          });
      }

      return result;
    }

    return input;
  }
}
