import { Static, StaticDecode, TSchema } from '@sinclair/typebox';
import { IntrospectedRoute } from './types';

/**
 * infers output from Typebox schema or typescript type
 *
 * @example
 * ```ts
 * inferOutputFromOutputSchema<TString> = string
 * inferOutputFromOutputSchema<string> = string
 * ```
 */
export type inferOutputFromOutputSchema<TOutputSchema> =
  TOutputSchema extends TSchema ? Static<TOutputSchema> : TOutputSchema;

/**
 * infers decoded output as return type for resolve function
 *
 * @example
 * ```ts
 * .query() => Date
 * .mutation() => Date
 * ```
 */
export type inferDecodedOutputFromArgsSchema<
  TOutputSchema extends TSchema | undefined,
> = TOutputSchema extends TSchema ? StaticDecode<TOutputSchema> : TOutputSchema;

/**
 * infers output from SimpleRoute
 * @see SimpleRoute
 *
 * @example
 * ```ts
 * inferOutput<{
 *   _def: {
 *     outputSchema: string;
 *     ...
 *   }
 * }> = string
 * ```
 */
export type inferOutput<TRoute extends IntrospectedRoute> =
  inferOutputFromOutputSchema<TRoute['_def']['outputSchema']>;
