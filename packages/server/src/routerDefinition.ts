import { Router } from '@schema-rpc/schema';
import { Server } from './server';
import { ContextBuilder, inferContextFromContextBuilder, inferContextParamsFromContextBuilder } from './context';

type RouterDefinitionArgs<TRouter extends Router, TContextBuilder extends ContextBuilder> = {
  router: TRouter;
  contextBuilder: TContextBuilder;
};

export const routerDefinition = <TRouter extends Router, TContextBuilder extends ContextBuilder>({
  router,
  contextBuilder,
}: RouterDefinitionArgs<TRouter, TContextBuilder>) => {
  return (routes: Server<TRouter>) => ({
    serve: async (...adapter: inferContextParamsFromContextBuilder<TContextBuilder>) => {
      const ctx = (await contextBuilder(adapter)) as inferContextFromContextBuilder<TContextBuilder>;

      console.log(ctx, router, routes);
    },
  });
};
