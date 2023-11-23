/**
 * @internal
 */
export type ArgsTransformerPicker<TArgs> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: ArgsTransformerPicker<TArgs[K]>;
        }
      | Transformer<string, TArgs, any>
  : Transformer<string, TArgs, any>;

/**
 * @internal
 */
export type ArgsTransformerPickerOutput<TArgsTransformerPicker> =
  TArgsTransformerPicker extends Transformer<any, any>
    ? inferTransformerResult<TArgsTransformerPicker>
    : TArgsTransformerPicker extends object
    ? {
        [K in keyof TArgsTransformerPicker]: ArgsTransformerPickerOutput<
          TArgsTransformerPicker[K]
        >;
      }
    : TArgsTransformerPicker extends Transformer<any, any>
    ? inferTransformerResult<TArgsTransformerPicker>
    : never;

/**
 * @internal
 */
export type inferTransformerScopedArgs<
  TTransformer extends Transformer<any, any>,
> = Parameters<TTransformer['parse']>[0];

/**
 * @internal
 */
export type inferTransformerResult<TTransformer extends Transformer<any, any>> =
  ReturnType<TTransformer['parse']>;

export class Transformer<
  TDescription extends string = '',
  TScopedArgs = unknown,
  TTransformerResult = unknown,
> {
  protected _DESCRIPTION: TDescription = '' as TDescription;

  constructor(public parse: (input: TScopedArgs) => TTransformerResult) {}

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
