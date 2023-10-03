import { Router } from '@schema-rpc/schema';
import { Context } from './context';
import { Server } from './server';

type RouterDefinitionArgs<TRouter extends Router, TContext extends Context> = {
  router: TRouter;
  ctx: TContext;
};

export const routerDefinition = <TRouter extends Router, TContext extends Context>({
  ctx,
  router,
}: RouterDefinitionArgs<TRouter, TContext>) => {
  return (routes: Server<TRouter>) => ({
    routes,
    ctx,
    router,
  });
};
