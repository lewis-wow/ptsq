import type { MaybePromise } from './types';

export type Transformation<TArgs> = ArgsTransformationObject<TArgs>;

/**
 * @internal
 */
export type ArgsTransformationFunction<TArgs> = (
  args: TArgs,
) => MaybePromise<any>;

/**
 * @internal
 */
export type AnyArgsTransformationFunction = ArgsTransformationFunction<any>;

/**
 * @internal
 */
export type inferArgsTransformationFunctionResult<
  TArgsTransformationFunction extends AnyArgsTransformationFunction,
> = Awaited<ReturnType<TArgsTransformationFunction>>;

/**
 * @internal
 */
export type inferArgsTransformationFunctionParameters<
  TArgsTransformationFunction extends AnyArgsTransformationFunction,
> = Parameters<TArgsTransformationFunction>[0];

/**
 * @internal
 */
export type ArgsTransformationObject<TArgs> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: ArgsTransformationObject<TArgs[K]>;
        }
      | ArgsTransformationFunction<TArgs>
  : ArgsTransformationFunction<TArgs>;

/**
 * @internal
 */
export type inferArgsTransformationNextArgs<TArgs, TTransformation> =
  TTransformation extends ArgsTransformationFunction<TArgs>
    ? inferArgsTransformationFunctionResult<TTransformation>
    : TTransformation extends ArgsTransformationObject<TArgs>
    ? {
        [K in keyof (TTransformation & TArgs)]: K extends keyof TArgs
          ? K extends keyof TTransformation
            ? inferArgsTransformationNextArgs<TArgs[K], TTransformation[K]>
            : TArgs[K]
          : never;
      }
    : never;
