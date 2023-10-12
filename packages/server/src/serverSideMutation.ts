import { Context } from './context';
import { ResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { inferResolverValidationSchema } from './types';

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
