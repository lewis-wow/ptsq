import type { MaybePromise } from './types';

/**
 * @internal
 */
export type OutputTransformation<
  TOutput,
  TOutputTransformationObject extends OutputTransformationObject<TOutput>,
> = (
  output: TOutput,
) => inferOutputTransformationNextOutput<TOutput, TOutputTransformationObject>;

/**
 * @internal
 */
export type AnyOutputTransformation = OutputTransformation<
  any,
  AnyOutputTransformationObject
>;

/**
 * @internal
 */
export type OutputTransformationFunction<TOutput> = (
  output: any,
) => MaybePromise<TOutput>;

/**
 * @internal
 */
export type AnyOutputTransformationFunction = OutputTransformationFunction<any>;

/**
 * @internal
 */
export type inferOutputTransformationFunctionResult<
  TArgsTransformationFunction extends AnyOutputTransformationFunction,
> = Awaited<ReturnType<TArgsTransformationFunction>>;

/**
 * @internal
 */
export type inferOutputTransformationFunctionParameters<
  TArgsTransformationFunction extends AnyOutputTransformationFunction,
> = Parameters<TArgsTransformationFunction>[0];

/**
 * @internal
 */
export type OutputTransformationObject<TOutput> = TOutput extends object
  ?
      | {
          [K in keyof TOutput]?: OutputTransformationFunction<TOutput[K]>;
        }
      | OutputTransformationFunction<TOutput>
  : OutputTransformationFunction<TOutput>;

/**
 * @internal
 */
export type AnyOutputTransformationObject = OutputTransformationObject<any>;

/**
 * @internal
 */
export type inferOutputTransformationNextOutput<TOutput, TTransformation> =
  TTransformation extends OutputTransformationFunction<TOutput>
    ? inferOutputTransformationFunctionParameters<TTransformation>
    : TTransformation extends OutputTransformationFunction<TOutput>
    ? {
        [K in keyof (TTransformation & TOutput)]: K extends keyof TOutput
          ? K extends keyof TTransformation
            ? inferOutputTransformationNextOutput<
                TOutput[K],
                TTransformation[K]
              >
            : TOutput[K]
          : never;
      }
    : never;

export const createRecursiveTransformation = async ({
  input,
  argsTransformationObject,
}: {
  input: unknown;
  argsTransformationObject?: AnyOutputTransformationObject;
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
