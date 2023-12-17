import type { Static } from '@sinclair/typebox';
import type { ResolverSchema } from './resolver';
import type { ErrorMessage } from './types';

export type Serializable =
  | string
  | number
  | null
  | undefined
  | boolean
  | Serializable[]
  | { [key: string]: Serializable };

export type SerializableValues =
  'string, number, null, boolean, Array<Serializable>, Record<string, Serializable>';

export type SerializableSchema<TSchemaArg extends ResolverSchema> =
  Static<TSchemaArg> extends Serializable
    ? TSchemaArg
    : ErrorMessage<`The schema is not serializable. The only serializable values are ${SerializableValues}`>;
