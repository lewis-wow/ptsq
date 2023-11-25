import type { MaybePromise } from './types';

/**
 * @internal
 */
export type Transformation<
  TArgs,
  TArgsTransformationObject extends ArgsTransformationObject<TArgs>,
> = (
  input: TArgs,
) => inferArgsTransformationNextArgs<TArgs, TArgsTransformationObject>;

/**
 * @internal
 */
export type AnyTransformation = Transformation<
  any,
  AnyArgsTransformationObject
>;

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
export type AnyArgsTransformationObject = ArgsTransformationObject<any>;

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

export const createRecursiveTransformation = async ({
  input,
  argsTransformationObject,
}: {
  input: unknown;
  argsTransformationObject?: AnyArgsTransformationObject;
}) => {
  if (argsTransformationObject === undefined) return input;

  if (typeof argsTransformationObject === 'function')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await argsTransformationObject(input);

  if (typeof input !== 'object' || input === null)
    throw new TypeError(
      `Input type must be an object when doing key transforming, typeof input is: ${typeof input}.`,
    );

  const resultObject: Record<string | number | symbol, any> = { ...input };
  for (const key of Object.keys(argsTransformationObject)) {
    resultObject[key] = await createRecursiveTransformation({
      input: resultObject[key],
      argsTransformationObject: argsTransformationObject[key],
    });
  }

  return resultObject;
};
