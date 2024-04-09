import { Static, StaticDecode, TSchema } from '@sinclair/typebox';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
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
export type inferOutputFromTypeboxOutputSchema<TOutputSchema extends TSchema> =
  Static<TOutputSchema>;

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

export type inferOutputFromOutputSchema<
  TOutputSchema extends TSchema | JSONSchema,
> = TOutputSchema extends TSchema
  ? Static<TOutputSchema>
  : TOutputSchema extends JSONSchema
    ? FromSchema<TOutputSchema>
    : never;

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
  inferOutputFromOutputSchema<TRoute['outputSchema']>;
