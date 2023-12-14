import type { Context } from './context';
import type { MiddlewareMeta } from './middleware';
import type { MaybePromise } from './types';

/**
 * @internal
 */
export type Transformation<
  TArgs,
  TContext extends Context,
  TArgsTransformationObject extends ArgsTransformationObject<TArgs, TContext>,
> = (options: {
  input: TArgs;
  ctx: TContext;
  meta: MiddlewareMeta;
}) => inferArgsTransformationNextArgs<
  TArgs,
  TContext,
  TArgsTransformationObject
>;

/**
 * @internal
 */
export type AnyTransformation = Transformation<
  any,
  any,
  AnyArgsTransformationObject
>;

/**
 * @internal
 */
export type ArgsTransformationFunction<
  TArgs,
  TContext extends Context,
> = (options: {
  input: TArgs;
  ctx: TContext;
  meta: MiddlewareMeta;
}) => MaybePromise<any>;

/**
 * @internal
 */
export type AnyArgsTransformationFunction = ArgsTransformationFunction<
  any,
  any
>;

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
export type ArgsTransformationObject<
  TArgs,
  TContext extends Context,
> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: ArgsTransformationObject<TArgs[K], TContext>;
        }
      | ArgsTransformationFunction<TArgs, TContext>
  : ArgsTransformationFunction<TArgs, TContext>;

/**
 * @internal
 */
export type AnyArgsTransformationObject = ArgsTransformationObject<any, any>;

/**
 * @internal
 */
export type inferArgsTransformationNextArgs<
  TArgs,
  TContext extends Context,
  TTransformation,
> = TTransformation extends ArgsTransformationFunction<TArgs, TContext>
  ? inferArgsTransformationFunctionResult<TTransformation>
  : TTransformation extends ArgsTransformationObject<TArgs, TContext>
  ? {
      [K in keyof (TTransformation & TArgs)]: K extends keyof TArgs
        ? K extends keyof TTransformation
          ? inferArgsTransformationNextArgs<
              TArgs[K],
              TContext,
              TTransformation[K]
            >
          : TArgs[K]
        : never;
    }
  : never;

export const createRecursiveTransformation = async ({
  options,
  argsTransformationObject,
}: {
  options: {
    input: unknown;
    ctx: object;
    meta: MiddlewareMeta;
  };
  argsTransformationObject?: AnyArgsTransformationObject;
}) => {
  const input = options.input;

  if (argsTransformationObject === undefined) return input;

  if (typeof argsTransformationObject === 'function')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await argsTransformationObject(options);

  if (typeof input !== 'object' || input === null)
    throw new TypeError(
      `Input type must be an object when doing key transforming, typeof input is: ${typeof input}.`,
    );

  const resultObject: Record<string | number | symbol, any> = { ...input };
  for (const key of Object.keys(argsTransformationObject)) {
    resultObject[key] = await createRecursiveTransformation({
      options: {
        ...options,
        input: resultObject[key],
      },
      argsTransformationObject: argsTransformationObject[key],
    });
  }

  return resultObject;
};
