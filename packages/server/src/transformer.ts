export type TransformerPicker<TArgs> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: TransformerPicker<TArgs[K]>;
        }
      | Transformer<TArgs, any>
  : Transformer<TArgs, any>;

export type TransformerOutput<TTransformerPicker> =
  TTransformerPicker extends Transformer<any, any>
    ? inferTransformerResult<TTransformerPicker>
    : TTransformerPicker extends object
    ? {
        [K in keyof TTransformerPicker]: TransformerOutput<
          TTransformerPicker[K]
        >;
      }
    : TTransformerPicker extends Transformer<any, any>
    ? inferTransformerResult<TTransformerPicker>
    : never;

export type inferTransformerScopedArgs<
  TTransformer extends Transformer<any, any>,
> = Parameters<TTransformer['transform']>[0];

export type inferTransformerResult<TTransformer extends Transformer<any, any>> =
  ReturnType<TTransformer['transform']>;

export abstract class Transformer<TScopedArgs, TTransformerResult> {
  abstract transform(input: TScopedArgs): TTransformerResult;

  static scope<TArgs, TTransfomerPicker extends TransformerPicker<TArgs>>(
    picker?: TTransfomerPicker,
  ): (options: { input: TArgs }) => TransformerOutput<TTransfomerPicker> {
    return ({ input }: { input: TArgs }) => this.recursiveCall(picker)(input);
  }

  static recursiveCall<TTransfomerPicker extends TransformerPicker<any>>(
    picker: TTransfomerPicker,
  ): (input: any) => any {
    if (picker instanceof Transformer)
      return (input: any) => picker.transform(input);

    if (typeof picker === 'object') {
      const result: any = {};
      for (const key of Object.keys(picker))
        result[key] = this.recursiveCall(picker[key]);
      return (input) => {
        const res: any = {};
        for (const key in result) {
          res[key] = result[key](input);
        }
        return res;
      };
    }

    return (input) => input;
  }
}
