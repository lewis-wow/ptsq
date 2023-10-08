import { ContextBuilder, inferContextParamsFromContextBuilder } from './context';
import { CustomOrigin, StaticOrigin } from './cors';
import { Router } from './createRouterFactory';
import { MaybePromise } from './types';
import { CorsOptions } from 'cors';

export type Serve<TParams extends any[] = any[]> = ({ router }: { router: Router }) => ServePayload<TParams>;

export type ServePayload<TParams extends any[]> = {
  introspection?: StaticOrigin | CustomOrigin | boolean;
  router: Router;
  cors?: CorsOptions;
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
  cors?: CorsOptions;
}>;

export type AnyServe = Serve;
export type AnyServeFunction = ServeFunction;

export const createServeFactory =
  <TContextBuilder extends ContextBuilder>({
    contextBuilder,
    introspection,
    cors,
  }: {
    contextBuilder: TContextBuilder;
    introspection?: StaticOrigin | CustomOrigin | boolean;
    cors?: CorsOptions;
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
        cors,
      };
    },
  });
