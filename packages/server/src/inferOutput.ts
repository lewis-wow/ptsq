import { Static, StaticDecode, TSchema } from '@sinclair/typebox';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { AnyRoute } from './route';
import { IntrospectedRoute } from './types';

/**
 * infers output from Typebox schema or typescript type
 *
 * @example
 * ```ts
 * inferOutputFromOutputSchema<TString> = string
 * ```
 */
export type inferOutputFromTypeboxOutputSchema<TOutputSchema extends TSchema> =
  Static<TOutputSchema>;

/**
 * infers output from Typebox schema or typescript type
 *
 * @example
 * ```ts
 * inferOutputFromIntrospectedOutputSchema<{ type: 'string' }> = string
 * ```
 */
export type inferOutputFromIntrospectedOutputSchema<
  TOutputSchema extends JSONSchema,
> = FromSchema<TOutputSchema>;

/**
 * infers decoded output as return type for resolve function
 *
 * @example
 * ```ts
 * .query() => Date
 * .mutation() => Date
 * ```
 */
export type inferDecodedOutputFromTypeboxOutputSchema<
  TOutputSchema extends TSchema | undefined,
> = TOutputSchema extends TSchema ? StaticDecode<TOutputSchema> : TOutputSchema;

/**
 * infers output from SimpleRoute
 * @see IntrospectedRoute
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
  TRoute extends AnyRoute
    ? inferOutputFromTypeboxOutputSchema<TRoute['outputSchema']>
    : inferOutputFromIntrospectedOutputSchema<TRoute['outputSchema']>;
