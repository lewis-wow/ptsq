import type { SerializableZodSchema } from '@schema-rpc/server';
import type { z } from 'zod';

export type RouteOutput<TOutput> = Promise<TOutput extends SerializableZodSchema ? z.infer<TOutput> : TOutput>;
