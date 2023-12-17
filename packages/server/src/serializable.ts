import type { Static, TObject } from '@sinclair/typebox';
import { z } from 'zod';
import type { ResolverSchema } from './resolver';

export type Serializable =
  | string
  | number
  | null
  | boolean
  | Serializable[]
  | { [key: string]: Serializable };

/**
 * @internal
 *
 * Checks if the response and request is serializable.
 */
export const serializableZodSchema: z.Schema<Serializable> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

export type ForceSerializableSchema<TSchemaArg extends ResolverSchema> = Static<
  TObject<TSchemaArg>
> extends Serializable
  ? TSchemaArg
  : never;
