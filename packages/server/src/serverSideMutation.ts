import type { Context } from './context';
import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { inferResolverValidationSchema } from './types';

export class ServerSideMutation<
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
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
