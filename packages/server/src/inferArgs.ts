import { Static, StaticDecode, TSchema } from '@sinclair/typebox';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { AnyEndpoint } from './endpoint';
import { IntrospectedRoute } from './types';

/**
 * infers args from Typebox schema or typescript type
 *
 * @example
 * ```ts
 * inferArgsFromArgsSchema<TString> = string
 * inferArgsFromArgsSchema<undefined> = undefined
 * inferArgsFromArgsSchema<void> = void
 * ```
 */
export type inferArgsFromTypeboxArgsSchema<
  TArgsSchema extends TSchema | void | undefined,
> = TArgsSchema extends undefined | void
  ? undefined | void
  : TArgsSchema extends TSchema
    ? Static<TArgsSchema>
    : never;

/**
 * infers args from introspected schema or typescript type
 *
 * @example
 * ```ts
 * inferArgsFromIntrospectedArgsSchema<{ type: 'string' }> = string
 * inferArgsFromIntrospectedArgsSchema<undefined> = undefined
 * inferArgsFromIntrospectedArgsSchema<void> = void
 * ```
 */
export type inferArgsFromIntrospectedArgsSchema<
  TArgsSchema extends JSONSchema | void | undefined,
> = TArgsSchema extends undefined | void
  ? undefined | void
  : TArgsSchema extends JSONSchema
    ? FromSchema<TArgsSchema>
    : never;

/**
 * infers decoded args as input for resolve function
 *
 * @example
 * ```ts
 * .query({ input }) => {...}
 * .mutation({ input }) => {...}
 * ```
 */
export type inferDecodedArgsFromTypeboxArgsSchema<
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
export type inferArgs<TRoute extends IntrospectedRoute> =
  'argsSchema' extends keyof TRoute
    ? TRoute extends AnyEndpoint
      ? inferArgsFromTypeboxArgsSchema<TRoute['argsSchema']>
      : inferArgsFromIntrospectedArgsSchema<TRoute['argsSchema']>
    : undefined | void;
