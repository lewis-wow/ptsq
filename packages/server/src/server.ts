import { ContextBuilder, inferContextFromContextBuilder } from './context';
import { middlewareDefinition } from './middlewareDefinition';
import { resolverDefinition } from './resolverDefinition';

export const createServer = <TContextBuilder extends ContextBuilder>({ ctx }: { ctx: TContextBuilder }) => {
  const middleware = middlewareDefinition<inferContextFromContextBuilder<TContextBuilder>>();
  const resolver = resolverDefinition<inferContextFromContextBuilder<TContextBuilder>>();

  return {
    middleware,
    resolver,
    ctx,
  };
};
