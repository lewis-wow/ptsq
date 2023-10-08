import { ContextBuilder, inferContextParamsFromContextBuilder } from './context';
import { CustomOrigin, StaticOrigin } from './cors';
import { Router } from './createRouterFactory';
import { MaybePromise } from './types';

export type Serve<TParams extends any[] = any[]> = ({ router }: { router: Router }) => ServePayload<TParams>;

export type ServePayload<TParams extends any[]> = {
  introspection?: StaticOrigin | CustomOrigin | boolean;
  router: Router;
  serveCaller: ServeFunction<TParams>;
};

export type ServeFunction<TParams extends any[] = any[]> = (options: {
  route?: string;
  params: TParams;
}) => MaybePromise<{
  router: Router;
  params: TParams;
  route?: string[];
  ctx: object;
  introspection?: StaticOrigin | CustomOrigin | boolean;
}>;

export type AnyServe = Serve;
export type AnyServeFunction = ServeFunction;

export const createServeFactory =
  <TContextBuilder extends ContextBuilder>({
    contextBuilder,
    introspection,
  }: {
    contextBuilder: TContextBuilder;
    introspection?: StaticOrigin | CustomOrigin | boolean;
  }): Serve<inferContextParamsFromContextBuilder<TContextBuilder>> =>
  ({ router }) => ({
    introspection,
    router,
    serveCaller: async ({ route, params }) => {
      const ctx = await contextBuilder(...params);
      const parsedRoute = route?.split('.');

      return {
        ctx,
        router,
        route: parsedRoute,
        params,
        introspection,
      };
    },
  });
