import { Router } from '@schema-rpc/schema';
import { Server } from './types';
import { ContextBuilder, inferContextParamsFromContextBuilder } from './context';
import { Serve } from './serve';

type RouterDefinitionArgs<TRouter extends Router, TContextBuilder extends ContextBuilder> = {
  router: TRouter;
  contextBuilder: TContextBuilder;
};

type RouterDefinition<TRouter extends Router, TContextBuilder extends ContextBuilder> = (routes: Server<TRouter>) => {
  serve: Serve<inferContextParamsFromContextBuilder<TContextBuilder>>;
};

export const routerDefinition =
  <TRouter extends Router, TContextBuilder extends ContextBuilder>({
    router,
    contextBuilder,
  }: RouterDefinitionArgs<TRouter, TContextBuilder>): RouterDefinition<TRouter, TContextBuilder> =>
  (routes: Server<TRouter>) => ({
    serve: async ({ route, params }) => {
      const ctx = await contextBuilder(...params);

      console.log(ctx, route, router, routes);
    },
  });
