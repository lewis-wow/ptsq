import { z } from 'zod';
import { SerializableZodSchema } from './serializable';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type MaybePromise<T> = T | Promise<T>;

export type ParseResolverInput<TResolveInput extends SerializableZodSchema | void> = TResolveInput extends z.Schema
  ? z.infer<TResolveInput>
  : undefined;

export type ParseResolverOutput<TResolveInput> = Promise<
  TResolveInput extends z.Schema ? z.infer<TResolveInput> : TResolveInput
>;

export type inferResolverInput<TResolveInput> = TResolveInput extends SerializableZodSchema
  ? z.infer<TResolveInput>
  : TResolveInput;

export type inferResolverOutput<TResolveOutput> = TResolveOutput extends z.Schema
  ? z.infer<TResolveOutput>
  : TResolveOutput;
