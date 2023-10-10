import { Context } from './context';
import { ResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { ParseResolverInput } from './types';

export class ServerSideQuery<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = unknown,
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

  query(input: ParseResolverInput<TInput>) {
    return this.resolveFunction({ input, ctx: this.ctx });
  }
}
