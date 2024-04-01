import { Static, StaticDecode, TSchema } from '@sinclair/typebox';
import { SimpleRoute } from './types';

/**
 * infers args from Typebox schema or typescript type
 *
 * @example
 * ```ts
 * inferArgsFromArgsSchema<TString> = string
 * inferArgsFromArgsSchema<string> = string
 * ```
 */
export type inferArgsFromArgsSchema<TArgsSchema> = TArgsSchema extends
  | undefined
  | void
  ? undefined | void
  : TArgsSchema extends TSchema
    ? Static<TArgsSchema>
    : TArgsSchema;

/**
 * infers decoded args as input for resolve function
 *
 * @example
 * ```ts
 * .query({ input }) => {...}
 * .mutation({ input }) => {...}
 * ```
 */
export type inferDecodedArgsFromArgsSchema<
  TArgsSchema extends TSchema | undefined,
> = TArgsSchema extends TSchema ? StaticDecode<TArgsSchema> : TArgsSchema;

/**
 * infers args from SimpleRoute
 * @see SimpleRoute
 *
 * @example
 * ```ts
 * inferArgs<{
 *   _def: {
 *     argsSchema: string;
 *     ...
 *   }
 * }> = string
 * ```
 */
export type inferArgs<TRoute extends SimpleRoute> = inferArgsFromArgsSchema<
  TRoute['_def']['argsSchema']
>;
