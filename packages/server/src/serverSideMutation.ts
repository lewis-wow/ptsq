import type { Context } from './context';
import type { ResolveFunction } from './resolver';
import type { SerializableZodSchema } from './serializable';
import type { inferResolverValidationSchema } from './types';

export class ServerSideMutation<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  TServerSideContext extends Context = Context,
> {
  ctx: TServerSideContext;
  resolveFunction: ResolveFunction<TInput, TOutput, TServerSideContext>;

  constructor({
    ctx,
    resolveFunction,
  }: {
    ctx: TServerSideContext;
    resolveFunction: ResolveFunction<TInput, TOutput, TServerSideContext>;
  }) {
    this.ctx = ctx;
    this.resolveFunction = resolveFunction;
  }

  mutate(input: inferResolverValidationSchema<TInput>) {
    return this.resolveFunction({ input, ctx: this.ctx });
  }
}
